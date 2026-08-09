import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { progressStore } from '../data-access'
import {
  PROGRESS_CHANGED_EVENT,
  REMOTE_SYNC_APPLIED_EVENT,
  getSyncCode,
  isCloudSyncAvailable,
} from '../data-access/cloud/syncMeta'

// `shortLabel` dùng cho thanh tab dưới cùng trên điện thoại (UX-01) — nhãn
// đầy đủ sẽ xuống dòng làm vỡ tab ở màn hình 360px.
const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ', shortLabel: 'Trang chủ', icon: '🏠', end: true },
  { to: '/lo-trinh-hoc', label: 'Lộ trình học', shortLabel: 'Lộ trình', icon: '🗓️' },
  { to: '/hoc-ly-thuyet', label: 'Học lý thuyết', shortLabel: 'Lý thuyết', icon: '📘' },
  { to: '/luyen-tap', label: 'Luyện tập', shortLabel: 'Luyện tập', icon: '🎯' },
  { to: '/thi-thu', label: 'Thi thử', shortLabel: 'Thi thử', icon: '⏱️' },
  { to: '/ho-so', label: 'Hồ sơ', shortLabel: 'Hồ sơ', icon: '🏆' },
] as const

// SDK Firebase (~500KB) tách thành chunk riêng, chỉ tải khi thật sự dùng
// (có mã đồng bộ) — xem docs/adr/0005. Bản đóng gói 1 file HTML (chế độ
// "online", `npm run build:online`) cũng tải chunk này khi cần, vì Đồng bộ
// nhiều thiết bị cần mạng để hoạt động nên không có lý do loại trừ khỏi
// bundle đó nữa (khác thiết kế ban đầu, xem "Cập nhật" trong ADR 0005).
const loadFirebaseSync = () => import('../data-access/cloud/firebaseSync')

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition-all',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500',
    isActive
      ? 'bg-linear-to-r from-emerald-500 to-lime-500 text-white shadow-md shadow-emerald-500/30'
      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-800',
  ].join(' ')

const tabClass = ({ isActive }: { isActive: boolean }) =>
  [
    // text-[10px] + nowrap để nhãn 2 chữ ("Trang chủ", "Luyện tập") không bị
    // xuống dòng làm các tab cao thấp khác nhau ở màn hình 360–390px.
    'flex flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[10px] font-bold whitespace-nowrap transition-colors',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500',
    isActive
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
      : 'text-slate-500 dark:text-slate-400',
  ].join(' ')

export function Layout() {
  const location = useLocation()
  const [coins, setCoins] = useState<number | null>(null)
  const [hasRemoteUpdate, setHasRemoteUpdate] = useState(false)

  useEffect(() => {
    progressStore.getCoins().then(setCoins)
  }, [location.pathname])

  // Xu (và các tiến độ khác) có thể đổi ngay trên cùng 1 trang (ví dụ chấm
  // kết quả buổi học ở Lộ trình học, hoặc dữ liệu vừa được đồng bộ về từ
  // thiết bị khác) mà không đổi route — lắng nghe sự kiện để header cập
  // nhật ngay, không phải đợi điều hướng sang trang khác.
  useEffect(() => {
    function handleProgressChanged() {
      progressStore.getCoins().then(setCoins)
    }
    window.addEventListener(PROGRESS_CHANGED_EVENT, handleProgressChanged)
    return () => window.removeEventListener(PROGRESS_CHANGED_EVENT, handleProgressChanged)
  }, [])

  // Đồng bộ cloud 1 lần lúc mở app nếu thiết bị này đã từng bật (mã lưu sẵn
  // trong localStorage) — sau đó chỉ đồng bộ lại lúc rời ứng dụng (đăng ký
  // bên trong initAutoSync), không lắng nghe realtime liên tục — xem
  // docs/adr/0005. Chỉ tải SDK Firebase khi thật sự có mã lưu sẵn.
  useEffect(() => {
    const code = getSyncCode()
    if (code && isCloudSyncAvailable()) {
      loadFirebaseSync().then((mod) => mod.initAutoSync(code).catch(() => {}))
    }
    function handleRemoteSync() {
      setHasRemoteUpdate(true)
    }
    window.addEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync)
    return () => window.removeEventListener(REMOTE_SYNC_APPLIED_EVENT, handleRemoteSync)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="border-b-2 border-emerald-100 bg-white dark:border-slate-800 dark:bg-slate-950">
        <nav
          aria-label="Điều hướng chính"
          className="mx-auto flex max-w-5xl flex-wrap items-center gap-1.5 px-4 py-2.5"
        >
          <span className="flex items-center gap-1.5 text-base font-extrabold text-slate-900 sm:mr-3 dark:text-slate-100">
            <span aria-hidden="true">🎮</span>
            {/* Rút gọn tiêu đề ở màn hình hẹp để header luôn gọn 1 dòng. */}
            <span className="lg:hidden">Ôn luyện Tiếng Anh 6</span>
            <span className="hidden lg:inline">Ôn luyện Tiếng Anh vào lớp 6</span>
          </span>
          {/* Thanh ngang chỉ hiện từ sm: trở lên — dưới đó dùng tab dưới cùng. */}
          <span className="hidden flex-wrap items-center gap-1 sm:flex">
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
          </span>
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
      {hasRemoteUpdate && (
        <div className="flex items-center justify-center gap-3 bg-sky-600 px-4 py-2 text-sm font-bold text-white">
          🔄 Đã có cập nhật tiến độ mới từ thiết bị khác.
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-white/20 px-3 py-1 hover:bg-white/30"
          >
            Tải lại trang
          </button>
          <button
            type="button"
            onClick={() => setHasRemoteUpdate(false)}
            aria-label="Đóng thông báo"
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
      {/* Chừa chỗ cho thanh tab cố định ở đáy màn hình điện thoại. */}
      <main className="flex-1 pb-20 sm:pb-0">
        <Outlet />
      </main>

      {/* UX-01: trên điện thoại, điều hướng chuyển xuống thanh tab đáy màn
          hình (chuẩn mực của ứng dụng học tập di động) — trước đây 6 mục ở
          header bị wrap 3 dòng, ăn mất ~18% chiều cao màn hình ở MỌI trang. */}
      <nav
        aria-label="Điều hướng chính (điện thoại)"
        className="fixed inset-x-0 bottom-0 z-20 flex gap-0.5 border-t-2 border-emerald-100 bg-white px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] sm:hidden dark:border-slate-800 dark:bg-slate-950"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : undefined}
            className={tabClass}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              {item.icon}
            </span>
            {item.shortLabel}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
