import { topics } from '../topics'
import { getTopicLabel } from '../topic-labels'
import type { CurriculumSessionTemplate, LessonPlanBlock } from '../../types/domain'

// Lộ trình dạy học 3 buổi/tuần, 90 phút/buổi — bổ sung theo yêu cầu người
// dùng, không có trong URD gốc. Cấu trúc mỗi buổi (khởi động → kiểm tra bài
// cũ → bài mới → luyện tập có hướng dẫn → luyện tập nâng cao/từ vựng →
// củng cố & giao bài) theo đúng mô hình 1 buổi học tại các trung tâm luyện
// thi vào 6, luôn có phần ôn từ vựng xen kẽ (spaced repetition) và một khối
// luyện đề/luyện tập có phản hồi ngay.
//
// Thứ tự 36 chủ điểm KHÔNG đi tuần tự theo mã NP-xx hay theo trang "Học lý
// thuyết" — đối chiếu lộ trình thực tế của các trung tâm (TAK12 tổng hợp 5
// giai đoạn; Casalink 4 giai đoạn: "Ngữ pháp & từ vựng → Đọc hiểu & tự luận
// → Ngữ âm & luyện nghe → Giải đề") cho thấy các trung tâm dạy theo GIAI
// ĐOẠN LỚN — Nền tảng trước, Nâng cao sau — rồi CHUYỂN HẲN sang tần suất
// luyện đề dày hơn khi gần ngày thi, kết thúc bằng nước rút luyện điểm yếu.
// Xem docs/adr/0004 để biết chi tiết đối chiếu và quyết định thiết kế.
// Ngày học thật không lưu ở đây — xem src/modules/curriculum/schedule.ts.

const TOPIC_TITLES: Record<string, string> = Object.fromEntries(
  topics.map((t) => [t.id, t.title]),
)

// Xuất ra ngoài để periodicTests.ts (sinh bài kiểm tra tuần/tháng) dùng lại,
// tránh lặp bảng tra cứu tiêu đề chủ điểm.
export function topicTitle(topicId: string): string {
  return TOPIC_TITLES[topicId] ?? getTopicLabel(topicId)
}

// Giai đoạn 1 — Nền tảng: từ loại & cấu trúc câu cơ bản, các thì động từ
// (luôn xuất hiện trong đề), câu hỏi Wh-/tag cơ bản, động từ khuyết thiếu
// thông dụng, hòa hợp chủ ngữ – động từ. Đây là nhóm kiến thức "ăn điểm
// nhanh" mà trung tâm nào cũng dạy trước tiên (TAK12 giai đoạn 2: "ngữ âm,
// từ vựng, ngữ pháp căn bản kèm các dạng bài dễ kiếm điểm").
const FOUNDATION_TOPIC_IDS = [
  'NP-01',
  'NP-02',
  'NP-03',
  'NP-05',
  'NP-04',
  'NP-08',
  'NP-07',
  'NP-09',
  'NP-10',
  'NP-06',
  'NP-32',
  'NP-11',
  'NP-12',
  'NP-13',
  'NP-14',
  'NP-15',
  'NP-16',
  'NP-17',
  'NP-23',
  'NP-30',
]

// Giai đoạn 2 — Nâng cao: mệnh đề quan hệ/trạng ngữ, câu điều kiện, bị động,
// tường thuật, các cấu trúc động từ phức tạp, cấu trúc nhấn mạnh/câu ước,
// và các "bẫy" hay gặp trong đề (từ dễ nhầm, biến đổi từ loại) — tương ứng
// giai đoạn 3 của TAK12 ("ngữ pháp nâng cao và các dạng bài phức tạp hơn
// như đọc hiểu, viết lại câu").
const ADVANCED_TOPIC_IDS = [
  'NP-18',
  'NP-19',
  'NP-20',
  'NP-21',
  'NP-22',
  'NP-24',
  'NP-25',
  'NP-33',
  'NP-28',
  'NP-26',
  'NP-27',
  'NP-29',
  'NP-31',
  'NP-34',
  'NP-35',
  'NP-36',
]

