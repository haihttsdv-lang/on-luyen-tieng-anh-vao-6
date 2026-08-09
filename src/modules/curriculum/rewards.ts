import type { ProgressStore } from '../../data-access/types'
import type { SessionFocus, SessionOutcome } from '../../types/domain'

// Số xu thưởng/phạt theo kết quả tự đánh giá mỗi buổi học — không có trong
// URD gốc, bổ sung theo yêu cầu người dùng "cộng và trừ xu đối với kết quả
// mỗi buổi học", nhất quán với cơ chế xu đã có ở Module Luyện tập (xem
// ProgressStore.addCoins). Buổi càng nặng (luyện đề, ôn thi tổng lực) thì
// mức xu càng cao để phản ánh đúng công sức bỏ ra.
const BASE_REWARD: Record<SessionFocus, number> = {
  orientation: 10,
  grammar: 8,
  'skill-lesson': 8, // ngang buổi 'grammar' — cùng độ nặng, chỉ khác đối tượng dạy
  review: 10,
  'mock-test': 12,
  'skill-drill': 10,
  'final-exam': 15,
  'weekly-test': 15,
  'monthly-test': 25,
}

export const OUTCOME_OPTIONS: {
  value: SessionOutcome
  emoji: string
  label: string
}[] = [
  { value: 'great', emoji: '🌟', label: 'Xuất sắc' },
  { value: 'ok', emoji: '🙂', label: 'Ổn' },
  { value: 'weak', emoji: '😅', label: 'Cần ôn lại' },
]

// 'great' cộng đủ, 'ok' cộng một nửa, 'weak' TRỪ một nửa — khuyến khích tự
// đánh giá trung thực thay vì luôn bấm "Xuất sắc" để lấy xu.
export function coinsForOutcome(focus: SessionFocus, outcome: SessionOutcome): number {
  const base = BASE_REWARD[focus]
  if (outcome === 'great') return base
  if (outcome === 'ok') return Math.round(base / 2)
  return -Math.round(base / 2)
}

/**
 * Áp dụng (hoặc bỏ chọn, khi `outcome` là `undefined`) kết quả tự đánh giá
 * cho một buổi học — bù trừ đúng số xu chênh lệch so với lựa chọn trước đó
 * (nếu có) rồi lưu outcome mới. Dùng chung giữa `CurriculumPage` (chấm ngay
 * trên danh sách) và `SessionRunnerPage` (chấm ở màn hình tổng kết cuối
 * phiên học — PP-01/PP-03) để hai nơi không lệch logic cộng/trừ xu.
 */
export async function applySessionOutcome(
  progressStore: Pick<ProgressStore, 'addCoins' | 'setSessionOutcome'>,
  sessionId: string,
  focus: SessionFocus,
  outcome: SessionOutcome | undefined,
  previousOutcome: SessionOutcome | undefined,
): Promise<void> {
  const previousDelta = previousOutcome ? coinsForOutcome(focus, previousOutcome) : 0
  const newDelta = outcome ? coinsForOutcome(focus, outcome) : 0
  await progressStore.addCoins(newDelta - previousDelta)
  await progressStore.setSessionOutcome(sessionId, outcome)
}
