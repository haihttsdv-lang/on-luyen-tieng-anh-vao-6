import { describe, expect, it } from 'vitest'
import { computeEarnedBadges } from '../../src/modules/curriculum/badges'
import type { MockTestResult, ScheduledSession, SessionOutcomeRecord } from '../../src/types/domain'

function fakeSession(
  id: string,
  date: string,
  overrides: Partial<ScheduledSession> = {},
): ScheduledSession {
  return {
    id,
    order: 0,
    focus: 'grammar',
    phaseLabel: '🧱 Giai đoạn 1 · Nền tảng',
    title: `Buổi ${id}`,
    topicIds: ['NP-01'],
    blocks: [{ label: 'x', minutes: 60, description: 'x' }],
    homework: 'Làm bài tập X',
    objectives: [],
    successCriteria: [],
    date,
    ...overrides,
  }
}

describe('HA-05 · computeEarnedBadges', () => {
  it('không có huy hiệu nào khi chưa học buổi nào', () => {
    const schedule = [fakeSession('B01', '2026-08-04')]
    expect(computeEarnedBadges(schedule, {}, {}, [])).toEqual([])
  })

  it('cấp huy hiệu hoàn thành giai đoạn khi TẤT CẢ buổi trong nhóm phaseLabel đã có outcome', () => {
    const schedule = [
      fakeSession('B01', '2026-08-04'),
      fakeSession('B02', '2026-08-06'),
    ]
    const outcomes: Record<string, SessionOutcomeRecord> = {
      B01: { outcome: 'ok', completedAt: '2026-08-04T10:00:00.000Z' },
      B02: { outcome: 'ok', completedAt: '2026-08-06T10:00:00.000Z' },
    }
    const badges = computeEarnedBadges(schedule, outcomes, {}, [])
    expect(badges.some((b) => b.id === 'phase-🧱 Giai đoạn 1 · Nền tảng')).toBe(true)
  })

  it('KHÔNG cấp huy hiệu giai đoạn khi còn 1 buổi chưa học', () => {
    const schedule = [
      fakeSession('B01', '2026-08-04'),
      fakeSession('B02', '2026-08-06'),
    ]
    const outcomes: Record<string, SessionOutcomeRecord> = {
      B01: { outcome: 'ok', completedAt: '2026-08-04T10:00:00.000Z' },
    }
    const badges = computeEarnedBadges(schedule, outcomes, {}, [])
    expect(badges.some((b) => b.id.startsWith('phase-'))).toBe(false)
  })

  it('cấp huy hiệu chuỗi 5 buổi khi có 5 buổi CHÍNH liên tiếp đều hoàn thành (bỏ qua kiểm tra tuần/tháng)', () => {
    const schedule = [
      fakeSession('B01', '2026-08-04'),
      fakeSession('W-2026-08-09', '2026-08-09', { focus: 'weekly-test' }), // xen giữa, không tính
      fakeSession('B02', '2026-08-06'),
      fakeSession('B03', '2026-08-08'),
      fakeSession('B04', '2026-08-11'),
      fakeSession('B05', '2026-08-13'),
    ]
    const outcomes: Record<string, SessionOutcomeRecord> = Object.fromEntries(
      ['B01', 'B02', 'B03', 'B04', 'B05'].map((id) => [
        id,
        { outcome: 'ok', completedAt: '2026-08-04T10:00:00.000Z' },
      ]),
    )
    const badges = computeEarnedBadges(schedule, outcomes, {}, [])
    expect(badges.some((b) => b.id === 'streak-5')).toBe(true)
  })

  it('KHÔNG cấp huy hiệu chuỗi khi bị ngắt quãng bởi 1 buổi chưa học', () => {
    const schedule = ['B01', 'B02', 'B03', 'B04', 'B05'].map((id, i) =>
      fakeSession(id, `2026-08-0${4 + i}`),
    )
    const outcomes: Record<string, SessionOutcomeRecord> = {
      B01: { outcome: 'ok', completedAt: '2026-08-04T10:00:00.000Z' },
      B02: { outcome: 'ok', completedAt: '2026-08-05T10:00:00.000Z' },
      // B03 bị bỏ — ngắt chuỗi
      B04: { outcome: 'ok', completedAt: '2026-08-07T10:00:00.000Z' },
      B05: { outcome: 'ok', completedAt: '2026-08-08T10:00:00.000Z' },
    }
    const badges = computeEarnedBadges(schedule, outcomes, {}, [])
    expect(badges.some((b) => b.id === 'streak-5')).toBe(false)
  })

  it('cấp huy hiệu 100% bài tập về nhà khi 1 tuần có buổi đã học đều làm xong bài tập', () => {
    const schedule = [fakeSession('B01', '2026-08-04'), fakeSession('B02', '2026-08-06')]
    const outcomes: Record<string, SessionOutcomeRecord> = {
      B01: { outcome: 'ok', completedAt: '2026-08-04T10:00:00.000Z' },
      B02: { outcome: 'ok', completedAt: '2026-08-06T10:00:00.000Z' },
    }
    const badges = computeEarnedBadges(schedule, outcomes, { B01: true, B02: true }, [])
    expect(badges.some((b) => b.id === 'homework-100')).toBe(true)
  })

  it('KHÔNG cấp huy hiệu bài tập về nhà khi còn ít nhất 1 buổi trong tuần chưa làm', () => {
    const schedule = [fakeSession('B01', '2026-08-04'), fakeSession('B02', '2026-08-06')]
    const outcomes: Record<string, SessionOutcomeRecord> = {
      B01: { outcome: 'ok', completedAt: '2026-08-04T10:00:00.000Z' },
      B02: { outcome: 'ok', completedAt: '2026-08-06T10:00:00.000Z' },
    }
    const badges = computeEarnedBadges(schedule, outcomes, { B01: true, B02: false }, [])
    expect(badges.some((b) => b.id === 'homework-100')).toBe(false)
  })

  it('cấp huy hiệu thi thử >80% khi có ít nhất 1 kết quả đạt', () => {
    const results: MockTestResult[] = [
      { id: 'm1', date: '2026-08-01', score: 30, total: 40, byTopic: {}, bySkill: {} },
      { id: 'm2', date: '2026-08-08', score: 35, total: 40, byTopic: {}, bySkill: {} },
    ]
    const badges = computeEarnedBadges([], {}, {}, results)
    expect(badges.some((b) => b.id === 'mock-test-80')).toBe(true)
  })

  it('KHÔNG cấp huy hiệu thi thử khi mọi kết quả đều dưới ngưỡng 80%', () => {
    const results: MockTestResult[] = [
      { id: 'm1', date: '2026-08-01', score: 30, total: 40, byTopic: {}, bySkill: {} },
    ]
    const badges = computeEarnedBadges([], {}, {}, results)
    expect(badges.some((b) => b.id === 'mock-test-80')).toBe(false)
  })
})
