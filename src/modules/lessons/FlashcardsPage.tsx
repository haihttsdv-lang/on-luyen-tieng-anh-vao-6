import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getTopicLabel } from '../../content/topic-labels'
import { contentStore, progressStore } from '../../data-access'
import type { BoxLevel, VocabCard } from '../../types/domain'

const MAX_BOX: BoxLevel = 5

interface QueueItem {
  card: VocabCard
  box: BoxLevel
}

// Phát âm giọng Anh-Mỹ bằng Web Speech API của trình duyệt — không cần file
// âm thanh hay mạng, phù hợp cả với bản offline đóng gói 1 file HTML.
function speakWord(word: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}

export function FlashcardsPage() {
  const { topicId } = useParams<{ topicId: string }>()
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
            to="/hoc-ly-thuyet"
            className="rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-5 py-2.5 font-bold text-white shadow-md shadow-emerald-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            Về danh sách bài học
          </Link>
        </div>
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
        <button
          type="button"
          aria-label={`Phát âm từ ${card.word} giọng Anh-Mỹ`}
          onClick={(e) => {
            e.stopPropagation()
            speakWord(card.word)
          }}
          className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-700 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
        >
          🔊
        </button>
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
