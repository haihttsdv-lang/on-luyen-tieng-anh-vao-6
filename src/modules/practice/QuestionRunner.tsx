import { useEffect, useRef, useState } from 'react'
import { ReadAlongPassage } from '../../components/ReadAlongPassage'
import { ReturnToSessionBanner } from '../../components/ReturnToSessionBanner'
import { SpeakButton } from '../../components/SpeakButton'
import { contentStore, progressStore } from '../../data-access'
import { playCorrect, playFinish, playWrong } from '../audio/sfx'
import { SLOW_RATE, toSpeakableWord } from '../audio/speak'
import type { Question, ReadingPassage } from '../../types/domain'

export type RunnerVariant = 'standard' | 'speed' | 'survival'

interface QuestionRunnerProps {
  questions: Question[]
  variant: RunnerVariant
  timeLimitSeconds?: number
  lives?: number
  title: string
  onExit: () => void
  // LT-06: cho phép nơi gọi (ví dụ bài kiểm tra đầu vào) biết kết quả cuối
  // cùng để cá nhân hóa lộ trình theo trình độ — tách khỏi `onExit` vì
  // `onExit` còn được gọi khi thoát ngang chừng (chưa có kết quả).
  onFinish?: (correctCount: number, total: number) => void
  // UX fix: khi phiên luyện tập này được mở TỪ Session Runner (`?from=`),
  // hiện thêm `ReturnToSessionBanner` ở màn hình hoàn thành để TỰ ĐỘNG quay
  // lại đúng buổi đó — độc lập với `onExit` (không thay thế), nên không ảnh
  // hưởng side-effect nào của trang gọi (ví dụ lưu điểm kiểm tra đầu vào).
  returnTo?: string
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
  onFinish,
  returnTo,
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
  const [passages, setPassages] = useState<ReadingPassage[]>([])
  const [confirmExit, setConfirmExit] = useState(false)
  // UX-09: từ câu thứ 2 trở đi của cùng một bài đọc, mặc định thu gọn đoạn
  // văn để câu hỏi không bị đẩy xuống dưới nếp gấp trên điện thoại.
  const [passageOpen, setPassageOpen] = useState(true)

  useEffect(() => {
    contentStore.getReadingPassages().then(setPassages)
  }, [])

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

  useEffect(() => {
    if (finished) playFinish()
  }, [finished])

  const finishReported = useRef(false)
  useEffect(() => {
    if (finished && onFinish && !finishReported.current) {
      finishReported.current = true
      const correctCount = log.filter((e) => e.correct).length
      onFinish(correctCount, log.length)
    }
  }, [finished, onFinish, log])

  const current = questions[index]
  const currentPassage = current?.passageId
    ? passages.find((p) => p.id === current.passageId)
    : undefined

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

    // MM-06: phản hồi bằng âm thanh ngoài màu sắc — học sinh nhận ra kết quả
    // nhanh hơn và giữ nhịp làm bài tốt hơn (tắt được ở trang Hồ sơ).
    if (correct) playCorrect()
    else playWrong()

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

  // Câu đầu tiên của một bài đọc thì mở sẵn đoạn văn, các câu sau thu gọn.
  useEffect(() => {
    const previousPassageId = index > 0 ? questions[index - 1]?.passageId : undefined
    setPassageOpen(questions[index]?.passageId !== previousPassageId)
  }, [index, questions])

