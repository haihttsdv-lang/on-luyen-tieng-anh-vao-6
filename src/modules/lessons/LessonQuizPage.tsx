import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ReadAlongPassage } from '../../components/ReadAlongPassage'
import { ReturnToSessionBanner } from '../../components/ReturnToSessionBanner'
import { SpeakButton } from '../../components/SpeakButton'
import { contentStore, progressStore } from '../../data-access'
import { SLOW_RATE, toSpeakableWord } from '../audio/speak'
import { useSessionReturn } from '../curriculum/returnTo'
import { shuffle } from '../practice/shuffle'
import type { Question, ReadingPassage, Topic } from '../../types/domain'
import { hasPassed, requiredCorrect } from './quizThreshold'

const QUIZ_LENGTH = 5

export function LessonQuizPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const { returnTo } = useSessionReturn()
  const [topic, setTopic] = useState<Topic | null | undefined>(undefined)
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [passages, setPassages] = useState<ReadingPassage[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [passed, setPassed] = useState(false)

  useEffect(() => {
    if (!topicId) return
    Promise.all([
      contentStore.getTopic(topicId),
      contentStore.getQuestions(),
      contentStore.getReadingPassages(),
    ]).then(([foundTopic, allQuestions, allPassages]) => {
      setTopic(foundTopic ?? null)
      const pool = allQuestions.filter((q) => q.topicIds.includes(topicId))
      setQuizQuestions(shuffle(pool).slice(0, QUIZ_LENGTH))
      setPassages(allPassages)
    })
  }, [topicId])

  const correctCount = useMemo(
    () =>
      quizQuestions.filter((q) => answers[q.id] === q.answerIndex).length,
    [quizQuestions, answers],
  )
  const scoreRatio = quizQuestions.length > 0 ? correctCount / quizQuestions.length : 0
  const needed = requiredCorrect(quizQuestions.length)
  const allAnswered =
    quizQuestions.length > 0 &&
    quizQuestions.every((q) => answers[q.id] !== undefined)

  async function handleSubmit() {
    if (!topicId) return
    const now = new Date().toISOString()
    for (const q of quizQuestions) {
      await progressStore.addAttempt({
        id: `${q.id}-${now}`,
        questionId: q.id,
        correct: answers[q.id] === q.answerIndex,
        timestamp: now,
      })
    }
    const didPass = hasPassed(correctCount, quizQuestions.length)
    await progressStore.setTopicStatus(topicId, didPass ? 'mastered' : 'in_progress')
    setPassed(didPass)
    setSubmitted(true)
  }

  function handleRetry() {
    setAnswers({})
    setSubmitted(false)
    setQuizQuestions((prev) => shuffle(prev))
  }

  if (topic === undefined) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500">
        Đang tải...
      </section>
    )
  }
  if (topic === null) {
    return <Navigate to="/hoc-ly-thuyet" replace />
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 text-center">
        <span className="text-4xl" aria-hidden="true">
          {passed ? '🏆' : '💪'}
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          {passed ? 'Xuất sắc! Đã nắm chủ điểm này' : 'Gần được rồi, cố thêm nhé!'}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Bạn trả lời đúng {correctCount}/{quizQuestions.length} câu (
          {Math.round(scoreRatio * 100)}%). Cần đúng ít nhất {needed}/
          {quizQuestions.length} câu để được đánh dấu "Đã nắm".
        </p>

        <ul className="mt-6 flex flex-col gap-3 text-left">
          {quizQuestions.map((q) => {
            const isCorrect = answers[q.id] === q.answerIndex
            return (
              <li
                key={q.id}
                className={`rounded-xl border-2 px-4 py-3 ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-500/10'
                    : 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-500/10'
                }`}
              >
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {isCorrect ? '✅' : '❌'} {q.prompt}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Đáp án đúng: {q.options[q.answerIndex]} — {q.explain}
                </p>
              </li>
            )
          })}
        </ul>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-full border-2 border-emerald-500 px-5 py-2.5 font-bold text-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:text-emerald-400"
          >
            Làm lại
          </button>
          <Link
            to={returnTo ?? '/hoc-ly-thuyet'}
            className="rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-5 py-2.5 font-bold text-white shadow-md shadow-emerald-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            {returnTo ? '▶️ Quay lại buổi học' : 'Về danh sách bài học'}
          </Link>
        </div>

        {/* UX fix: tới từ Session Runner thì tự động quay lại đúng buổi học
            sau vài giây, không bắt học sinh tự tìm đường về. */}
        {returnTo && <ReturnToSessionBanner returnTo={returnTo} />}
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-bold text-slate-400">{topic.id}</p>
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        🎯 Quiz nhanh: {topic.title}
      </h1>
      {/* ND-01: nói rõ ngưỡng đạt ngay từ đầu thay vì để học sinh đoán. */}
      <p className="mt-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
        Bài này có {quizQuestions.length} câu — cần đúng ít nhất {needed} câu để
        được đánh dấu "Đã nắm".
      </p>

      <ol className="mt-6 flex flex-col gap-6">
        {quizQuestions.map((q, index) => {
          const passage = q.passageId
            ? passages.find((p) => p.id === q.passageId)
            : undefined
          const isFirstOfPassage =
            passage &&
            quizQuestions.findIndex((x) => x.passageId === q.passageId) === index
          return (
          <li key={q.id}>
            {isFirstOfPassage && (
              <div className="mb-3">
                <ReadAlongPassage passage={passage} />
              </div>
            )}
            <div className="flex items-start gap-2">
              <p className="font-bold text-slate-900 dark:text-slate-100">
                Câu {index + 1}. {q.prompt}
              </p>
              {/* MM-01: Ngữ âm không thể dạy bằng chữ — cho nghe cả 4 phương án. */}
              {q.skillId === 'KN-08' && (
                <SpeakButton
                  text={q.options.map(toSpeakableWord)}
                  label={`Nghe lần lượt 4 phương án của câu ${index + 1}`}
                  size="sm"
                />
              )}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {q.options.map((option, optionIndex) => (
                // Nút nghe nằm NGOÀI <label>: bấm vào nút bên trong label sẽ
                // kích hoạt luôn radio, khiến học sinh vô tình chọn đáp án
                // chỉ vì muốn nghe thử từ đó.
                <div
                  key={optionIndex}
                  className={`flex items-center gap-2 rounded-xl border-2 pr-2 transition-colors ${
                    answers[q.id] === optionIndex
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                      : 'border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
                  }`}
                >
                  <label className="flex flex-1 cursor-pointer items-center gap-2 px-4 py-2.5">
                    <input
                      type="radio"
                      name={q.id}
                      className="accent-emerald-600"
                      checked={answers[q.id] === optionIndex}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }))
                      }
                    />
                    <span className="flex-1 text-slate-800 dark:text-slate-200">
                      {option}
                    </span>
                  </label>
                  {q.skillId === 'KN-08' && (
                    <SpeakButton
                      text={toSpeakableWord(option)}
                      label={`Nghe chậm từ ${toSpeakableWord(option)}`}
                      rate={SLOW_RATE}
                      size="sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </li>
          )
        })}
      </ol>

      <button
        type="button"
        disabled={!allAnswered}
        onClick={handleSubmit}
        className="mt-8 rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-6 py-3 font-bold text-white shadow-md shadow-emerald-500/30 transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      >
        Nộp bài
      </button>
    </section>
  )
}
