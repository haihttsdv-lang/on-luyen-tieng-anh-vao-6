import type { Question, SkillId } from '../../types/domain'
import { shuffle } from '../practice/shuffle'

/**
 * Sinh đề thi thử theo blueprint (số câu mỗi dạng bài), giữ nguyên thứ tự
 * các phần như đề thật (Ngữ âm → Từ vựng-Ngữ pháp → Đọc hiểu → Viết), mỗi
 * phần chọn ngẫu nhiên trong ngân hàng để giảm khả năng trùng đề giữa hai
 * lần sinh liên tiếp (NFR-08).
 *
 * `topicIds` (tuỳ chọn — dùng cho "Tự tạo đề"): ưu tiên chọn câu hỏi thuộc
 * các chủ điểm này trước; nếu một phần không đủ câu theo chủ điểm đã chọn,
 * tự động lấp đầy bằng câu ngẫu nhiên khác cùng dạng bài để vẫn giữ đúng
 * cấu trúc/số câu như đề thật (không bao giờ thiếu câu).
 */
export function generateMockTest(
  allQuestions: Question[],
  blueprint: Partial<Record<SkillId, number>>,
  topicIds?: string[],
): Question[] {
  const bySkill = new Map<SkillId, Question[]>()
  for (const q of allQuestions) {
    const list = bySkill.get(q.skillId) ?? []
    list.push(q)
    bySkill.set(q.skillId, list)
  }

  const topicFilter = topicIds && topicIds.length > 0 ? new Set(topicIds) : null

  const result: Question[] = []
  for (const [skillId, count] of Object.entries(blueprint) as [
    SkillId,
    number,
  ][]) {
    const pool = bySkill.get(skillId) ?? []

    if (!topicFilter) {
      result.push(...shuffle(pool).slice(0, count))
      continue
    }

    const matching = pool.filter((q) => q.topicIds.some((t) => topicFilter.has(t)))
    const picked = shuffle(matching).slice(0, count)
    if (picked.length < count) {
      const pickedIds = new Set(picked.map((q) => q.id))
      const rest = pool.filter((q) => !pickedIds.has(q.id))
      picked.push(...shuffle(rest).slice(0, count - picked.length))
    }
    result.push(...picked)
  }
  return result
}
