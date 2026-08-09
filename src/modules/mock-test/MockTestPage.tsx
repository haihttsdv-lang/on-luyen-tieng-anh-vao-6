import { useState } from 'react'
import { Link } from 'react-router-dom'
import { contentStore } from '../../data-access'
import type { Question } from '../../types/domain'
import { MOCK_TEST_OPTIONS, scaleBlueprint } from './blueprint'
import { generateMockTest } from './generateMockTest'
import { MockTestRunner } from './MockTestRunner'

export function MockTestPage() {
  const [session, setSession] = useState<{
    questions: Question[]
    durationMinutes: number
  } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleStart(optionId: string) {
    const option = MOCK_TEST_OPTIONS.find((o) => o.id === optionId)
    if (!option) return
    setLoadingId(optionId)
    const allQuestions = await contentStore.getQuestions()
    const blueprint = scaleBlueprint(option.totalQuestions)
    const questions = generateMockTest(allQuestions, blueprint)
    setSession({ questions, durationMinutes: option.durationMinutes })
    setLoadingId(null)
  }

  if (session) {
    return (
      <MockTestRunner
        questions={session.questions}
        durationMinutes={session.durationMinutes}
        onExit={() => setSession(null)}
      />
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 lg:max-w-5xl">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        ⏱️ Thi thử
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Đề sinh ngẫu nhiên, tính giờ. Chọn độ dài phù hợp với thời gian em có.
      </p>

      {/* UX-02: 3 lựa chọn đề xếp ngang trên màn hình rộng. */}
      <ul className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {MOCK_TEST_OPTIONS.map((option) => (
          <li key={option.id} className="h-full">
            <button
              type="button"
              disabled={loadingId !== null}
              onClick={() => handleStart(option.id)}
              className="flex h-full w-full flex-col gap-1 rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {option.label}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {option.description}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Link
        to="/thi-thu/tu-tao-de"
        className="mt-3 flex flex-col gap-1 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-emerald-800 dark:bg-emerald-500/10"
      >
        <span className="font-bold text-emerald-800 dark:text-emerald-300">
          🎯 Tự tạo đề (chọn chủ điểm)
        </span>
        <span className="text-sm text-emerald-700 dark:text-emerald-400">
          Chọn chủ điểm muốn ôn hoặc để hệ thống chọn ngẫu nhiên — đề vẫn giữ
          đúng cấu trúc 40 câu / 45 phút như đề thật Cầu Giấy.
        </span>
      </Link>
    </section>
  )
}
