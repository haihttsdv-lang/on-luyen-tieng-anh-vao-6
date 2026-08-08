import { topicTitle } from '../../content/curriculum'
import type {
  CurriculumSessionTemplate,
  LessonPlanBlock,
  ScheduledSession,
} from '../../types/domain'
import { buildSchedule, parseISODate, toISODate } from './schedule'

// Bài kiểm tra định kỳ — không có trong URD gốc, bổ sung theo yêu cầu người
// dùng: "bổ sung thêm bài kiểm tra kiến thức đã học trong từng tuần vào
// ngày Chủ nhật cuối tuần và bài kiểm tra tháng vào Chủ nhật cuối tháng, có
// chấm điểm tặng xu". Khác với 50 buổi học cố định trong CURRICULUM_PLAN
// (nội dung tĩnh, ngày do schedule.ts tính), các bài kiểm tra này được sinh
// ĐỘNG theo lịch — mỗi Chủ nhật trong khoảng thời gian có buổi học đều có 1
// bài kiểm tra tuần, riêng Chủ nhật cuối cùng của tháng thì thay bằng bài
// kiểm tra tháng (không kiểm tra tuần + tháng cùng lúc trong 1 ngày).
// Chấm điểm/tặng xu dùng chung cơ chế tự đánh giá 3 mức (great/ok/weak) với
// các buổi học thường — xem rewards.ts.

function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function atMidnight(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function isLastSundayOfMonth(sunday: Date): boolean {
  return addDays(sunday, 7).getMonth() !== sunday.getMonth()
}

function formatShort(date: Date): string {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function weeklyTestBlocks(topicTitles: string[]): LessonPlanBlock[] {
  const content =
    topicTitles.length > 0
      ? `Làm bài kiểm tra tổng hợp các nội dung đã học trong tuần: ${topicTitles.join(', ')}.`
      : 'Làm bài kiểm tra tổng hợp các nội dung đã học trong tuần (Thi thử → Đề 20 câu).'
  return [
    {
      label: 'Phổ biến quy chế',
      minutes: 5,
      description: 'Nhắc lại quy tắc làm bài và thời gian làm bài kiểm tra.',
    },
    { label: 'Làm bài kiểm tra tuần', minutes: 30, description: content },
    {
      label: 'Chấm điểm & thưởng xu',
      minutes: 10,
      description: 'Chấm điểm ngay, tự đánh giá kết quả để nhận xu thưởng.',
    },
  ]
}

function monthlyTestBlocks(topicTitles: string[]): LessonPlanBlock[] {
  const content =
    topicTitles.length > 0
      ? `Làm bài kiểm tra tổng hợp toàn bộ nội dung đã học trong tháng: ${topicTitles.join(', ')}.`
      : 'Làm bài kiểm tra tổng hợp toàn bộ nội dung đã học trong tháng (Thi thử → Giống đề Cầu Giấy).'
  return [
    {
      label: 'Khởi động & ôn nhanh',
      minutes: 10,
      description: 'Nhắc lại các chủ điểm trọng tâm đã học trong tháng.',
    },
    { label: 'Làm bài kiểm tra tháng', minutes: 40, description: content },
    {
      label: 'Chữa bài chi tiết',
      minutes: 15,
      description: 'Chữa từng câu sai, phân tích điểm mạnh/yếu trong tháng.',
    },
    {
      label: 'Chấm điểm & thưởng xu',
      minutes: 10,
      description: 'Tổng kết điểm, tự đánh giá kết quả để nhận xu thưởng.',
    },
  ]
}

/**
 * Sinh bài kiểm tra tuần/tháng cho mỗi Chủ nhật trong khoảng ngày của
 * `mainSchedule` (từ buổi đầu tới buổi cuối) — không sinh quá phạm vi lộ
 * trình học chính, kể cả khi `mainSchedule` kết thúc sớm hơn hạn chót.
 */
export function buildPeriodicTests(
  mainSchedule: ScheduledSession[],
): ScheduledSession[] {
  if (mainSchedule.length === 0) return []

  const sortedByDate = [...mainSchedule].sort((a, b) => a.date.localeCompare(b.date))
  const firstDate = atMidnight(parseISODate(sortedByDate[0].date))
  const lastDate = atMidnight(parseISODate(sortedByDate[sortedByDate.length - 1].date))

  let sunday = firstDate
  while (sunday.getDay() !== 0) sunday = addDays(sunday, 1)

  const tests: ScheduledSession[] = []
  while (sunday.getTime() <= lastDate.getTime()) {
    const phaseAtDate =
      [...sortedByDate].reverse().find((s) => parseISODate(s.date).getTime() <= sunday.getTime()) ??
      sortedByDate[0]

    if (isLastSundayOfMonth(sunday)) {
      const monthStart = new Date(sunday.getFullYear(), sunday.getMonth(), 1)
      const monthTopicIds = [
        ...new Set(
          sortedByDate
            .filter((s) => {
              const d = parseISODate(s.date)
              return d.getTime() >= monthStart.getTime() && d.getTime() <= sunday.getTime()
            })
            .flatMap((s) => s.topicIds),
        ),
      ]
      tests.push({
        id: `M-${toISODate(sunday)}`,
        order: 0,
        focus: 'monthly-test',
        phaseLabel: phaseAtDate.phaseLabel,
        title: `Kiểm tra kiến thức tháng ${sunday.getMonth() + 1}/${sunday.getFullYear()}`,
        topicIds: monthTopicIds,
        blocks: monthlyTestBlocks(monthTopicIds.map(topicTitle)),
        homework: 'Lập danh sách chủ điểm còn yếu trong tháng để ôn tập kỹ hơn trước khi sang tháng mới.',
        date: toISODate(sunday),
      })
    } else {
      const weekStart = addDays(sunday, -6)
      const weekTopicIds = [
        ...new Set(
          sortedByDate
            .filter((s) => {
              const d = parseISODate(s.date)
              return d.getTime() >= weekStart.getTime() && d.getTime() <= sunday.getTime()
            })
            .flatMap((s) => s.topicIds),
        ),
      ]
      tests.push({
        id: `W-${toISODate(sunday)}`,
        order: 0,
        focus: 'weekly-test',
        phaseLabel: phaseAtDate.phaseLabel,
        title: `Kiểm tra kiến thức tuần (${formatShort(weekStart)} – ${formatShort(sunday)})`,
        topicIds: weekTopicIds,
        blocks: weeklyTestBlocks(weekTopicIds.map(topicTitle)),
        homework: 'Ôn lại các câu làm sai trong bài kiểm tra tuần.',
        date: toISODate(sunday),
      })
    }

    sunday = addDays(sunday, 7)
  }

  return tests
}

/** Gộp buổi học chính + bài kiểm tra định kỳ, sắp theo ngày, đánh lại số buổi. */
export function mergeSchedule(...groups: ScheduledSession[][]): ScheduledSession[] {
  return groups
    .flat()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((session, i) => ({ ...session, order: i + 1 }))
}

/** Lộ trình đầy đủ: buổi học chính (Thứ Ba/Năm/Bảy) + kiểm tra tuần/tháng (Chủ nhật). */
export function buildFullSchedule(
  templates: CurriculumSessionTemplate[],
  startDate: Date,
  deadline: Date,
): ScheduledSession[] {
  const main = buildSchedule(templates, startDate, deadline)
  const tests = buildPeriodicTests(main)
  return mergeSchedule(main, tests)
}
