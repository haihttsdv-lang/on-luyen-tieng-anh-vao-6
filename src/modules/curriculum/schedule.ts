import type {
  CurriculumSessionTemplate,
  ScheduledSession,
  SessionOutcomeRecord,
} from '../../types/domain'

// Hạn hoàn thành lộ trình theo yêu cầu người dùng: "hoàn thành trước ngày
// 31/12/2026". Lịch học lý tưởng là 3 buổi/tuần vào Thứ Ba/Năm/Bảy, nhưng
// nếu ngày bắt đầu quá muộn (không đủ số buổi lý tưởng trước hạn), thuật
// toán tự giãn/nén để LUÔN đảm bảo buổi cuối cùng không vượt quá hạn.
export const CURRICULUM_DEADLINE = new Date(2026, 11, 31)
export const DEFAULT_SESSION_WEEKDAYS = [2, 4, 6] as const // Thứ Ba, Năm, Bảy (0 = Chủ nhật)

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function atMidnight(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function generateWeekdayDates(
  start: Date,
  end: Date,
  weekdays: readonly number[],
): Date[] {
  const dates: Date[] = []
  const endMidnight = atMidnight(end)
  let cur = atMidnight(start)
  while (cur.getTime() <= endMidnight.getTime()) {
    if (weekdays.includes(cur.getDay())) dates.push(cur)
    cur = addDays(cur, 1)
  }
  return dates
}

/**
 * Tính ngày cho `count` buổi học theo đúng lịch 3 buổi/tuần (`weekdays`),
 * tính từ `startDate` trở đi. Nếu không đủ chỗ trước `deadline`, giãn đều
 * để vẫn hoàn thành đúng hạn.
 *
 * `forceFirstDate` (mặc định `true`): buổi đầu tiên LUÔN là `startDate`
 * (yêu cầu người dùng: "bắt đầu luôn từ hôm nay"), bất kể hôm đó có rơi vào
 * lịch cố định hay không — dùng cho lần khai giảng đầu tiên của cả lộ
 * trình. Khi tính lại lịch SAU MỘT LẦN hoàn thành buổi học (xem
 * `buildAdaptiveSchedule`), truyền `false` để buổi tiếp theo luôn rơi đúng
 * Thứ Ba/Năm/Bảy — không ép lên ngày `startDate` (vốn chỉ là "hôm sau ngày
 * hoàn thành", có thể rơi vào bất kỳ thứ nào) làm lệch hẳn lịch cố định.
 */
export function computeScheduleDates(
  startDate: Date,
  deadline: Date,
  count: number,
  weekdays: readonly number[] = DEFAULT_SESSION_WEEKDAYS,
  forceFirstDate: boolean = true,
): Date[] {
  if (count <= 0) return []

  if (!forceFirstDate) {
    const ideal = generateWeekdayDates(startDate, deadline, weekdays)
    if (ideal.length >= count) return ideal.slice(0, count)
    const startMs = atMidnight(startDate).getTime()
    const endMs = Math.max(atMidnight(deadline).getTime(), startMs)
    const span = endMs - startMs
    const step = count > 1 ? span / (count - 1) : 0
    return Array.from({ length: count }, (_, i) => new Date(startMs + step * i))
  }

  const first = atMidnight(startDate)
  if (count === 1) return [first]

  const remainingCount = count - 1
  const afterStart = addDays(first, 1)
  const ideal = generateWeekdayDates(afterStart, deadline, weekdays)

  let rest: Date[]
  if (ideal.length >= remainingCount) {
    rest = ideal.slice(0, remainingCount)
  } else {
    const startMs = afterStart.getTime()
    const endMs = Math.max(atMidnight(deadline).getTime(), startMs)
    const span = endMs - startMs
    const step = remainingCount > 1 ? span / (remainingCount - 1) : 0
    rest = Array.from({ length: remainingCount }, (_, i) => new Date(startMs + step * i))
  }
  return [first, ...rest]
}

/**
 * Lịch thích ứng — bổ sung theo yêu cầu người dùng: "tại mỗi buổi học ghi
 * nhận việc đã hoàn thành và tự động điều chỉnh đẩy thời gian học cho buổi
 * tiếp theo cho phù hợp". Khác `computeScheduleDates` thuần túy tính từ 1
 * ngày bắt đầu cố định, hàm này còn xét tới `outcomes` (đã hoàn thành hay
 * chưa, hoàn thành lúc nào):
 *
 *   - Buổi ĐÃ hoàn thành: hiển thị đúng ngày hoàn thành thực tế
 *     (`completedAt`) — làm nhật ký lịch sử, không tính lại.
 *   - Buổi CHƯA hoàn thành: xếp lịch (theo `computeScheduleDates`, vẫn giữ
 *     lịch 3 buổi/tuần và không vượt `deadline`) bắt đầu từ điểm neo = ngày
 *     kế tiếp buổi hoàn thành gần nhất TRONG THỨ TỰ lộ trình, hoặc `now`
 *     nếu mốc đó đã ở quá khứ hoặc chưa hoàn thành buổi nào.
 *
 * Hệ quả tự nhiên: học chậm hoặc bỏ buổi → điểm neo trễ hơn → các buổi sau
 * tự động bị đẩy lùi. Học nhanh hơn dự kiến → điểm neo sớm hơn → các buổi
 * sau cũng được xếp sớm hơn tương ứng. Không cần lưu "ngày bắt đầu lộ
 * trình" cố định nữa — luôn tính lại từ tiến độ thực tế mỗi lần gọi.
 */
export function buildAdaptiveSchedule(
  templates: CurriculumSessionTemplate[],
  outcomes: Record<string, Pick<SessionOutcomeRecord, 'completedAt'>>,
  deadline: Date = CURRICULUM_DEADLINE,
  now: Date = new Date(),
  weekdays: readonly number[] = DEFAULT_SESSION_WEEKDAYS,
): ScheduledSession[] {
  const today = atMidnight(now)

  let anchor = today
  let hasAnyCompletion = false
  for (const template of templates) {
    const record = outcomes[template.id]
    if (!record) continue
    hasAnyCompletion = true
    const dayAfterCompletion = addDays(atMidnight(new Date(record.completedAt)), 1)
    anchor = dayAfterCompletion.getTime() > today.getTime() ? dayAfterCompletion : today
  }

  const pendingTemplates = templates.filter((t) => !outcomes[t.id])
  // Ép buổi tiếp theo đúng bằng điểm neo CHỈ khi chưa hoàn thành buổi nào
  // (khai giảng lần đầu, "bắt đầu luôn từ hôm nay") — một khi đã có buổi
  // hoàn thành, điểm neo chỉ là "hôm sau ngày hoàn thành" và có thể rơi vào
  // bất kỳ thứ nào, nên để buổi tiếp theo tự tìm đúng Thứ Ba/Năm/Bảy gần
  // nhất từ điểm neo trở đi, giữ đúng lịch 3 buổi/tuần.
  const pendingDates = computeScheduleDates(
    anchor,
    deadline,
    pendingTemplates.length,
    weekdays,
    !hasAnyCompletion,
  )

  let pendingIndex = 0
  return templates.map((template, i) => {
    const record = outcomes[template.id]
    const date = record
      ? toISODate(new Date(record.completedAt))
      : toISODate(pendingDates[pendingIndex++])
    return { ...template, order: i + 1, date }
  })
}
