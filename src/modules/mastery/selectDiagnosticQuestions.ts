import type { Question } from '../../types/domain'
import { shuffle } from '../practice/shuffle'

const TARGET_COUNT = 26

/**
 * FR-M01: chọn ~25–30 câu phủ đều các nhóm chủ điểm chính cho bài kiểm tra
 * đầu vào. Ưu tiên câu giới thiệu chủ điểm chưa được phủ, sau đó lấp đầy
 * ngẫu nhiên tới TARGET_COUNT nếu ngân hàng có đủ chủ điểm đa dạng.
 */
export function selectDiagnosticQuestions(allQuestions: Question[]): Question[] {
  const shuffled = shuffle(allQuestions)
  const covered = new Set<string>()
  const selected: Question[] = []
  const remaining: Question[] = []

  for (const q of shuffled) {
    const introducesNewTopic = q.topicIds.some((t) => !covered.has(t))
    if (introducesNewTopic && selected.length < TARGET_COUNT) {
      selected.push(q)
      for (const t of q.topicIds) covered.add(t)
    } else {
      remaining.push(q)
    }
  }

  for (const q of remaining) {
    if (selected.length >= TARGET_COUNT) break
    selected.push(q)
  }

  return shuffle(selected)
}
