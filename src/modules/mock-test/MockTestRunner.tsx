import { useEffect, useRef, useState } from 'react'
import { SKILL_LABELS } from '../../content/skill-labels'
import { getTopicLabel } from '../../content/topic-labels'
import { contentStore, progressStore } from '../../data-access'
import type { Question, ReadingPassage, SkillId } from '../../types/domain'

interface MockTestRunnerProps {
  questions: Question[]
  durationMinutes: number
  onExit: () => void
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MockTestRunner({
  questions,
  durationMinutes,
  onExit,
}: MockTestRunnerProps) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  const [submitted, setSubmitted] = useState(false)
  const [startedAt] = useState(() => Date.now())
  const savedRef = useRef(false)
  const [passages, setPassages] = useState<ReadingPassage[]>([])

  useEffect(() => {
    contentStore.getReadingPassages().then(setPassages)
  }, [])

  useEffect(() => {
    if (submitted) return
    if (timeLeft <= 0) {
      setSubmitted(true)
      return
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, submitted])

  useEffect(() => {
    if (!submitted || savedRef.current) return
    savedRef.current = true

    const byTopic: Record<string, { correct: number; total: number }> = {}
    const bySkill: Partial<Record<SkillId, { correct: number; total: number }>> = {}
    let correctCount = 0
    const now = new Date().toISOString()

    for (const q of questions) {
      const selected = answers[q.id]
      const correct = selected === q.answerIndex
      if (correct) correctCount++

      const skillEntry = bySkill[q.skillId] ?? { correct: 0, total: 0 }
      skillEntry.total++
      if (correct) skillEntry.correct++
      bySkill[q.skillId] = skillEntry

      for (const topicId of q.topicIds) {
        const topicEntry = byTopic[topicId] ?? { correct: 0, total: 0 }
        topicEntry.total++
        if (correct) topicEntry.correct++
        byTopic[topicId] = topicEntry
      }

      progressStore.addAttempt({
        id: `mock-${q.id}-${now}`,
        questionId: q.id,
        correct,
        timestamp: now,
      })
    }

    progressStore.addMockTestResult({
      id: `mt-${now}`,
      date: now,
      score: correctCount,
      total: questions.length,
      byTopic,
      bySkill,
      durationUsedSeconds: Math.round((Date.now() - startedAt) / 1000),
    })
  }, [submitted, answers, questions, startedAt])

  if (questions.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500">
        Chưa đủ câu hỏi để sinh đề thi thử này.
      </section>
    )
  }

