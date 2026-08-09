import { useEffect, useState } from 'react'
import {
  NORMAL_RATE,
  SLOW_RATE,
  cancelSpeech,
  isSpeechAvailable,
  speak,
} from '../modules/audio/speak'
import type { ReadingPassage } from '../types/domain'

/**
 * MM-03 · Hộp đoạn văn đọc hiểu có chức năng *read-along*: vừa nghe vừa nhìn
 * chữ, và **tô sáng đúng từ đang được đọc**.
 *
 * Vừa nghe vừa dõi theo từng từ là phương pháp chuẩn để tăng tốc độ đọc và
 * ngữ điệu ở lứa tuổi tiểu học — hiệu quả rõ nhất với học sinh đọc chậm, vì
 * mắt buộc phải bám theo giọng đọc thay vì nhảy cóc.
 *
 * Kỹ thuật: `SpeechSynthesisUtterance.onboundary` báo vị trí ký tự của từ sắp
 * đọc; từ đó cắt đoạn văn thành 3 phần (trước / từ đang đọc / sau). Trình
 * duyệt nào không bắn `onboundary` thì phần tô sáng đơn giản là không xuất
 * hiện — vẫn nghe được bình thường, không vỡ giao diện.
 */

interface ReadAlongPassageProps {
  passage: ReadingPassage
  /** Cho phép thu gọn đoạn văn (UX-09) — dùng ở màn hình làm bài. */
  collapsible?: boolean
  open?: boolean
  onToggle?: () => void
}

const LEVEL_BADGE: Record<'basic' | 'advanced', { label: string; className: string }> = {
  basic: {
    label: 'Cơ bản',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  advanced: {
    label: 'Nâng cao',
    className: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  },
}

export function ReadAlongPassage({
  passage,
  collapsible = false,
  open = true,
  onToggle,
}: ReadAlongPassageProps) {
  const [speaking, setSpeaking] = useState(false)
  const [slow, setSlow] = useState(false)
  const [mark, setMark] = useState<{ start: number; end: number } | null>(null)

  // Rời trang giữa chừng thì phải tắt giọng đọc, nếu không nó chạy tiếp sang
  // trang mới.
  useEffect(() => () => cancelSpeech(), [])

  function stop() {
    cancelSpeech()
    setSpeaking(false)
    setMark(null)
  }

  function start(rate: number) {
    setSpeaking(true)
    setSlow(rate === SLOW_RATE)
    speak(passage.text, {
      rate,
      onBoundary: (charIndex, charLength) => {
        if (charLength > 0) setMark({ start: charIndex, end: charIndex + charLength })
      },
      onEnd: () => {
        setSpeaking(false)
        setMark(null)
      },
    })
  }

  const level = passage.level ?? 'basic'
  const badge = LEVEL_BADGE[level]

  const body = mark ? (
    <>
      {passage.text.slice(0, mark.start)}
      <mark className="rounded bg-amber-300 px-0.5 text-slate-900 dark:bg-amber-400">
        {passage.text.slice(mark.start, mark.end)}
      </mark>
      {passage.text.slice(mark.end)}
    </>
  ) : (
    passage.text
  )

  return (
    <div className="rounded-xl border-2 border-sky-100 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-500/10">
      <div className="flex flex-wrap items-center gap-2">
        {collapsible ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="flex-1 text-left text-xs font-bold tracking-wide text-sky-600 uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:text-sky-400"
          >
            📖 {passage.title} {open ? '▲' : '▼ (bấm để mở)'}
          </button>
        ) : (
          <p className="flex-1 text-xs font-bold tracking-wide text-sky-600 uppercase dark:text-sky-400">
            📖 {passage.title}
          </p>
        )}
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {isSpeechAvailable() && (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => (speaking && !slow ? stop() : start(NORMAL_RATE))}
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-3 py-1.5 text-xs font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            <span aria-hidden="true">{speaking && !slow ? '⏹' : '🔊'}</span>
            {speaking && !slow ? 'Dừng' : 'Nghe bài đọc'}
          </button>
          <button
            type="button"
            onClick={() => (speaking && slow ? stop() : start(SLOW_RATE))}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-sky-300 px-3 py-1.5 text-xs font-bold text-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-sky-700 dark:text-sky-300"
          >
            <span aria-hidden="true">{speaking && slow ? '⏹' : '🐢'}</span>
            {speaking && slow ? 'Dừng' : 'Đọc chậm'}
          </button>
        </div>
      )}

      {open && (
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {body}
        </p>
      )}
    </div>
  )
}
