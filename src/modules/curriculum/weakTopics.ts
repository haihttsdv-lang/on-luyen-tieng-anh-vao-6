import type { Attempt, Question, ScheduledSession } from '../../types/domain'
import { computeAllTopicMastery } from '../mastery/masteryCalc'

// LT-03: buổi "Luyện chuyên sâu theo dạng bài yếu" và "Ôn thi tổng lực"
// không gắn sẵn topicIds tĩnh (không biết trước học sinh sẽ yếu chủ điểm
// nào) — mô tả buổi học nói "bắt bệnh" nhưng trước đây không có gì để bắt
// bệnh cả. Tính động top N chủ điểm yếu nhất từ dữ liệu luyện tập thật.
// Tách riêng file (thay vì để trong CurriculumPage) để SessionRunnerPage
// (PP-01) dùng lại đúng cùng một logic, không lệch nhau giữa hai màn hình.
const WEAK_TOPICS_FOR_DRILL = 5

export function weakTopicIds(attempts: Attempt[], questions: Question[]): string[] {
  const mastery = computeAllTopicMastery(attempts, questions)
  return Object.entries(mastery)
    .filter(([, result]) => result.level === 'weak')
    .sort((a, b) => (a[1].score ?? 0) - (b[1].score ?? 0))
    .slice(0, WEAK_TOPICS_FOR_DRILL)
    .map(([topicId]) => topicId)
}

/** "Bơm" topicIds động vào buổi CHƯA gắn sẵn chủ điểm nào — không đụng tới
 * buổi ngữ pháp/ôn tập vốn đã có topicIds tĩnh đúng ý đồ thiết kế giai đoạn.
 * `focus === 'review'` khớp thêm 3 buổi "Chốt tủ" (LT-05, giai đoạn 4) —
 * PHÂN BIỆT được với 2 buổi "Ôn tập tổng hợp" chốt giai đoạn 1/2 nhờ
 * `topicIds.length === 0`: hai buổi đó luôn có sẵn topicIds tĩnh (danh sách
 * chủ điểm của cả giai đoạn), chỉ buổi "Chốt tủ" mới để trống chờ bơm động. */
export function injectWeakTopics(
  schedule: ScheduledSession[],
  weak: string[],
): ScheduledSession[] {
  if (weak.length === 0) return schedule
  return schedule.map((session) =>
    session.topicIds.length === 0 &&
    (session.focus === 'skill-drill' ||
      session.focus === 'final-exam' ||
      session.focus === 'review')
      ? { ...session, topicIds: weak }
      : session,
  )
}
