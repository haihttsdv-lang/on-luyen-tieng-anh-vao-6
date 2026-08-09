import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTopicLabel } from '../../content/topic-labels'
import { contentStore, progressStore } from '../../data-access'
import type { Attempt, MockTestResult, Question } from '../../types/domain'
import { computeAllTopicMastery } from './masteryCalc'

function countActiveDaysLast7(timestamps: string[]): number {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const days = new Set(
    timestamps
      .filter((ts) => new Date(ts).getTime() >= sevenDaysAgo)
      .map((ts) => ts.slice(0, 10)),
  )
  return days.size
}

export function ParentOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [activeDays, setActiveDays] = useState(0)
  const [latestMockTest, setLatestMockTest] = useState<MockTestResult | null>(null)
  const [weakestTopics, setWeakestTopics] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const [attempts, mockTests, questions]: [Attempt[], MockTestResult[], Question[]] =
        await Promise.all([
          progressStore.getAttempts(),
          progressStore.getMockTestResults(),
          contentStore.getQuestions(),
        ])

      const timestamps = [
        ...attempts.map((a) => a.timestamp),
        ...mockTests.map((m) => m.date),
      ]
      setActiveDays(countActiveDaysLast7(timestamps))

      const latest = [...mockTests].sort((a, b) => b.date.localeCompare(a.date))[0]
      setLatestMockTest(latest ?? null)

      const mastery = computeAllTopicMastery(attempts, questions)
      const weakest = Object.entries(mastery)
        .filter(([, result]) => result.level === 'weak')
        .sort((a, b) => (a[1].score ?? 0) - (b[1].score ?? 0))
        .slice(0, 3)
        .map(([topicId]) => topicId)
      setWeakestTopics(weakest)

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center text-slate-500">
        Đang tải...
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-12 print:max-w-none print:py-0">
      {/* UX-10: phụ huynh và giáo viên kèm thường muốn bản giấy để trao đổi
          hằng tuần — ẩn các phần điều hướng khi in. */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          to="/ho-so"
          className="text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
        >
          ← Quay lại
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border-2 border-slate-200 px-4 py-1.5 text-sm font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-700 dark:text-slate-300"
        >
          🖨️ In báo cáo
        </button>
      </div>

      <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        👨‍👩‍👧 Tổng quan cho phụ huynh
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Thông tin ngắn gọn, không có dữ liệu định danh cá nhân của con.
      </p>
      <p className="hidden text-sm text-slate-500 print:block">
        Ngày in: {new Date().toLocaleDateString('vi-VN')}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Số buổi học tuần này</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {activeDays} <span className="text-base font-normal">/ 7 ngày</span>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Điểm thi thử gần nhất</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {latestMockTest
              ? `${latestMockTest.score}/${latestMockTest.total}`
              : 'Chưa có'}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500">Con nên chú ý ôn thêm phần</p>
        {weakestTopics.length === 0 ? (
          <p className="mt-1 text-slate-700 dark:text-slate-300">
            Chưa đủ dữ liệu, hoặc con đang học tốt các phần đã luyện tập.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {weakestTopics.map((topicId) => (
              <li
                key={topicId}
                className="rounded-lg bg-rose-50 px-3 py-2 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
              >
                {getTopicLabel(topicId)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
