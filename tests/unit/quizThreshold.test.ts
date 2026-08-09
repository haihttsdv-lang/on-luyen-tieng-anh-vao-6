import { describe, expect, it } from 'vitest'
import { hasPassed, requiredCorrect } from '../../src/modules/lessons/quizThreshold'

describe('Ngưỡng đạt quiz cuối bài (ND-01)', () => {
  it('giữ đúng chuẩn 80% với bài từ 5 câu trở lên', () => {
    expect(requiredCorrect(5)).toBe(4)
    expect(requiredCorrect(10)).toBe(8)
    expect(requiredCorrect(8)).toBe(7) // ceil(6.4)
  })

  it('luôn cho phép sai 1 câu khi bài ngắn dưới 5 câu', () => {
    // Đây là lỗi cũ: 3 câu × 80% = 2.4 → ceil = 3 ⇒ bắt buộc đúng 3/3 (100%).
    expect(requiredCorrect(3)).toBe(2)
    expect(requiredCorrect(4)).toBe(3)
    expect(requiredCorrect(2)).toBe(1)
  })

  it('không bao giờ trả về 0 khi có ít nhất 1 câu', () => {
    expect(requiredCorrect(1)).toBe(1)
    expect(requiredCorrect(0)).toBe(0)
  })

  it('hasPassed khớp với requiredCorrect', () => {
    expect(hasPassed(2, 3)).toBe(true)
    expect(hasPassed(1, 3)).toBe(false)
    expect(hasPassed(4, 5)).toBe(true)
    expect(hasPassed(3, 5)).toBe(false)
    expect(hasPassed(0, 0)).toBe(false)
  })
})
