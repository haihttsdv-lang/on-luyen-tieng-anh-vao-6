import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTopicLabel } from '../../content/topic-labels'
import { contentStore } from '../../data-access'
import type { Question } from '../../types/domain'
import { scaleBlueprint } from './blueprint'
import { generateMockTest } from './generateMockTest'
import { MockTestRunner } from './MockTestRunner'

const CAU_GIAY_TOTAL = 40
const CAU_GIAY_DURATION_MINUTES = 45
const RANDOM_TOPIC_MIN = 4
const RANDOM_TOPIC_MAX = 8

export function CustomMockTestPage() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [session, setSession] = useState<Question[] | null>(null)

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

  function handleRandomPick() {
    const allIds = topicCounts.map(([id]) => id)
    const count = Math.min(
      allIds.length,
      RANDOM_TOPIC_MIN + Math.floor(Math.random() * (RANDOM_TOPIC_MAX - RANDOM_TOPIC_MIN + 1)),
    )
    const shuffled = [...allIds].sort(() => Math.random() - 0.5)
    setSelected(new Set(shuffled.slice(0, count)))
  }

  function handleGenerate() {
    const blueprint = scaleBlueprint(CAU_GIAY_TOTAL)
    const questions = generateMockTest(allQuestions, blueprint, [...selected])
    setSession(questions)
  }

  if (session) {
    return (
      <MockTestRunner
        questions={session}
        durationMinutes={CAU_GIAY_DURATION_MINUTES}
        onExit={() => setSession(null)}
      />
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <Link
        to="/thi-thu"
        className="text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
      >
        ← Quay lại Thi thử
      </Link>

      <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        🎯 Tự tạo đề
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Chọn chủ điểm bạn muốn tập trung ôn, hoặc để hệ thống chọn ngẫu nhiên.
        Đề tạo ra vẫn giữ đúng cấu trúc 40 câu / 45 phút / 4 phần như đề thật
        THCS Cầu Giấy (Ngữ âm, Từ vựng-Ngữ pháp, Đọc hiểu, Viết lại câu) — phần
        nào không đủ câu theo chủ điểm đã chọn sẽ tự lấp đầy bằng câu khác
        cùng dạng bài để không thiếu câu.
      </p>

      <button
        type="button"
        onClick={handleRandomPick}
        className="mt-4 rounded-full border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:border-amber-800 dark:bg-amber-500/10 dark:text-amber-400"
      >
        🎲 Chọn ngẫu nhiên chủ điểm
      </button>

      <ul className="mt-4 flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
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
        onClick={handleGenerate}
        className="mt-6 rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-6 py-3 font-bold text-white shadow-md shadow-emerald-500/30 transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      >
        Tạo đề ({selected.size} chủ điểm đã chọn)
      </button>
    </section>
  )
}
