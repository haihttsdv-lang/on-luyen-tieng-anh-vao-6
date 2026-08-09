import { topicTitle } from '../../content/curriculum'
import type {
  CurriculumSessionTemplate,
  LessonPlanBlock,
  ScheduledSession,
  SessionOutcomeRecord,
  SuccessCriterion,
} from '../../types/domain'
import { buildAdaptiveSchedule, parseISODate, toISODate } from './schedule'

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
      description: 'Nhắc lại quy tắc làm bài (không tra cứu, làm liên tục) và thời gian làm bài kiểm tra.',
    },
    { label: 'Làm bài kiểm tra tuần', minutes: 20, description: content },
    {
      label: 'Chấm điểm & thưởng xu',
      minutes: 5,
      description: 'Chấm điểm ngay, tự đánh giá kết quả (tốt/ổn/cần cố gắng) để nhận xu thưởng và xem chủ điểm nào cần ôn thêm cuối tuần.',
    },
  ]
}

const WEEKLY_TEST_OBJECTIVES = [
  'Tự kiểm tra lại toàn bộ kiến thức đã học trong tuần.',
  'Biết ngay điểm yếu của tuần để ôn thêm trước khi sang tuần mới.',
]
const WEEKLY_TEST_SUCCESS_CRITERIA: SuccessCriterion[] = [
  { label: 'Hoàn thành cả 3 khối của bài kiểm tra tuần', check: { type: 'blocksDone' } },
  { label: 'Làm đủ số câu trong đề kiểm tra tuần', check: { type: 'minAttempts', count: 10 } },
]
const WEEKLY_TEST_PARENT_NOTE =
  'Bài kiểm tra tuần — điểm số chỉ mang tính tham khảo nhanh, không nặng nề như bài kiểm tra tháng hay thi thử. Bố mẹ có thể hỏi con câu nào sai để cùng ôn lại cuối tuần.'

function monthlyTestBlocks(topicTitles: string[]): LessonPlanBlock[] {
  const content =
    topicTitles.length > 0
      ? `Làm bài kiểm tra tổng hợp toàn bộ nội dung đã học trong tháng: ${topicTitles.join(', ')}.`
      : 'Làm bài kiểm tra tổng hợp toàn bộ nội dung đã học trong tháng (Thi thử → Giống đề Cầu Giấy).'
  return [
    {
      label: 'Khởi động & ôn nhanh',
      minutes: 5,
      description: 'Nhắc lại các chủ điểm trọng tâm đã học trong tháng, xem lại điểm yếu từ các bài kiểm tra tuần trước đó.',
    },
    { label: 'Làm bài kiểm tra tháng', minutes: 30, description: content },
    {
      label: 'Chữa bài chi tiết',
      minutes: 10,
      description: 'Chữa từng câu sai, phân tích điểm mạnh/yếu trong tháng theo chủ điểm và dạng bài.',
    },
    {
      label: 'Chấm điểm & thưởng xu',
      minutes: 5,
      description: 'Tổng kết điểm, tự đánh giá kết quả để nhận xu thưởng, ghi lại điểm yếu nhất vào sổ tay để ôn kỹ tháng sau.',
    },
  ]
}

const MONTHLY_TEST_OBJECTIVES = [
  'Tự kiểm tra lại toàn bộ kiến thức đã học trong tháng.',
  'Biết ngay điểm mạnh/yếu của cả tháng để điều chỉnh kịp thời trước tháng mới.',
]
const MONTHLY_TEST_SUCCESS_CRITERIA: SuccessCriterion[] = [
  { label: 'Hoàn thành cả 4 khối của bài kiểm tra tháng', check: { type: 'blocksDone' } },
  { label: 'Làm đủ số câu trong đề kiểm tra tháng', check: { type: 'minAttempts', count: 20 } },
]
const MONTHLY_TEST_PARENT_NOTE =
  'Bài kiểm tra tháng — tổng hợp toàn bộ nội dung đã học, đáng tin cậy hơn hẳn 1 bài kiểm tra tuần để đánh giá tiến bộ thật sự. Bố mẹ nên xem cùng con phần nào còn yếu để ưu tiên ôn trong tháng tới.'

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
    // LT-07: nếu buổi đầu tiên của cả lộ trình rơi đúng vào Chủ nhật (mở app
    // lần đầu vào Chủ nhật, "bắt đầu luôn từ hôm nay" ép buổi 1 = hôm đó),
    // thì Chủ nhật đó KHÔNG được sinh bài kiểm tra tuần — chưa học buổi nào
    // thì không có gì để kiểm tra, và bài kiểm tra sẽ trùng ngày, dồn 135
    // phút vào một hôm.
    if (sunday.getTime() === firstDate.getTime()) {
      sunday = addDays(sunday, 7)
      continue
    }
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
        objectives: MONTHLY_TEST_OBJECTIVES,
        successCriteria: MONTHLY_TEST_SUCCESS_CRITERIA,
        parentNote: MONTHLY_TEST_PARENT_NOTE,
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
        objectives: WEEKLY_TEST_OBJECTIVES,
        successCriteria: WEEKLY_TEST_SUCCESS_CRITERIA,
        parentNote: WEEKLY_TEST_PARENT_NOTE,
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

/**
 * Lộ trình đầy đủ: buổi học chính (Thứ Ba/Năm/Bảy, tự đẩy lịch theo tiến độ
 * hoàn thành thực tế — xem `buildAdaptiveSchedule`) + kiểm tra tuần/tháng
 * (Chủ nhật, sinh theo khoảng ngày của lịch chính đã tính). Bài kiểm tra đã
 * hoàn thành cũng hiển thị đúng ngày hoàn thành thực tế, nhất quán với buổi
 * học chính.
 */
export function buildFullSchedule(
  templates: CurriculumSessionTemplate[],
  outcomes: Record<string, Pick<SessionOutcomeRecord, 'completedAt'>>,
  deadline: Date,
  now: Date = new Date(),
): ScheduledSession[] {
  const main = buildAdaptiveSchedule(templates, outcomes, deadline, now)
  const tests = buildPeriodicTests(main).map((test) => {
    const record = outcomes[test.id]
    return record ? { ...test, date: toISODate(new Date(record.completedAt)) } : test
  })
  return mergeSchedule(main, tests)
}
