import { describe, expect, it } from 'vitest'
import {
  classifyLevel,
  computeAllTopicMastery,
  computeWeightedMastery,
  MASTERED_THRESHOLD,
  MIN_ATTEMPTS_FOR_SCORE,
  WEAK_THRESHOLD,
} from '../../src/modules/mastery/masteryCalc'
import type { Attempt, Question } from '../../src/types/domain'

function makeAttempt(
  correct: boolean,
  timestamp: string,
  questionId = 'Q1',
): Attempt {
  return { id: `${questionId}-${timestamp}`, questionId, correct, timestamp }
}

function makeQuestion(id: string, topicIds: string[]): Question {
  return {
    id,
    prompt: 'p',
    options: ['a', 'b', 'c', 'd'],
    answerIndex: 0,
    explain: 'e',
    topicIds,
    skillId: 'KN-06',
  }
}

describe('classifyLevel', () => {
  it('phân loại đúng 3 ngưỡng đã xác nhận: <50% yếu, 50–80% tiến bộ, >80% thành thạo', () => {
    expect(classifyLevel(0)).toBe('weak')
    expect(classifyLevel(0.49)).toBe('weak')
    expect(classifyLevel(WEAK_THRESHOLD)).toBe('improving')
    expect(classifyLevel(0.65)).toBe('improving')
    expect(classifyLevel(MASTERED_THRESHOLD)).toBe('improving')
    expect(classifyLevel(0.81)).toBe('mastered')
    expect(classifyLevel(1)).toBe('mastered')
  })
})

describe('computeWeightedMastery', () => {
  it('trả về no-data khi số lượt làm dưới ngưỡng tối thiểu', () => {
    const attempts = [
      makeAttempt(true, '2026-01-01T00:00:00Z'),
      makeAttempt(true, '2026-01-02T00:00:00Z'),
    ]
    expect(attempts.length).toBeLessThan(MIN_ATTEMPTS_FOR_SCORE)
    const result = computeWeightedMastery(attempts)
    expect(result.level).toBe('no-data')
    expect(result.score).toBeNull()
  })

  it('tính điểm 100% khi mọi lượt (đủ tối thiểu) đều đúng', () => {
    const attempts = [
      makeAttempt(true, '2026-01-01T00:00:00Z'),
      makeAttempt(true, '2026-01-02T00:00:00Z'),
      makeAttempt(true, '2026-01-03T00:00:00Z'),
    ]
    const result = computeWeightedMastery(attempts)
    expect(result.score).toBe(1)
    expect(result.level).toBe('mastered')
  })

  it('cho lượt gần đây trọng số cao hơn lượt cũ', () => {
    // 3 lượt sai cũ nhất, rồi 3 lượt đúng gần nhất — điểm phải > 50%
    // vì lượt đúng gần đây có trọng số lớn hơn lượt sai cũ.
    const attempts = [
      makeAttempt(false, '2026-01-01T00:00:00Z'),
      makeAttempt(false, '2026-01-02T00:00:00Z'),
      makeAttempt(false, '2026-01-03T00:00:00Z'),
      makeAttempt(true, '2026-01-04T00:00:00Z'),
      makeAttempt(true, '2026-01-05T00:00:00Z'),
      makeAttempt(true, '2026-01-06T00:00:00Z'),
    ]
    const result = computeWeightedMastery(attempts)
    // weights 1..6, sai ở 1,2,3 (tổng trọng số sai=6), đúng ở 4,5,6 (tổng=15)
    // score = 15 / 21
    expect(result.score).toBeCloseTo(15 / 21, 5)
    expect(result.score!).toBeGreaterThan(WEAK_THRESHOLD)
  })

  it('chỉ dùng tối đa 10 lượt gần nhất, bỏ qua lượt cũ hơn', () => {
    const oldWrong = Array.from({ length: 5 }, (_, i) =>
      makeAttempt(false, `2026-01-${(i + 1).toString().padStart(2, '0')}T00:00:00Z`),
    )
    const recentCorrect = Array.from({ length: 10 }, (_, i) =>
      makeAttempt(true, `2026-02-${(i + 1).toString().padStart(2, '0')}T00:00:00Z`),
    )
    const result = computeWeightedMastery([...oldWrong, ...recentCorrect])
    expect(result.attemptsUsed).toBe(10)
    expect(result.score).toBe(1) // 10 lượt gần nhất đều đúng, 5 lượt sai cũ bị loại
  })

  it('không phụ thuộc thứ tự attempts truyền vào (tự sắp xếp theo timestamp)', () => {
    const a = makeAttempt(true, '2026-01-03T00:00:00Z')
    const b = makeAttempt(false, '2026-01-01T00:00:00Z')
    const c = makeAttempt(true, '2026-01-02T00:00:00Z')
    const result1 = computeWeightedMastery([a, b, c])
    const result2 = computeWeightedMastery([c, a, b])
    expect(result1.score).toBe(result2.score)
  })
})

describe('computeAllTopicMastery', () => {
  it('gộp đúng lượt làm theo topicIds của câu hỏi, kể cả câu gắn nhiều chủ điểm', () => {
    const questions: Question[] = [
      makeQuestion('Q1', ['NP-11']),
      makeQuestion('Q2', ['NP-11', 'TV-02']),
    ]
    const attempts: Attempt[] = [
      makeAttempt(true, '2026-01-01T00:00:00Z', 'Q1'),
      makeAttempt(true, '2026-01-02T00:00:00Z', 'Q1'),
      makeAttempt(false, '2026-01-03T00:00:00Z', 'Q2'),
    ]
    const result = computeAllTopicMastery(attempts, questions)
    expect(result['NP-11'].totalAttempts).toBe(3)
    expect(result['TV-02'].totalAttempts).toBe(1)
  })
})