const PHASE_LABEL = {
  orientation: '🚩 Khai giảng',
  foundation: '🧱 Giai đoạn 1 · Nền tảng',
  advanced: '🚀 Giai đoạn 2 · Nâng cao',
  ramp: '🎯 Giai đoạn 3 · Luyện đề tăng tốc',
  finalSprint: '🏁 Giai đoạn 4 · Nước rút cuối cùng',
} as const

// Chu kỳ ôn từ vựng xen kẽ theo buổi ngữ pháp — đi từ chủ đề gần gũi, cụ thể
// (bản thân, gia đình, trường học...) tới chủ đề trừu tượng hơn (công nghệ,
// môi trường), lặp lại vòng khi hết 14 chủ đề để đảm bảo ôn nhắc lại nhiều
// lần trước ngày thi (đúng tinh thần Leitner box đã có ở FlashcardsPage).
const VOCAB_SEQUENCE = [
  'TV-01',
  'TV-02',
  'TV-04',
  'TV-03',
  'TV-05',
  'TV-06',
  'TV-07',
  'TV-08',
  'TV-09',
  'TV-10',
  'TV-11',
  'TV-12',
  'TV-13',
  'TV-14',
]

function orientationBlocks(): LessonPlanBlock[] {
  return [
    {
      label: 'Làm quen & giới thiệu lộ trình',
      minutes: 15,
      description:
        'Giới thiệu mục tiêu, lịch học 3 buổi/tuần (Thứ Ba/Năm/Bảy) và cách dùng ứng dụng (Học lý thuyết, Luyện tập, Thi thử, Hồ sơ).',
    },
    {
      label: 'Kiểm tra đầu vào',
      minutes: 45,
      description:
        'Làm bài kiểm tra đầu vào (Hồ sơ → Kiểm tra đầu vào) để xác định điểm mạnh/yếu ban đầu.',
    },
    {
      label: 'Giới thiệu định dạng đề thi',
      minutes: 15,
      description: 'Giới thiệu cấu trúc đề thi vào lớp 6 (định dạng tham khảo Cầu Giấy) và các dạng bài KN-01..08.',
    },
    {
      label: 'Củng cố & giao nhiệm vụ',
      minutes: 15,
      description: 'Giải đáp thắc mắc, giao nhiệm vụ chuẩn bị cho buổi học đầu tiên.',
    },
  ]
}

function grammarBlocks(topicId: string, vocabTopicId: string): LessonPlanBlock[] {
  const title = topicTitle(topicId)
  const vocabLabel = getTopicLabel(vocabTopicId)
  return [
    {
      label: 'Khởi động',
      minutes: 10,
      description: `Trò chơi ôn nhanh từ vựng chủ đề "${vocabLabel}" đã học trước đó, điểm danh và tạo không khí.`,
    },
    {
      label: 'Kiểm tra bài cũ',
      minutes: 10,
      description: 'Làm Quiz nhanh 5 câu của chủ điểm buổi trước để xác nhận đã nắm kiến thức.',
    },
    {
      label: 'Bài mới',
      minutes: 25,
      description: `Học lý thuyết chủ điểm "${title}": trình bày gạch đầu dòng, ví dụ minh họa, và lỗi thường gặp.`,
    },
    {
      label: 'Luyện tập có hướng dẫn',
      minutes: 20,
      description: `Luyện tập theo chủ điểm "${title}" (Luyện tập → Theo chủ điểm), chữa lỗi trực tiếp từng câu.`,
    },
    {
      label: 'Luyện tập nâng cao & từ vựng',
      minutes: 15,
      description: `Ôn flashcard từ vựng "${vocabLabel}" (spaced repetition) và làm thêm 1 vòng luyện đề trộn dạng bài.`,
    },
    {
      label: 'Củng cố & giao bài tập',
      minutes: 10,
      description: `Tổng kết kiến thức trọng tâm, làm Quiz nhanh chủ điểm "${title}" để chốt "Đã nắm", giao bài tập về nhà.`,
    },
  ]
}

