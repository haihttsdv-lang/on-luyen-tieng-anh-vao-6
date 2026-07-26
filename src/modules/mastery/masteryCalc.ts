import type { Attempt, Question, SkillId } from '../../types/domain'

/**
 * Công thức tính mức độ thành thạo (FR-M03, đã xác nhận với người dùng):
 * trung bình có trọng số của tối đa 10 lượt làm gần nhất cho mỗi chủ điểm,
 * lượt gần đây nhất có trọng số cao nhất, giảm dần tuyến tính. Cần tối
 * thiểu 3 lượt làm mới bắt đầu tính điểm hiển thị (dưới 3 lượt = 'no-data').
 *
 * Ngưỡng phân loại 3 mức (FR-M04, đã xác nhận): <50% Cần ôn lại,
 * 50–80% Đang tiến bộ, >80% Thành thạo.
 */
export const RECENCY_WINDOW = 10
export const MIN_ATTEMPTS_FOR_SCORE = 3
export const WEAK_THRESHOLD = 0.5
export const MASTERED_THRESHOLD = 0.8

export type MasteryLevel = 'no-data' | 'weak' | 'improving' | 'mastered'

export interface MasteryResult {
  /** 0–1, null nếu chưa đủ MIN_ATTEMPTS_FOR_SCORE lượt làm */
  score: number | null
  /** Tổng số lượt làm gần nhất được dùng để tính (tối đa RECENCY_WINDOW) */
  attemptsUsed: number
  /** Tổng số lượt làm toàn bộ (không giới hạn cửa sổ) — dùng để quyết định 'no-data' */
  totalAttempts: number
  level: MasteryLevel
}

export function classifyLevel(score: number): Exclude<MasteryLevel, 'no-data'> {
  if (score < WEAK_THRESHOLD) return 'weak'
  if (score <= MASTERED_THRESHOLD) return 'improving'
  return 'mastered'
}

/** Sắp xếp attempts theo thời gian tăng dần, lấy tối đa N lượt gần nhất. */
function takeRecent(attempts: Attempt[], n: number): Attempt[] {
  return [...attempts]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(-n)
}

export function computeWeightedMastery(attempts: Attempt[]): MasteryResult {
  const totalAttempts = attempts.length
  if (totalAttempts < MIN_ATTEMPTS_FOR_SCORE) {
    return { score: null, attemptsUsed: 0, totalAttempts, level: 'no-data' }
  }

  const recent = takeRecent(attempts, RECENCY_WINDOW)
  const k = recent.length
  // Lượt cũ nhất trong cửa sổ có trọng số 1, lượt mới nhất có trọng số k.
  let weightedSum = 0
  let weightTotal = 0
  recent.forEach((attempt, i) => {
    const weight = i + 1
    weightedSum += (attempt.correct ? 1 : 0) * weight
    weightTotal += weight
  })
  const score = weightedSum / weightTotal

  return { score, attemptsUsed: k, totalAttempts, level: classifyLevel(score) }
}

function buildQuestionMap(questions: Question[]) {
  return new Map(questions.map((q) => [q.id, q]))
}

export function groupAttemptsByTopic(
  attempts: Attempt[],
  questions: Question[],
): Record<string, Attempt[]> {
  const questionMap = buildQuestionMap(questions)
  const byTopic: Record<string, Attempt[]> = {}
  for (const attempt of attempts) {
    if (!attempt.questionId) continue
    const question = questionMap.get(attempt.questionId)
    if (!question) continue
    for (const topicId of question.topicIds) {
      ;(byTopic[topicId] ??= []).push(attempt)
    }
  }
  return byTopic
}

export function groupAttemptsBySkill(
  attempts: Attempt[],
  questions: Question[],
): Partial<Record<SkillId, Attempt[]>> {
  const questionMap = buildQuestionMap(questions)
  const bySkill: Partial<Record<SkillId, Attempt[]>> = {}
  for (const attempt of attempts) {
    if (!attempt.questionId) continue
    const question = questionMap.get(attempt.questionId)
    if (!question) continue
    ;(bySkill[question.skillId] ??= []).push(attempt)
  }
  return bySkill
}

export function computeAllTopicMastery(
  attempts: Attempt[],
  questions: Question[],
): Record<string, MasteryResult> {
  const byTopic = groupAttemptsByTopic(attempts, questions)
  const result: Record<string, MasteryResult> = {}
  for (const [topicId, topicAttempts] of Object.entries(byTopic)) {
    result[topicId] = computeWeightedMastery(topicAttempts)
  }
  return result
}

export function computeAllSkillMastery(
  attempts: Attempt[],
  questions: Question[],
): Partial<Record<SkillId, MasteryResult>> {
  const bySkill = groupAttemptsBySkill(attempts, questions)
  const result: Partial<Record<SkillId, MasteryResult>> = {}
  for (const [skillId, skillAttempts] of Object.entries(bySkill)) {
    result[skillId as SkillId] = computeWeightedMastery(skillAttempts)
  }
  return result
}
