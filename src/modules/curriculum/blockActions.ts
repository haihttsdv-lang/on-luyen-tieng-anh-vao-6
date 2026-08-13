import type { LessonPlanBlock, ScheduledSession } from '../../types/domain'
import { withSessionReturn } from './returnTo'

/**
 * PP-02 · Nút hành động thật cho từng khối trong buổi học, thay cho mô tả
 * bằng chữ kiểu "(Luyện tập → Theo chủ điểm)" mà học sinh phải tự đọc rồi tự
 * điều hướng.
 *
 * Tính action ở TẦNG UI (không bake vào `CurriculumSessionTemplate` tĩnh
 * trong `content/curriculum/index.ts`) vì hai lý do:
 *
 * 1. Buổi `skill-drill`/`final-exam` có `topicIds` được "bơm" ĐỘNG lúc chạy
 *    trên trình duyệt (xem `weakTopicIds()` trong CurriculumPage — bắt bệnh
 *    từ dữ liệu luyện tập thật), nội dung tĩnh lúc build không thể biết
 *    trước học sinh sẽ yếu chủ điểm nào.
 * 2. Với dữ liệu ĐÃ tĩnh sẵn (grammar/review/mock-test), việc suy ra action
 *    từ `session.topicIds`/`vocabTopicId` vẫn chính xác 100% — không cần
 *    trùng lặp thông tin ở hai nơi.
 *
 * Khớp theo `block.label` — tập nhãn hữu hạn, đã đo được 23 nhãn khác nhau
 * trong toàn bộ `content/curriculum/index.ts` + `periodicTests.ts` tại thời
 * điểm viết. Khối nào không khớp nhãn nào (thuần thông tin, không có hành
 * động cụ thể — ví dụ "Phổ biến quy chế") thì trả về `undefined`, ẩn nút.
 */

export interface BlockAction {
  label: string
  to: string
}

function topicsQuery(topicIds: string[]): string {
  return topicIds.length > 0 ? `?topics=${encodeURIComponent(topicIds.join(','))}` : ''
}

// LT-01: buổi 'skill-lesson' luyện đúng dạng bài (KN-xx) vừa dạy phương
// pháp, không phải chủ điểm ngữ pháp — KN-07 (Viết đoạn văn) không nằm
// trong ngân hàng Question nên trỏ sang trang Viết đoạn thay vì luyện dạng
// bài trắc nghiệm.
function skillPracticeAction(skillId: string): BlockAction {
  if (skillId === 'KN-07') return { label: '✍️ Viết đoạn văn ngay', to: '/luyen-tap/viet' }
  return { label: '🎯 Luyện đúng dạng bài này', to: `/luyen-tap/dang-bai?skill=${skillId}` }
}

// PP-01 UX fix: mọi trang đích (lý thuyết/luyện tập/quiz/flashcard...) cần
// biết ĐANG Ở BUỔI NÀO để tự động quay lại đúng buổi đó sau khi hoàn thành
// (xem `returnTo.ts`/`ReturnToSessionBanner`) — trước đây học sinh học xong
// lý thuyết hay làm bài tập xong phải tự bấm về Lộ trình học rồi tự tìm lại
// buổi, không có gì mang theo ngữ cảnh "đang học buổi nào" qua các trang đó.
export function getBlockAction(
  session: ScheduledSession,
  block: LessonPlanBlock,
  previousTopicId?: string,
): BlockAction | undefined {
  const action = computeAction(session, block, previousTopicId)
  return action ? { ...action, to: withSessionReturn(action.to, session.id) } : undefined
}