function checkpointReviewBlocks(phaseTitle: string): LessonPlanBlock[] {
  return [
    {
      label: 'Khởi động',
      minutes: 10,
      description: 'Trò chơi tổng hợp ôn nhanh từ vựng các chủ đề đã học trong giai đoạn vừa qua.',
    },
    {
      label: 'Ôn tập lý thuyết',
      minutes: 25,
      description: `Hệ thống hóa toàn bộ chủ điểm trong "${phaseTitle}" bằng Sơ đồ tư duy (Học lý thuyết → Sơ đồ tư duy).`,
    },
    {
      label: 'Luyện đề tổng hợp',
      minutes: 30,
      description: 'Làm đề luyện tập trộn toàn bộ chủ điểm trong giai đoạn vừa ôn (Luyện tập → Theo chủ điểm).',
    },
    {
      label: 'Chữa đề & phân tích lỗi',
      minutes: 15,
      description: 'Xem lại các câu sai, xác định chủ điểm còn yếu cần luyện thêm.',
    },
    {
      label: 'Củng cố & giao bài tập',
      minutes: 10,
      description: 'Ôn thêm từ vựng, giao bài luyện tập ở nhà cho các chủ điểm còn yếu.',
    },
  ]
}

function checkpointMockTestBlocks(phaseTitle: string): LessonPlanBlock[] {
  return [
    { label: 'Khởi động', minutes: 10, description: 'Nhắc lại chiến thuật làm bài và cách phân bổ thời gian.' },
    {
      label: 'Luyện đề',
      minutes: 40,
      description: `Làm đề luyện tập 20 câu tổng hợp toàn bộ "${phaseTitle}" (Thi thử → Đề 20 câu).`,
    },
    {
      label: 'Chữa đề chi tiết',
      minutes: 25,
      description: 'Chữa từng câu sai, phân tích điểm theo chủ điểm và theo dạng bài.',
    },
    {
      label: 'Ôn từ vựng nhanh',
      minutes: 10,
      description: 'Ôn flashcard các chủ đề từ vựng đã học.',
    },
    {
      label: 'Củng cố & giao bài tập',
      minutes: 5,
      description: 'Giao bài luyện tập ở nhà cho các chủ điểm còn yếu qua kết quả luyện đề.',
    },
  ]
}

// Giai đoạn 3 (Casalink: "Giải đề & các kỹ năng khi làm đề thi"; TAK12 giai
// đoạn 4: "làm các đề thi thử mới hàng tuần cùng ôn chủ điểm nâng cao theo
// từng dạng bài") — luyện đề với tần suất dày hơn hẳn giai đoạn 1–2, xen kẽ
// 1 buổi luyện đề đầy đủ với 1 buổi "bắt bệnh" luyện sâu đúng dạng bài còn
// yếu (thay vì học tuần tự theo chủ điểm như trước).
function skillDrillBlocks(round: number): LessonPlanBlock[] {
  return [
    {
      label: 'Khởi động',
      minutes: 10,
      description: 'Xem lại kết quả luyện đề gần nhất (Hồ sơ → Bản đồ năng lực), chọn 1–2 dạng bài yếu nhất.',
    },
    {
      label: 'Luyện chuyên sâu theo dạng bài',
      minutes: 40,
      description: `Vòng ${round}: Luyện tập theo dạng bài đang yếu nhất (Luyện tập → Theo dạng bài), làm liên tục nhiều câu cùng dạng.`,
    },
    {
      label: 'Ôn ngữ pháp liên quan',
      minutes: 20,
      description: 'Ôn lại lý thuyết và làm Quiz nhanh của các chủ điểm liên quan trực tiếp tới dạng bài đó.',
    },
    {
      label: 'Ôn từ vựng còn yếu',
      minutes: 10,
      description: 'Ôn flashcard các thẻ đang ở Hộp 1–2 (chưa thuộc chắc).',
    },
    {
      label: 'Củng cố & giao bài tập',
      minutes: 10,
      description: 'Giao thêm bài luyện tập ở nhà đúng dạng bài còn yếu.',
    },
  ]
}

