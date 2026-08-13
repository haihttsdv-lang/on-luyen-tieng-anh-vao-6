import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AUTO_RETURN_SECONDS = 3

/**
 * Khi một hoạt động (quiz/luyện tập/flashcard) được mở TỪ Session Runner
 * (`?from=<sessionId>`, xem `returnTo.ts`) và vừa hoàn thành, tự động điều
 * hướng lại đúng buổi học đó sau vài giây — trước đây học sinh phải tự bấm
 * "Về danh sách..." rồi tự tìm lại buổi trong Lộ trình học. Vẫn hiện đủ lâu
 * để đọc kết quả trước khi chuyển trang, và luôn có nút bấm ngay nếu không
 * muốn chờ.
 */
export function ReturnToSessionBanner({ returnTo }: { returnTo: string }) {
  const navigate = useNavigate()
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RETURN_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate(returnTo)
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, navigate, returnTo])

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 rounded-xl border-2 border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800 dark:border-sky-800 dark:bg-sky-500/10 dark:text-sky-300">
      <span>▶️ Tự động quay lại buổi học sau {secondsLeft}s…</span>
      <button
        type="button"
        onClick={() => navigate(returnTo)}
        className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        Quay lại ngay
      </button>
    </div>
  )
}