  // UX-07: phím 1–4 chọn đáp án, Enter/Space sang câu tiếp theo — luyện phản
  // xạ nhanh cho phần thi tính giờ khi làm trên máy tính.
  useEffect(() => {
    if (finished || confirmExit) return
    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return
      if (selected === null) {
        const optionIndex = Number(event.key) - 1
        if (optionIndex >= 0 && optionIndex < 4) {
          event.preventDefault()
          handleAnswer(optionIndex)
        }
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

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

        {/* UX fix: tới từ Session Runner thì tự động quay lại đúng buổi học
            sau vài giây, không bắt học sinh tự tìm đường về. */}
        {returnTo && <ReturnToSessionBanner returnTo={returnTo} />}
      </section>
    )
  }

  return (
    // UX-02: câu hỏi thường vẫn giữ bề rộng dễ đọc; riêng câu có đoạn văn thì
    // nới rộng ở lg: để xếp đoạn văn bên trái, câu hỏi bên phải — mô phỏng
    // đúng cách làm bài trên giấy (mắt không phải cuộn lên xuống liên tục).
    <section
      className={`mx-auto px-4 py-12 ${
        currentPassage ? 'max-w-2xl lg:max-w-6xl' : 'max-w-2xl'
      }`}
    >
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

      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          Câu {index + 1}/{questions.length}
          {variant !== 'standard' && streak > 1 ? ` · 🔥 chuỗi ${streak}` : ''}
        </p>
        {/* UX-03: dừng giữa chừng mà không phải bấm Back của trình duyệt. */}
        <button
          type="button"
          onClick={() => setConfirmExit(true)}
          className="rounded-full border-2 border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 hover:border-rose-300 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-slate-700 dark:text-slate-400"
        >
          ✕ Thoát
        </button>
      </div>

      {/* UX-04: thanh tiến trình tô màu theo kết quả từng câu — nhìn thấy
          "sắp xong" là yếu tố giữ động lực đã được kiểm chứng. */}
      <div
        className="mt-2 flex gap-0.5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={index}
        aria-label={`Đã làm ${index} trên ${questions.length} câu`}
      >
        {questions.map((q, i) => {
          const entry = log.find((e) => e.question.id === q.id)
          const color = entry
            ? entry.correct
              ? 'bg-emerald-500'
              : 'bg-rose-500'
            : i === index
              ? 'bg-emerald-300 dark:bg-emerald-700'
              : 'bg-slate-200 dark:bg-slate-700'
          return <span key={q.id} className={`h-1.5 flex-1 rounded-full ${color}`} />
        })}
      </div>

      {confirmExit && (
        <div className="mt-4 rounded-xl border-2 border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-500/10">
          <p className="font-bold text-slate-900 dark:text-slate-100">
            Thoát khi đang làm dở?
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Bạn đã làm {log.length}/{questions.length} câu. Kết quả từng câu đã
            được ghi nhận vào tiến độ, nhưng phiên luyện tập này sẽ không được
            tính điểm tổng kết.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onExit}
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            >
              Thoát ngay
            </button>
            <button
              type="button"
              onClick={() => setConfirmExit(false)}
              className="rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-700 dark:text-slate-300"
            >
              Học tiếp
            </button>
          </div>
        </div>
      )}

      <div
        className={
          currentPassage ? 'lg:grid lg:grid-cols-2 lg:items-start lg:gap-8' : undefined
        }
      >
        {currentPassage && (
          <div className="mt-4 lg:sticky lg:top-4">
            {/* MM-03: nghe bài đọc và tô sáng từ đang đọc (read-along). */}
            <ReadAlongPassage
              passage={currentPassage}
              collapsible
              open={passageOpen}
              onToggle={() => setPassageOpen((open) => !open)}
            />
          </div>
        )}

        <div className={currentPassage ? 'lg:mt-4' : undefined}>
      <div className="mt-4 flex items-start gap-2">
        <p className="flex-1 font-bold whitespace-pre-line text-slate-900 dark:text-slate-100">
          {current.prompt}
        </p>
        {/* MM-01: Ngữ âm phải nghe được mới học được. */}
        {current.skillId === 'KN-08' && (
          <SpeakButton
            text={current.options.map(toSpeakableWord)}
            label="Nghe lần lượt 4 phương án"
            size="sm"
          />
        )}
      </div>

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

          // Nút nghe phải là ANH EM của nút chọn đáp án, không phải con —
          // <button> lồng trong <button> là HTML không hợp lệ và trình duyệt
          // sẽ tự tách thẻ, làm hỏng bố cục.
          return (
            <div
              key={optionIndex}
              className={`flex items-center gap-2 rounded-xl border-2 pr-2 transition-colors ${stateClass}`}
            >
              <button
                type="button"
                disabled={isAnswered}
                onClick={() => handleAnswer(optionIndex)}
                className="flex flex-1 items-center gap-2 rounded-xl px-4 py-2.5 text-left disabled:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500 sm:flex dark:bg-slate-800 dark:text-slate-400">
                  {optionIndex + 1}
                </span>
                <span className="flex-1 text-slate-800 dark:text-slate-200">
                  {isAnswered && isCorrectOption && '✅ '}
                  {isAnswered && isSelected && !isCorrectOption && '❌ '}
                  {option}
                </span>
              </button>
              {current.skillId === 'KN-08' && (
                <SpeakButton
                  text={toSpeakableWord(option)}
                  label={`Nghe chậm từ ${toSpeakableWord(option)}`}
                  rate={SLOW_RATE}
                  size="sm"
                />
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-2 hidden text-xs text-slate-400 sm:block">
        Mẹo: bấm phím <kbd>1</kbd>–<kbd>4</kbd> để chọn đáp án,{' '}
        <kbd>Enter</kbd> để sang câu tiếp theo.
      </p>

      {/* UX-08: trình đọc màn hình cần đọc được kết quả đúng/sai và lời giải
          thích — nội dung này xuất hiện động sau khi bấm chọn. */}
      <div aria-live="polite">
        {selected !== null && (
          <>
            <p className="sr-only">
              {selected === current.answerIndex ? 'Đúng rồi.' : 'Sai rồi.'} Đáp
              án đúng là {current.options[current.answerIndex]}.
            </p>
            <div className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {current.explain}
              {/* ND-04: gợi ý cấu trúc chỉ hiện khi trả lời sai — đúng cách
                  giáo viên chữa dạng viết lại câu. */}
              {current.hint && selected !== current.answerIndex && (
                <p className="mt-2 font-bold text-amber-700 dark:text-amber-400">
                  💡 Ghi nhớ cấu trúc: {current.hint}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {selected !== null && (
        <button
          type="button"
          onClick={handleNext}
          className="mt-6 rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-6 py-3 font-bold text-white shadow-md shadow-emerald-500/30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          Câu tiếp theo →
        </button>
      )}
        </div>
      </div>
    </section>
  )
}
