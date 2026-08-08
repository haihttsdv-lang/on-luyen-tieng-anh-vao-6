import { describe, expect, it } from 'vitest'
import { CURRICULUM_PLAN } from '../../src/content/curriculum'
import { topics } from '../../src/content/topics'
import { buildFullSchedule, buildPeriodicTests, mergeSchedule } from '../../src/modules/curriculum/periodicTests'
import { coinsForOutcome } from '../../src/modules/curriculum/rewards'
import {
  CURRICULUM_DEADLINE,
  buildSchedule,
  computeScheduleDates,
  parseISODate,
  toISODate,
} from '../../src/modules/curriculum/schedule'
import type { ScheduledSession, SessionFocus } from '../../src/types/domain'

describe('Lộ trình học (CURRICULUM_PLAN)', () => {
  it('mỗi buổi học có tổng thời lượng đúng 90 phút', () => {
    for (const session of CURRICULUM_PLAN) {
      const total = session.blocks.reduce((sum, b) => sum + b.minutes, 0)
      expect(total).toBe(90)
    }
  })

  it('id buổi học duy nhất và thứ tự order tăng dần liên tục từ 1', () => {
    const ids = CURRICULUM_PLAN.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    CURRICULUM_PLAN.forEach((s, i) => expect(s.order).toBe(i + 1))
  })

  it('mỗi chủ điểm ngữ pháp (36/36) đều được dạy đúng 1 buổi "grammar"', () => {
    const grammarSessions = CURRICULUM_PLAN.filter((s) => s.focus === 'grammar')
    expect(grammarSessions).toHaveLength(36)
    const taughtTopicIds = grammarSessions.flatMap((s) => s.topicIds)
    const allTopicIds = topics.map((t) => t.id)
    expect(new Set(taughtTopicIds).size).toBe(36)
    for (const topicId of allTopicIds) {
      expect(taughtTopicIds).toContain(topicId)
    }
  })

  it('có đủ buổi khai giảng, ôn tập, luyện đề, luyện chuyên sâu, và ôn thi tổng lực theo đúng 4 giai đoạn', () => {
    const countFocus = (focus: string) =>
      CURRICULUM_PLAN.filter((s) => s.focus === focus).length
    expect(countFocus('orientation')).toBe(1)
    expect(countFocus('review')).toBe(2) // chốt Giai đoạn 1 + Giai đoạn 2
    expect(countFocus('mock-test')).toBe(5) // 2 chốt giai đoạn + 3 vòng tăng tốc
    expect(countFocus('skill-drill')).toBe(3) // 3 vòng luyện chuyên sâu ở Giai đoạn 3
    expect(countFocus('final-exam')).toBe(3)
    expect(CURRICULUM_PLAN).toHaveLength(50)
  })

  it('mỗi buổi "grammar" đều có 1 chủ đề từ vựng đi kèm hợp lệ (TV-xx)', () => {
    for (const session of CURRICULUM_PLAN.filter((s) => s.focus === 'grammar')) {
      expect(session.vocabTopicId).toMatch(/^TV-\d{2}$/)
    }
  })

  it('36 chủ điểm ngữ pháp được chia thành đúng 2 giai đoạn Nền tảng/Nâng cao, không trùng lặp', () => {
    const grammarSessions = CURRICULUM_PLAN.filter((s) => s.focus === 'grammar')
    const foundation = grammarSessions.filter((s) => s.phaseLabel.includes('Nền tảng'))
    const advanced = grammarSessions.filter((s) => s.phaseLabel.includes('Nâng cao'))
    expect(foundation).toHaveLength(20)
    expect(advanced).toHaveLength(16)
  })

  it('các buổi trong cùng 1 giai đoạn xuất hiện liên tục (không xen kẽ giai đoạn khác)', () => {
    const seenLabels = new Set<string>()
    let lastLabel: string | undefined
    for (const session of CURRICULUM_PLAN) {
      if (session.phaseLabel !== lastLabel) {
        expect(seenLabels.has(session.phaseLabel)).toBe(false)
        seenLabels.add(session.phaseLabel)
        lastLabel = session.phaseLabel
      }
    }
  })
})

