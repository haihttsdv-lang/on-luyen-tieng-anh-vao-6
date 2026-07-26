import { describe, expect, it } from 'vitest'
import { questions } from '../../src/content/questions'
import { readingPassages } from '../../src/content/reading-passages'
import { topics } from '../../src/content/topics'
import { vocabCards } from '../../src/content/vocab'
import { writingPrompts } from '../../src/content/writing-prompts'

const GROUP_B_TENSE_TOPIC_IDS = ['NP-11', 'NP-12', 'NP-13', 'NP-14', 'NP-15', 'NP-16']

const ALL_LESSON_TOPIC_IDS = [
  ...GROUP_B_TENSE_TOPIC_IDS,
  'NP-01',
  'NP-03',
  'NP-06',
  'NP-07',
  'NP-08',
  'NP-20',
  'NP-21',
  'NP-22',
  'NP-23',
  'NP-25',
  'NP-26',
  'NP-28',
]

const VOCAB_TOPIC_IDS = ['TV-01', 'TV-02', 'TV-04', 'TV-05', 'TV-07', 'TV-09']

const VALID_SKILL_IDS = new Set([
  'KN-01',
  'KN-02',
  'KN-03',
  'KN-04',
  'KN-05',
  'KN-06',
  'KN-07',
  'KN-08',
])

describe('Ngân hàng câu hỏi (Question)', () => {
  it('có đúng 131 câu hỏi (Giai đoạn 1+3+6)', () => {
    expect(questions).toHaveLength(131)
  })

  it('có đủ câu hỏi mỗi dạng bài để sinh đề thi thử "Giống Cầu Giấy" (docs/adr/0002)', () => {
    const required: Record<string, number> = {
      'KN-08': 4,
      'KN-03': 8,
      'KN-04': 2,
      'KN-06': 8,
      'KN-01': 4,
      'KN-02': 10,
      'KN-05': 4,
    }
    for (const [skillId, min] of Object.entries(required)) {
      const count = questions.filter((q) => q.skillId === skillId).length
      expect(count).toBeGreaterThanOrEqual(min)
    }
  })

  it('mỗi câu hỏi có id duy nhất', () => {
    const ids = questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('mỗi câu hỏi có đúng 4 lựa chọn, answerIndex hợp lệ, và ít nhất 1 topicId', () => {
    for (const q of questions) {
      expect(q.options).toHaveLength(4)
      expect(q.answerIndex).toBeGreaterThanOrEqual(0)
      expect(q.answerIndex).toBeLessThanOrEqual(3)
      expect(q.topicIds.length).toBeGreaterThan(0)
      expect(VALID_SKILL_IDS.has(q.skillId)).toBe(true)
      expect(q.prompt.length).toBeGreaterThan(0)
      expect(q.explain.length).toBeGreaterThan(0)
    }
  })

  it('mọi câu hỏi có passageId đều trỏ tới một ReadingPassage tồn tại', () => {
    const passageIds = new Set(readingPassages.map((p) => p.id))
    for (const q of questions) {
      if (q.passageId) {
        expect(passageIds.has(q.passageId)).toBe(true)
      }
    }
  })

  it('mỗi bài đọc KN-02 có đúng 5 câu hỏi gắn kèm', () => {
    for (const passage of readingPassages) {
      const linked = questions.filter((q) => q.passageId === passage.id)
      expect(linked).toHaveLength(5)
    }
  })

  it('mỗi chủ điểm đã có bài học lý thuyết đều có ít nhất 3 câu hỏi để làm quiz nhanh (FR-L03)', () => {
    for (const topicId of ALL_LESSON_TOPIC_IDS) {
      const linked = questions.filter((q) => q.topicIds.includes(topicId))
      expect(linked.length).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('Bài học lý thuyết (Topic)', () => {
  it('có 18 bài học (Nhóm B đầy đủ + 12 chủ điểm bổ sung Giai đoạn 6), mỗi bài đủ giải thích, 3–5 ví dụ, và lỗi thường gặp', () => {
    expect(topics).toHaveLength(18)
    const topicIds = topics.map((t) => t.id)
    for (const requiredId of ALL_LESSON_TOPIC_IDS) {
      expect(topicIds).toContain(requiredId)
    }
    for (const topic of topics) {
      expect(topic.lesson.length).toBeGreaterThan(0)
      expect(topic.examples.length).toBeGreaterThanOrEqual(3)
      expect(topic.examples.length).toBeLessThanOrEqual(5)
      for (const example of topic.examples) {
        expect(example.en.length).toBeGreaterThan(0)
        expect(example.vi.length).toBeGreaterThan(0)
      }
      expect(topic.commonMistakes.length).toBeGreaterThan(0)
    }
  })

  it('mọi câu hỏi trong ngân hàng có gắn NP-xx đều trỏ tới một chủ điểm đã có bài học (không còn lệch pha luyện/học)', () => {
    const lessonTopicIds = new Set(topics.map((t) => t.id))
    const npIdsInQuestions = new Set(
      questions.flatMap((q) => q.topicIds).filter((id) => id.startsWith('NP-')),
    )
    for (const id of npIdsInQuestions) {
      expect(lessonTopicIds.has(id)).toBe(true)
    }
  })
})

describe('Flashcard từ vựng (VocabCard)', () => {
  it('có 84 flashcard trải đều 6 chủ đề (14 thẻ/chủ đề), mỗi thẻ đủ từ, nghĩa, và câu ví dụ', () => {
    expect(vocabCards).toHaveLength(84)
    for (const topicId of VOCAB_TOPIC_IDS) {
      const cards = vocabCards.filter((c) => c.topicId === topicId)
      expect(cards).toHaveLength(14)
    }
    for (const card of vocabCards) {
      expect(VOCAB_TOPIC_IDS).toContain(card.topicId)
      expect(card.word.length).toBeGreaterThan(0)
      expect(card.meaning.length).toBeGreaterThan(0)
      expect(card.example.length).toBeGreaterThan(0)
    }
  })

  it('không có từ trùng lặp id trong cùng ngân hàng', () => {
    const ids = vocabCards.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('Bài đọc hiểu dài (ReadingPassage)', () => {
  it('có 8 bài đọc, mỗi bài có tiêu đề, nội dung, và chủ điểm', () => {
    expect(readingPassages).toHaveLength(8)
    for (const passage of readingPassages) {
      expect(passage.title.length).toBeGreaterThan(0)
      expect(passage.text.length).toBeGreaterThan(0)
      expect(passage.topicIds.length).toBeGreaterThan(0)
    }
  })
})

describe('Đề viết đoạn văn (WritingPrompt)', () => {
  it('có 5 đề viết khởi động, mỗi đề có gợi ý ý tưởng và từ vựng', () => {
    expect(writingPrompts).toHaveLength(5)
    for (const prompt of writingPrompts) {
      expect(prompt.title.length).toBeGreaterThan(0)
      expect(prompt.ideas.length).toBeGreaterThan(0)
      expect(prompt.vocab.length).toBeGreaterThan(0)
    }
  })
})
