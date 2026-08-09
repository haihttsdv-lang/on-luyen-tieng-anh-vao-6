import { describe, expect, it } from 'vitest'
import {
  canPickOutcome,
  computeSessionCompletion,
  evaluateSuccessCriterion,
  type SessionCompletionResult,
} from '../../src/modules/curriculum/sessionCompletion'
import type { Attempt, ScheduledSession, VocabCard } from '../../src/types/domain'

function fakeSession(overrides: Partial<ScheduledSession> = {}): ScheduledSession {
  return {
    id: 'B02',
    order: 2,
    focus: 'grammar',
    phaseLabel: '🧱 Giai đoạn 1 · Nền tảng',
    title: 'Hiện tại đơn',
    topicIds: ['NP-11'],
    vocabTopicId: 'TV-01',
    blocks: [{ label: 'x', minutes: 10, description: 'x' }],
    homework: '',
    objectives: [],
    successCriteria: [],
    date: '2026-08-11',
    ...overrides,
  }
}

function vocabCard(id: string, topicId: string): VocabCard {
  return {
    id,
    word: id,
    partOfSpeech: 'n.',
    phonetic: '/x/',
    meaning: 'x',
    example: 'x',
    topicId,
  }
}

describe('PP-03 · computeSessionCompletion', () => {
  it('điểm 0 khi không có bất kỳ dữ liệu luyện tập nào trong buổi', () => {
    const result = computeSessionCompletion({
      session: fakeSession(),
      attempts: [],
      sessionStartAt: '2026-08-11T00:00:00.000Z',
      topicStatuses: {},
      vocabBoxLevels: {},
      vocabCards: [],
      doneBlockCount: 0,
      totalBlockCount: 4,
    })
    expect(result.score).toBe(0)
    expect(result.suggestedOutcome).toBe('weak')
  })

  it('chỉ đếm lượt luyện tập SAU thời điểm bắt đầu buổi, không tính lượt cũ', () => {
    const attempts: Attempt[] = [
      { id: 'a1', questionId: 'q1', correct: true, timestamp: '2026-08-10T09:00:00.000Z' }, // trước buổi
      { id: 'a2', questionId: 'q2', correct: true, timestamp: '2026-08-11T09:30:00.000Z' }, // trong buổi
    ]
    const result = computeSessionCompletion({
      session: fakeSession(),
      attempts,
      sessionStartAt: '2026-08-11T09:00:00.000Z',
      topicStatuses: {},
      vocabBoxLevels: {},
      vocabCards: [],
      doneBlockCount: 0,
      totalBlockCount: 4,
    })
    expect(result.attemptsCount).toBe(1)
  })

  it('điểm cao khi quiz đã đạt "Đã nắm", từ vựng lên hộp cao, và đủ câu luyện tập', () => {
    const cards = [vocabCard('c1', 'TV-01'), vocabCard('c2', 'TV-01')]
    const attempts: Attempt[] = Array.from({ length: 12 }, (_, i) => ({
      id: `a${i}`,
      questionId: `q${i}`,
      correct: true,
      timestamp: '2026-08-11T09:30:00.000Z',
    }))
    const result = computeSessionCompletion({
      session: fakeSession(),
      attempts,
      sessionStartAt: '2026-08-11T09:00:00.000Z',
      topicStatuses: { 'NP-11': 'mastered' },
      vocabBoxLevels: { c1: 5, c2: 5 },
      vocabCards: cards,
      doneBlockCount: 4,
      totalBlockCount: 4,
    })
    expect(result.score).toBeCloseTo(1, 5)
    expect(result.suggestedOutcome).toBe('great')
  })

  it('buổi không có topicId/vocabTopicId (khai giảng, luyện đề...) chấm hoàn toàn theo số câu luyện tập + số khối', () => {
    const session = fakeSession({ topicIds: [], vocabTopicId: undefined, focus: 'orientation' })
    const attempts: Attempt[] = Array.from({ length: 10 }, (_, i) => ({
      id: `a${i}`,
      questionId: `q${i}`,
      correct: true,
      timestamp: '2026-08-11T09:30:00.000Z',
    }))
    const result = computeSessionCompletion({
      session,
      attempts,
      sessionStartAt: '2026-08-11T09:00:00.000Z',
      topicStatuses: {},
      vocabBoxLevels: {},
      vocabCards: [],
      doneBlockCount: 4,
      totalBlockCount: 4,
    })
    expect(result.quizMastered).toBeNull()
    expect(result.vocabAvgProgress).toBeNull()
    expect(result.score).toBeCloseTo(1, 5)
  })

  it('không bao giờ vượt quá 1 dù số câu luyện tập vượt ngưỡng full credit', () => {
    const attempts: Attempt[] = Array.from({ length: 50 }, (_, i) => ({
      id: `a${i}`,
      questionId: `q${i}`,
      correct: true,
      timestamp: '2026-08-11T09:30:00.000Z',
    }))
    const result = computeSessionCompletion({
      session: fakeSession({ topicIds: [], vocabTopicId: undefined }),
      attempts,
      sessionStartAt: '2026-08-11T09:00:00.000Z',
      topicStatuses: {},
      vocabBoxLevels: {},
      vocabCards: [],
      doneBlockCount: 4,
      totalBlockCount: 4,
    })
    expect(result.score).toBeLessThanOrEqual(1)
  })
})

