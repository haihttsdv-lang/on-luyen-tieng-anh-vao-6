import type { CurriculumTier } from '../../content/curriculum'
import type { DiagnosticScore } from '../../types/domain'

/**
 * LT-06 (docs/RA-SOAT-LO-TRINH-HOC.md) — suy ra mức cá nhân hóa lộ trình từ
 * điểm bài kiểm tra đầu vào. Ngưỡng đối xứng với `masteryCalc.ts`
 * (WEAK_THRESHOLD 0.5 / MASTERED_THRESHOLD 0.8) để nhất quán "yếu/vững" xuyên
 * suốt ứng dụng, dù đây là ngưỡng cho MỘT bài kiểm tra chẩn đoán duy nhất,
 * không phải điểm mastery tính từ nhiều lượt luyện tập.
 */
const WEAK_THRESHOLD = 0.5
const STRONG_THRESHOLD = 0.8

export function tierFromDiagnosticScore(score: DiagnosticScore | undefined): CurriculumTier {
  if (!score || score.total === 0) return 'standard'
  const ratio = score.correctCount / score.total
  if (ratio < WEAK_THRESHOLD) return 'foundation-boost'
  if (ratio > STRONG_THRESHOLD) return 'accelerated'
  return 'standard'
}
