import { describe, expect, it } from 'vitest'
import { getSuggestions } from '../../src/modules/mastery/getSuggestions'
import type { Attempt, Question, Topic } from '../../src/types/domain'

function q(id: string, topicIds: string[]): Question {
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

function attempt(questionId: string, correct: boolean, ts: string): Attempt {
  return { id: `${questionId}-${ts}`, questionId, correct, timestamp: ts }
}

const questions: Question[] = [q('Q-NP11', ['NP-11']), q('Q-NP13', ['NP-13'])]
const topics: Topic[] = []

describe('getSuggestions', () => {
  it('ưu tiên chủ điểm đã luyện có tỉ lệ đúng thấp nhất lên đầu (FR-M06)', () => {
    const attempts: Attempt[] = [
      attempt('Q-NP11', false, '2026-01-01T00:00:00Z'),
      attempt('Q-NP13', true, '2026-01-01T00:00:00Z'),
    ]
    const suggestions = getSuggestions({
      attempts,
      questions,
      topics,
      vocabCards: [],
      vocabBoxLevels: {},
    })
    expect(suggestions[0].kind).toBe('weak-topic')
    expect(suggestions[0].label).toContain('NP-11')
  })

  it('chủ điểm chưa từng luyện không bị coi là yếu, chỉ xuất hiện qua lộ trình nền tảng (FR-M07)', () => {
    const suggestions = getSuggestions({
      attempts: [],
      questions,
      topics,
      vocabCards: [],
      vocabBoxLevels: {},
    })
    expect(suggestions.every((s) => s.kind !== 'weak-topic')).toBe(true)
    expect(suggestions.some((s) => s.kind === 'foundational')).toBe(true)
  })

  it('không gợi ý quá 3 hành động', () => {
    const suggestions = getSuggestions({
      attempts: [],
      questions,
      topics,
      vocabCards: [],
      vocabBoxLevels: {},
    })
    expect(suggestions.length).toBeLessThanOrEqual(3)
  })
})
