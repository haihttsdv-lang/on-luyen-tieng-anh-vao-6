import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTopicLabel } from '../../content/topic-labels'
import { THEMATIC_GROUPS, sequenceIndexFor } from '../../content/topic-groups'
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

  const sequencedTopics = [...topics].sort(
    (a, b) => sequenceIndexFor(a.id) - sequenceIndexFor(b.id),
  )
  const masteredCount = sequencedTopics.filter(
    (t) => statuses[t.id] === 'mastered',
  ).length

  const vocabTopicIds = [...new Set(vocabCards.map((c) => c.topicId))].sort()

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          📘 Học lý thuyết
        </h1>
        <Link
          to="/hoc-ly-thuyet/so-do-tu-duy"
          className="rounded-full bg-linear-to-r from-fuchsia-500 to-purple-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-purple-500/30 transition-transform hover:scale-105"
        >
          🧠 Sơ đồ tư duy
        </Link>
      </div>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Học lần lượt từng bài theo đúng thứ tự để dễ theo dõi tiến độ, làm
        quiz nhanh sau mỗi bài để mở khóa "Đã nắm".
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-linear-to-r from-emerald-500 to-lime-500 transition-all"
            style={{
              width: `${sequencedTopics.length > 0 ? (masteredCount / sequencedTopics.length) * 100 : 0}%`,
            }}
          />
        </div>
        <span className="shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400">
          {masteredCount}/{sequencedTopics.length} đã nắm
        </span>
      </div>

      {THEMATIC_GROUPS.map((group) => {
        const groupTopics = sequencedTopics.filter((t) =>
          group.topicIds.includes(t.id),
        )
        if (groupTopics.length === 0) return null
        const groupMastered = groupTopics.filter(
          (t) => statuses[t.id] === 'mastered',
        ).length
        return (
          <div key={group.id} className="mt-8">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">
                {group.icon} {group.label}
              </h2>
              <span className="shrink-0 text-xs font-bold text-slate-400">
                {groupMastered}/{groupTopics.length}
              </span>
            </div>
            <ol className="mt-2 flex flex-col gap-3">
              {groupTopics.map((topic) => {
                const status = statuses[topic.id]
                return (
                  <li key={topic.id}>
                    <Link
                      to={`/hoc-ly-thuyet/${topic.id}`}
                      className="flex items-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                          status === 'mastered'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {sequenceIndexFor(topic.id) + 1}
                      </span>
                      <span className="min-w-0 flex-1">
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
            </ol>
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
