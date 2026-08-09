import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { progressStore } from '../../data-access'

const PRACTICE_MODES = [
  {
    to: '/luyen-tap/dang-bai',
    icon: '📝',
    color: 'from-sky-400 to-blue-500',
    title: 'Luyện theo dạng bài',
    description: 'Luyện đúng cấu trúc từng dạng bài như đề thi thật.',
  },
  {
    to: '/luyen-tap/chu-diem',
    icon: '🧩',
    color: 'from-emerald-400 to-lime-500',
    title: 'Luyện theo chủ điểm',
    description: 'Chọn đúng chủ điểm bạn đang yếu để "cày" riêng.',
  },
  {
    to: '/luyen-tap/viet',
    icon: '✍️',
    color: 'from-fuchsia-400 to-purple-500',
    title: 'Viết đoạn văn',
    description: 'Gợi ý dàn ý, từ vựng, và tự kiểm tra bài viết.',
  },
] as const

const GAME_MODES = [
  {
    to: '/luyen-tap/tro-choi/toc-do',
    icon: '⚡',
    color: 'from-orange-400 to-amber-500',
    title: 'Đua tốc độ',
    description: 'Trả lời càng nhiều câu càng tốt trong 60 giây, ăn xu theo chuỗi đúng.',
  },
  {
    to: '/luyen-tap/tro-choi/kho-bau',
    icon: '🗺️',
    color: 'from-rose-400 to-pink-500',
    title: 'Săn kho báu',
    description: 'Trả lời đúng để mở rương báu, 3 mạng, sai hết mạng là dừng cuộc chơi.',
  },
] as const

export function PracticeMenuPage() {
  const [coins, setCoins] = useState<number | null>(null)

  useEffect(() => {
    progressStore.getCoins().then(setCoins)
  }, [])

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 lg:max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            🎯 Luyện tập
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Luyện sát đề thi, hoặc chơi các trò chơi có thưởng để đỡ nhàm chán.
          </p>
        </div>
        {coins !== null && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            🪙 {coins} xu
          </span>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRACTICE_MODES.map((mode) => (
          <Link
            key={mode.to}
            to={mode.to}
            className="group rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-800 dark:bg-slate-900"
          >
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br text-xl ${mode.color}`}
              aria-hidden="true"
            >
              {mode.icon}
            </span>
            <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
              {mode.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {mode.description}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-extrabold text-slate-900 dark:text-slate-100">
        🎮 Trò chơi có thưởng
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAME_MODES.map((mode) => (
          <Link
            key={mode.to}
            to={mode.to}
            className="group rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-amber-800 dark:bg-amber-500/5"
          >
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br text-xl ${mode.color}`}
              aria-hidden="true"
            >
              {mode.icon}
            </span>
            <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
              {mode.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {mode.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
