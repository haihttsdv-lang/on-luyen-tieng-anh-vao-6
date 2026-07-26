import { useRef, useState } from 'react'
import { progressStore } from '../../data-access'

// NFR-05: Phương án A chỉ lưu tiến độ trong localStorage — dễ mất khi xóa
// cache trình duyệt hoặc đổi thiết bị. Xuất/nhập JSON là lớp an toàn đơn
// giản, không cần backend (không có trong URD gốc, bổ sung theo yêu cầu).
export function BackupSection() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleExport() {
    const json = await progressStore.exportAll()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `on-luyen-tieng-anh-tien-do-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('Đã tải file sao lưu.')
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (
      !window.confirm(
        'Khôi phục sẽ GHI ĐÈ toàn bộ tiến độ hiện tại trên máy này bằng dữ liệu trong file. Tiếp tục?',
      )
    ) {
      return
    }

    try {
      const text = await file.text()
      await progressStore.importAll(text)
      setMessage('Khôi phục thành công! Đang tải lại trang...')
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Khôi phục thất bại.')
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">
        💾 Sao lưu & khôi phục
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Tiến độ chỉ lưu trên trình duyệt này. Hãy tải file sao lưu định kỳ để
        không mất dữ liệu khi xóa bộ nhớ trình duyệt hoặc đổi thiết bị.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-full bg-slate-800 px-4 py-2 text-sm font-bold text-white dark:bg-slate-700"
        >
          Tải file sao lưu
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
        >
          Khôi phục từ file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {message && (
        <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {message}
        </p>
      )}
    </div>
  )
}
