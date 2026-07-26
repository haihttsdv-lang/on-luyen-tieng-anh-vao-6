import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTopicLabel } from '../../content/topic-labels'
import { contentStore, progressStore } from '../../data-access'
import type { Topic, TopicStatus, VocabCard } from '../../types/domain'

const STATUS_LABEL: Record<TopicStatus, string> = {
  in_progress: 'Đang học',
  mastered: 'Đã nắm',
}

const STATUS_CLASS: Record<TopicStatus, string> = {
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  mastered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
}

// Nhóm chủ điểm ngữ pháp theo Mục 4.1 URD, dùng để gom bài học cho dễ theo dõi.
const GRAMMAR_GROUPS: { label: string; range: [number, number] }[] = [
  { label: 'Nhóm A — Từ loại & cụm từ cơ bản', range: [1, 10] },
  { label: 'Nhóm B — Thì động từ', range: [11, 16] },
  { label: 'Nhóm C — Cấu trúc câu & mệnh đề', range: [17, 22] },
  { label: 'Nhóm D — Động từ khuyết thiếu & dạng động từ', range: [23, 25] },
  { label: 'Nhóm E — Cấu trúc nâng cao thường gặp trong đề', range: [26, 31] },
]

function groupLabelFor(topicId: string): string {
  const num = Number(topicId.split('-')[1])
  return (
    GRAMMAR_GROUPS.find((g) => num >= g.range[0] && num <= g.range[1])?.label ??
    'Khác'
  )
}

export function LessonListPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [vocabCards, setVocabCards] = useState<VocabCard[]>([])
  const [statuses, setStatuses] = useState<Record<string, TopicStatus>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      contentStore.getTopics(),
      contentStore.getVocabCards(),
      progressStore.getTopicStatuses(),
    ]).then(([loadedTopics, loadedVocab, loadedStatuses]) => {
      setTopics(loadedTopics)
      setVocabCards(loadedVocab)
      setStatuses(loadedStatuses)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500">
        Đang tải...
      </section>
    )
  }

  const groupedTopics = new Map<string, Topic[]>()
  for (const topic of topics) {
    const label = groupLabelFor(topic.id)
    ;(groupedTopics.get(label) ?? groupedTopics.set(label, []).get(label)!).push(
      topic,
    )
  }

  const vocabTopicIds = [...new Set(vocabCards.map((c) => c.topicId))].sort()

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        📘 Học lý thuyết
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Học từng bài, làm quiz nhanh để mở khóa "Đã nắm".
      </p>

      {GRAMMAR_GROUPS.map((group) => {
        const groupTopics = groupedTopics.get(group.label)
        if (!groupTopics || groupTopics.length === 0) return null
        return (
          <div key={group.label} className="mt-6">
            <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">
              {group.label}
            </h2>
            <ul className="mt-2 flex flex-col gap-3">
              {groupTopics.map((topic) => {
                const status = statuses[topic.id]
                return (
                  <li key={topic.id}>
                    <Link
                      to={`/hoc-ly-thuyet/${topic.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <span>
                        <span className="block text-xs font-bold text-slate-400">
                          {topic.id}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {topic.title}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          status ? STATUS_CLASS[status] : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}
                      >
                        {status ? STATUS_LABEL[status] : 'Chưa học'}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}

      <h2 className="mt-8 text-sm font-bold tracking-wide text-slate-500 uppercase">
        🗂️ Flashcard từ vựng
      </h2>
      <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {vocabTopicIds.map((topicId) => {
          const count = vocabCards.filter((c) => c.topicId === topicId).length
          return (
            <li key={topicId}>
              <Link
                to={`/hoc-ly-thuyet/tu-vung/${topicId}`}
                className="flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-5 py-4 font-bold text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400"
              >
                <span>
                  <span className="block text-xs font-bold text-emerald-500">
                    {topicId}
                  </span>
                  {getTopicLabel(topicId)}
                </span>
                <span className="shrink-0 text-xs">{count} từ</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
