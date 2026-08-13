import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ReturnToSessionBanner } from '../../components/ReturnToSessionBanner'
import { SpeakButton } from '../../components/SpeakButton'
import { VoiceRecorder } from '../../components/VoiceRecorder'
import { getTopicLabel } from '../../content/topic-labels'
import { contentStore, progressStore } from '../../data-access'
import { useSessionReturn } from '../curriculum/returnTo'
import type { BoxLevel, VocabCard } from '../../types/domain'

const MAX_BOX: BoxLevel = 5

interface QueueItem {
  card: VocabCard
  box: BoxLevel
}

export function FlashcardsPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const { returnTo } = useSessionReturn()
  const [queue, setQueue] = useState<QueueItem[] | null>(null)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)

  useEffect(() => {
    if (!topicId) return
    contentStore.getVocabCards().then(async (allCards) => {
      const cards = allCards.filter((c) => c.topicId === topicId)
      const items = await Promise.all(
        cards.map(async (card) => ({
          card,
          box: (await progressStore.getVocabBoxLevel(card.id)) ?? (1 as BoxLevel),
        })),
      )
      // Ưu tiên ôn thẻ ở hộp thấp (mới/chưa thuộc) trước — FR-L06.
      items.sort((a, b) => a.box - b.box)
      setQueue(items)
      setIndex(0)
      setFlipped(false)
      setReviewedCount(0)
    })
  }, [topicId])

  if (!topicId) {
    return <Navigate to="/hoc-ly-thuyet" replace />
  }

  async function handleAnswer(knewIt: boolean) {
    if (!queue) return
    const current = queue[index]
    const nextBox: BoxLevel = knewIt
      ? (Math.min(current.box + 1, MAX_BOX) as BoxLevel)
      : 1
    await progressStore.setVocabBoxLevel(current.card.id, nextBox)
    setReviewedCount((n) => n + 1)
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  if (!queue) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center text-slate-500">
        Đang tải...
      </section>
    )
  }

  if (queue.length === 0) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center text-slate-500">
        Chưa có flashcard cho chủ đề này.
      </section>
    )
  }

  if (index >= queue.length) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <span className="text-4xl" aria-hidden="true">
          🎉
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Hoàn thành bộ thẻ!
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Bạn đã ôn {reviewedCount}/{queue.length} thẻ. Thẻ "Chưa thuộc" sẽ
          quay lại sớm hơn ở lượt ôn sau.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIndex(0)
              setReviewedCount(0)
            }}
            className="rounded-full border-2 border-emerald-500 px-5 py-2.5 font-bold text-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:text-emerald-400"
          >
            Ôn lại
          </button>
          <Link
            to={returnTo ?? '/hoc-ly-thuyet'}
            className="rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-5 py-2.5 font-bold text-white shadow-md shadow-emerald-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            {returnTo ? '▶️ Quay lại buổi học' : 'Về danh sách bài học'}
          </Link>
        </div>

        {/* UX fix: tới từ Session Runner thì tự động quay lại đúng buổi học
            sau vài giây, không bắt học sinh tự tìm đường về. */}
        {returnTo && <ReturnToSessionBanner returnTo={returnTo} />}
      </section>
    )
  }

  const { card, box } = queue[index]

  return (
    <section className="mx-auto max-w-xl px-4 py-12 text-center">
      <p className="text-sm font-bold text-slate-400">
        Thẻ {index + 1}/{queue.length} · Hộp {box}/{MAX_BOX}
      </p>
      <h1 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
        🗂️ {getTopicLabel(topicId)}
      </h1>

      <div className="relative mt-6">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="flex min-h-52 w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-slate-100 bg-white p-8 shadow-sm transition-colors hover:border-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-800 dark:bg-slate-900"
        >
          {!flipped ? (
            <>
              {/* MM-05: hình minh họa bằng emoji — có hình ảnh mà không thêm
                  tài nguyên nào; từ nào chưa gán emoji thì bỏ qua. */}
              {card.emoji && (
                <span className="text-5xl" aria-hidden="true">
                  {card.emoji}
                </span>
              )}
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {card.word}
              </span>
              <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold italic dark:bg-slate-800">
                  {card.partOfSpeech}
                </span>
                <span>{card.phonetic}</span>
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {card.meaning}
              </span>
              <span className="mt-2 text-slate-600 italic dark:text-slate-400">
                {card.example}
              </span>
            </>
          )}
          <span className="mt-4 text-xs font-bold text-slate-400">
            {flipped ? '(Bấm để xem lại mặt trước)' : '(Bấm để lật thẻ)'}
          </span>
        </button>
        <SpeakButton
          text={card.word}
          label={`Phát âm từ ${card.word} giọng Anh-Mỹ`}
          className="absolute top-3 right-3"
        />
        {/* Nghe cả câu ví dụ ở mặt sau — nghe ngữ điệu cả câu chứ không chỉ
            từ đơn lẻ (MM-02). */}
        {flipped && (
          <SpeakButton
            text={card.example}
            label={`Nghe câu ví dụ của từ ${card.word}`}
            size="sm"
            className="absolute right-3 bottom-3"
          />
        )}
      </div>

      {/* MM-07: nghe mẫu → tự đọc lại → nghe lại chính mình. Bản ghi chỉ nằm
          trong bộ nhớ tab, không lưu và không đồng bộ đi đâu. */}
      <div className="mt-4">
        <VoiceRecorder
          label={`Ghi âm phát âm từ ${card.word}`}
          resetKey={card.id}
        />
      </div>

      {flipped && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => handleAnswer(false)}
            className="rounded-full bg-rose-100 px-5 py-2.5 font-bold text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:bg-rose-500/10 dark:text-rose-400"
          >
            😅 Chưa thuộc
          </button>
          <button
            type="button"
            onClick={() => handleAnswer(true)}
            className="rounded-full bg-emerald-100 px-5 py-2.5 font-bold text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
          >
            😎 Đã thuộc
          </button>
        </div>
      )}
    </section>
  )
}
