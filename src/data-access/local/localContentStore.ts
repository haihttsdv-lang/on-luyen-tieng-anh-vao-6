import { topics } from '../../content/topics'
import { questions } from '../../content/questions'
import { readingPassages } from '../../content/reading-passages'
import { vocabCards } from '../../content/vocab'
import { writingPrompts } from '../../content/writing-prompts'
import type { ContentStore } from '../types'

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
    return vocabCards
  },
  async getWritingPrompts() {
    return writingPrompts
  },
}
