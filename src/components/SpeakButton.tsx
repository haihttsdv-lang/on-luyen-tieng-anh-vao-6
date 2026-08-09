import { useEffect, useState } from 'react'
import {
  NORMAL_RATE,
  cancelSpeech,
  isSpeechAvailable,
  speak,
  speakSequence,
} from '../modules/audio/speak'

type Size = 'sm' | 'md'

interface SpeakButtonProps {
  /** Văn bản cần đọc. Truyền mảng để đọc lần lượt nhiều đoạn. */
  text: string | string[]
  /** Nhãn cho trình đọc màn hình, ví dụ "Nghe câu ví dụ 1". */
  label: string
  /** Chữ hiện cạnh biểu tượng loa (mặc định chỉ có biểu tượng). */
  children?: React.ReactNode
  rate?: number
  size?: Size
  className?: string
}

const SIZE_CLASS: Record<Size, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-base',
}

/**
 * Nút 🔊 dùng chung cho toàn ứng dụng (MM-01/02/03). Tự ẩn khi trình duyệt
 * không hỗ trợ Web Speech API, và hiện trạng thái "đang đọc" để học sinh
 * biết bấm lần nữa là dừng.
 */
export function SpeakButton({
  text,
  label,
  children,
  rate = NORMAL_RATE,
  size = 'md',
  className = '',
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false)

  // Rời trang giữa chừng thì phải tắt tiếng, nếu không giọng đọc vẫn chạy
  // tiếp ở trang mới.
  useEffect(() => () => cancelSpeech(), [])

  if (!isSpeechAvailable()) return null

  function handleClick(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (speaking) {
      cancelSpeech()
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    const onEnd = () => setSpeaking(false)
    if (Array.isArray(text)) speakSequence(text, { rate, onEnd })
    else speak(text, { rate, onEnd })
  }

  const shape = children
    ? 'gap-1.5 rounded-full px-3 py-1.5 text-xs'
    : `justify-center rounded-full ${SIZE_CLASS[size]}`

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleClick}
      className={`inline-flex shrink-0 items-center font-bold transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${shape} ${
        speaking
          ? 'bg-emerald-500 text-white'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
      } ${className}`}
    >
      <span aria-hidden="true">{speaking ? '🔈' : '🔊'}</span>
      {children}
    </button>
  )
}
