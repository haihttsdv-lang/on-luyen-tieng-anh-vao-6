import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTopicLabel } from '../../content/topic-labels'
import { GRAMMAR_GROUPS, groupFor } from '../../content/topic-groups'
import { contentStore } from '../../data-access'
import type { Topic, VocabCard } from '../../types/domain'

const COLOR_STYLES: Record<string, { border: string; chip: string; header: string }> = {
  sky: {
    border: 'border-t-sky-400',
    chip: 'bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400',
    header: 'text-sky-600 dark:text-sky-400',
  },
  emerald: {
    border: 'border-t-emerald-400',
    chip: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400',
    header: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    border: 'border-t-amber-400',
    chip: 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400',
    header: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    border: 'border-t-rose-400',
    chip: 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400',
    header: 'text-rose-600 dark:text-rose-400',
  },
  purple: {
    border: 'border-t-purple-400',
    chip: 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400',
    header: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    border: 'border-t-orange-400',
    chip: 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400',
    header: 'text-orange-600 dark:text-orange-400',
  },
  pink: {
    border: 'border-t-pink-400',
    chip: 'bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-500/10 dark:text-pink-400',
    header: 'text-pink-600 dark:text-pink-400',
  },
}

function Branch({
  icon,
  title,
  color,
  children,
}: {
  icon: string
  title: string
  color: string
  children: React.ReactNode
}) {
  const style = COLOR_STYLES[color]
  return (
    <div className="flex flex-col items-center">
      <div className={`h-6 w-0.5 bg-linear-to-b from-slate-300 to-transparent dark:from-slate-700`} />
      <div
        className={`w-full rounded-2xl border-2 border-t-4 border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${style.border}`}
      >
        <h2 className={`flex items-center gap-1.5 text-sm font-extrabold ${style.header}`}>
          <span aria-hidden="true">{icon}</span> {title}
        </h2>
        <div className="mt-3 flex flex-wrap gap-1.5">{children}</div>
      </div>
    </div>
  )
}

export function MindmapPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [vocabCards, setVocabCards] = useState<VocabCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([contentStore.getTopics(), contentStore.getVocabCards()]).then(
      ([loadedTopics, loadedVocab]) => {
        setTopics(loadedTopics)
        setVocabCards(loadedVocab)
        setLoading(false)
      },
    )
  }, [])

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500">
        Đang tải...
      </section>
    )
  }

  const vocabTopicIds = [...new Set(vocabCards.map((c) => c.topicId))].sort()

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <Link
        to="/hoc-ly-thuyet"
        className="text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
      >
        ← Quay lại danh sách bài học
      </Link>

      <div className="mt-4 rounded-3xl bg-linear-to-br from-fuchsia-500 via-purple-500 to-indigo-500 px-6 py-8 text-center text-white shadow-lg shadow-purple-500/20">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          🧠 Sơ đồ tư duy: Ngữ pháp & Từ vựng
        </h1>
        <p className="mt-2 text-white/90">
          Toàn bộ {topics.length} chủ điểm ngữ pháp và {vocabTopicIds.length} chủ đề
          từ vựng trong một trang — bấm vào bất kỳ ô nào để tra cứu hoặc học ngay.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {GRAMMAR_GROUPS.map((group) => {
          const groupTopics = topics
            .filter((t) => groupFor(t.id)?.label === group.label)
            .sort((a, b) => a.id.localeCompare(b.id))
          if (groupTopics.length === 0) return null
          return (
            <Branch key={group.label} icon={group.icon} title={group.shortLabel} color={group.color}>
              {groupTopics.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/hoc-ly-thuyet/${topic.id}`}
                  title={topic.title}
                  className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${COLOR_STYLES[group.color].chip}`}
                >
                  {topic.id}
                </Link>
              ))}
            </Branch>
          )
        })}

        <Branch icon="🗂️" title="Từ vựng" color="pink">
          {vocabTopicIds.map((topicId) => (
            <Link
              key={topicId}
              to={`/hoc-ly-thuyet/tu-vung/${topicId}`}
              title={getTopicLabel(topicId)}
              className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${COLOR_STYLES.pink.chip}`}
            >
              {topicId}
            </Link>
          ))}
        </Branch>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Di chuột/chạm vào từng mã để xem tên đầy đủ. Bấm để mở bài học hoặc bộ flashcard tương ứng.
      </p>
    </section>
  )
}
