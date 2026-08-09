import { Fragment, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { SpeakButton } from '../../components/SpeakButton'
import { VoiceRecorder } from '../../components/VoiceRecorder'
import { LEARNING_SEQUENCE } from '../../content/topic-groups'
import { getTopicLabel } from '../../content/topic-labels'
import { contentStore, progressStore } from '../../data-access'
import type { Topic } from '../../types/domain'
import { GrammarVisual, hasGrammarVisual } from './GrammarVisual'

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

  // UX-06: học xong bài này sang thẳng bài sau, không phải quay lại danh
  // sách rồi cuộn tìm. Dùng đúng LEARNING_SEQUENCE của trang danh sách.
  const seqIndex = LEARNING_SEQUENCE.indexOf(topic.id)
  const prevId = seqIndex > 0 ? LEARNING_SEQUENCE[seqIndex - 1] : undefined
  const nextId =
    seqIndex >= 0 && seqIndex < LEARNING_SEQUENCE.length - 1
      ? LEARNING_SEQUENCE[seqIndex + 1]
      : undefined

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

      {/* MM-04: sơ đồ trực quan (trục thời gian / bảng chia động từ / sơ đồ
          cấu trúc câu) cho các chủ điểm khó hình dung bằng chữ. */}
      {hasGrammarVisual(topic.id) && (
        <>
          <h2 className="mt-8 text-lg font-bold text-slate-900 dark:text-slate-100">
            🖼️ Sơ đồ trực quan
          </h2>
          <div className="mt-3">
            <GrammarVisual topicId={topic.id} />
          </div>
        </>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          ✏️ Ví dụ
        </h2>
        {/* MM-02: nghe liên tiếp cả 5 câu — dùng cho phần "Khởi động" 10 phút
            trong Lộ trình học. */}
        <SpeakButton
          text={topic.examples.map((e) => e.en)}
          label="Nghe toàn bộ câu ví dụ"
        >
          Nghe tất cả
        </SpeakButton>
      </div>
      <ul className="mt-3 flex flex-col gap-3">
        {topic.examples.map((example, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {example.en}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {example.vi}
              </p>
            </div>
            <SpeakButton text={example.en} label={`Nghe câu ví dụ ${i + 1}`} />
          </li>
        ))}
      </ul>
      {/* MM-07: sau khi nghe mẫu, đọc lại rồi nghe lại chính mình — vòng lặp
          luyện phát âm khi không có giáo viên ngồi cạnh sửa. */}
      <div className="mt-3 rounded-xl border border-dashed border-slate-200 px-4 py-3 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          🎤 Đọc to các câu ví dụ rồi nghe lại xem đã giống bản mẫu chưa. Bản
          ghi chỉ nằm trong trình duyệt của em, không lưu lại ở đâu cả.
        </p>
        <div className="mt-2">
          <VoiceRecorder
            label={`Ghi âm đọc câu ví dụ bài ${topic.id}`}
            resetKey={topic.id}
          />
        </div>
      </div>

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

      <nav
        aria-label="Điều hướng bài học"
        className="mt-10 flex items-stretch justify-between gap-3 border-t-2 border-slate-100 pt-6 dark:border-slate-800"
      >
        {prevId ? (
          <Link
            to={`/hoc-ly-thuyet/${prevId}`}
            className="flex max-w-[45%] flex-col rounded-xl border-2 border-slate-100 px-4 py-2.5 text-left hover:border-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-800"
          >
            <span className="text-xs font-bold text-slate-400">← Bài trước</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {getTopicLabel(prevId)}
            </span>
          </Link>
        ) : (
          <span />
        )}
        <span className="self-center text-xs font-bold whitespace-nowrap text-slate-400">
          Bài {seqIndex + 1}/{LEARNING_SEQUENCE.length}
        </span>
        {nextId ? (
          <Link
            to={`/hoc-ly-thuyet/${nextId}`}
            className="flex max-w-[45%] flex-col rounded-xl border-2 border-slate-100 px-4 py-2.5 text-right hover:border-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-800"
          >
            <span className="text-xs font-bold text-slate-400">Bài sau →</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {getTopicLabel(nextId)}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </section>
  )
}
