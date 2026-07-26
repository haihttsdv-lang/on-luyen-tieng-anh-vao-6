import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { progressStore } from '../data-access'

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ', icon: '🏠', end: true },
  { to: '/hoc-ly-thuyet', label: 'Học lý thuyết', icon: '📘' },
  { to: '/luyen-tap', label: 'Luyện tập', icon: '🎯' },
  { to: '/thi-thu', label: 'Thi thử', icon: '⏱️' },
  { to: '/ho-so', label: 'Hồ sơ', icon: '🏆' },
] as const

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition-all',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500',
    isActive
      ? 'bg-linear-to-r from-emerald-500 to-lime-500 text-white shadow-md shadow-emerald-500/30'
      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-800',
  ].join(' ')

export function Layout() {
  const location = useLocation()
  const [coins, setCoins] = useState<number | null>(null)

  useEffect(() => {
    progressStore.getCoins().then(setCoins)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="border-b-2 border-emerald-100 bg-white dark:border-slate-800 dark:bg-slate-950">
        <nav
          aria-label="Điều hướng chính"
          className="mx-auto flex max-w-4xl flex-wrap items-center gap-1.5 px-4 py-3"
        >
          <span className="mr-4 flex items-center gap-1.5 text-base font-extrabold text-slate-900 dark:text-slate-100">
            <span aria-hidden="true">🎮</span>
            Ôn luyện Tiếng Anh vào lớp 6
          </span>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : undefined}
              className={linkClass}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          {coins !== null && coins > 0 && (
            <span
              className="ml-auto flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
              aria-label={`${coins} xu`}
            >
              🪙 {coins}
            </span>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