describe('Lập lịch buổi học (schedule.ts)', () => {
  it('computeScheduleDates trả về đúng số lượng ngày yêu cầu', () => {
    const dates = computeScheduleDates(
      new Date(2026, 7, 10),
      new Date(2026, 11, 31),
      50,
    )
    expect(dates).toHaveLength(50)
  })

  it('buổi đầu tiên luôn đúng bằng ngày bắt đầu, bất kể ngày đó là thứ mấy', () => {
    for (const start of [
      new Date(2026, 7, 8), // Thứ Bảy — trùng lịch cố định
      new Date(2026, 7, 9), // Chủ nhật — không trùng lịch cố định
      new Date(2026, 7, 10), // Thứ Hai — không trùng lịch cố định
    ]) {
      const dates = computeScheduleDates(start, new Date(2026, 11, 31), 50)
      expect(toISODate(dates[0])).toBe(toISODate(start))
    }
  })

  it('với lịch lý tưởng 3 buổi/tuần, không có ngày nào vượt hạn chót', () => {
    const deadline = new Date(2026, 11, 31)
    const dates = computeScheduleDates(new Date(2026, 7, 10), deadline, 50)
    for (const d of dates) {
      expect(d.getTime()).toBeLessThanOrEqual(deadline.getTime())
    }
  })

  it('từ buổi thứ hai trở đi, mỗi ngày trong lịch lý tưởng đều rơi vào Thứ Ba/Năm/Bảy', () => {
    const dates = computeScheduleDates(
      new Date(2026, 7, 10),
      new Date(2026, 11, 31),
      50,
    )
    for (const d of dates.slice(1)) {
      expect([2, 4, 6]).toContain(d.getDay())
    }
  })

  it('nếu ngày bắt đầu quá sát hạn chót (không đủ chỗ 3 buổi/tuần), vẫn nén lịch để hoàn thành đúng hạn', () => {
    const deadline = new Date(2026, 11, 31)
    const start = new Date(2026, 11, 20) // chỉ còn ~11 ngày trước hạn
    const dates = computeScheduleDates(start, deadline, 50)
    expect(dates).toHaveLength(50)
    expect(dates[dates.length - 1].getTime()).toBeLessThanOrEqual(deadline.getTime())
    expect(dates[0].getTime()).toBe(atMidnightMs(start))
  })

  it('buildSchedule luôn hoàn thành trước hoặc đúng hạn 31/12/2026 dù bắt đầu từ ngày nào, và buổi 1 luôn là ngày bắt đầu', () => {
    for (const start of [new Date(2026, 7, 8), new Date(2026, 9, 1), new Date(2026, 11, 15)]) {
      const scheduled = buildSchedule(CURRICULUM_PLAN, start, CURRICULUM_DEADLINE)
      const lastDate = parseISODate(scheduled[scheduled.length - 1].date)
      expect(lastDate.getTime()).toBeLessThanOrEqual(CURRICULUM_DEADLINE.getTime())
      expect(scheduled).toHaveLength(CURRICULUM_PLAN.length)
      expect(scheduled[0].date).toBe(toISODate(start))
    }
  })

  it('toISODate/parseISODate là nghịch đảo của nhau', () => {
    const d = new Date(2026, 9, 5)
    expect(toISODate(parseISODate(toISODate(d)))).toBe(toISODate(d))
  })
})

function atMidnightMs(date: Date): number {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy.getTime()
}

function fakeSession(id: string, date: string): ScheduledSession {
  return {
    id,
    order: 0,
    focus: 'grammar',
    phaseLabel: '🧱 Giai đoạn 1 · Nền tảng',
    title: `Buổi ${id}`,
    topicIds: ['NP-01'],
    blocks: [{ label: 'x', minutes: 90, description: 'x' }],
    homework: '',
    date,
  }
}

