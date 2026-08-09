import { PROGRESS_CHANGED_EVENT } from '../../data-access/cloud/syncMeta'

/**
 * MM-06 · Hiệu ứng âm thanh cho phản hồi đúng/sai và các trò chơi.
 *
 * Sinh âm bằng Web Audio API (dao động hình sin ngắn) thay vì file âm thanh:
 * không thêm một byte tài nguyên nào, hoạt động cả trong bản đóng gói 1 file
 * HTML và khi không có Internet.
 *
 * **Luôn có nút bật/tắt và mặc định BẬT**: âm thanh bất ngờ trong lớp học
 * hoặc khi học sinh đang ngồi cạnh người khác là phiền, nên trạng thái được
 * lưu trong localStorage và có công tắc ở trang Hồ sơ.
 */

const STORAGE_KEY = 'ol6.settings.sfxEnabled'

export function isSfxEnabled(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) !== 'false'
}

export function setSfxEnabled(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, String(enabled))
  // Dùng chung sự kiện tiến độ để các màn hình đang mở cập nhật công tắc ngay.
  window.dispatchEvent(new CustomEvent(PROGRESS_CHANGED_EVENT))
}

let audioContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!Ctor) return null
  audioContext ??= new Ctor()
  return audioContext
}

interface Tone {
  frequency: number
  /** Thời điểm bắt đầu, tính bằng giây kể từ lúc gọi. */
  at: number
  duration: number
}

function playTones(tones: Tone[]): void {
  if (!isSfxEnabled()) return
  const ctx = getContext()
  if (!ctx) return
  // Trình duyệt khóa AudioContext tới khi có tương tác người dùng — các
  // hiệu ứng này luôn phát sau một cú bấm nên resume() ở đây là hợp lệ.
  if (ctx.state === 'suspended') void ctx.resume()

  for (const tone of tones) {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = tone.frequency
    const start = ctx.currentTime + tone.at
    const end = start + tone.duration
    // Vào/ra êm để không nghe thấy tiếng "tách" ở hai đầu nốt.
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.12, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)
    oscillator.connect(gain).connect(ctx.destination)
    oscillator.start(start)
    oscillator.stop(end + 0.02)
  }
}

/** Trả lời đúng — hai nốt đi lên. */
export function playCorrect(): void {
  playTones([
    { frequency: 660, at: 0, duration: 0.09 },
    { frequency: 880, at: 0.09, duration: 0.13 },
  ])
}

/** Trả lời sai — một nốt trầm ngắn, cố ý KHÔNG chói tai. */
export function playWrong(): void {
  playTones([{ frequency: 200, at: 0, duration: 0.18 }])
}

/** Hoàn thành lượt chơi — hợp âm rải đi lên. */
export function playFinish(): void {
  playTones([
    { frequency: 523, at: 0, duration: 0.1 },
    { frequency: 659, at: 0.1, duration: 0.1 },
    { frequency: 784, at: 0.2, duration: 0.1 },
    { frequency: 1047, at: 0.3, duration: 0.2 },
  ])
}
