// Phát âm bằng Web Speech API sẵn có của trình duyệt — không cần file âm
// thanh, không cần Internet, không tăng dung lượng bundle. Tách ra từ
// `speakWord()` vốn nằm riêng trong FlashcardsPage để dùng chung cho Ngữ âm
// (KN-08), câu ví dụ trong bài học và bài đọc hiểu — xem MM-01/MM-02/MM-03
// trong docs/RA-SOAT-VA-GOP-Y-PHAT-TRIEN.md.

export interface SpeakOptions {
  /** Tốc độ đọc. 1 = bình thường, 0.6–0.7 = đọc chậm để nghe rõ từng âm. */
  rate?: number
  /** Gọi khi đọc xong (hoặc bị hủy) — dùng để tắt trạng thái "đang đọc". */
  onEnd?: () => void
  /** Gọi mỗi khi chuyển sang từ mới — dùng để tô sáng từ đang đọc (MM-03). */
  onBoundary?: (charIndex: number, charLength: number) => void
}

export const NORMAL_RATE = 0.9
export const SLOW_RATE = 0.65

export function isSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function cancelSpeech(): void {
  if (!isSpeechAvailable()) return
  window.speechSynthesis.cancel()
}

/**
 * Đọc một đoạn văn bản tiếng Anh. Luôn hủy phần đang đọc dở trước đó để
 * tránh chồng tiếng khi học sinh bấm liên tiếp nhiều nút.
 */
export function speak(text: string, options: SpeakOptions = {}): void {
  if (!isSpeechAvailable() || !text.trim()) {
    options.onEnd?.()
    return
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = options.rate ?? NORMAL_RATE
  if (options.onEnd) {
    utterance.onend = () => options.onEnd?.()
    utterance.onerror = () => options.onEnd?.()
  }
  if (options.onBoundary) {
    utterance.onboundary = (event) => {
      // `charLength` không được mọi trình duyệt hỗ trợ — suy ra từ độ dài
      // token bắt đầu tại charIndex khi thiếu.
      const length =
        event.charLength ?? (text.slice(event.charIndex).match(/^\S+/)?.[0].length ?? 0)
      options.onBoundary?.(event.charIndex, length)
    }
  }
  window.speechSynthesis.speak(utterance)
}

/**
 * Đọc lần lượt nhiều đoạn (ví dụ "Nghe cả 4 phương án", "Nghe toàn bộ ví
 * dụ"), có khoảng nghỉ ngắn giữa các đoạn nhờ đọc thành nhiều utterance
 * riêng thay vì nối chuỗi.
 */
export function speakSequence(texts: string[], options: SpeakOptions = {}): void {
  const items = texts.filter((t) => t.trim())
  if (!isSpeechAvailable() || items.length === 0) {
    options.onEnd?.()
    return
  }
  window.speechSynthesis.cancel()
  items.forEach((text, index) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = options.rate ?? NORMAL_RATE
    if (index === items.length - 1 && options.onEnd) {
      utterance.onend = () => options.onEnd?.()
      utterance.onerror = () => options.onEnd?.()
    }
    window.speechSynthesis.speak(utterance)
  })
}

/**
 * Bỏ phần tiếng Việt và ký hiệu phiên âm khỏi chuỗi trước khi đọc — dùng cho
 * các phương án dạng `"pre'sent"` (đánh dấu trọng âm) hay `"apple /ˈæpl/"`.
 */
export function toSpeakableWord(raw: string): string {
  return raw
    .replace(/\/[^/]*\//g, ' ') // bỏ phiên âm IPA trong dấu gạch chéo
    .replace(/[ˈˌ'’`]/g, '') // bỏ dấu trọng âm
    .replace(/\s+/g, ' ')
    .trim()
}