// Đếm số Chủ nhật trong [start, end] bằng cách lặp độc lập với
// buildPeriodicTests, để bài test không chỉ đối chiếu chính nó (tautology).
function countSundays(start: Date, end: Date): number {
  let count = 0
  const cur = new Date(start)
  cur.setHours(0, 0, 0, 0)
  const endMs = new Date(end).setHours(0, 0, 0, 0)
  while (cur.getTime() <= endMs) {
    if (cur.getDay() === 0) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

describe('Bài kiểm tra tuần/tháng (periodicTests.ts)', () => {
  it('sinh đúng 1 bài kiểm tra cho mỗi Chủ nhật trong khoảng ngày của lịch chính', () => {
    const main = [fakeSession('B01', '2026-08-01'), fakeSession('B02', '2026-09-15')]
    const tests = buildPeriodicTests(main)
    const expectedCount = countSundays(new Date(2026, 7, 1), new Date(2026, 8, 15))
    expect(tests).toHaveLength(expectedCount)
    for (const t of tests) {
      expect(parseISODate(t.date).getDay()).toBe(0)
    }
  })

  it('Chủ nhật cuối cùng của tháng luôn là "monthly-test", các Chủ nhật khác là "weekly-test"', () => {
    const main = [fakeSession('B01', '2026-08-01'), fakeSession('B02', '2026-09-30')]
    const tests = buildPeriodicTests(main)
    for (const t of tests) {
      const sunday = parseISODate(t.date)
      const nextSunday = new Date(sunday)
      nextSunday.setDate(nextSunday.getDate() + 7)
      const isLastOfMonth = nextSunday.getMonth() !== sunday.getMonth()
      expect(t.focus).toBe(isLastOfMonth ? 'monthly-test' : 'weekly-test')
    }
    expect(tests.some((t) => t.focus === 'monthly-test')).toBe(true)
    expect(tests.some((t) => t.focus === 'weekly-test')).toBe(true)
  })

  it('không sinh bài kiểm tra nào ngoài khoảng ngày của lịch chính', () => {
    const main = [fakeSession('B01', '2026-08-10'), fakeSession('B02', '2026-08-20')]
    const tests = buildPeriodicTests(main)
    const firstMs = atMidnightMs(new Date(2026, 7, 10))
    const lastMs = atMidnightMs(new Date(2026, 7, 20))
    for (const t of tests) {
      const ms = atMidnightMs(parseISODate(t.date))
      expect(ms).toBeGreaterThanOrEqual(firstMs)
      expect(ms).toBeLessThanOrEqual(lastMs)
    }
  })

  it('id bài kiểm tra duy nhất và mang tiền tố W-/M- kèm ngày', () => {
    const main = [fakeSession('B01', '2026-08-01'), fakeSession('B02', '2026-10-31')]
    const tests = buildPeriodicTests(main)
    const ids = tests.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const t of tests) {
      expect(t.id).toMatch(/^[WM]-\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('mergeSchedule gộp và đánh lại order tuần tự theo đúng thứ tự ngày', () => {
    const a = [fakeSession('B01', '2026-08-04'), fakeSession('B02', '2026-08-06')]
    const b = [fakeSession('W-2026-08-09', '2026-08-09')]
    const merged = mergeSchedule(a, b)
    expect(merged.map((s) => s.id)).toEqual(['B01', 'B02', 'W-2026-08-09'])
    expect(merged.map((s) => s.order)).toEqual([1, 2, 3])
  })

  it('buildFullSchedule = buổi học chính + đúng số bài kiểm tra Chủ nhật, không trùng id', () => {
    const start = new Date(2026, 7, 8)
    const scheduled = buildFullSchedule(CURRICULUM_PLAN, start, CURRICULUM_DEADLINE)
    const mainOnly = buildSchedule(CURRICULUM_PLAN, start, CURRICULUM_DEADLINE)
    const expectedTestCount = countSundays(
      parseISODate(mainOnly[0].date),
      parseISODate(mainOnly[mainOnly.length - 1].date),
    )
    expect(scheduled).toHaveLength(CURRICULUM_PLAN.length + expectedTestCount)
    const ids = scheduled.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    // Vẫn sắp theo ngày tăng dần và order khớp vị trí.
    for (let i = 1; i < scheduled.length; i++) {
      expect(scheduled[i].date >= scheduled[i - 1].date).toBe(true)
      expect(scheduled[i].order).toBe(i + 1)
    }
  })
})

describe('Xu thưởng/phạt theo kết quả buổi học (rewards.ts)', () => {
  const focuses: SessionFocus[] = [
    'orientation',
    'grammar',
    'review',
    'mock-test',
    'skill-drill',
    'final-exam',
    'weekly-test',
    'monthly-test',
  ]

  it('"great" luôn cộng dương, "weak" luôn trừ (âm), "ok" cộng dương nhưng ít hơn "great"', () => {
    for (const focus of focuses) {
      const great = coinsForOutcome(focus, 'great')
      const ok = coinsForOutcome(focus, 'ok')
      const weak = coinsForOutcome(focus, 'weak')
      expect(great).toBeGreaterThan(0)
      expect(ok).toBeGreaterThan(0)
      expect(ok).toBeLessThan(great)
      expect(weak).toBeLessThan(0)
    }
  })

  it('"weak" trừ đúng bằng độ lớn "ok" (đối xứng cộng/trừ)', () => {
    for (const focus of focuses) {
      expect(coinsForOutcome(focus, 'weak')).toBe(-coinsForOutcome(focus, 'ok'))
    }
  })
})