function rampMockTestBlocks(round: number): LessonPlanBlock[] {
  return [
    { label: 'Khởi động', minutes: 10, description: 'Nhắc lại chiến thuật phân bổ thời gian làm bài.' },
    {
      label: 'Luyện đề đầy đủ',
      minutes: 45,
      description: `Vòng ${round}: Làm đề luyện tập 20 câu tổng hợp mọi chủ điểm đã học (Thi thử → Đề 20 câu).`,
    },
    {
      label: 'Chữa đề chi tiết',
      minutes: 25,
      description: 'Chữa từng câu sai, cập nhật danh sách chủ điểm/dạng bài còn yếu.',
    },
    {
      label: 'Củng cố & giao bài tập',
      minutes: 10,
      description: 'Giao bài luyện tập ở nhà theo đúng điểm yếu vừa phát hiện.',
    },
  ]
}

function finalExamBlocks(round: number, total: number): LessonPlanBlock[] {
  return [
    {
      label: 'Khởi động & nhắc quy chế thi',
      minutes: 5,
      description: `Ôn thi thử toàn diện lần ${round}/${total} — nhắc quy tắc làm bài, phân bổ thời gian.`,
    },
    {
      label: 'Thi thử đầy đủ định dạng',
      minutes: 60,
      description: 'Làm đề thi thử đầy đủ định dạng (đối chiếu Cầu Giấy — 40 câu) trong điều kiện giống phòng thi (Thi thử → Giống đề Cầu Giấy).',
    },
    {
      label: 'Chữa đề chi tiết',
      minutes: 20,
      description: 'Chữa đề, tổng kết điểm mạnh/yếu theo dạng bài và chủ điểm.',
    },
    {
      label: 'Ôn tập chuyên sâu',
      minutes: 5,
      description: 'Ôn nhanh các chủ điểm còn yếu nhất trước ngày thi thật.',
    },
  ]
}

