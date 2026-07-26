import { useEffect, useRef, useState } from 'react'
import { progressStore } from '../../data-access'
import type { Question } from '../../types/domain'

export type RunnerVariant = 'standard' | 'speed' | 'survival'

interface QuestionRunnerProps {
  questions: Question[]
  variant: RunnerVariant
  timeLimitSeconds?: number
  lives?: number
  title: string
  onExit: () => void
}

interface AnsweredEntry {
  question: Question
  selected: number
  correct: boolean
}

function coinsForStreak(streak: number): number {
  // Chuỗi đúng liên tiếp càng dài, điểm thưởng mỗi câu càng cao (tối đa x3).
  return 2 + Math.min(streak, 3)
}

function starsFor(ratio: number): number {
  if (ratio >= 0.8) return 3
  if (ratio >= 0.5) return 2
  if (ratio > 0) return 1
  return 0
}

export function QuestionRunner({
  questions,
  variant,
  timeLimitSeconds,
  lives = 3,
  title,
  onExit,
}: QuestionRunnerProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [log, setLog] = useState<AnsweredEntry[]>([])
  const [livesLeft, setLivesLeft] = useState(lives)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [coins, setCoins] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds ?? 0)
  const [finished, setFinished] = useState(false)
  const [finishReason, setFinishReason] = useState<
    'completed' | 'time-up' | 'out-of-lives'
  >('completed')
  const coinsSaved = useRef(false)

  useEffect(() => {
    if (variant !== 'speed' || finished) return
    if (timeLeft <= 0) {
      setFinished(true)
      setFinishReason('time-up')
      return
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [variant, timeLeft, finished])

  useEffect(() => {
    if (finished && variant !== 'standard' && !coinsSaved.current) {
      coinsSaved.current = true
      if (coins > 0) progressStore.addCoins(coins)
    }
  }, [finished, variant, coins])

  const current = questions[index]

  function handleAnswer(optionIndex: number) {
    if (selected !== null || !current) return
    const correct = optionIndex === current.answerIndex
    setSelected(optionIndex)
    setLog((prev) => [...prev, { question: current, selected: optionIndex, correct }])
    progressStore.addAttempt({
      id: `${current.id}-${Date.now()}`,
      questionId: current.id,
      correct,
      timestamp: new Date().toISOString(),
    })

    if (correct) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setBestStreak((b) => Math.max(b, newStreak))
      if (variant !== 'standard') setCoins((c) => c + coinsForStreak(newStreak))
    } else {
      setStreak(0)
      if (variant === 'survival') {
        setLivesLeft((l) => l - 1)
      }
    }
  }

  function handleNext() {
    const outOfLives = variant === 'survival' && livesLeft <= 0
    if (outOfLives) {
      setFinished(true)
      setFinishReason('out-of-lives')
      return
    }
    if (index + 1 >= questions.length) {
      setFinished(true)
      setFinishReason('completed')
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
  }

  if (questions.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500">
        Chưa có câu hỏi phù hợp. Hãy chọn lựa chọn khác.
      </section>
    )
  }

  if (finished) {
    const correctCount = log.filter((e) => e.correct).length
    const ratio = log.length > 0 ? correctCount / log.length : 0
    const stars = starsFor(ratio)

    return (
      <section className="mx-auto max-w-2xl px-4 py-12 text-center">
        <span className="text-4xl" aria-hidden="true">
          {finishReason === 'out-of-lives' ? '💔' : ratio >= 0.8 ? '🏆' : '🎯'}
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          {finishReason === 'time-up'
            ? 'Hết giờ!'
            : finishReason === 'out-of-lives'
              ? 'Hết mạng rồi!'
              : 'Hoàn thành!'}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Đúng {correctCount}/{log.length} câu ({Math.round(ratio * 100)}%)
        </p>

        {variant !== 'standard' && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="text-2xl" aria-hidden="true">
              {'⭐'.repeat(stars)}
              {'☆'.repeat(3 - stars)}
            </div>
            <p className="font-bold text-amber-600 dark:text-amber-400">
              🪙 +{coins} xu · Chuỗi đúng dài nhất: {bestStreak}
            </p>
          </div>
        )}

        <ul className="mt-6 flex flex-col gap-3 text-left">
          {log.map((entry, i) => (
            <li
              key={i}
              className={`rounded-xl border-2 px-4 py-3 ${
                entry.correct
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-500/10'
                  : 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-500/10'
              }`}
            >
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {entry.correct ? '✅' : '❌'} {entry.question.prompt}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Đáp án đúng: {entry.question.options[entry.question.answerIndex]}{' '}
                — {entry.question.explain}
              </p>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onExit}
          className="mt-6 rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-6 py-3 font-bold text-white shadow-md shadow-emerald-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          Xong
        </button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        <div className="flex items-center gap-3 text-sm font-bold">
          {variant === 'survival' && (
            <span aria-label={`${livesLeft} mạng`}>
              {'❤️'.repeat(Math.max(livesLeft, 0))}
              {'🖤'.repeat(Math.max(lives - livesLeft, 0))}
            </span>
          )}
          {variant === 'speed' && (
            <span className="text-orange-600 dark:text-orange-400">
              ⏱️ {timeLeft}s
            </span>
          )}
          {variant !== 'standard' && (
            <span className="text-amber-600 dark:text-amber-400">🪙 {coins}</span>
          )}
        </div>
      </div>

      <p className="mt-1 text-sm text-slate-400">
        Câu {index + 1}/{questions.length}
        {variant !== 'standard' && streak > 1 ? ` · 🔥 chuỗi ${streak}` : ''}
      </p>

      <p className="mt-4 font-bold whitespace-pre-line text-slate-900 dark:text-slate-100">
        {current.prompt}
      </p>

      <div className="mt-4 flex flex-col gap-2" data-testid="answer-options">
        {current.options.map((option, optionIndex) => {
          const isAnswered = selected !== null
          const isCorrectOption = optionIndex === current.answerIndex
          const isSelected = selected === optionIndex

          let stateClass =
            'border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
          if (isAnswered && isCorrectOption) {
            stateClass =
              'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
          } else if (isAnswered && isSelected && !isCorrectOption) {
            stateClass = 'border-rose-500 bg-rose-50 dark:bg-rose-500/10'
          }

          return (
            <button
              key={optionIndex}
              type="button"
              disabled={isAnswered}
              onClick={() => handleAnswer(optionIndex)}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-left transition-colors disabled:cursor-default ${stateClass} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500`}
            >
              <span className="text-slate-800 dark:text-slate-200">
                {isAnswered && isCorrectOption && '✅ '}
                {isAnswered && isSelected && !isCorrectOption && '❌ '}
                {option}
              </span>
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <div className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {current.explain}
        </div>
      )}

      {selected !== null && (
        <button
          type="button"
          onClick={handleNext}
          className="mt-6 rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-6 py-3 font-bold text-white shadow-md shadow-emerald-500/30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          Câu tiếp theo →
        </button>
      )}
    </section>
  )
}
