import { describe, expect, it } from 'vitest'
import { computeVocabMasteryFromBoxes } from '../../src/modules/mastery/masteryCalc'
import type { BoxLevel, VocabCard } from '../../src/types/domain'

function card(id: string, topicId: string): VocabCard {
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

const cards = [
  card('a', 'TV-01'),
  card('b', 'TV-01'),
  card('c', 'TV-01'),
  card('d', 'TV-01'),
]

describe('Mức thành thạo từ vựng theo hộp Leitner (ND-07)', () => {
  it("báo 'no-data' khi chưa ôn đủ 3 thẻ", () => {
    const result = computeVocabMasteryFromBoxes(cards, { a: 5, b: 5 } as Record<
      string,
      BoxLevel
    >)
    expect(result['TV-01'].level).toBe('no-data')
    expect(result['TV-01'].score).toBeNull()
  })

  it('thẻ ở hộp 5 được 1 điểm, hộp 1 được 0 điểm', () => {
    const all5 = { a: 5, b: 5, c: 5, d: 5 } as Record<string, BoxLevel>
    expect(computeVocabMasteryFromBoxes(cards, all5)['TV-01'].score).toBe(1)

    const all1 = { a: 1, b: 1, c: 1, d: 1 } as Record<string, BoxLevel>
    expect(computeVocabMasteryFromBoxes(cards, all1)['TV-01'].score).toBe(0)
  })

  it('thẻ chưa ôn tính như hộp 1 nên điểm chỉ lên khi ôn hết bộ thẻ', () => {
    // Ôn 3/4 thẻ lên hộp 5: (1 + 1 + 1 + 0) / 4 = 0.75, chưa đạt "Thành thạo".
    const result = computeVocabMasteryFromBoxes(cards, { a: 5, b: 5, c: 5 } as Record<
      string,
      BoxLevel
    >)
    expect(result['TV-01'].score).toBe(0.75)
    expect(result['TV-01'].level).toBe('improving')
  })

  it('phân loại đúng ngưỡng yếu/tiến bộ/thành thạo', () => {
    const weak = { a: 2, b: 2, c: 1, d: 1 } as Record<string, BoxLevel>
    expect(computeVocabMasteryFromBoxes(cards, weak)['TV-01'].level).toBe('weak')

    const mastered = { a: 5, b: 5, c: 5, d: 4 } as Record<string, BoxLevel>
    expect(computeVocabMasteryFromBoxes(cards, mastered)['TV-01'].level).toBe('mastered')
  })
})
