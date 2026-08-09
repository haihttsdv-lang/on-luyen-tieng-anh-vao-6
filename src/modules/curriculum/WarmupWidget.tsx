import { useEffect, useState } from 'react'
import { SpeakButton } from '../../components/SpeakButton'
import { contentStore } from '../../data-access'
import { toSpeakableWord } from '../audio/speak'
import type { ScheduledSession } from '../../types/domain'

const MAX_ITEMS = 8

interface WarmupItem {
  text: string
  emoji?: string
}

/**
 * AT-01/AT-02 · Khối "Khởi động" trong Session Runner (PP-01) trước đây chỉ
 * mô tả bằng chữ "Trò chơi ôn nhanh từ vựng..." / "Nghe 6 từ được đọc lên
 * (dùng nút 🔊)..." mà không có gì để thực sự bấm nghe NGAY tại chỗ — học
 * sinh phải tự tưởng tượng ra hoạt động đó. Widget này hiện trực tiếp danh
 * sách từ có thể nghe được, tái dùng dữ liệu đã có sẵn (không cần biên soạn
 * nội dung mới):
 *
 *   - Buổi 'grammar' (có `vocabTopicId`): lấy tối đa 8 thẻ từ vựng đầu tiên
 *     của chủ đề đang ôn, kèm emoji minh họa nếu có (MM-05).
 *   - Buổi 'skill-lesson' dạng Ngữ âm (`skillId === 'KN-08'`): lấy các từ ví
 *     dụ THẬT từ chính ngân hàng câu hỏi Ngữ âm — không tự bịa danh sách từ
 *     minh họa riêng, tránh lệch với nội dung luyện tập ngay sau đó.
 */
export function WarmupWidget({
  session,
}: {
  session: Pick<ScheduledSession, 'vocabTopicId' | 'skillId'>
}) {
  const [items, setItems] = useState<WarmupItem[] | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (session.vocabTopicId) {
        const cards = await contentStore.getVocabCards()
        const picked = cards
          .filter((c) => c.topicId === session.vocabTopicId)
          .slice(0, MAX_ITEMS)
          .map((c) => ({ text: c.word, emoji: c.emoji }))
        if (!cancelled) setItems(picked)
        return
      }
      if (session.skillId === 'KN-08') {
        const questions = await contentStore.getQuestions()
        const words = questions
          .filter((q) => q.skillId === 'KN-08')
          .flatMap((q) => q.options.map(toSpeakableWord))
        const unique = [...new Set(words)].slice(0, MAX_ITEMS).map((text) => ({ text }))
        if (!cancelled) setItems(unique)
        return
      }
      if (!cancelled) setItems([])
    }
    load()
    return () => {
      cancelled = true
    }
  }, [session.vocabTopicId, session.skillId])

  if (!items || items.length === 0) return null

  return (
    <div className="mt-3 rounded-xl border border-dashed border-emerald-300 bg-white/70 p-3 dark:border-emerald-800 dark:bg-slate-900/40">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">🔊 Nghe thử ngay</p>
        <SpeakButton text={items.map((w) => w.text)} label="Nghe tất cả từ ở khối khởi động" size="sm">
          Nghe tất cả
        </SpeakButton>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.text}
            className="flex items-center gap-1.5 rounded-full bg-emerald-50 py-1.5 pr-1.5 pl-3 text-sm font-bold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            {item.emoji && <span aria-hidden="true">{item.emoji}</span>}
            {item.text}
            <SpeakButton text={item.text} label={`Nghe từ ${item.text}`} size="sm" />
          </span>
        ))}
      </div>
    </div>
  )
}
