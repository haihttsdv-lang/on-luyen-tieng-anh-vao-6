import type { Question } from '../../types/domain'
import { grammarExtra1 } from './grammar-extra-1'
import { grammarExtra2 } from './grammar-extra-2'
import { grammarExtra3 } from './grammar-extra-3'

/**
 * ND-02 · Ngân hàng câu hỏi ngữ pháp bổ sung.
 *
 * Tách làm 3 file theo dải chủ điểm (NP-01→12, NP-13→24, NP-25→36) để mỗi
 * file vừa tầm đọc và soát nội dung; file này chỉ gộp lại cho `index.ts`.
 */
export const grammarExtra: Question[] = [
  ...grammarExtra1,
  ...grammarExtra2,
  ...grammarExtra3,
]