function computeAction(
  session: ScheduledSession,
  block: LessonPlanBlock,
  previousTopicId?: string,
): BlockAction | undefined {
  const topicId = session.topicIds[0]
  const vocabTopicId = session.vocabTopicId

  switch (block.label) {
    case 'Kiểm tra đầu vào':
      return { label: 'Bắt đầu làm bài', to: '/ho-so/kiem-tra-dau-vao' }

    case 'Khởi động':
      return vocabTopicId
        ? { label: '🗂️ Ôn flashcard', to: `/hoc-ly-thuyet/tu-vung/${vocabTopicId}` }
        : undefined

    case 'Kiểm tra bài cũ':
      return previousTopicId
        ? { label: '🎯 Làm quiz nhanh', to: `/hoc-ly-thuyet/${previousTopicId}/quiz` }
        : undefined

    case 'Bài mới':
      return topicId
        ? { label: '📘 Mở bài học', to: `/hoc-ly-thuyet/${topicId}` }
        : undefined

    case 'Luyện tập có hướng dẫn':
    case 'Luyện tập nâng cao':
    case 'Ôn ngữ pháp liên quan':
    case 'Ôn tập chuyên sâu':
      if (session.skillId) return skillPracticeAction(session.skillId)
      return session.topicIds.length > 0
        ? { label: '🎯 Luyện tập ngay', to: `/luyen-tap/chu-diem${topicsQuery(session.topicIds)}` }
        : { label: '🎯 Luyện theo dạng bài', to: '/luyen-tap/dang-bai' }

    // PP-07 · Khuôn B "Khám phá": làm thử chủ điểm chưa học TRƯỚC khi giảng.
    case 'Thử sức trước':
      return session.topicIds.length > 0
        ? { label: '🎲 Thử sức ngay', to: `/luyen-tap/chu-diem${topicsQuery(session.topicIds)}` }
        : undefined

    // PP-07 · Khuôn C "Trò chơi hóa": trỏ về menu Luyện tập — nơi có sẵn cả
    // 2 trò chơi (Đua tốc độ, Săn kho báu) để học sinh tự chọn.
    case 'Chơi mà học':
      return { label: '🎮 Chọn trò chơi ôn tập', to: '/luyen-tap' }

    case 'Luyện chuyên sâu theo dạng bài':
      return session.topicIds.length > 0
        ? {
            label: '🎯 Luyện đúng chủ điểm yếu',
            to: `/luyen-tap/chu-diem${topicsQuery(session.topicIds)}`,
          }
        : { label: '🎯 Chọn dạng bài', to: '/luyen-tap/dang-bai' }

    case 'Luyện tập nâng cao & từ vựng':
      return vocabTopicId
        ? { label: '🗂️ Ôn flashcard', to: `/hoc-ly-thuyet/tu-vung/${vocabTopicId}` }
        : undefined

    case 'Củng cố & giao bài tập':
      return topicId
        ? { label: '🎯 Làm quiz nhanh', to: `/hoc-ly-thuyet/${topicId}/quiz` }
        : undefined

    case 'Ôn tập lý thuyết':
      return { label: '🧠 Mở sơ đồ tư duy', to: '/hoc-ly-thuyet/so-do-tu-duy' }

    case 'Luyện đề tổng hợp':
    case 'Luyện đề':
    case 'Luyện đề đầy đủ':
    case 'Làm bài kiểm tra tuần':
    case 'Làm bài kiểm tra tháng':
      return session.topicIds.length > 0
        ? { label: '⏱️ Vào làm đề', to: `/thi-thu/tu-tao-de${topicsQuery(session.topicIds)}` }
        : { label: '⏱️ Vào làm đề', to: '/thi-thu' }

    case 'Chữa đề & phân tích lỗi':
    case 'Chữa đề chi tiết':
    case 'Chữa bài chi tiết':
      return { label: '🏆 Xem bản đồ năng lực', to: '/ho-so' }

    case 'Ôn từ vựng nhanh':
    case 'Ôn từ vựng còn yếu':
      return vocabTopicId
        ? { label: '🗂️ Ôn flashcard', to: `/hoc-ly-thuyet/tu-vung/${vocabTopicId}` }
        : { label: '📘 Chọn chủ đề từ vựng', to: '/hoc-ly-thuyet' }

    case 'Thi thử đầy đủ định dạng':
      return { label: '⏱️ Vào Thi thử', to: '/thi-thu' }

    // Các khối thuần thông tin (giới thiệu, phổ biến quy chế, chấm điểm...)
    // không có một trang đích cụ thể nào để trỏ tới — cố ý không có action.
    default:
      return undefined
  }
}
