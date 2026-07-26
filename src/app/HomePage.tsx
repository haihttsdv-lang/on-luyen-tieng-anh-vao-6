import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { contentStore, progressStore } from '../data-access'
import { getSuggestions, type Suggestion } from '../modules/mastery/getSuggestions'
import type { BoxLevel } from '../types/domain'

const SECTIONS = [
  {
    to: '/hoc-ly-thuyet',
    icon: '📘',
    color: 'from-sky-400 to-blue-500',
    title: 'Học lý thuyết',
    description: 'Chinh phục từng chủ điểm ngữ pháp và flashcard từ vựng.',
  },
  {
    to: '/luyen-tap',
    icon: '🎯',
    color: 'from-emerald-400 to-lime-500',
    title: 'Luyện tập',
    description: 'Luyện theo dạng bài hoặc "cày" đúng chủ điểm đang yếu.',
  },
  {
    to: '/thi-thu',
    icon: '⏱️',
    color: 'from-orange-400 to-amber-500',
    title: 'Thi thử',
    description: 'Đấu với đồng hồ, sinh đề ngẫu nhiên theo tỷ trọng.',
  },
  {
    to: '/ho-so',
    icon: '🏆',
    color: 'from-fuchsia-400 to-purple-500',
    title: 'Hồ sơ',
    description: 'Xem bản đồ năng lực và nhiệm vụ nên làm tiếp theo.',
  },
] as const

export function HomePage() {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null)

  useEffect(() => {
    async function load() {
      const [attempts, questions, topics, vocabCards] = await Promise.all([
        progressStore.getAttempts(),
        contentStore.getQuestions(),
        contentStore.getTopics(),
        contentStore.getVocabCards(),
      ])
      const vocabBoxLevels: Record<string, BoxLevel> = {}
      await Promise.all(
        vocabCards.map(async (card) => {
          const level = await progressStore.getVocabBoxLevel(card.id)
          if (level !== undefined) vocabBoxLevels[card.id] = level
        }),
      )
      setSuggestions(
        getSuggestions({ attempts, questions, topics, vocabCards, vocabBoxLevels }),
      )
    }
    load()
  }, [])

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-3xl bg-linear-to-br from-emerald-500 via-lime-500 to-amber-400 px-6 py-10 text-white shadow-lg shadow-emerald-500/20 sm:px-10">
        <p className="text-sm font-bold tracking-wide uppercase opacity-90">
          Chào mừng trở lại!
        </p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
          Ôn luyện Tiếng Anh vào lớp 6
        </h1>
        <p className="mt-3 max-w-2xl text-white/90">
          Học lý thuyết, luyện tập theo chủ điểm, và nhận gợi ý nhiệm vụ tiếp
          theo dựa trên điểm mạnh–yếu thực tế của em.
        </p>
      </div>

      {suggestions !== null && suggestions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">
            🎯 Gợi ý hôm nay
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {suggestions.map((s, i) => (
              <Link
                key={i}
                to={s.href}
                className="flex items-center justify-between gap-3 rounded-xl border-2 border-slate-100 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-800 dark:bg-slate-900"
              >
                <span>
                  <span className="block font-bold text-slate-900 dark:text-slate-100">
                    {s.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {s.reason}
                  </span>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="group rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-800 dark:bg-slate-900"
          >
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br text-xl ${section.color}`}
              aria-hidden="true"
            >
              {section.icon}
            </span>
            <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
