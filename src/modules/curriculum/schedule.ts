import type { CurriculumSessionTemplate, ScheduledSession } from '../../types/domain'

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
 * Tính ngày cho `count` buổi học. Buổi đầu tiên LUÔN là `startDate` (yêu
 * cầu người dùng: "bắt đầu luôn từ hôm nay"), bất kể hôm đó có rơi vào lịch
 * cố định hay không. Các buổi còn lại ưu tiên đúng lịch 3 buổi/tuần
 * (`weekdays`), tính từ ngày kế tiếp `startDate`. Nếu không đủ chỗ trước
 * `deadline`, giãn đều các buổi còn lại trên khoảng thời gian còn lại để
 * vẫn hoàn thành đúng hạn.
 */
export function computeScheduleDates(
  startDate: Date,
  deadline: Date,
  count: number,
  weekdays: readonly number[] = DEFAULT_SESSION_WEEKDAYS,
): Date[] {
  if (count <= 0) return []

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

export function buildSchedule(
  templates: CurriculumSessionTemplate[],
  startDate: Date,
  deadline: Date = CURRICULUM_DEADLINE,
): ScheduledSession[] {
  const dates = computeScheduleDates(startDate, deadline, templates.length)
  return templates.map((template, i) => ({
    ...template,
    date: toISODate(dates[i]),
  }))
}