describe('PP-04 · evaluateSuccessCriterion', () => {
  const fullCompletion: SessionCompletionResult = {
    score: 1,
    suggestedOutcome: 'great',
    attemptsCount: 12,
    quizMastered: true,
    vocabAvgProgress: 0.75,
    blocksDoneRatio: 1,
  }

  it('blocksDone: chỉ đạt khi hoàn thành 100% khối', () => {
    expect(evaluateSuccessCriterion({ label: 'x', check: { type: 'blocksDone' } }, fullCompletion)).toBe(true)
    expect(
      evaluateSuccessCriterion(
        { label: 'x', check: { type: 'blocksDone' } },
        { ...fullCompletion, blocksDoneRatio: 0.8 },
      ),
    ).toBe(false)
  })

  it('quizMastered: false khi buổi không có quiz (null) hoặc quiz chưa đạt', () => {
    expect(evaluateSuccessCriterion({ label: 'x', check: { type: 'quizMastered' } }, fullCompletion)).toBe(true)
    expect(
      evaluateSuccessCriterion(
        { label: 'x', check: { type: 'quizMastered' } },
        { ...fullCompletion, quizMastered: false },
      ),
    ).toBe(false)
    expect(
      evaluateSuccessCriterion(
        { label: 'x', check: { type: 'quizMastered' } },
        { ...fullCompletion, quizMastered: null },
      ),
    ).toBe(false)
  })

  it('vocabProgress: so sánh đúng ngưỡng minRatio, an toàn khi null', () => {
    const check = { type: 'vocabProgress' as const, minRatio: 0.5 }
    expect(evaluateSuccessCriterion({ label: 'x', check }, fullCompletion)).toBe(true)
    expect(
      evaluateSuccessCriterion({ label: 'x', check }, { ...fullCompletion, vocabAvgProgress: 0.4 }),
    ).toBe(false)
    expect(
      evaluateSuccessCriterion({ label: 'x', check }, { ...fullCompletion, vocabAvgProgress: null }),
    ).toBe(false)
  })

  it('minAttempts: so sánh đúng ngưỡng count', () => {
    const check = { type: 'minAttempts' as const, count: 10 }
    expect(evaluateSuccessCriterion({ label: 'x', check }, fullCompletion)).toBe(true)
    expect(
      evaluateSuccessCriterion({ label: 'x', check }, { ...fullCompletion, attemptsCount: 9 }),
    ).toBe(false)
  })
})

describe('PP-03 · canPickOutcome', () => {
  it('chặn tự chọn "Xuất sắc" khi điểm hoàn thành dưới 50%', () => {
    expect(canPickOutcome('great', 0.49)).toBe(false)
    expect(canPickOutcome('great', 0.5)).toBe(true)
    expect(canPickOutcome('great', 0)).toBe(false)
  })

  it('luôn cho phép chọn "Ổn" và "Cần ôn lại" bất kể điểm hoàn thành', () => {
    expect(canPickOutcome('ok', 0)).toBe(true)
    expect(canPickOutcome('weak', 0)).toBe(true)
  })
})