function buildCurriculumPlan(): CurriculumSessionTemplate[] {
  const sessions: CurriculumSessionTemplate[] = []
  let order = 1
  let vocabIndex = 0

  const nextVocabTopicId = () => {
    const id = VOCAB_SEQUENCE[vocabIndex % VOCAB_SEQUENCE.length]
    vocabIndex += 1
    return id
  }

  const pushSession = (session: Omit<CurriculumSessionTemplate, 'id' | 'order'>) => {
    sessions.push({ id: `B${String(order).padStart(2, '0')}`, order, ...session })
    order += 1
  }

  pushSession({
    focus: 'orientation',
    phaseLabel: PHASE_LABEL.orientation,
    title: 'Buổi làm quen & kiểm tra đầu vào',
    topicIds: [],
    blocks: orientationBlocks(),
    homework: 'Cài đặt/mở ứng dụng ở nhà, xem lại Sơ đồ tư duy tổng hợp lý thuyết.',
  })

  function addGrammarPhase(topicIds: string[], phaseLabel: string) {
    for (const topicId of topicIds) {
      const vocabTopicId = nextVocabTopicId()
      pushSession({
        focus: 'grammar',
        phaseLabel,
        title: topicTitle(topicId),
        topicIds: [topicId],
        vocabTopicId,
        blocks: grammarBlocks(topicId, vocabTopicId),
        homework: `Làm Quiz nhanh chủ điểm "${topicTitle(topicId)}" đạt từ 80%, ôn từ vựng "${getTopicLabel(vocabTopicId)}" tới Hộp 3 trở lên.`,
      })
    }
  }

  function addCheckpoint(topicIds: string[], phaseLabel: string, phaseTitle: string) {
    pushSession({
      focus: 'review',
      phaseLabel,
      title: `Ôn tập tổng hợp: ${phaseTitle}`,
      topicIds: [...topicIds],
      blocks: checkpointReviewBlocks(phaseTitle),
      homework: 'Luyện tập thêm các chủ điểm còn yếu trong giai đoạn vừa ôn.',
    })
    pushSession({
      focus: 'mock-test',
      phaseLabel,
      title: `Luyện đề chốt: ${phaseTitle}`,
      topicIds: [...topicIds],
      blocks: checkpointMockTestBlocks(phaseTitle),
      homework: 'Xem lại các câu làm sai trong đề luyện tập, ôn lại chủ điểm liên quan.',
    })
  }

  // Giai đoạn 1 — Nền tảng
  addGrammarPhase(FOUNDATION_TOPIC_IDS, PHASE_LABEL.foundation)
  addCheckpoint(FOUNDATION_TOPIC_IDS, PHASE_LABEL.foundation, 'Giai đoạn 1 · Nền tảng')

  // Giai đoạn 2 — Nâng cao
  addGrammarPhase(ADVANCED_TOPIC_IDS, PHASE_LABEL.advanced)
  addCheckpoint(ADVANCED_TOPIC_IDS, PHASE_LABEL.advanced, 'Giai đoạn 2 · Nâng cao')

  // Giai đoạn 3 — Luyện đề tăng tốc: xen kẽ luyện chuyên sâu theo dạng bài
  // còn yếu với luyện đề đầy đủ, tần suất luyện đề tăng dần khi gần ngày
  // thi (đúng tinh thần "luyện đề hàng tuần đến ngày thi" của TAK12).
  const RAMP_ROUNDS = 3
  for (let round = 1; round <= RAMP_ROUNDS; round++) {
    pushSession({
      focus: 'skill-drill',
      phaseLabel: PHASE_LABEL.ramp,
      title: `Luyện chuyên sâu theo dạng bài yếu — vòng ${round}/${RAMP_ROUNDS}`,
      topicIds: [],
      blocks: skillDrillBlocks(round),
      homework: 'Luyện thêm ở nhà đúng dạng bài vừa "bắt bệnh" trong buổi học.',
    })
    pushSession({
      focus: 'mock-test',
      phaseLabel: PHASE_LABEL.ramp,
      title: `Luyện đề tổng hợp — vòng ${round}/${RAMP_ROUNDS}`,
      topicIds: [],
      blocks: rampMockTestBlocks(round),
      homework: 'Xem lại toàn bộ câu sai, cập nhật danh sách chủ điểm còn yếu.',
    })
  }

  // Giai đoạn 4 — Nước rút cuối cùng: thi thử toàn diện liên tiếp, mỗi lần
  // đều chữa đề và ôn sâu đúng điểm yếu còn lại (TAK12 giai đoạn 5).
  const FINAL_EXAM_ROUNDS = 3
  for (let round = 1; round <= FINAL_EXAM_ROUNDS; round++) {
    pushSession({
      focus: 'final-exam',
      phaseLabel: PHASE_LABEL.finalSprint,
      title: `Ôn thi tổng lực — Thi thử toàn diện lần ${round}/${FINAL_EXAM_ROUNDS}`,
      topicIds: [],
      blocks: finalExamBlocks(round, FINAL_EXAM_ROUNDS),
      homework: 'Nghỉ ngơi đầy đủ, xem lại tổng hợp lỗi thường gặp của các chủ điểm còn yếu nhất.',
    })
  }

  return sessions
}

export const CURRICULUM_PLAN: CurriculumSessionTemplate[] = buildCurriculumPlan()
