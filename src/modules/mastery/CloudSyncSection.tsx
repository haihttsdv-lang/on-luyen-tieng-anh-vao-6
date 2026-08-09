import { useEffect, useState } from 'react'
import {
  type SyncStatus,
  generateSyncCode,
  getSyncCode,
  isCloudSyncAvailable,
} from '../../data-access/cloud/syncMeta'

// SDK Firebase (~500KB) chỉ tải khi thật sự cần (có mã đồng bộ) — xem
// docs/adr/0005. Kể cả bản đóng gói 1 file HTML (chế độ "online") cũng tải
// chunk này khi cần, vì Đồng bộ nhiều thiết bị vốn cần mạng để hoạt động.
const loadFirebaseSync = () => import('../../data-access/cloud/firebaseSync')

const STATUS_LABEL: Record<SyncStatus, string> = {
  idle: '',
  connecting: '🔄 Đang kết nối...',
  syncing: '🔄 Đang đồng bộ...',
  synced: '✅ Đã đồng bộ',
  error: '⚠️ Lỗi đồng bộ — thử bấm "Đồng bộ ngay"',
}

// Đồng bộ tiến độ tự động giữa các thiết bị — không có trong URD gốc, bổ
// sung theo yêu cầu người dùng. Xem docs/adr/0005 để biết vì sao chọn
// Firebase và các đánh đổi (đặc biệt: mã đồng bộ đóng vai trò như mật khẩu,
// last-write-wins khi 2 thiết bị cùng sửa gần như đồng thời).
export function CloudSyncSection() {
  const [code, setCode] = useState<string | undefined>(getSyncCode())
  const [inputCode, setInputCode] = useState('')
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return
    loadFirebaseSync()
      .then((mod) => mod.initAutoSync(code, setStatus))
      .catch(() => setStatus('error'))
  }, [code])

  if (!isCloudSyncAvailable()) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">
          ☁️ Đồng bộ nhiều thiết bị
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Chưa cấu hình. Để bật đồng bộ tự động giữa các thiết bị (điện
          thoại, máy tính...), thêm cấu hình Firebase vào file{' '}
          <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">.env</code>{' '}
          — xem hướng dẫn trong README (mục "Đồng bộ nhiều thiết bị").
        </p>
      </div>
    )
  }

  async function handleCreateCode() {
    const newCode = generateSyncCode()
    if (
      !window.confirm(
        `Sẽ tạo mã mới "${newCode}" và dùng dữ liệu hiện tại trên máy này làm bản gốc. Nhập mã này trên thiết bị khác để liên kết. Tiếp tục?`,
      )
    ) {
      return
    }
    setCode(newCode)
    setMessage(`Đã tạo mã ${newCode}. Ghi lại và nhập trên thiết bị khác để liên kết.`)
  }

  async function handleLinkCode() {
    const trimmed = inputCode.trim().toUpperCase()
    if (!trimmed) return
    if (
      !window.confirm(
        `Liên kết với mã "${trimmed}"? Nếu mã này đã có dữ liệu trên cloud, dữ liệu đó sẽ GHI ĐÈ tiến độ hiện tại trên máy này.`,
      )
    ) {
      return
    }
    setCode(trimmed)
    setInputCode('')
    setMessage(`Đã liên kết với mã ${trimmed}.`)
  }

  async function handleDisable() {
    if (!window.confirm('Ngừng đồng bộ trên thiết bị này? Dữ liệu trên cloud vẫn giữ nguyên.')) {
      return
    }
    const mod = await loadFirebaseSync()
    mod.disableSync()
    setCode(undefined)
    setStatus('idle')
    setMessage('Đã ngừng đồng bộ trên thiết bị này.')
  }

  async function handleSyncNow() {
    const mod = await loadFirebaseSync()
    setMessage(null)
    await mod.syncNow(setStatus)
    setMessage('Đã đồng bộ xong.')
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">
          ☁️ Đồng bộ nhiều thiết bị
        </h2>
        {status !== 'idle' && (
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {STATUS_LABEL[status]}
          </span>
        )}
      </div>

      {code ? (
        <>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Đang liên kết với mã:
          </p>
          <p className="mt-1 rounded-xl bg-slate-100 px-4 py-2 text-center text-lg font-extrabold tracking-widest text-slate-800 dark:bg-slate-800 dark:text-slate-100">
            {code}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Tự động đồng bộ mỗi khi <strong>mở</strong> và <strong>rời</strong>{' '}
            ứng dụng (không đồng bộ liên tục trong lúc dùng, để tiết kiệm dữ
            liệu và không cần giữ kết nối mạng suốt phiên học). Nhập đúng mã
            này ở mục "Đồng bộ nhiều thiết bị" trên thiết bị khác để liên
            kết. Giữ kín mã — ai biết mã cũng xem/sửa được tiến độ này.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSyncNow}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
            >
              Đồng bộ ngay
            </button>
            <button
              type="button"
              onClick={handleDisable}
              className="rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              Ngừng đồng bộ
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Liên kết các thiết bị bằng 1 mã đồng bộ để tự động cập nhật tiến
            độ qua lại mỗi khi mở/rời ứng dụng — không cần bấm xuất/nhập thủ
            công mỗi lần đổi thiết bị.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCreateCode}
              className="rounded-full bg-slate-800 px-4 py-2 text-sm font-bold text-white dark:bg-slate-700"
            >
              Tạo mã mới (thiết bị đầu tiên)
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Nhập mã từ thiết bị khác"
              maxLength={8}
              className="rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-bold tracking-widest uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handleLinkCode}
              disabled={!inputCode.trim()}
              className="rounded-full border-2 border-emerald-500 px-4 py-2 text-sm font-bold text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-emerald-400"
            >
              Liên kết
            </button>
          </div>
        </>
      )}

      {message && (
        <p className="mt-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {message}
        </p>
      )}
    </div>
  )
}
