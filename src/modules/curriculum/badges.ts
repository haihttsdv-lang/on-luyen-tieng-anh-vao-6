import type { MockTestResult, ScheduledSession, SessionOutcomeRecord } from '../../types/domain'
import { parseISODate } from './schedule'

/**
 * HA-05 (docs/RA-SOAT-LO-TRINH-HOC.md) — huy hiệu mốc thành tích, chi phí
 * cài đặt gần như bằng 0 (không cần dữ liệu mới, chỉ đọc lại dữ liệu đã có
 * sẵn: outcomes, bài tập về nhà, kết quả thi thử) nhưng tác động động lực
 * cao với lứa tuổi 10–11.
 */
export interface EarnedBadge {
  id: string
  emoji: string
  title: string
}

const STREAK_TARGET = 5
const MOCK_TEST_GREAT_RATIO = 0.8

/** Nhóm các buổi liên tiếp có cùng `phaseLabel` — dùng để phát hiện hoàn thành trọn 1 giai đoạn. */
function groupByPhase(schedule: ScheduledSession[]): { label: string; sessions: ScheduledSession[] }[] {
  const groups: { label: string; sessions: ScheduledSession[] }[] = []
  for (const session of schedule) {
    const last = groups[groups.length - 1]
    if (last && last.label === session.phaseLabel) last.sessions.push(session)
    else groups.push({ label: session.phaseLabel, sessions: [session] })
  }
  return groups
}

/** ISO 8601 tuần (yyyy-Www) — dùng để gom buổi học theo tuần khi xét bài tập về nhà. */
function isoWeekKey(dateIso: string): string {
  const date = parseISODate(dateIso)
  const target = new Date(date.getTime())
  target.setHours(0, 0, 0, 0)
  // Đưa về đúng Thứ Năm của tuần ISO (tuần bắt đầu Thứ Hai) để năm ISO luôn
  // đúng kể cả tuần giao giữa 2 năm dương lịch.
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7))
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const weekNumber =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    )
  return `${target.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`
}

export function computeEarnedBadges(
  schedule: ScheduledSession[],
  outcomes: Record<string, SessionOutcomeRecord>,
  homeworkDoneBySession: Record<string, boolean>,
  mockTestResults: MockTestResult[],
): EarnedBadge[] {
  const badges: EarnedBadge[] = []

  // 1) Hoàn thành trọn 1 giai đoạn — mọi buổi trong nhóm phaseLabel liên tục
  // đó đều đã có outcome.
  for (const group of groupByPhase(schedule)) {
    if (group.sessions.length > 0 && group.sessions.every((s) => outcomes[s.id])) {
      badges.push({
        id: `phase-${group.label}`,
        emoji: '🏅',
        title: `Hoàn thành ${group.label}`,
      })
    }
  }

  // 2) Chuỗi 5 buổi học chính LIÊN TIẾP đều đã hoàn thành (không tính bài
  // kiểm tra tuần/tháng — 2 loại đó tự sinh theo lịch, không phản ánh nỗ
  // lực học đều đặn của học sinh theo cùng cách buổi học chính làm).
  const mainSessions = schedule.filter(
    (s) => s.focus !== 'weekly-test' && s.focus !== 'monthly-test',
  )
  let streak = 0
  let bestStreak = 0
  for (const s of mainSessions) {
    streak = outcomes[s.id] ? streak + 1 : 0
    bestStreak = Math.max(bestStreak, streak)
  }
  if (bestStreak >= STREAK_TARGET) {
    badges.push({
      id: 'streak-5',
      emoji: '🔥',
      title: `Chuỗi ${STREAK_TARGET} buổi học liên tiếp không bỏ buổi`,
    })
  }

  // 3) Có ít nhất 1 tuần làm đủ 100% bài tập về nhà của các buổi đã học
  // trong tuần đó (chỉ tính buổi thật sự có giao bài tập).
  const weeks = new Map<string, ScheduledSession[]>()
  for (const s of schedule) {
    if (!outcomes[s.id] || !s.homework) continue
    const key = isoWeekKey(s.date)
    const list = weeks.get(key) ?? []
    list.push(s)
    weeks.set(key, list)
  }
  const hasPerfectHomeworkWeek = [...weeks.values()].some(
    (sessions) => sessions.length > 0 && sessions.every((s) => homeworkDoneBySession[s.id]),
  )
  if (hasPerfectHomeworkWeek) {
    badges.push({
      id: 'homework-100',
      emoji: '📋',
      title: 'Hoàn thành 100% bài tập về nhà trong 1 tuần',
    })
  }

  // 4) Có ít nhất 1 lần thi thử đạt trên 80%.
  const hasGreatMockTest = mockTestResults.some(
    (r) => r.total > 0 && r.score / r.total > MOCK_TEST_GREAT_RATIO,
  )
  if (hasGreatMockTest) {
    badges.push({
      id: 'mock-test-80',
      emoji: '🎯',
      title: 'Thi thử đạt trên 80%',
    })
  }

  return badges
}
