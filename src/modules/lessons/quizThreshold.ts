// FR-L03 quy định "đạt từ 80% trở lên mới đánh dấu Đã nắm". Nhưng khi ngân
// hàng câu hỏi của chủ điểm chỉ có 3 câu, ngưỡng 80% biến thành "phải đúng
// cả 3/3 = 100%" — khắt khe hơn hẳn ý định thiết kế và không được báo trước
// cho học sinh (xem ND-01 trong docs/RA-SOAT-VA-GOP-Y-PHAT-TRIEN.md).
//
// Cách xử lý: vẫn giữ 80% làm chuẩn, nhưng LUÔN cho phép sai ít nhất 1 câu
// khi bài quiz ngắn (dưới 5 câu) — đúng tinh thần "80% là mức khá, không
// phải tuyệt đối". Số câu cần đúng được hiển thị công khai ngay đầu quiz.

export const PASS_RATIO = 0.8

/** Số câu tối thiểu phải đúng để được đánh dấu "Đã nắm". */
export function requiredCorrect(totalQuestions: number): number {
  if (totalQuestions <= 0) return 0
  const strict = Math.ceil(totalQuestions * PASS_RATIO)
  // Bài dưới 5 câu: hạ xuống để học sinh được phép sai 1 câu do bất cẩn.
  if (totalQuestions < 5) return Math.max(1, Math.min(strict, totalQuestions - 1))
  return strict
}

export function hasPassed(correctCount: number, totalQuestions: number): boolean {
  return totalQuestions > 0 && correctCount >= requiredCorrect(totalQuestions)
}
