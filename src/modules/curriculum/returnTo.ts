import { useSearchParams } from 'react-router-dom'

/**
 * Trước đây các nút hành động trong buổi học (PP-02, `getBlockAction`) đưa
 * học sinh sang trang Lý thuyết/Luyện tập/Quiz nhưng KHÔNG mang theo thông
 * tin "đang học buổi nào" — học xong lại phải tự bấm về Lộ trình học rồi tự
 * tìm lại đúng buổi. Gắn `from=<sessionId>` vào URL đích để các trang đó biết
 * đường quay lại, và tự động điều hướng về khi hoàn thành (xem
 * `ReturnToSessionBanner`).
 */
export const SESSION_RETURN_PARAM = 'from'

export function withSessionReturn(to: string, sessionId: string): string {
  const separator = to.includes('?') ? '&' : '?'
  return `${to}${separator}${SESSION_RETURN_PARAM}=${encodeURIComponent(sessionId)}`
}

export interface SessionReturnInfo {
  /** id buổi học nếu trang này được mở từ Lộ trình học, ngược lại `null`. */
  sessionId: string | null
  /** URL Session Runner để quay lại đúng buổi đó, `null` nếu không tới từ đó. */
  returnTo: string | null
}

/** Đọc `from` trên URL hiện tại — dùng ở các trang đích để biết có nên tự
 * động quay lại Session Runner khi hoàn thành hoạt động hay không. */
export function useSessionReturn(): SessionReturnInfo {
  const [params] = useSearchParams()
  const sessionId = params.get(SESSION_RETURN_PARAM)
  return {
    sessionId,
    returnTo: sessionId ? `/lo-trinh-hoc/${sessionId}/hoc` : null,
  }
}
