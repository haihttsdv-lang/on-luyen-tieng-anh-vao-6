import type { SkillId } from '../../types/domain'

export interface MockTestOption {
  id: string
  label: string
  totalQuestions: number
  durationMinutes: number
  description: string
}

// Quy đổi 4 phần thật của đề THCS Cầu Giấy sang các mã KN-xx sẵn có của URD —
// xem docs/adr/0002 để biết lý do quy đổi và giới hạn của cách quy đổi này.
// Tỷ lệ theo đúng số câu từng phần thật: Phonetics 4, Vocab&Grammar 18
// (KN-03 4 + KN-09 4 + KN-04 2 + KN-06 8), Reading 14 (KN-01 4 + KN-02 10),
// Writing 4.
//
// Cập nhật ND-03: đề thật có 4 câu đồng/trái nghĩa, trước đây bị gộp vào
// KN-03 nên đề sinh ra có thể KHÔNG có câu nào thuộc dạng này. Tách 4 câu từ
// KN-03 sang mã mới KN-09, giữ nguyên tổng phần Vocab & Grammar = 18.
const CAU_GIAY_BLUEPRINT: Partial<Record<SkillId, number>> = {
  'KN-08': 4,
  'KN-03': 4,
  'KN-09': 4,
  'KN-04': 2,
  'KN-06': 8,
  'KN-01': 4,
  'KN-02': 10,
  'KN-05': 4,
}

const CAU_GIAY_TOTAL = 40

export const MOCK_TEST_OPTIONS: MockTestOption[] = [
  {
    id: '20',
    label: '20 câu / 20 phút',
    totalQuestions: 20,
    durationMinutes: 20,
    description: 'Đề ngắn, tỷ trọng theo cùng cấu trúc thật, phù hợp luyện nhanh.',
  },
  {
    id: '30',
    label: '30 câu / 30 phút',
    totalQuestions: 30,
    durationMinutes: 30,
    description: 'Đề trung bình, tỷ trọng theo cùng cấu trúc thật.',
  },
  {
    id: 'cau-giay',
    label: '🎓 Giống đề THCS Cầu Giấy (40 câu / 45 phút)',
    totalQuestions: CAU_GIAY_TOTAL,
    durationMinutes: 45,
    description:
      'Mô phỏng đúng số câu 4 phần của đề thật: Ngữ âm, Từ vựng-Ngữ pháp, Đọc hiểu, Viết lại câu.',
  },
]

/** Co giãn blueprint Cầu Giấy (40 câu) về một tổng số câu bất kỳ, giữ nguyên tỷ lệ. */
export function scaleBlueprint(
  targetTotal: number,
): Partial<Record<SkillId, number>> {
  if (targetTotal === CAU_GIAY_TOTAL) return { ...CAU_GIAY_BLUEPRINT }

  const entries = Object.entries(CAU_GIAY_BLUEPRINT) as [SkillId, number][]
  const scaled = entries.map(([skillId, count]) => {
    const exact = (count / CAU_GIAY_TOTAL) * targetTotal
    return { skillId, floor: Math.floor(exact), remainder: exact - Math.floor(exact) }
  })

  let assigned = scaled.reduce((sum, s) => sum + s.floor, 0)
  let remaining = targetTotal - assigned

  // Largest-remainder method: phân bổ phần còn thiếu cho các mã có phần dư lớn nhất.
  const byRemainderDesc = [...scaled].sort((a, b) => b.remainder - a.remainder)
  const result: Partial<Record<SkillId, number>> = {}
  for (const s of scaled) result[s.skillId] = s.floor
  for (let i = 0; i < byRemainderDesc.length && remaining > 0; i++, remaining--) {
    result[byRemainderDesc[i].skillId]! += 1
  }

  return result
}
