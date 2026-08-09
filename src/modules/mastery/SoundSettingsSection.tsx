import { useState } from 'react'
import { isSfxEnabled, playCorrect, setSfxEnabled } from '../audio/sfx'
import { isSpeechAvailable } from '../audio/speak'

/**
 * MM-06 · Công tắc hiệu ứng âm thanh. Bắt buộc phải có: âm thanh phát bất
 * ngờ khi học sinh đang ngồi trong lớp hoặc cạnh người khác là phiền, và
 * không phải phụ huynh nào cũng muốn bật.
 */
export function SoundSettingsSection() {
  const [enabled, setEnabled] = useState(isSfxEnabled)

  function toggle() {
    const next = !enabled
    setEnabled(next)
    setSfxEnabled(next)
    if (next) playCorrect() // nghe thử ngay để biết âm thanh thế nào
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
        🔊 Âm thanh
      </h2>
      <label className="mt-3 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={toggle}
          className="mt-1 h-5 w-5 accent-emerald-600"
        />
        <span>
          <span className="block font-bold text-slate-800 dark:text-slate-200">
            Hiệu ứng âm thanh khi luyện tập
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Tiếng báo đúng/sai và tiếng chúc mừng khi hoàn thành. Tắt đi nếu em
            đang học ở nơi cần yên tĩnh.
          </span>
        </span>
      </label>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        {isSpeechAvailable()
          ? 'Nút 🔊 đọc từ và câu tiếng Anh luôn hoạt động, không phụ thuộc công tắc này.'
          : 'Trình duyệt này không hỗ trợ đọc tiếng Anh, nên các nút 🔊 sẽ bị ẩn.'}
      </p>
    </section>
  )
}
