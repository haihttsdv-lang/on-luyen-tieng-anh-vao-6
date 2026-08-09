import { describe, expect, it } from 'vitest'
import { CURRICULUM_PLAN } from '../../src/content/curriculum'
import { topics } from '../../src/content/topics'
import { buildFullSchedule, buildPeriodicTests, mergeSchedule } from '../../src/modules/curriculum/periodicTests'
import { coinsForOutcome } from '../../src/modules/curriculum/rewards'
import {
  CURRICULUM_DEADLINE,
  buildAdaptiveSchedule,
  computeScheduleDates,
  parseISODate,
  toISODate,
} from '../../src/modules/curriculum/schedule'
import type {
  CurriculumSessionTemplate,
  ScheduledSession,
  SessionFocus,
} from '../../src/types/domain'

describe('Lộ trình học (CURRICULUM_PLAN)', () => {
  it('mỗi buổi học có tổng thời lượng đúng 60 phút', () => {
    for (const session of CURRICULUM_PLAN) {
      const total = session.blocks.reduce((sum, b) => sum + b.minutes, 0)
      expect(total).toBe(60)
    }
  })

  it('PP-06: buổi "grammar"/"skill-lesson" có ít nhất 1 khối `optional` để chế độ "Học phiên rút gọn" có tác dụng thật', () => {
    const sessionsWithShortMode = CURRICULUM_PLAN.filter(
      (s) => s.focus === 'grammar' || s.focus === 'skill-lesson',
    )
    expect(sessionsWithShortMode.length).toBeGreaterThan(0)
    for (const session of sessionsWithShortMode) {
      expect(session.blocks.some((b) => b.optional)).toBe(true)
    }
    // Buổi kiểm tra/thi thử không được có khối optional — mọi nội dung đều
    // là phần thi thật, không có "phần mở rộng" nào để bỏ qua.
    const testSessions = CURRICULUM_PLAN.filter((s) =>
      ['mock-test', 'final-exam', 'weekly-test', 'monthly-test'].includes(s.focus),
    )
    for (const session of testSessions) {
      expect(session.blocks.some((b) => b.optional)).toBe(false)
    }
  })

  it('PP-04: mỗi buổi học có 2–3 mục tiêu và ít nhất 1 tiêu chí đạt được đối chiếu bằng dữ liệu thật', () => {
    for (const session of CURRICULUM_PLAN) {
      expect(session.objectives.length).toBeGreaterThanOrEqual(2)
      expect(session.objectives.length).toBeLessThanOrEqual(3)
      expect(session.successCriteria.length).toBeGreaterThanOrEqual(1)
      // Mọi buổi đều có tiêu chí "hoàn thành hết các khối" — tiêu chí cơ bản
      // nhất, áp dụng được cho MỌI loại buổi (không phụ thuộc quiz/từ vựng).
      expect(session.successCriteria.some((c) => c.check.type === 'blocksDone')).toBe(true)
    }
  })

  it('PP-08: mỗi buổi học đều có ghi chú dành cho phụ huynh', () => {
    for (const session of CURRICULUM_PLAN) {
      expect(session.parentNote?.length ?? 0).toBeGreaterThan(0)
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
    // LT-05: 2 buổi "Ôn tập tổng hợp" chốt Giai đoạn 1/2 + 3 buổi "Chốt tủ"
    // xen giữa các vòng thi thử toàn diện ở Giai đoạn 4.
    expect(countFocus('review')).toBe(5)
    expect(countFocus('mock-test')).toBe(5) // 2 chốt giai đoạn + 3 vòng tăng tốc
    expect(countFocus('skill-drill')).toBe(3) // 3 vòng luyện chuyên sâu ở Giai đoạn 3
    // LT-05: nâng từ 3 → 9 vòng thi thử toàn diện, dùng quỹ ~4 tuần lịch
    // trước đây bỏ trống (lộ trình cũ kết thúc sớm 30 ngày trước hạn chót).
    expect(countFocus('final-exam')).toBe(9)
    // LT-01: 8 buổi dạy phương pháp làm dạng bài (Ngữ âm x2, Đọc hiểu x3,
    // Tìm lỗi sai, Viết lại câu, Viết đoạn văn) — trước đây lộ trình bỏ
    // trắng hoàn toàn 5/9 dạng bài của đề thật.
    expect(countFocus('skill-lesson')).toBe(8)
    expect(CURRICULUM_PLAN).toHaveLength(67)
  })

  it('LT-01: 8 buổi kỹ năng phủ đủ 5 dạng bài còn thiếu, mỗi buổi có skillId hợp lệ và không gắn topicIds', () => {
    const skillLessons = CURRICULUM_PLAN.filter((s) => s.focus === 'skill-lesson')
    const bySkill = new Map<string, number>()
    for (const s of skillLessons) {
      expect(s.topicIds).toEqual([])
      expect(s.skillId).toBeDefined()
      bySkill.set(s.skillId!, (bySkill.get(s.skillId!) ?? 0) + 1)
    }
    expect(bySkill.get('KN-08')).toBe(2) // Ngữ âm
    expect(bySkill.get('KN-02')).toBe(3) // Đọc hiểu
    expect(bySkill.get('KN-06')).toBe(1) // Tìm lỗi sai
    expect(bySkill.get('KN-05')).toBe(1) // Viết lại câu
    expect(bySkill.get('KN-07')).toBe(1) // Viết đoạn văn
  })

  it('mỗi buổi "grammar" đều có 1 chủ đề từ vựng đi kèm hợp lệ (TV-xx)', () => {
    for (const session of CURRICULUM_PLAN.filter((s) => s.focus === 'grammar')) {
      expect(session.vocabTopicId).toMatch(/^TV-\d{2}$/)
    }
  })

  it('LT-04: chủ đề từ vựng khó (TV-12/13/14) được ôn nhiều hơn chủ đề dễ, và không dồn cục nhiều buổi liên tiếp', () => {
    const grammarSessions = CURRICULUM_PLAN.filter((s) => s.focus === 'grammar')
    const counts: Record<string, number> = {}
    const gapsByTopic: Record<string, number[]> = {}
    const lastIndexByTopic: Record<string, number> = {}
    grammarSessions.forEach((s, i) => {
      const id = s.vocabTopicId!
      counts[id] = (counts[id] ?? 0) + 1
      if (lastIndexByTopic[id] !== undefined) {
        ;(gapsByTopic[id] ??= []).push(i - lastIndexByTopic[id])
      }
      lastIndexByTopic[id] = i
    })

    for (const hardId of ['TV-12', 'TV-13', 'TV-14']) {
      expect(counts[hardId]).toBeGreaterThanOrEqual(4)
    }
    for (const easyId of ['TV-01', 'TV-02', 'TV-03', 'TV-04', 'TV-05', 'TV-06', 'TV-07', 'TV-08']) {
      expect(counts[easyId]).toBe(2)
    }
    // Trải đều: không có 2 lần ôn liên tiếp của cùng 1 chủ đề (khoảng cách ≥ 2).
    for (const gaps of Object.values(gapsByTopic)) {
      for (const gap of gaps) expect(gap).toBeGreaterThanOrEqual(2)
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

  it('PP-07: 36 buổi ngữ pháp xoay đều 3 khuôn (Dẫn dắt/Khám phá/Trò chơi hóa), mỗi khuôn vẫn đúng 60 phút và 6 khối', () => {
    const grammarSessions = CURRICULUM_PLAN.filter((s) => s.focus === 'grammar')
    // Nhận diện khuôn qua nhãn khối đặc trưng — không export riêng biến
    // variant ra khỏi content/curriculum, tránh rò rỉ chi tiết cài đặt.
    const variantOf = (labels: string[]) => {
      if (labels.includes('Thử sức trước')) return 'explore'
      if (labels.includes('Chơi mà học')) return 'gamify'
      return 'lead'
    }
    const counts = { lead: 0, explore: 0, gamify: 0 }
    for (const session of grammarSessions) {
      const labels = session.blocks.map((b) => b.label)
      counts[variantOf(labels)]++
      expect(session.blocks).toHaveLength(6)
      expect(session.blocks.reduce((sum, b) => sum + b.minutes, 0)).toBe(60)
    }
    // 36 buổi / 3 khuôn = 12 buổi mỗi khuôn đúng (xoay vòng đều theo i % 3).
    expect(counts).toEqual({ lead: 12, explore: 12, gamify: 12 })
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

  it('buildAdaptiveSchedule (không có buổi nào hoàn thành) luôn xong trước hoặc đúng hạn 31/12/2026 dù "hôm nay" là ngày nào, và buổi 1 luôn là "hôm nay"', () => {
    for (const now of [new Date(2026, 7, 8), new Date(2026, 9, 1), new Date(2026, 11, 15)]) {
      const scheduled = buildAdaptiveSchedule(CURRICULUM_PLAN, {}, CURRICULUM_DEADLINE, now)
      const lastDate = parseISODate(scheduled[scheduled.length - 1].date)
      expect(lastDate.getTime()).toBeLessThanOrEqual(CURRICULUM_DEADLINE.getTime())
      expect(scheduled).toHaveLength(CURRICULUM_PLAN.length)
      expect(scheduled[0].date).toBe(toISODate(now))
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

function addDaysForTest(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function fakeSession(id: string, date: string): ScheduledSession {
  return {
    id,
    order: 0,
    focus: 'grammar',
    phaseLabel: '🧱 Giai đoạn 1 · Nền tảng',
    title: `Buổi ${id}`,
    topicIds: ['NP-01'],
    blocks: [{ label: 'x', minutes: 60, description: 'x' }],
    homework: '',
    objectives: [],
    successCriteria: [],
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

  it('LT-07: không sinh bài kiểm tra tuần vào đúng ngày buổi đầu tiên, kể cả khi buổi đó là Chủ nhật', () => {
    // Mở app lần đầu vào Chủ nhật ("bắt đầu luôn từ hôm nay") ép buổi khai
    // giảng = đúng hôm đó — trước khi sửa, Chủ nhật này còn bị sinh thêm 1
    // bài kiểm tra tuần, dồn 135 phút vào ngày đầu tiên dù chưa học gì.
    const main = [fakeSession('B01', '2026-08-09'), fakeSession('B02', '2026-08-20')]
    const tests = buildPeriodicTests(main)
    expect(tests.some((t) => t.date === '2026-08-09')).toBe(false)
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
    const now = new Date(2026, 7, 8)
    const scheduled = buildFullSchedule(CURRICULUM_PLAN, {}, CURRICULUM_DEADLINE, now)
    const mainOnly = buildAdaptiveSchedule(CURRICULUM_PLAN, {}, CURRICULUM_DEADLINE, now)
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

function fakeTemplate(id: string, focus: SessionFocus = 'grammar'): CurriculumSessionTemplate {
  return {
    id,
    order: 0,
    focus,
    phaseLabel: '🧱 Giai đoạn 1 · Nền tảng',
    title: `Buổi ${id}`,
    topicIds: ['NP-01'],
    blocks: [{ label: 'x', minutes: 60, description: 'x' }],
    homework: '',
    objectives: [],
    successCriteria: [],
  }
}

describe('Đẩy lịch tự động theo tiến độ hoàn thành thực tế (buildAdaptiveSchedule)', () => {
  const deadline = new Date(2026, 11, 31)
  const templates = [fakeTemplate('B01'), fakeTemplate('B02'), fakeTemplate('B03'), fakeTemplate('B04')]

  it('buổi đã hoàn thành hiển thị đúng ngày hoàn thành thực tế, không tính lại theo lịch', () => {
    const now = new Date(2026, 7, 20)
    const scheduled = buildAdaptiveSchedule(
      templates,
      { B01: { completedAt: new Date(2026, 7, 11, 9, 0).toISOString() } },
      deadline,
      now,
    )
    expect(scheduled.find((s) => s.id === 'B01')!.date).toBe('2026-08-11')
  })

  it('buổi chưa hoàn thành được xếp từ ngày SAU buổi hoàn thành gần nhất (không phải từ hôm nay) nếu mốc đó ở tương lai, và vẫn đúng lịch Thứ Ba/Năm/Bảy', () => {
    // Hoàn thành B01 "hôm nay" (20/08, Thứ Năm) → điểm neo cho B02 là hôm
    // sau (21/08, Thứ Sáu — KHÔNG thuộc lịch cố định). B02 phải rơi vào
    // Thứ Ba/Năm/Bảy gần nhất từ điểm neo trở đi, tức 22/08 (Thứ Bảy) —
    // không bị ép đúng bằng 21/08 như buổi khai giảng đầu tiên.
    const now = new Date(2026, 7, 20)
    const scheduled = buildAdaptiveSchedule(
      templates,
      { B01: { completedAt: now.toISOString() } },
      deadline,
      now,
    )
    const b02 = scheduled.find((s) => s.id === 'B02')!
    expect(b02.date).toBe('2026-08-22')
    expect(parseISODate(b02.date).getDay()).toBe(6) // Thứ Bảy
  })

  it('nếu buổi hoàn thành gần nhất đã lâu trong quá khứ, buổi tiếp theo được xếp từ hôm nay (không bị kẹt ở quá khứ) — mô phỏng "học chậm/bỏ buổi thì bị đẩy lùi"', () => {
    const now = new Date(2026, 8, 1) // hôm nay 01/09, xa ngày hoàn thành B01
    const scheduled = buildAdaptiveSchedule(
      templates,
      { B01: { completedAt: new Date(2026, 7, 11).toISOString() } }, // hoàn thành từ 11/08
      deadline,
      now,
    )
    const b02 = scheduled.find((s) => s.id === 'B02')!
    expect(parseISODate(b02.date).getTime()).toBe(now.getTime())
  })

  it('mốc neo dựa trên buổi hoàn thành gần nhất THEO THỨ TỰ lộ trình, không phải theo thời gian hoàn thành thực tế', () => {
    // Hoàn thành B03 trước (ví dụ học nhảy cóc) rồi hoàn thành B01 sau, muộn
    // hơn về mặt đồng hồ — nhưng B03 đứng sau B01 trong lộ trình nên vẫn là
    // mốc neo cho các buổi CHƯA hoàn thành (B02 nếu chưa học, B04...).
    const now = new Date(2026, 7, 25)
    const scheduled = buildAdaptiveSchedule(
      templates,
      {
        B01: { completedAt: new Date(2026, 7, 20).toISOString() }, // hoàn thành sau B03 về mặt đồng hồ
        B03: { completedAt: new Date(2026, 7, 15).toISOString() },
      },
      deadline,
      now,
    )
    // B02 là buổi CHƯA hoàn thành đầu tiên trong danh sách còn lại — luôn
    // nhận đúng ngày neo. Neo phải theo B03 (buổi cuối cùng ĐÃ hoàn thành
    // trong thứ tự lộ trình B01→B02→B03→B04), không phải theo B01 dù B01
    // hoàn thành muộn hơn. B03 hoàn thành 15/08 (quá khứ so với now=25/08)
    // nên neo = now.
    const b02 = scheduled.find((s) => s.id === 'B02')!
    expect(parseISODate(b02.date).getTime()).toBe(now.getTime())
  })

  it('mọi buổi CHƯA hoàn thành luôn rơi đúng lịch cố định Thứ Ba/Năm/Bảy, kể cả khi điểm neo rơi vào ngày khác trong tuần', () => {
    // Với nhiều "hôm nay" khác nhau (đủ 7 thứ trong tuần) và có 1 buổi vừa
    // hoàn thành, điểm neo (hôm sau) có thể rơi vào bất kỳ thứ nào — nhưng
    // mọi buổi CHƯA hoàn thành vẫn phải rơi đúng Thứ Ba/Năm/Bảy, không được
    // "ăn theo" thứ lệch của điểm neo (bug đã phát hiện qua kiểm tra trực
    // quan: buổi tiếp theo từng bị xếp vào Chủ nhật).
    for (let offset = 0; offset < 7; offset++) {
      const now = addDaysForTest(new Date(2026, 7, 8), offset)
      const scheduled = buildAdaptiveSchedule(
        templates,
        { B01: { completedAt: now.toISOString() } },
        deadline,
        now,
      )
      for (const s of scheduled) {
        if (s.id === 'B01') continue // đã hoàn thành, giữ ngày lịch sử
        expect([2, 4, 6]).toContain(parseISODate(s.date).getDay())
      }
    }
  })

  it('không bao giờ vượt quá deadline dù có nhiều buổi hoàn thành rải rác', () => {
    const now = new Date(2026, 11, 20)
    const scheduled = buildAdaptiveSchedule(
      templates,
      { B01: { completedAt: new Date(2026, 11, 19).toISOString() } },
      deadline,
      now,
    )
    for (const s of scheduled) {
      expect(parseISODate(s.date).getTime()).toBeLessThanOrEqual(deadline.getTime())
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
