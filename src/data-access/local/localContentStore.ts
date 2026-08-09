import { topics } from '../../content/topics'
import { questions } from '../../content/questions'
import { readingPassages } from '../../content/reading-passages'
import { vocabCards } from '../../content/vocab'
import { emojiForWord } from '../../content/vocab/emoji'
import { writingPrompts } from '../../content/writing-prompts'
import type { ContentStore } from '../types'

// Gắn emoji minh họa (MM-05) ngay tại tầng ContentStore để mọi màn hình
// dùng thẻ từ vựng đều có hình, mà bảng tra emoji vẫn nằm tách riêng khỏi
// 420 dòng dữ liệu từ vựng — xem src/content/vocab/emoji.ts.
const vocabCardsWithEmoji = vocabCards.map((card) => {
  const emoji = emojiForWord(card.word)
  return emoji ? { ...card, emoji } : card
})

// Implementation ContentStore cho Phương án A: nội dung là dữ liệu tĩnh
// bundle sẵn trong ứng dụng (src/content/), không cần gọi mạng.
export const localContentStore: ContentStore = {
  async getTopics() {
    return topics
  },
  async getTopic(id) {
    return topics.find((t) => t.id === id)
  },
  async getQuestions() {
    return questions
  },
  async getReadingPassages() {
    return readingPassages
  },
  async getVocabCards() {
    return vocabCardsWithEmoji
  },
  async getWritingPrompts() {
    return writingPrompts
  },
}