  if (submitted) {
    const correctCount = questions.filter(
      (q) => answers[q.id] === q.answerIndex,
    ).length
    const ratio = correctCount / questions.length

    const bySkill = new Map<SkillId, { correct: number; total: number }>()
    const byTopic = new Map<string, { correct: number; total: number }>()
    for (const q of questions) {
      const correct = answers[q.id] === q.answerIndex
      const s = bySkill.get(q.skillId) ?? { correct: 0, total: 0 }
      s.total++
      if (correct) s.correct++
      bySkill.set(q.skillId, s)
      for (const topicId of q.topicIds) {
        const t = byTopic.get(topicId) ?? { correct: 0, total: 0 }
        t.total++
        if (correct) t.correct++
        byTopic.set(topicId, t)
      }
    }
    const weakestTopicsFirst = [...byTopic.entries()].sort(
      (a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total,
    )

    return (
      <section className="mx-auto max-w-2xl px-4 py-12">
        <div className="text-center">
          <span className="text-4xl" aria-hidden="true">
            {ratio >= 0.8 ? '🏆' : ratio >= 0.5 ? '🙂' : '💪'}
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Điểm: {correctCount}/{questions.length} ({Math.round(ratio * 100)}%)
          </h1>
        </div>

        <h2 className="mt-8 text-lg font-bold text-slate-900 dark:text-slate-100">
          📊 Điểm theo dạng bài
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {[...bySkill.entries()].map(([skillId, stat]) => (
            <div
              key={skillId}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="text-sm">
                <span className="font-bold text-slate-400">{skillId}</span>{' '}
                <span className="text-slate-800 dark:text-slate-200">
                  {SKILL_LABELS[skillId]}
                </span>
              </span>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                {stat.correct}/{stat.total}
              </span>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-lg font-bold text-slate-900 dark:text-slate-100">
          🧩 Điểm theo chủ điểm (yếu nhất trước)
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {weakestTopicsFirst.map(([topicId, stat]) => (
            <div
              key={topicId}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="text-sm">
                <span className="font-bold text-slate-400">{topicId}</span>{' '}
                <span className="text-slate-800 dark:text-slate-200">
                  {getTopicLabel(topicId)}
                </span>
              </span>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                {stat.correct}/{stat.total}
              </span>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-lg font-bold text-slate-900 dark:text-slate-100">
          📝 Xem lại từng câu
        </h2>
        <ul className="mt-3 flex flex-col gap-3">
          {questions.map((q, i) => {
            const selected = answers[q.id]
            const correct = selected === q.answerIndex
            const passage = q.passageId
              ? passages.find((p) => p.id === q.passageId)
              : undefined
            const isFirstOfPassage =
              passage && questions.findIndex((x) => x.passageId === q.passageId) === i
            return (
              <li
                key={q.id}
                className={`rounded-xl border-2 px-4 py-3 ${
                  correct
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-500/10'
                    : 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-500/10'
                }`}
              >
                {isFirstOfPassage && (
                  <div className="mb-3 rounded-lg border border-sky-100 bg-sky-50 p-3 dark:border-sky-900 dark:bg-sky-500/10">
                    <p className="text-xs font-bold tracking-wide text-sky-600 uppercase dark:text-sky-400">
                      📖 {passage.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {passage.text}
                    </p>
                  </div>
                )}
                <p className="font-medium whitespace-pre-line text-slate-900 dark:text-slate-100">
                  {correct ? '✅' : '❌'} Câu {i + 1}. {q.prompt}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Bạn chọn: {selected !== undefined ? q.options[selected] : '(bỏ trống)'}
                  {!correct && <> · Đáp án đúng: {q.options[q.answerIndex]}</>}
                  {' — '}
                  {q.explain}
                </p>
              </li>
            )
          })}
        </ul>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onExit}
            className="rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-6 py-3 font-bold text-white shadow-md shadow-emerald-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            Xong
          </button>
        </div>
      </section>
    )
  }

  const current = questions[index]
  const currentPassage = current.passageId
    ? passages.find((p) => p.id === current.passageId)
    : undefined
  const answeredCount = Object.keys(answers).length

  function handleSubmitClick() {
    if (
      answeredCount < questions.length &&
      !window.confirm(
        `Bạn còn ${questions.length - answeredCount} câu chưa trả lời. Vẫn nộp bài?`,
      )
    ) {
      return
    }
    setSubmitted(true)
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-slate-500">
          Đã trả lời {answeredCount}/{questions.length}
        </p>
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${
            timeLeft <= 60
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          ⏱️ {formatTime(timeLeft)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {questions.map((q, i) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Câu ${i + 1}`}
            aria-current={i === index}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
              i === index
                ? 'bg-emerald-600 text-white'
                : answers[q.id] !== undefined
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm font-bold text-slate-400">
        Câu {index + 1}/{questions.length} · {current.skillId}
      </p>

      {currentPassage && (
        <div className="mt-3 rounded-xl border-2 border-sky-100 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-500/10">
          <p className="text-xs font-bold tracking-wide text-sky-600 uppercase dark:text-sky-400">
            📖 {currentPassage.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {currentPassage.text}
          </p>
        </div>
      )}

      <p className="mt-1 font-bold whitespace-pre-line text-slate-900 dark:text-slate-100">
        {current.prompt}
      </p>

      <div className="mt-4 flex flex-col gap-2" data-testid="answer-options">
        {current.options.map((option, optionIndex) => (
          <button
            key={optionIndex}
            type="button"
            onClick={() =>
              setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))
            }
            className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
              answers[current.id] === optionIndex
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                : 'border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-slate-800 dark:text-slate-200">
              {option}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-between gap-3">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="rounded-full border-2 border-slate-200 px-5 py-2.5 font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-700 dark:text-slate-300"
        >
          ← Câu trước
        </button>
        {index + 1 < questions.length ? (
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            className="rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-5 py-2.5 font-bold text-white shadow-md shadow-emerald-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            Câu tiếp theo →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitClick}
            className="rounded-full bg-linear-to-r from-orange-400 to-amber-500 px-5 py-2.5 font-bold text-white shadow-md shadow-orange-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            Nộp bài
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={handleSubmitClick}
        className="mt-3 w-full text-center text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        Nộp bài sớm
      </button>
    </section>
  )
}
