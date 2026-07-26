import type { Question, SkillId } from '../../types/domain'
import { shuffle } from '../practice/shuffle'

/**
 * Sinh đề thi thử theo blueprint (số câu mỗi dạng bài), giữ nguyên thứ tự
 * các phần như đề thật (Ngữ âm → Từ vựng-Ngữ pháp → Đọc hiểu → Viết), mỗi
 * phần chọn ngẫu nhiên trong ngân hàng để giảm khả năng trùng đề giữa hai
 * lần sinh liên tiếp (NFR-08).
 */
export function generateMockTest(
  allQuestions: Question[],
  blueprint: Partial<Record<SkillId, number>>,
): Question[] {
  const bySkill = new Map<SkillId, Question[]>()
  for (const q of allQuestions) {
    const list = bySkill.get(q.skillId) ?? []
    list.push(q)
    bySkill.set(q.skillId, list)
  }

  const result: Question[] = []
  for (const [skillId, count] of Object.entries(blueprint) as [
    SkillId,
    number,
  ][]) {
    const pool = bySkill.get(skillId) ?? []
    result.push(...shuffle(pool).slice(0, count))
  }
  return result
}
