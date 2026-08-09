import { describe, expect, it } from 'vitest'
import { getCurriculumPlan } from '../../src/content/curriculum'
import { tierFromDiagnosticScore } from '../../src/modules/curriculum/personalize'

describe('LT-06 · tierFromDiagnosticScore', () => {
  it('chưa làm bài kiểm tra đầu vào ⇒ standard', () => {
    expect(tierFromDiagnosticScore(undefined)).toBe('standard')
  })
  it('dưới 50% ⇒ foundation-boost', () => {
    expect(tierFromDiagnosticScore({ correctCount: 5, total: 20 })).toBe('foundation-boost')
  })
  it('đúng 50% ⇒ standard (không phải foundation-boost)', () => {
    expect(tierFromDiagnosticScore({ correctCount: 10, total: 20 })).toBe('standard')
  })
  it('trên 80% ⇒ accelerated', () => {
    expect(tierFromDiagnosticScore({ correctCount: 18, total: 20 })).toBe('accelerated')
  })
  it('đúng 80% ⇒ standard (không phải accelerated)', () => {
    expect(tierFromDiagnosticScore({ correctCount: 16, total: 20 })).toBe('standard')
  })
})

describe('LT-06 · getCurriculumPlan', () => {
  it("'standard' và 'accelerated' có cùng số buổi (không xóa/gộp buổi nào)", () => {
    const standard = getCurriculumPlan('standard')
    const accelerated = getCurriculumPlan('accelerated')
    expect(accelerated).toHaveLength(standard.length)
  })

  it("'foundation-boost' thêm đúng 4 buổi 'Củng cố nền tảng' trước Giai đoạn 1", () => {
    const standard = getCurriculumPlan('standard')
    const boosted = getCurriculumPlan('foundation-boost')
    expect(boosted).toHaveLength(standard.length + 4)

    const boostSessions = boosted.filter((s) => s.title.startsWith('Củng cố nền tảng'))
    expect(boostSessions).toHaveLength(4)
    // Phải nằm NGAY SAU buổi khai giảng, TRƯỚC buổi ngữ pháp đầu tiên.
    const orientationIndex = boosted.findIndex((s) => s.focus === 'orientation')
    const firstGrammarIndex = boosted.findIndex((s) => s.focus === 'grammar')
    for (const s of boostSessions) {
      const i = boosted.indexOf(s)
      expect(i).toBeGreaterThan(orientationIndex)
      expect(i).toBeLessThan(firstGrammarIndex)
    }
  })

  it('mọi id buổi trong mọi tier đều duy nhất và order tăng dần liên tục từ 1', () => {
    for (const tier of ['standard', 'foundation-boost', 'accelerated'] as const) {
      const plan = getCurriculumPlan(tier)
      const ids = plan.map((s) => s.id)
      expect(new Set(ids).size).toBe(ids.length)
      plan.forEach((s, i) => expect(s.order).toBe(i + 1))
    }
  })

  it('gọi lại cùng 1 tier trả về cùng tham chiếu mảng (có cache)', () => {
    expect(getCurriculumPlan('standard')).toBe(getCurriculumPlan('standard'))
  })
})
