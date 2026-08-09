import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getTopicLabel } from '../../content/topic-labels'
import { contentStore } from '../../data-access'
import type { Question } from '../../types/domain'
import { QuestionRunner } from './QuestionRunner'
import { shuffle } from './shuffle'

const SESSION_LENGTH = 15

// LT-02/PP-02: cho phép Lộ trình học sai thẳng vào một phiên luyện tập đúng
// chủ điểm buổi đó qua `?topics=NP-11,NP-12`, thay vì luôn bắt học sinh tự
// tick lại từ đầu.
function useTopicsFromQuery(): string[] {
  const [params] = useSearchParams()
  const raw = params.get('topics')
  return useMemo(
    () => (raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : []),
    [raw],
  )
}

export function PracticeByTopicPage() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const topicsFromQuery = useTopicsFromQuery()
  const [selected, setSelected] = useState<Set<string>>(new Set(topicsFromQuery))
  const [sessionQuestions, setSessionQuestions] = useState<Question[] | null>(null)
  const [autoStarted, setAutoStarted] = useState(false)

  useEffect(() => {
    contentStore.getQuestions().then(setAllQuestions)
  }, [])

  const topicCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const q of allQuestions) {
      for (const topicId of q.topicIds) {
        counts.set(topicId, (counts.get(topicId) ?? 0) + 1)
      }
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [allQuestions])

  function toggle(topicId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(topicId)) next.delete(topicId)
      else next.add(topicId)
      return next
    })
  }

  function startSession() {
    const pool = allQuestions.filter((q) =>
      q.topicIds.some((id) => selected.has(id)),
    )
    setSessionQuestions(shuffle(pool).slice(0, SESSION_LENGTH))
  }

  useEffect(() => {
    if (autoStarted || topicsFromQuery.length === 0 || allQuestions.length === 0) return
    setAutoStarted(true)
    const pool = allQuestions.filter((q) =>
      q.topicIds.some((id) => topicsFromQuery.includes(id)),
    )
    setSessionQuestions(shuffle(pool).slice(0, SESSION_LENGTH))
  }, [autoStarted, topicsFromQuery, allQuestions])

  if (sessionQuestions) {
    return (
      <QuestionRunner
        questions={sessionQuestions}
        variant="standard"
        title={`🧩 ${[...selected].join(', ')}`}
        onExit={() => setSessionQuestions(null)}
      />
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <Link
        to="/luyen-tap"
        className="text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
      >
        ← Quay lại Luyện tập
      </Link>

      <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        🧩 Luyện theo chủ điểm
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Chọn một hoặc nhiều chủ điểm bạn đang yếu, hệ thống sẽ lọc câu hỏi từ
        toàn bộ ngân hàng, bất kể thuộc dạng bài nào.
      </p>

      <ul className="mt-6 flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
        {topicCounts.map(([topicId, count]) => (
          <li key={topicId}>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 border-slate-100 bg-white px-4 py-2.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-emerald-600"
                  checked={selected.has(topicId)}
                  onChange={() => toggle(topicId)}
                />
                <span className="text-sm font-bold text-slate-400">
                  {topicId}
                </span>
                <span className="text-slate-800 dark:text-slate-200">
                  {getTopicLabel(topicId)}
                </span>
              </span>
              <span className="shrink-0 text-xs font-bold text-slate-400">
                {count} câu
              </span>
            </label>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={selected.size === 0}
        onClick={startSession}
        className="mt-6 rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-6 py-3 font-bold text-white shadow-md shadow-emerald-500/30 transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      >
        Bắt đầu luyện ({selected.size} chủ điểm)
      </button>
    </section>
  )
}
