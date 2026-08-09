import { describe, expect, it } from 'vitest'
import { questions } from '../../src/content/questions'
import { readingPassages } from '../../src/content/reading-passages'
import { topics } from '../../src/content/topics'
import { vocabCards } from '../../src/content/vocab'
import { writingPrompts } from '../../src/content/writing-prompts'

// Mục 4.1 URD: 31 chủ điểm ngữ pháp gốc NP-01..31, cộng thêm NP-32..36 đối
// chiếu bổ sung từ giáo trình các trung tâm luyện thi (xem docs/adr/0003).
const ALL_LESSON_TOPIC_IDS = [
  ...Array.from({ length: 31 }, (_, i) => `NP-${String(i + 1).padStart(2, '0')}`),
  'NP-32',
  'NP-33',
  'NP-34',
  'NP-35',
  'NP-36',
]

// Mục 4.2 URD: đủ 14 chủ đề từ vựng TV-01..14.
const VOCAB_TOPIC_IDS = Array.from({ length: 14 }, (_, i) =>
  `TV-${String(i + 1).padStart(2, '0')}`,
)

const VALID_SKILL_IDS = new Set([
  'KN-01',
  'KN-02',
  'KN-03',
  'KN-04',
  'KN-05',
  'KN-06',
  'KN-07',
  'KN-08',
  'KN-09',
])

describe('Ngân hàng câu hỏi (Question)', () => {
  // Mục tiêu URD 4.4: 8–10 câu/chủ điểm ngữ pháp. Sau đợt bổ sung ND-02/03/
  // 04/05, ngân hàng đạt 477 câu và MỌI chủ điểm NP đều có ≥ 8 câu (xem test
  // riêng bên dưới) — con số tổng chỉ chốt để phát hiện mất dữ liệu ngoài ý
  // muốn, không phải mục tiêu tự thân.
  it('có đúng 477 câu hỏi', () => {
    expect(questions).toHaveLength(477)
  })

  it('mỗi chủ điểm ngữ pháp có ít nhất 8 câu hỏi (Mục 4.4 URD, ND-02)', () => {
    const countByTopic: Record<string, number> = {}
    for (const q of questions) {
      for (const topicId of q.topicIds) {
        if (topicId.startsWith('NP-')) {
          countByTopic[topicId] = (countByTopic[topicId] ?? 0) + 1
        }
      }
    }
    for (const topicId of ALL_LESSON_TOPIC_IDS) {
      expect(countByTopic[topicId] ?? 0).toBeGreaterThanOrEqual(8)
    }
  })

  it('có đủ câu hỏi mỗi dạng bài để sinh đề thi thử "Giống Cầu Giấy" (docs/adr/0002)', () => {
    const required: Record<string, number> = {
      'KN-08': 4,
      'KN-03': 4,
      'KN-09': 4,
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
  it('có đủ 36 bài học ngữ pháp (31/31 Mục 4.1 + 5 bổ sung đối chiếu giáo trình), mỗi bài đủ giải thích, 3–5 ví dụ, và lỗi thường gặp', () => {
    expect(topics).toHaveLength(36)
    const topicIds = topics.map((t) => t.id)
    for (const requiredId of ALL_LESSON_TOPIC_IDS) {
      expect(topicIds).toContain(requiredId)
    }
    for (const topic of topics) {
      expect(topic.lesson.length).toBeGreaterThan(0)
      for (const point of topic.lesson) {
        expect(point.length).toBeGreaterThan(0)
      }
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
  it('có đủ 420 flashcard trải đều 14/14 chủ đề (30 thẻ/chủ đề), mỗi thẻ đủ từ, loại từ, phiên âm, nghĩa, và câu ví dụ', () => {
    expect(vocabCards).toHaveLength(420)
    for (const topicId of VOCAB_TOPIC_IDS) {
      const cards = vocabCards.filter((c) => c.topicId === topicId)
      expect(cards).toHaveLength(30)
    }
    for (const card of vocabCards) {
      expect(VOCAB_TOPIC_IDS).toContain(card.topicId)
      expect(card.word.length).toBeGreaterThan(0)
      expect(card.partOfSpeech.length).toBeGreaterThan(0)
      expect(card.phonetic).toMatch(/^\/.+\/$/)
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
  it('có 15 bài đọc, mỗi bài có tiêu đề, nội dung, và chủ điểm', () => {
    expect(readingPassages).toHaveLength(15)
    for (const passage of readingPassages) {
      expect(passage.title.length).toBeGreaterThan(0)
      expect(passage.text.length).toBeGreaterThan(0)
      expect(passage.topicIds.length).toBeGreaterThan(0)
    }
  })
})

describe('Đề viết đoạn văn (WritingPrompt)', () => {
  it('có đủ 15 đề viết (Mục 4.4 URD), mỗi đề có gợi ý ý tưởng và từ vựng', () => {
    expect(writingPrompts).toHaveLength(15)
    for (const prompt of writingPrompts) {
      expect(prompt.title.length).toBeGreaterThan(0)
      expect(prompt.ideas.length).toBeGreaterThan(0)
      expect(prompt.vocab.length).toBeGreaterThan(0)
    }
  })
})
