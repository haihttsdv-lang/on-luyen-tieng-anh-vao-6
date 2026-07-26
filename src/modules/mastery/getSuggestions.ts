import { getTopicLabel } from '../../content/topic-labels'
import type { Attempt, Question, Topic, VocabCard } from '../../types/domain'
import { FOUNDATIONAL_TOPIC_ORDER } from './foundationalOrder'
import {
  computeAllTopicMastery,
  groupAttemptsByTopic,
  MIN_ATTEMPTS_FOR_SCORE,
} from './masteryCalc'

export interface Suggestion {
  kind: 'weak-topic' | 'foundational' | 'vocab-review'
  label: string
  /** Lý do minh bạch (NFR-07) — ví dụ "vì bạn đúng 3/10 câu gần nhất". */
  reason: string
  href: string
}

const MAX_SUGGESTIONS = 3
const VOCAB_DUE_BOX_LEVEL = 2

interface GetSuggestionsParams {
  attempts: Attempt[]
  questions: Question[]
  topics: Topic[]
  vocabCards: VocabCard[]
  vocabBoxLevels: Record<string, number>
}

function topicHref(topicId: string, topics: Topic[]): string {
  const hasLesson = topics.some((t) => t.id === topicId)
  return hasLesson ? `/hoc-ly-thuyet/${topicId}` : '/luyen-tap/chu-diem'
}

export function getSuggestions({
  attempts,
  questions,
  topics,
  vocabCards,
  vocabBoxLevels,
}: GetSuggestionsParams): Suggestion[] {
  const byTopic = groupAttemptsByTopic(attempts, questions)
  const masteryByTopic = computeAllTopicMastery(attempts, questions)

  // FR-M06: xếp hạng "yếu nhất" trong số chủ điểm đã luyện >=1 lần — dùng
  // điểm thô (không cần đủ MIN_ATTEMPTS_FOR_SCORE như khi hiển thị trên bản
  // đồ năng lực) để không bỏ sót chủ điểm mới luyện 1–2 lần mà sai nhiều.
  const attemptedTopics = Object.entries(byTopic)
    .filter(([, list]) => list.length > 0)
    .map(([topicId, list]) => {
      const official = masteryByTopic[topicId]
      const correct = list.filter((a) => a.correct).length
      const rankingScore =
        official.score ?? correct / list.length
      return { topicId, rankingScore, correct, total: list.length, official }
    })
    .sort((a, b) => a.rankingScore - b.rankingScore)

  const suggestions: Suggestion[] = []

  for (const candidate of attemptedTopics) {
    if (suggestions.length >= MAX_SUGGESTIONS) break
    const hasEnoughForOfficialScore =
      candidate.official.totalAttempts >= MIN_ATTEMPTS_FOR_SCORE
    const reasonCount = hasEnoughForOfficialScore
      ? `${Math.round((candidate.official.score ?? 0) * candidate.official.attemptsUsed)}/${candidate.official.attemptsUsed} câu gần nhất`
      : `${candidate.correct}/${candidate.total} câu đã làm`
    suggestions.push({
      kind: 'weak-topic',
      label: `Ôn lại ${candidate.topicId} — ${getTopicLabel(candidate.topicId)}`,
      reason: `Vì bạn đúng ${reasonCount}`,
      href: topicHref(candidate.topicId, topics),
    })
  }

  // FR-M08: kết hợp gợi ý ôn từ vựng nếu có thẻ ở hộp thấp (mới/dễ quên).
  // Chọn chủ đề có nhiều thẻ "sắp quên" nhất để gợi ý cụ thể, không gộp
  // chung nhiều chủ đề (tránh số đếm không khớp với trang đích).
  const dueCards = vocabCards.filter(
    (card) => (vocabBoxLevels[card.id] ?? 1) <= VOCAB_DUE_BOX_LEVEL,
  )
  const dueCountByTopic = new Map<string, number>()
  for (const card of dueCards) {
    dueCountByTopic.set(card.topicId, (dueCountByTopic.get(card.topicId) ?? 0) + 1)
  }
  const topDueTopic = [...dueCountByTopic.entries()].sort((a, b) => b[1] - a[1])[0]
  if (topDueTopic && suggestions.length < MAX_SUGGESTIONS) {
    const [dueTopicId, dueCount] = topDueTopic
    suggestions.push({
      kind: 'vocab-review',
      label: `Ôn flashcard ${dueTopicId} — ${dueCount} từ sắp quên`,
      reason: 'Vì các từ này chưa được đánh giá "Đã thuộc" gần đây',
      href: `/hoc-ly-thuyet/tu-vung/${dueTopicId}`,
    })
  }

  // FR-M07: chủ điểm chưa từng luyện KHÔNG bị coi là yếu — lấp đầy chỗ còn
  // trống bằng lộ trình nền tảng mặc định, chỉ chọn chủ điểm đã có nội dung.
  if (suggestions.length < MAX_SUGGESTIONS) {
    const availableTopicIds = new Set(questions.flatMap((q) => q.topicIds))
    const attemptedIds = new Set(Object.keys(byTopic))
    for (const topicId of FOUNDATIONAL_TOPIC_ORDER) {
      if (suggestions.length >= MAX_SUGGESTIONS) break
      if (attemptedIds.has(topicId)) continue
      if (!availableTopicIds.has(topicId)) continue
      suggestions.push({
        kind: 'foundational',
        label: `Bắt đầu học ${topicId} — ${getTopicLabel(topicId)}`,
        reason: 'Chủ điểm nền tảng nên học sớm',
        href: topicHref(topicId, topics),
      })
    }
  }

  return suggestions.slice(0, MAX_SUGGESTIONS)
}
