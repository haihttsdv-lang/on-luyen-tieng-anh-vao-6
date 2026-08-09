import { describe, expect, it } from 'vitest'
import {
  findMostRecentCompletedSession,
  pickTodaySession,
} from '../../src/modules/curriculum/TodaySessionCard'
import type { ScheduledSession, SessionOutcomeRecord } from '../../src/types/domain'

function fakeSession(id: string, date: string, homework = ''): ScheduledSession {
  return {
    id,
    order: 0,
    focus: 'grammar',
    phaseLabel: '🧱 Giai đoạn 1 · Nền tảng',
    title: `Buổi ${id}`,
    topicIds: ['NP-01'],
    blocks: [{ label: 'x', minutes: 60, description: 'x' }],
    homework,
    objectives: [],
    successCriteria: [],
    date,
  }
}

describe('pickTodaySession', () => {
  it('trả về null khi mọi buổi đã hoàn thành', () => {
    const schedule = [fakeSession('B01', '2026-08-01')]
    const outcomes: Record<string, SessionOutcomeRecord> = {
      B01: { outcome: 'ok', completedAt: '2026-08-01T10:00:00.000Z' },
    }
    expect(pickTodaySession(schedule, outcomes, new Date('2026-08-09'))).toBeNull()
  })

  it('ưu tiên buổi đúng ngày hôm nay nếu có', () => {
    const schedule = [fakeSession('B01', '2026-08-09'), fakeSession('B02', '2026-08-11')]
    const result = pickTodaySession(schedule, {}, new Date('2026-08-09'))
    expect(result?.session.id).toBe('B01')
    expect(result?.status).toBe('today')
  })

  it('báo "overdue" khi buổi gần nhất còn dang dở đã quá ngày', () => {
    const schedule = [fakeSession('B01', '2026-08-01')]
    const result = pickTodaySession(schedule, {}, new Date('2026-08-09'))
    expect(result?.status).toBe('overdue')
  })
})

describe('PP-05 · findMostRecentCompletedSession', () => {
  it('trả về null khi chưa hoàn thành buổi nào', () => {
    const schedule = [fakeSession('B01', '2026-08-01')]
    expect(findMostRecentCompletedSession(schedule, {})).toBeNull()
  })

  it('chọn đúng buổi có completedAt MUỘN NHẤT, không phải order/date lớn nhất', () => {
    const schedule = [
      fakeSession('B01', '2026-08-01'),
      fakeSession('B02', '2026-08-04'),
      fakeSession('B03', '2026-08-06'),
    ]
    // B03 có ngày hiển thị muộn nhất nhưng lại được CHẤM sớm hơn B02 (lịch
    // tự đẩy có thể đảo thứ tự hoàn thành thực tế so với ngày hiển thị).
    const outcomes: Record<string, SessionOutcomeRecord> = {
      B01: { outcome: 'ok', completedAt: '2026-08-01T10:00:00.000Z' },
      B03: { outcome: 'ok', completedAt: '2026-08-05T10:00:00.000Z' },
      B02: { outcome: 'ok', completedAt: '2026-08-06T10:00:00.000Z' },
    }
    expect(findMostRecentCompletedSession(schedule, outcomes)?.id).toBe('B02')
  })
})
