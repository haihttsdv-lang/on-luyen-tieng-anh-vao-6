import { Fragment, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { contentStore, progressStore } from '../../data-access'
import type { Topic } from '../../types/domain'

// Parse cú pháp đơn giản **in đậm** trong nội dung bài học thành <strong>,
// để làm nổi bật công thức/từ khóa quan trọng mà không cần thư viện markdown.
function renderBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-extrabold text-emerald-700 dark:text-emerald-400">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

export function LessonDetailPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const [topic, setTopic] = useState<Topic | null | undefined>(undefined)

  useEffect(() => {
    if (!topicId) return
    contentStore.getTopic(topicId).then(async (found) => {
      setTopic(found ?? null)
      if (found) {
        const statuses = await progressStore.getTopicStatuses()
        if (statuses[topicId] !== 'mastered') {
          await progressStore.setTopicStatus(topicId, 'in_progress')
        }
      }
    })
  }, [topicId])

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

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <Link
        to="/hoc-ly-thuyet"
        className="text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
      >
        ← Quay lại danh sách
      </Link>

      <p className="mt-4 text-xs font-bold text-slate-400">{topic.id}</p>
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        {topic.title}
      </h1>
      <h2 className="mt-6 text-lg font-bold text-slate-900 dark:text-slate-100">
        📖 Nội dung bài học
      </h2>
      <ul className="mt-3 flex flex-col gap-2.5">
        {topic.lesson.map((point, i) => (
          <li
            key={i}
            className="rounded-xl border-2 border-emerald-100 bg-emerald-50/60 px-4 py-3 leading-relaxed text-slate-700 dark:border-emerald-900 dark:bg-emerald-500/5 dark:text-slate-300"
          >
            {renderBold(point)}
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-lg font-bold text-slate-900 dark:text-slate-100">
        ✏️ Ví dụ
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {topic.examples.map((example, i) => (
          <li
            key={i}
            className="rounded-xl border border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {example.en}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {example.vi}
            </p>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-lg font-bold text-slate-900 dark:text-slate-100">
        ⚠️ Lỗi thường gặp
      </h2>
      <ul className="mt-3 flex flex-col gap-2.5">
        {topic.commonMistakes.map((mistake, i) => (
          <li
            key={i}
            className="rounded-xl border-2 border-rose-100 bg-rose-50/60 px-4 py-3 text-slate-700 dark:border-rose-900 dark:bg-rose-500/5 dark:text-slate-300"
          >
            {mistake}
          </li>
        ))}
      </ul>

      <Link
        to={`/hoc-ly-thuyet/${topic.id}/quiz`}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-6 py-3 font-bold text-white shadow-md shadow-emerald-500/30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      >
        🎯 Làm quiz nhanh
      </Link>
    </section>
  )
}
