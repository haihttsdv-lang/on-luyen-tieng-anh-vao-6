import type {
  Attempt,
  BoxLevel,
  ScheduledSession,
  SessionOutcome,
  SuccessCriterion,
  TopicStatus,
  VocabCard,
} from '../../types/domain'

/**
 * PP-03 · Gợi ý mức tự đánh giá dựa trên DỮ LIỆU THẬT thay vì để 3 nút
 * 🌟/🙂/😅 hoàn toàn cảm tính.
 *
 * Trước đây bấm "Xuất sắc" không cần học gì vẫn +xu, và `completedAt` vẫn
 * được ghi nhận — khiến lịch thích ứng (`buildAdaptiveSchedule`) đẩy các
 * buổi sau như thể đã học xong. Hàm này gộp 4 nguồn dữ liệu ĐÃ CÓ SẴN trong
 * ứng dụng thành một điểm hoàn thành 0–1, rồi gợi ý mức tương ứng — học sinh
 * vẫn được xác nhận hoặc hạ xuống, nhưng không thể tự nâng lên "Xuất sắc"
 * khi điểm quá thấp (xem `canPickOutcome`).
 *
 * Trọng số theo tài liệu rà soát (PP-03): quiz 40% · số câu luyện tập 30% ·
 * từ vựng 20% · số khối đã hoàn thành 10%. Với buổi KHÔNG có `topicId` cụ
 * thể (khai giảng, ôn tập, luyện đề, kiểm tra định kỳ...) thì không có quiz
 * hay flashcard riêng để đối chiếu — dồn trọng số quiz+vocab (60%) sang số
 * câu luyện tập, giữ nguyên 10% cho số khối hoàn thành.
 */

const MIN_ATTEMPTS_FOR_FULL_CREDIT = 10
const GREAT_THRESHOLD = 0.7
const OK_THRESHOLD = 0.35
/** Ngưỡng tối thiểu để được TỰ chọn "Xuất sắc" — thấp hơn thì chỉ gợi ý tối đa "Ổn". */
const GREAT_PICK_THRESHOLD = 0.5

export interface SessionCompletionInput {
  session: Pick<ScheduledSession, 'topicIds' | 'vocabTopicId'>
  /** Toàn bộ lượt luyện tập của học sinh (Attempt.timestamp dùng để lọc theo buổi). */
  attempts: Attempt[]
  /** Thời điểm bắt đầu phiên học (ISO) — chỉ đếm lượt luyện tập SAU mốc này. */
  sessionStartAt: string
  topicStatuses: Record<string, TopicStatus>
  vocabBoxLevels: Record<string, BoxLevel>
  vocabCards: VocabCard[]
  doneBlockCount: number
  totalBlockCount: number
}

export interface SessionCompletionResult {
  /** 0–1, càng cao càng cho thấy đã thực sự học trong buổi này. */
  score: number
  suggestedOutcome: SessionOutcome
  attemptsCount: number
  quizMastered: boolean | null
  vocabAvgProgress: number | null
  blocksDoneRatio: number
}

export function computeSessionCompletion(
  input: SessionCompletionInput,
): SessionCompletionResult {
  const { session, attempts, sessionStartAt, topicStatuses, vocabBoxLevels, vocabCards } =
    input

  const attemptsCount = attempts.filter((a) => a.timestamp >= sessionStartAt).length
  const attemptsRatio = Math.min(attemptsCount / MIN_ATTEMPTS_FOR_FULL_CREDIT, 1)

  const primaryTopicId = session.topicIds[0]
  const quizMastered = primaryTopicId ? topicStatuses[primaryTopicId] === 'mastered' : null

  let vocabAvgProgress: number | null = null
  if (session.vocabTopicId) {
    const cards = vocabCards.filter((c) => c.topicId === session.vocabTopicId)
    if (cards.length > 0) {
      const total = cards.reduce((sum, c) => sum + ((vocabBoxLevels[c.id] ?? 1) - 1) / 4, 0)
      vocabAvgProgress = total / cards.length
    }
  }

  const blocksDoneRatio =
    input.totalBlockCount > 0 ? input.doneBlockCount / input.totalBlockCount : 0

  let score: number
  if (quizMastered !== null || vocabAvgProgress !== null) {
    const quizPart = quizMastered !== null ? (quizMastered ? 1 : 0) * 0.4 : 0
    const vocabPart = vocabAvgProgress !== null ? vocabAvgProgress * 0.2 : 0
    // Chủ điểm có quiz nhưng buổi không ôn từ vựng (hoặc ngược lại): dồn phần
    // trọng số của thành phần vắng mặt sang số câu luyện tập, để tổng trọng
    // số luôn là 1 thay vì bị "mất điểm oan" vì thiếu dữ liệu không áp dụng.
    const missing = (quizMastered === null ? 0.4 : 0) + (vocabAvgProgress === null ? 0.2 : 0)
    score = quizPart + vocabPart + attemptsRatio * (0.3 + missing) + blocksDoneRatio * 0.1
  } else {
    score = attemptsRatio * 0.9 + blocksDoneRatio * 0.1
  }
  score = Math.max(0, Math.min(1, score))

  const suggestedOutcome: SessionOutcome =
    score >= GREAT_THRESHOLD ? 'great' : score >= OK_THRESHOLD ? 'ok' : 'weak'

  return {
    score,
    suggestedOutcome,
    attemptsCount,
    quizMastered,
    vocabAvgProgress,
    blocksDoneRatio,
  }
}

/** PP-03: không cho tự chọn "Xuất sắc" nếu dữ liệu thật quá thấp (< 50%). */
export function canPickOutcome(outcome: SessionOutcome, score: number): boolean {
  if (outcome === 'great') return score >= GREAT_PICK_THRESHOLD
  return true
}

/**
 * PP-04: đối chiếu từng `SuccessCriterion` của buổi học bằng ĐÚNG dữ liệu
 * thật đã tính ở `computeSessionCompletion` — không phải tự học sinh tick
 * tay. `quizMastered`/`vocabProgress` trả `false` khi buổi không có quiz/từ
 * vựng tương ứng (`null`) thay vì báo lỗi, vì khi đó bản thân tiêu chí đó
 * không nên xuất hiện trong dữ liệu buổi học (nhưng vẫn cần xử lý an toàn).
 */
export function evaluateSuccessCriterion(
  criterion: SuccessCriterion,
  completion: SessionCompletionResult,
): boolean {
  switch (criterion.check.type) {
    case 'blocksDone':
      return completion.blocksDoneRatio >= 1
    case 'quizMastered':
      return completion.quizMastered === true
    case 'vocabProgress':
      return (completion.vocabAvgProgress ?? 0) >= criterion.check.minRatio
    case 'minAttempts':
      return completion.attemptsCount >= criterion.check.count
  }
}
