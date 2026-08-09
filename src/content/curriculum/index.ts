import { topics } from '../topics'
import { getTopicLabel } from '../topic-labels'
import type {
  CurriculumSessionTemplate,
  LessonPlanBlock,
  SkillId,
  SuccessCriterion,
} from '../../types/domain'

// Lộ trình dạy học 3 buổi/tuần — bổ sung theo yêu cầu người dùng, không có
// trong URD gốc. Ban đầu 90 phút/buổi, sau đó rút xuống còn 60 phút/buổi
// theo yêu cầu người dùng để phù hợp hơn với khả năng tập trung của học
// sinh tiểu học — mỗi khối trong buổi được co giãn theo tỉ lệ, ưu tiên giữ
// đủ thời lượng cho khối "Bài mới"/"Luyện chuyên sâu". Cấu trúc mỗi buổi (khởi động → kiểm tra bài
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

// LT-04 (docs/RA-SOAT-LO-TRINH-HOC.md): chu kỳ cũ chia đều 14 chủ đề theo
// vòng tròn khiến 8 chủ đề DỄ (TV-01..08: gia đình, trường học, đồ ăn...)
// được ôn 3 lần trong khi 3 chủ đề KHÓ nhất — TV-12 (công nghệ), TV-13 (môi
// trường), TV-14 (cụm động từ & thành ngữ) — chỉ được ôn 2 lần: NGƯỢC với
// nguyên tắc "từ trừu tượng, khó nhớ cần lặp lại nhiều hơn". Bảng trọng số
// dưới đây đảo lại: chủ đề dễ ôn 2 lần, chủ đề khó ôn 4–5 lần, tổng đúng
// bằng 36 (đúng số buổi 'grammar' — mỗi buổi ôn 1 chủ đề từ vựng).
const VOCAB_WEIGHT: [string, number][] = [
  ['TV-01', 2], ['TV-02', 2], ['TV-03', 2], ['TV-04', 2],
  ['TV-05', 2], ['TV-06', 2], ['TV-07', 2], ['TV-08', 2], // dễ, cụ thể: 8×2=16
  ['TV-09', 2], ['TV-10', 2], ['TV-11', 2],                // trung bình: 3×2=6
  ['TV-12', 4], ['TV-13', 5], ['TV-14', 5],                 // khó, trừu tượng: 4+5+5=14
]

/**
 * Trải đều các lượt ôn của từng chủ đề theo trọng số thay vì dồn cục — chủ
 * đề trọng số 5 (36 buổi) sẽ xuất hiện ở buổi ~thứ 4, 11, 18, 25, 32
 * (khoảng cách đều ~7 buổi), không phải 5 buổi liền nhau rồi 31 buổi vắng
 * bóng. Kỹ thuật: xếp mỗi lượt ôn thứ i/count của một chủ đề vào vị trí
 * phân số (i + 0.5) / count trên trục 0–1 rồi sắp toàn bộ theo vị trí đó —
 * tương đương thuật toán lịch trình round-robin có trọng số (weighted fair
 * queueing) dùng trong scheduler mạng/OS.
 */
function buildVocabSequence(weights: [string, number][]): string[] {
  const slots: { topicId: string; pos: number }[] = []
  for (const [topicId, count] of weights) {
    for (let i = 0; i < count; i++) {
      slots.push({ topicId, pos: (i + 0.5) / count })
    }
  }
  slots.sort((a, b) => a.pos - b.pos)
  return slots.map((s) => s.topicId)
}

const VOCAB_SEQUENCE = buildVocabSequence(VOCAB_WEIGHT)

function orientationBlocks(): LessonPlanBlock[] {
  return [
    {
      label: 'Làm quen & giới thiệu lộ trình',
      minutes: 10,
      description:
        'Giới thiệu mục tiêu cuối cùng (đỗ THCS Cầu Giấy), lịch học 3 buổi/tuần (Thứ Ba/Năm/Bảy) + kiểm tra Chủ nhật, và 4 khu vực chính của ứng dụng: Học lý thuyết, Luyện tập, Thi thử, Hồ sơ (nơi xem Bản đồ năng lực và xu thưởng).',
    },
    {
      label: 'Kiểm tra đầu vào',
      minutes: 30,
      description:
        'Làm bài kiểm tra đầu vào (Hồ sơ → Kiểm tra đầu vào) trong điều kiện làm việc tập trung, không tra cứu — kết quả này quyết định lộ trình sẽ đi theo mức nào (chuẩn / củng cố nền tảng / tăng tốc), nên cần làm nghiêm túc như thi thật.',
    },
    {
      label: 'Giới thiệu định dạng đề thi',
      minutes: 10,
      description: 'Giới thiệu nhanh cấu trúc đề thi vào lớp 6 (định dạng tham khảo Cầu Giấy, 40 câu/45 phút) và 9 dạng bài KN-01..08 sẽ gặp trong đề, không đi sâu — chỉ để học sinh hình dung bức tranh tổng thể.',
    },
    {
      label: 'Củng cố & giao nhiệm vụ',
      minutes: 10,
      description: 'Xem ngay kết quả bài kiểm tra đầu vào cùng nhau, giải đáp thắc mắc, và giao nhiệm vụ chuẩn bị (mang sách, chuẩn bị sổ tay ghi lỗi sai) cho buổi học đầu tiên.',
    },
  ]
}

const ORIENTATION_OBJECTIVES = [
  'Hiểu rõ lịch học và cách dùng 4 khu vực chính của ứng dụng.',
  'Biết được điểm mạnh/điểm yếu ban đầu qua bài kiểm tra đầu vào.',
  'Nắm được bức tranh tổng quát về cấu trúc đề thi vào lớp 6.',
]
const ORIENTATION_SUCCESS_CRITERIA: SuccessCriterion[] = [
  { label: 'Hoàn thành cả 4 khối của buổi khai giảng', check: { type: 'blocksDone' } },
  { label: 'Làm xong trọn vẹn bài kiểm tra đầu vào', check: { type: 'minAttempts', count: 15 } },
]
const ORIENTATION_PARENT_NOTE =
  'Buổi đầu tiên — con vừa làm bài kiểm tra đầu vào để xác định lộ trình phù hợp. Bố mẹ có thể cùng con xem qua ứng dụng, hỏi con thấy phần nào dễ/khó nhất trong bài kiểm tra.'

// PP-07 (docs/RA-SOAT-LO-TRINH-HOC.md): 36 buổi ngữ pháp trước đây dùng Y HỆT
// 1 khuôn, chỉ đổi tên chủ điểm — buổi thứ 30 giống hệt buổi thứ 2, học sinh
// đoán trước được và chán. Xoay vòng 3 khuôn dạy khác nhịp (đều dạy đủ nội
// dung, cùng 6 khối/60 phút) theo `i % 3` trong `addGrammarPhase` — KHÔNG
// gắn khuôn theo độ khó chủ điểm (dữ liệu không có sẵn xếp hạng độ khó đáng
// tin cậy), chỉ xoay vòng đơn giản để tạo cảm giác mới lạ đều đặn.
export type GrammarVariant = 'lead' | 'explore' | 'gamify'
const GRAMMAR_VARIANTS: GrammarVariant[] = ['lead', 'explore', 'gamify']

function grammarBlocks(
  topicId: string,
  vocabTopicId: string,
  variant: GrammarVariant,
): LessonPlanBlock[] {
  const title = topicTitle(topicId)
  const vocabLabel = getTopicLabel(vocabTopicId)

  const warmup: LessonPlanBlock = {
    label: 'Khởi động',
    minutes: 5,
    description: `Trò chơi ôn nhanh 5 từ vựng chủ đề "${vocabLabel}" đã học trước đó (bấm 🔊 nghe rồi đoán nghĩa) — điểm danh và tạo không khí trước khi vào bài mới.`,
  }
  const guidedPractice: LessonPlanBlock = {
    label: 'Luyện tập có hướng dẫn',
    minutes: 15,
    description: `Luyện 10 câu chủ điểm "${title}" (Luyện tập → Theo chủ điểm), chữa lỗi trực tiếp ngay sau mỗi câu — không dồn lại chữa cuối buổi để tránh lặp lại lỗi sai nhiều lần.`,
  }
  const consolidate: LessonPlanBlock = {
    label: 'Củng cố & giao bài tập',
    minutes: 5,
    description: `Tổng kết 1 câu chốt kiến thức trọng tâm, làm Quiz nhanh chủ điểm "${title}" để chốt "Đã nắm" trên Bản đồ năng lực, giao bài tập về nhà.`,
  }

  if (variant === 'explore') {
    // Khuôn B "Khám phá" — kỹ thuật productive failure: cho làm thử chủ điểm
    // CHƯA HỌC trước, rồi giảng ngay sau để giải thích đúng chỗ vừa sai —
    // hiệu quả hơn giảng-trước với chủ điểm dễ gài bẫy (từ dễ nhầm, cấu trúc
    // dễ lẫn). Thay "Kiểm tra bài cũ" bằng "Thử sức trước" — 1/3 số buổi
    // ngữ pháp, không ảnh hưởng tới việc ôn chủ điểm buổi trước nói chung.
    return [
      warmup,
      {
        label: 'Thử sức trước',
        minutes: 10,
        description: `Làm thử 5 câu chủ điểm "${title}" MẶC DÙ CHƯA HỌC — sai là chuyện bình thường, mục đích là tự nhận ra chỗ dễ nhầm trước khi nghe giảng (Luyện tập → Theo chủ điểm).`,
      },
      {
        label: 'Bài mới',
        minutes: 15,
        description: `Học lý thuyết chủ điểm "${title}", GIẢI THÍCH NGAY vì sao những câu vừa làm ở trên dễ sai — nhớ lâu hơn hẳn học lý thuyết suông rồi mới luyện.`,
        needsAdult: true,
      },
      guidedPractice,
      {
        label: 'Luyện tập nâng cao & từ vựng',
        minutes: 10,
        description: `Ôn flashcard từ vựng "${vocabLabel}" (spaced repetition, ưu tiên thẻ ở Hộp 1–2) và làm thêm 5 câu luyện đề trộn dạng bài để không quên các chủ điểm cũ.`,
        optional: true,
      },
      consolidate,
    ]
  }

  const reviewPrevious: LessonPlanBlock = {
    label: 'Kiểm tra bài cũ',
    minutes: 5,
    description: 'Làm Quiz nhanh 5 câu của chủ điểm buổi trước để xác nhận đã nắm kiến thức, không đạt thì ôn lại 2 phút trước khi tiếp tục.',
  }
  const newLesson: LessonPlanBlock = {
    label: 'Bài mới',
    minutes: 20,
    description: `Học lý thuyết chủ điểm "${title}": trình bày công thức bằng gạch đầu dòng, 2–3 ví dụ minh họa, và mục "Lỗi thường gặp" — đọc kỹ mục này vì đề thi hay khai thác đúng những lỗi đó.`,
    needsAdult: true,
  }

  if (variant === 'gamify') {
    // Khuôn C "Trò chơi hóa" — thay khối luyện mở rộng bằng 1 trong 2 trò
    // chơi ôn tập ĐÃ CÓ SẴN (Đua tốc độ, Săn kho báu) nhưng lộ trình trước
    // đây chưa từng dẫn học sinh tới, dù đã tồn tại từ trước.
    return [
      warmup,
      reviewPrevious,
      newLesson,
      guidedPractice,
      {
        label: 'Chơi mà học',
        minutes: 10,
        description: `Chơi 1 trong 2 trò chơi ôn tập đã học (🏁 Đua tốc độ hoặc 🗺️ Săn kho báu) để ôn lại chủ điểm "${title}" cùng các chủ điểm cũ — vừa học vừa chơi, đỡ nhàm hơn làm đề tay.`,
        optional: true,
      },
      consolidate,
    ]
  }

  // Khuôn A "Dẫn dắt" (mặc định) — lý thuyết → luyện có hướng dẫn → luyện tự do.
  return [
    warmup,
    reviewPrevious,
    newLesson,
    guidedPractice,
    {
      label: 'Luyện tập nâng cao & từ vựng',
      minutes: 10,
      description: `Ôn flashcard từ vựng "${vocabLabel}" (spaced repetition, ưu tiên thẻ ở Hộp 1–2) và làm thêm 5 câu luyện đề trộn dạng bài để không quên các chủ điểm cũ.`,
      optional: true,
    },
    consolidate,
  ]
}

function grammarParentNote(title: string): string {
  return `Hôm nay con học chủ điểm "${title}". Bố mẹ có thể hỏi con giải thích lại quy tắc bằng lời của mình, hoặc cùng con làm thử 1–2 câu Quiz nhanh (Học lý thuyết → "${title}" → Quiz) để kiểm tra nhanh xem con đã nắm chưa.`
}

function grammarObjectives(title: string, vocabLabel: string): string[] {
  return [
    `Nắm được công thức và cách dùng chủ điểm "${title}".`,
    `Nhận diện đúng "${title}" khi làm bài trắc nghiệm, tránh các lỗi thường gặp.`,
    `Ôn được từ vựng "${vocabLabel}" qua flashcard.`,
  ]
}

function grammarSuccessCriteria(title: string, vocabLabel: string): SuccessCriterion[] {
  return [
    { label: 'Hoàn thành cả 6 khối của buổi học', check: { type: 'blocksDone' } },
    { label: `Quiz nhanh chủ điểm "${title}" đạt "Đã nắm"`, check: { type: 'quizMastered' } },
    {
      label: `Ôn từ vựng "${vocabLabel}" tới Hộp 3 trở lên`,
      check: { type: 'vocabProgress', minRatio: 0.5 },
    },
    { label: 'Làm tối thiểu 10 câu luyện tập trong buổi', check: { type: 'minAttempts', count: 10 } },
  ]
}

function checkpointReviewBlocks(phaseTitle: string): LessonPlanBlock[] {
  return [
    {
      label: 'Khởi động',
      minutes: 5,
      description: 'Trò chơi tổng hợp ôn nhanh từ vựng các chủ đề đã học trong giai đoạn vừa qua — mục tiêu nhớ lại, không cần giải thích kỹ.',
    },
    {
      label: 'Ôn tập lý thuyết',
      minutes: 20,
      description: `Hệ thống hóa toàn bộ chủ điểm trong "${phaseTitle}" bằng Sơ đồ tư duy (Học lý thuyết → Sơ đồ tư duy) — chỉ nhắc lại công thức cốt lõi từng chủ điểm, không giảng lại từ đầu.`,
    },
    {
      label: 'Luyện đề tổng hợp',
      minutes: 20,
      description: 'Làm 15 câu luyện tập trộn toàn bộ chủ điểm trong giai đoạn vừa ôn (Luyện tập → Theo chủ điểm) — đề trộn giúp phát hiện chủ điểm nào hay nhầm với chủ điểm khác.',
    },
    {
      label: 'Chữa đề & phân tích lỗi',
      minutes: 10,
      description: 'Xem lại các câu sai, ghi tên chủ điểm còn yếu vào sổ tay lỗi sai để luyện thêm ở buổi sau.',
      needsAdult: true,
    },
    {
      label: 'Củng cố & giao bài tập',
      minutes: 5,
      description: 'Ôn nhanh flashcard từ vựng, giao bài luyện tập ở nhà đúng các chủ điểm vừa xác định còn yếu.',
    },
  ]
}

function checkpointReviewParentNote(phaseTitle: string): string {
  return `Đây là buổi ôn tập tổng hợp chốt "${phaseTitle}". Bố mẹ có thể hỏi con: "Chủ điểm nào trong giai đoạn vừa học con thấy khó nhớ nhất?" — đó thường là chủ điểm cần luyện thêm ở nhà.`
}

function checkpointReviewObjectives(phaseTitle: string): string[] {
  return [
    `Hệ thống hóa lại toàn bộ chủ điểm đã học trong "${phaseTitle}".`,
    'Xác định đúng chủ điểm còn yếu cần luyện thêm trước khi vào giai đoạn tiếp theo.',
  ]
}

const CHECKPOINT_REVIEW_SUCCESS_CRITERIA: SuccessCriterion[] = [
  { label: 'Hoàn thành cả 5 khối của buổi ôn tập', check: { type: 'blocksDone' } },
  { label: 'Làm tối thiểu 15 câu luyện đề tổng hợp', check: { type: 'minAttempts', count: 15 } },
]

function checkpointMockTestBlocks(phaseTitle: string): LessonPlanBlock[] {
  return [
    { label: 'Khởi động', minutes: 5, description: 'Nhắc lại chiến thuật làm bài (đọc lướt câu hỏi trước, làm câu dễ trước) và cách phân bổ thời gian ~1 phút/câu.' },
    {
      label: 'Luyện đề',
      minutes: 25,
      description: `Làm đề luyện tập 20 câu tổng hợp toàn bộ "${phaseTitle}" (Thi thử → Đề 20 câu) — bấm giờ nghiêm túc để quen áp lực thời gian.`,
    },
    {
      label: 'Chữa đề chi tiết',
      minutes: 20,
      description: 'Chữa từng câu sai ngay sau khi nộp bài, phân tích điểm theo chủ điểm và theo dạng bài trên Bản đồ năng lực.',
      needsAdult: true,
    },
    {
      label: 'Ôn từ vựng nhanh',
      minutes: 5,
      description: 'Ôn nhanh flashcard các chủ đề từ vựng đã học trong giai đoạn, ưu tiên thẻ đang ở Hộp 1–2.',
    },
    {
      label: 'Củng cố & giao bài tập',
      minutes: 5,
      description: 'Giao bài luyện tập ở nhà đúng các chủ điểm/dạng bài còn yếu qua kết quả luyện đề vừa làm.',
    },
  ]
}

function checkpointMockTestParentNote(phaseTitle: string): string {
  return `Buổi luyện đề chốt "${phaseTitle}" — điểm số hôm nay phản ánh cả giai đoạn vừa học, không phải chỉ 1 buổi. Bố mẹ nên tập trung hỏi con "con định sửa gì", tránh chê điểm số để con không sợ luyện đề.`
}

function checkpointMockTestObjectives(phaseTitle: string): string[] {
  return [
    `Làm được trọn vẹn 1 đề luyện tập 20 câu tổng hợp "${phaseTitle}".`,
    'Biết chính xác điểm mạnh/yếu của mình sau giai đoạn vừa học.',
  ]
}

const CHECKPOINT_MOCK_TEST_SUCCESS_CRITERIA: SuccessCriterion[] = [
  { label: 'Hoàn thành cả 5 khối của buổi luyện đề', check: { type: 'blocksDone' } },
  { label: 'Làm đủ 20 câu trong đề luyện tập', check: { type: 'minAttempts', count: 20 } },
]

// Giai đoạn 3 (Casalink: "Giải đề & các kỹ năng khi làm đề thi"; TAK12 giai
// đoạn 4: "làm các đề thi thử mới hàng tuần cùng ôn chủ điểm nâng cao theo
// từng dạng bài") — luyện đề với tần suất dày hơn hẳn giai đoạn 1–2, xen kẽ
// 1 buổi luyện đề đầy đủ với 1 buổi "bắt bệnh" luyện sâu đúng dạng bài còn
// yếu (thay vì học tuần tự theo chủ điểm như trước).
function skillDrillBlocks(round: number): LessonPlanBlock[] {
  return [
    {
      label: 'Khởi động',
      minutes: 5,
      description: 'Xem lại kết quả luyện đề gần nhất (Hồ sơ → Bản đồ năng lực), chọn đúng 1–2 dạng bài yếu nhất để tập trung cả buổi.',
    },
    {
      label: 'Luyện chuyên sâu theo dạng bài',
      minutes: 30,
      description: `Vòng ${round}: Luyện 15–20 câu dạng bài đang yếu nhất (Luyện tập → Theo dạng bài) liên tục, không xen dạng khác — lặp lại đúng 1 dạng giúp phản xạ hình thành nhanh hơn.`,
    },
    {
      label: 'Ôn ngữ pháp liên quan',
      minutes: 15,
      description: 'Ôn lại lý thuyết cốt lõi và làm Quiz nhanh 5 câu của chủ điểm liên quan trực tiếp tới dạng bài vừa luyện.',
    },
    {
      label: 'Ôn từ vựng còn yếu',
      minutes: 5,
      description: 'Ôn flashcard các thẻ đang ở Hộp 1–2 (chưa thuộc chắc) trong 5 phút.',
    },
    {
      label: 'Củng cố & giao bài tập',
      minutes: 5,
      description: 'Giao thêm bài luyện tập ở nhà đúng dạng bài còn yếu vừa luyện trong buổi.',
    },
  ]
}

const SKILL_DRILL_OBJECTIVES = [
  'Xác định đúng 1–2 dạng bài đang yếu nhất qua Bản đồ năng lực.',
  'Luyện chuyên sâu để cải thiện rõ rệt đúng dạng bài đó.',
]
const SKILL_DRILL_SUCCESS_CRITERIA: SuccessCriterion[] = [
  { label: 'Hoàn thành cả 5 khối của buổi luyện chuyên sâu', check: { type: 'blocksDone' } },
  { label: 'Luyện tối thiểu 15 câu đúng dạng bài đang yếu', check: { type: 'minAttempts', count: 15 } },
]
const SKILL_DRILL_PARENT_NOTE =
  'Buổi này con luyện chuyên sâu đúng dạng bài đang yếu nhất (tự "bắt bệnh" từ dữ liệu luyện tập). Bố mẹ có thể hỏi con hôm nay luyện dạng bài gì và con thấy đã đỡ hơn chưa so với lần trước.'

function rampMockTestBlocks(round: number): LessonPlanBlock[] {
  return [
    { label: 'Khởi động', minutes: 5, description: 'Nhắc lại chiến thuật phân bổ thời gian làm bài — câu dễ làm trước, câu khó đánh dấu quay lại sau.' },
    {
      label: 'Luyện đề đầy đủ',
      minutes: 35,
      description: `Vòng ${round}: Làm đề luyện tập 20 câu tổng hợp mọi chủ điểm đã học (Thi thử → Đề 20 câu), bấm giờ như thi thật.`,
    },
    {
      label: 'Chữa đề chi tiết',
      minutes: 15,
      description: 'Chữa từng câu sai ngay, cập nhật danh sách chủ điểm/dạng bài còn yếu vào sổ tay lỗi sai.',
      needsAdult: true,
    },
    {
      label: 'Củng cố & giao bài tập',
      minutes: 5,
      description: 'Giao bài luyện tập ở nhà theo đúng điểm yếu vừa phát hiện qua đề này.',
    },
  ]
}

const RAMP_MOCK_TEST_OBJECTIVES = [
  'Làm được trọn vẹn 1 đề luyện tập 20 câu tổng hợp mọi chủ điểm đã học.',
  'Cập nhật đúng danh sách chủ điểm/dạng bài còn yếu.',
]
const RAMP_MOCK_TEST_SUCCESS_CRITERIA: SuccessCriterion[] = [
  { label: 'Hoàn thành cả 4 khối của buổi luyện đề', check: { type: 'blocksDone' } },
  { label: 'Làm đủ 20 câu trong đề luyện tập', check: { type: 'minAttempts', count: 20 } },
]
const RAMP_MOCK_TEST_PARENT_NOTE =
  'Buổi luyện đề tổng hợp — càng gần ngày thi, tần suất luyện đề càng dày hơn theo đúng lộ trình. Bố mẹ nên giữ tinh thần nhẹ nhàng, tránh so sánh điểm số giữa các lần luyện đề.'

// LT-05 (docs/RA-SOAT-LO-TRINH-HOC.md): lộ trình cũ kết thúc sớm ~30 ngày
// trước hạn 31/12/2026 (~13 buổi trống lãng phí). Buổi "chốt tủ" này xen kẽ
// giữa các vòng thi thử toàn diện — không thi thêm 1 đề nữa, mà dành hẳn
// buổi để CHỮA SÂU và ôn lại đúng những chủ điểm sai nhiều nhất qua các lần
// thi thử trước, tránh học sinh chỉ "thi cho có" mà không thực sự khắc phục.
function finalReviewBlocks(round: number): LessonPlanBlock[] {
  return [
    {
      label: 'Khởi động',
      minutes: 5,
      description: `Xem lại điểm số ${round} lần thi thử gần nhất (Hồ sơ → Bản đồ năng lực), liệt kê chủ điểm sai từ 2 lần trở lên — đây chính là danh sách cần "chốt tủ" hôm nay.`,
    },
    {
      label: 'Ôn ngữ pháp liên quan',
      minutes: 25,
      description: 'Học lại lý thuyết cốt lõi và làm Quiz nhanh của đúng những chủ điểm vừa liệt kê — không dàn trải sang chủ điểm đã vững, chỉ tập trung điểm yếu nhất.',
    },
    {
      label: 'Luyện chuyên sâu theo dạng bài',
      minutes: 20,
      description: 'Luyện 10–15 câu đúng chủ điểm/dạng bài còn yếu (Luyện tập → Theo chủ điểm), làm tới khi đạt ổn định (trên 80% đúng) mới dừng.',
    },
    {
      label: 'Củng cố & giao bài tập',
      minutes: 10,
      description: 'Ghi lại "sổ tay lỗi sai" — liệt kê ngắn gọn từng lỗi và cách sửa đúng, mang theo tới buổi thi thử tiếp theo để tự kiểm tra lại.',
    },
  ]
}

const FINAL_REVIEW_OBJECTIVES = [
  'Chữa sâu đúng những chủ điểm sai từ 2 lần thi thử trở lên.',
  'Ghi lại "sổ tay lỗi sai" đầy đủ để mang theo buổi thi thử tiếp theo.',
]
const FINAL_REVIEW_SUCCESS_CRITERIA: SuccessCriterion[] = [
  { label: 'Hoàn thành cả 4 khối của buổi "Chốt tủ"', check: { type: 'blocksDone' } },
  { label: 'Luyện tối thiểu 10 câu đúng chủ điểm còn yếu', check: { type: 'minAttempts', count: 10 } },
]
const FINAL_REVIEW_PARENT_NOTE =
  'Buổi "Chốt tủ" — không thi thêm đề nào, mà dành cả buổi chữa sâu đúng những lỗi lặp lại nhiều lần qua các đợt thi thử trước. Bố mẹ có thể xem cùng con "sổ tay lỗi sai" con vừa ghi.'

// Buổi thi thử là NGOẠI LỆ về thời lượng: đề đầy đủ định dạng Cầu Giấy chạy
// đúng 45 phút thật (`CAU_GIAY_DURATION_MINUTES` ở CustomMockTestPage.tsx),
// không thể rút ngắn vì phải mô phỏng đúng áp lực thời gian phòng thi thật —
// nên buổi này chỉ còn đúng 10 phút (5 khởi động + 5 chữa nhanh) cho phần
// còn lại, tổng 60 phút thay vì 90 như các buổi khác.
function finalExamBlocks(round: number, total: number): LessonPlanBlock[] {
  return [
    {
      label: 'Khởi động & nhắc quy chế thi',
      minutes: 5,
      description: `Thi thử toàn diện lần ${round}/${total} — nhắc quy tắc làm bài, không tra cứu, phân bổ ~1 phút/câu cho 40 câu trong 45 phút.`,
    },
    {
      label: 'Thi thử đầy đủ định dạng',
      minutes: 45,
      description: 'Làm đề thi thử đầy đủ định dạng (đối chiếu Cầu Giấy — 40 câu, đúng 45 phút) trong điều kiện giống phòng thi thật, không dừng giữa chừng (Thi thử → Giống đề Cầu Giấy).',
      needsAdult: true,
    },
    {
      label: 'Chữa đề nhanh',
      minutes: 10,
      description: 'Xem điểm ngay, ghi nhanh 3 chủ điểm/dạng bài sai nhiều nhất vào sổ tay lỗi sai — phần chữa sâu để dành cho buổi "Chốt tủ" tiếp theo.',
      needsAdult: true,
    },
  ]
}

function finalExamObjectives(round: number, total: number): string[] {
  return [
    `Hoàn thành trọn vẹn đề thi thử toàn diện lần ${round}/${total} trong đúng 45 phút.`,
    'Biết chính xác điểm mạnh/yếu còn lại trước ngày thi thật.',
  ]
}

function finalExamParentNote(round: number, total: number): string {
  return `Thi thử toàn diện lần ${round}/${total} — đúng áp lực thời gian phòng thi thật (45 phút). Sau buổi, bố mẹ nên hỏi con cảm thấy phần nào tự tin nhất thay vì hỏi ngay điểm số, để con không sợ thi thử.`
}

const FINAL_EXAM_SUCCESS_CRITERIA: SuccessCriterion[] = [
  { label: 'Hoàn thành cả 3 khối của buổi thi thử', check: { type: 'blocksDone' } },
  { label: 'Làm đủ 40 câu trong đề thi thử', check: { type: 'minAttempts', count: 40 } },
]

/**
 * LT-01 (docs/RA-SOAT-LO-TRINH-HOC.md) — trước bản cập nhật này, lộ trình
 * chỉ dạy 36 chủ điểm ngữ pháp, bỏ trắng hoàn toàn 5/9 dạng bài của đề thật
 * (Ngữ âm, Đọc hiểu, Tìm lỗi sai, Viết lại câu, Viết đoạn văn — chiếm 55%
 * số câu đề thật). Học sinh nắm đủ ngữ pháp vẫn có thể mất điểm vì chưa
 * từng được dạy CHIẾN THUẬT làm các dạng bài này. 8 buổi dưới đây dạy
 * phương pháp trước, luyện ngay sau — tái dùng 100% ngân hàng câu hỏi/bài
 * đọc/đề viết đã có sẵn (không cần biên soạn nội dung luyện tập mới).
 */
interface SkillLessonSpec {
  skillId: SkillId
  title: string
  warmup: string
  theory: string
  guided: string
  advanced: string
  homework: string
}

function skillLessonBlocks(spec: SkillLessonSpec): LessonPlanBlock[] {
  return [
    { label: 'Khởi động', minutes: 5, description: spec.warmup },
    { label: 'Học chiến thuật làm bài', minutes: 20, description: spec.theory, needsAdult: true },
    { label: 'Luyện tập có hướng dẫn', minutes: 20, description: spec.guided },
    { label: 'Luyện tập nâng cao', minutes: 10, description: spec.advanced, optional: true },
    {
      label: 'Củng cố & giao bài tập',
      minutes: 5,
      description: 'Tổng kết mẹo làm bài quan trọng nhất của buổi học, giao bài luyện thêm (xem mục "Bài tập về nhà" của buổi học).',
    },
  ]
}

function skillLessonObjectives(spec: SkillLessonSpec): string[] {
  return [
    `Nắm được chiến thuật làm dạng bài "${spec.title}".`,
    'Áp dụng thành thạo chiến thuật đó khi luyện tập, không còn làm theo cảm tính.',
  ]
}

const SKILL_LESSON_SUCCESS_CRITERIA: SuccessCriterion[] = [
  { label: 'Hoàn thành cả 5 khối của buổi học kỹ năng', check: { type: 'blocksDone' } },
  { label: 'Làm tối thiểu 20 câu luyện tập trong buổi', check: { type: 'minAttempts', count: 20 } },
]

function skillLessonParentNote(spec: SkillLessonSpec): string {
  return `Hôm nay con học PHƯƠNG PHÁP làm dạng bài "${spec.title}" (khác buổi ngữ pháp thông thường). Bố mẹ có thể hỏi con "mẹo làm bài hôm nay là gì?" — nếu con trả lời được nghĩa là con đã hiểu chiến thuật, không chỉ làm đúng may rủi.`
}

const PHONETICS_1: SkillLessonSpec = {
  skillId: 'KN-08',
  title: 'Ngữ âm 1: Quy tắc phát âm đuôi -s/-es và -ed',
  warmup:
    'Nghe 6 từ được đọc lên (dùng nút 🔊), đoán xem từ nào có đuôi phát âm khác nhóm còn lại — khởi động đúng dạng bài "chọn từ có cách phát âm khác" hay gặp trong đề.',
  theory:
    '**Đuôi -s/-es** (số nhiều danh từ, động từ ngôi 3 số ít): đọc **/s/** sau âm cuối vô thanh (p, t, k, f...) — books, cats; đọc **/z/** sau âm cuối hữu thanh và nguyên âm — dogs, plays; đọc **/ɪz/** sau âm xuýt (s, sh, ch, x, ge/dge) — boxes, watches. **Đuôi -ed** (quá khứ/phân từ): đọc **/t/** sau âm cuối vô thanh — watched; đọc **/d/** sau âm cuối hữu thanh và nguyên âm — played; đọc **/ɪd/** sau âm /t/ hoặc /d/ — wanted, needed. Mẹo: nhìn ÂM CUỐI của từ gốc (không phải chữ cái cuối) để chọn nhóm đọc.',
  guided:
    'Làm 12 câu Ngữ âm về đuôi -s/-es/-ed (Luyện tập → Theo dạng bài, chọn Ngữ âm). Bấm nút 🔊 nghe từng phương án TRƯỚC khi chọn — luyện đúng phản xạ nghe, không đoán bằng mắt.',
  advanced:
    'Làm thêm 1 vòng câu Ngữ âm ngẫu nhiên khác (trọng âm, nguyên âm) để làm quen định dạng đề — chưa cần học kỹ phần trọng âm, để dành cho buổi Ngữ âm 2.',
  homework:
    'Ôn lại bảng quy tắc /s/-/z/-/ɪz/ và /t/-/d/-/ɪd/, tự đọc to 10 từ bất kỳ trong sách rồi kiểm tra lại bằng nút 🔊.',
}

const PHONETICS_2: SkillLessonSpec = {
  skillId: 'KN-08',
  title: 'Ngữ âm 2: Quy tắc trọng âm từ 2–3 âm tiết',
  warmup:
    'Nghe 6 từ 2 âm tiết, vỗ tay vào đúng âm tiết mang trọng âm — luyện tai trước khi học quy tắc.',
  theory:
    '**Danh từ/tính từ 2 âm tiết:** trọng âm thường rơi vào âm tiết 1 — TAble, HAPpy. **Động từ 2 âm tiết:** trọng âm thường rơi vào âm tiết 2 — beGIN, aGREE. **Từ có đuôi -tion, -sion, -ic, -ious:** trọng âm rơi vào âm tiết NGAY TRƯỚC đuôi đó — inforMAtion, geoGRAphic. **Từ có đuôi -ese, -ee, -eer** (giữ nghĩa gốc): trọng âm rơi ĐÚNG vào đuôi đó — Japan**ESE**, engin**EER**. Đây là quy tắc PHỔ BIẾN, không tuyệt đối — khi không chắc, hãy nghe bằng nút 🔊 thay vì đoán mò.',
  guided:
    'Làm 12 câu Ngữ âm về trọng âm (Luyện tập → Theo dạng bài), đọc to từng phương án trước khi bấm chọn để luyện phản xạ nghe–nói cùng lúc.',
  advanced:
    'Trộn 15 câu Ngữ âm ngẫu nhiên (cả nhóm phát âm lẫn trọng âm) để luyện tốc độ nhận diện nhanh — mục tiêu dưới 20 giây/câu.',
  homework:
    'Chọn 10 từ mới học trong tuần, tự gạch chân âm tiết mang trọng âm rồi kiểm tra lại bằng nút 🔊.',
}

const READING_1: SkillLessonSpec = {
  skillId: 'KN-02',
  title: 'Đọc hiểu 1: Kỹ năng đọc lướt tìm thông tin (Scanning)',
  warmup: 'Xem nhanh 1 đoạn văn 30 giây, sau đó trả lời "Bài nói về chủ đề gì?" — không đọc kỹ, chỉ lướt.',
  theory:
    '**Bước 1:** Đọc LƯỚT các câu hỏi TRƯỚC khi đọc bài — biết mình cần tìm thông tin gì (tên riêng, con số, ngày tháng, địa điểm...). **Bước 2:** Đọc bài, mắt lướt nhanh tìm TỪ KHÓA trùng hoặc gần nghĩa với câu hỏi, không đọc từng chữ. **Bước 3:** Khi thấy từ khóa, đọc kỹ 1–2 câu xung quanh để lấy đáp án chính xác, không suy diễn thêm. Câu hỏi chi tiết (What/When/Where/Who) luôn có đáp án nằm TRỰC TIẾP trong bài.',
  guided:
    'Làm 2 bài đọc hiểu cơ bản (Luyện tập → Theo dạng bài, chọn Đọc hiểu văn bản dài), tập đọc câu hỏi trước rồi mới đọc bài — tự bấm giờ khoảng 90 giây/bài để luyện tốc độ.',
  advanced:
    'Làm thêm 1 bài đọc hiểu, lần này ghi ra các từ khóa đã dùng để tìm từng đáp án — so sánh với bạn học hoặc phụ huynh xem cách tìm có hiệu quả không.',
  homework: 'Áp dụng kỹ thuật "đọc câu hỏi trước khi đọc bài" cho 1 bài đọc bất kỳ trong sách giáo khoa.',
}

const READING_2: SkillLessonSpec = {
  skillId: 'KN-02',
  title: 'Đọc hiểu 2: Câu hỏi ý chính (Main Idea) & Suy luận (Inference)',
  warmup: 'Đọc 3 câu đầu của một bài đã học trước đó, đoán xem cả bài sẽ nói về điều gì.',
  theory:
    '**Câu hỏi ý chính** ("What is the passage mainly about?"): đáp án đúng phải KHÁI QUÁT cả bài, không chỉ đúng ở 1 đoạn nhỏ — hay sai vì chọn phương án chỉ đúng 1 phần. Mẹo: câu ĐẦU và câu CUỐI bài thường chứa ý chính. **Câu hỏi suy luận** ("What can be inferred...?"): đáp án KHÔNG được nói thẳng trong bài, phải suy ra từ chi tiết đã cho nhưng vẫn cần CĂN CỨ rõ trong bài — loại trừ phương án nói điều trái với bài hoặc bài không hề nhắc tới.',
  guided:
    'Làm 2 bài đọc hiểu tập trung câu hỏi ý chính/suy luận. Sau mỗi câu, tự giải thích bằng lời "vì sao chọn đáp án này" TRƯỚC khi xem lời giải.',
  advanced: 'Làm thêm 1 bài đọc mức `advanced` (200–250 từ) để làm quen độ khó thật của đề thi.',
  homework: 'Chọn 1 bài đọc đã học, tự đặt 1 câu hỏi ý chính và 1 câu hỏi suy luận cho bài đó.',
}

const ERROR_FINDING: SkillLessonSpec = {
  skillId: 'KN-06',
  title: 'Tìm và sửa lỗi sai: 6 nhóm lỗi hay gặp trong đề',
  warmup: 'Đọc nhanh 3 câu có lỗi sai, đoán xem lỗi nằm ở từ nào trước khi học lý thuyết.',
  theory:
    '6 nhóm lỗi hay gặp nhất: **(1) Thì động từ** — sai thì, thiếu -s/-ed. **(2) Hòa hợp chủ–vị** — chủ ngữ số ít/nhiều không khớp động từ. **(3) Giới từ** — sai giới từ đi kèm cố định (interested IN, good AT). **(4) Mạo từ** — thừa/thiếu a/an/the. **(5) Từ loại** — dùng tính từ thay trạng từ hoặc ngược lại. **(6) So sánh** — sai cấu trúc so sánh hơn/nhất. Chiến thuật: đọc cả câu để hiểu nghĩa trước, rồi kiểm tra LẦN LƯỢT từng nhóm lỗi trên với phần gạch chân — đừng chỉ nhìn từ đơn lẻ.',
  guided:
    'Làm 15 câu Tìm lỗi sai (Luyện tập → Theo dạng bài). Với mỗi câu sai, gọi tên ĐÚNG nhóm lỗi (1–6 ở trên) trước khi xem giải thích.',
  advanced: 'Làm thêm 15 câu, lần này bấm giờ 40 giây/câu để luyện tốc độ làm bài như thi thật.',
  homework: 'Viết lại 5 câu sai đã gặp trong buổi thành 5 câu đúng, ghi rõ mỗi câu thuộc nhóm lỗi nào.',
}

const READING_3: SkillLessonSpec = {
  skillId: 'KN-02',
  title: 'Đọc hiểu 3: Tham chiếu đại từ & Đoán nghĩa từ theo ngữ cảnh',
  warmup: 'Tìm nhanh 2 đại từ (it/they/this) trong một đoạn văn bất kỳ và đoán chúng thay cho từ nào.',
  theory:
    '**Câu hỏi tham chiếu đại từ** ("The word *it/they* refers to...?"): tìm đại từ trong bài, đọc NGƯỢC LÊN các câu phía TRƯỚC để tìm danh từ mà nó thay thế — kiểm tra lại bằng cách thay danh từ vào chỗ đại từ xem câu có còn đúng nghĩa không. **Câu hỏi đoán nghĩa từ** ("...is closest in meaning to...?"): không cần biết nghĩa chính xác, đọc CẢ CÂU chứa từ đó để đoán nghĩa từ NGỮ CẢNH — chú ý từ nối "but/however" (báo hiệu nghĩa trái ngược) hay "and/also" (báo hiệu nghĩa tương đồng).',
  guided:
    'Làm 2 bài đọc hiểu tập trung 2 dạng câu hỏi này, luyện thao tác đọc ngược lên tìm danh từ được thay thế.',
  advanced:
    'Làm thêm 1 bài đọc `advanced`, thống kê xem 1 bài có bao nhiêu câu dạng tham chiếu/đoán nghĩa — càng quen sẽ càng làm nhanh.',
  homework: 'Tìm 3 đại từ (it/they/this) trong 1 bài đọc đã học, xác định chúng thay thế cho từ/cụm từ nào.',
}

const REWRITE: SkillLessonSpec = {
  skillId: 'KN-05',
  title: 'Viết lại câu: Hệ thống hóa 10 dạng biến đổi bắt buộc',
  warmup: 'Đọc nhanh 3 câu viết lại mẫu, đoán xem mỗi câu thuộc dạng biến đổi nào.',
  theory:
    'Đề CLC luôn kiểm tra 10 dạng biến đổi: (1) so...that ↔ such...that, (2) too...to ↔ not enough to, (3) chủ động ↔ bị động, (4) trực tiếp ↔ gián tiếp, (5) câu điều kiện, (6) wish/if only, (7) so sánh hơn ↔ nhất ↔ bằng, (8) because ↔ because of / although ↔ despite, (9) It takes... ↔ spend, (10) used to. Chiến thuật: trước tiên XÁC ĐỊNH ĐÚNG câu thuộc dạng nào trong 10 dạng trên (dựa vào từ khóa trong câu gốc), rồi mới áp dụng ĐÚNG công thức — đừng viết theo cảm tính. Câu làm sai sẽ hiện gợi ý công thức (💡).',
  guided:
    'Làm 15 câu Viết lại câu (Luyện tập → Theo dạng bài). Với mỗi câu, GỌI TÊN dạng biến đổi (1–10 ở trên) trước khi chọn đáp án.',
  advanced: 'Làm thêm 12 câu còn lại để phủ hết cả 10 dạng, đọc kỹ gợi ý 💡 ở những câu làm sai.',
  homework:
    'Viết ra giấy công thức của 3 dạng biến đổi em thấy khó nhất, kèm 1 ví dụ tự nghĩ cho mỗi dạng.',
}

const WRITING: SkillLessonSpec = {
  skillId: 'KN-07',
  title: 'Viết đoạn văn: Dàn ý 3 phần & cách tự chấm bài',
  warmup: 'Đọc 1 bài mẫu đã có sẵn trong ứng dụng, đoán xem câu nào là mở đoạn, câu nào là kết đoạn.',
  theory:
    '**Dàn ý chuẩn cho đoạn 50–70 từ:** Câu 1 — MỞ ĐOẠN (giới thiệu chủ đề, dùng luôn 1 từ khóa của đề bài). 3–4 câu — THÂN ĐOẠN (mỗi câu 1 ý, đúng thì và dùng từ vựng gợi ý). Câu cuối — KẾT ĐOẠN (cảm nghĩ hoặc tổng kết ngắn). **5 lỗi hay gặp nhất:** thiếu/thừa số từ, không dùng từ vựng gợi ý, sai thì xuyên suốt đoạn, câu quá dài thiếu dấu câu, mở đoạn không liên quan đề bài. **Cách tự chấm:** viết xong, dùng checklist có sẵn kiểm tra từng tiêu chí — bước học sinh hay bỏ qua nhất nhưng quan trọng nhất.',
  guided:
    'Viết 1 đoạn văn theo đề tự chọn (Luyện tập → Viết đoạn văn), áp dụng đúng dàn ý 3 phần, rồi dùng checklist tự chấm và so sánh với bài mẫu.',
  advanced: 'Viết thêm 1 đoạn văn với đề khác, lần này bấm giờ 15 phút để luyện tốc độ viết như thi thật.',
  homework:
    'Chọn 1 bài mẫu đã đọc, gạch chân câu mở đoạn/thân đoạn/kết đoạn để nhận diện rõ cấu trúc 3 phần.',
}

// LT-06 (docs/RA-SOAT-LO-TRINH-HOC.md): điểm kiểm tra đầu vào < 50% ⇒ chèn
// 4 buổi "Củng cố nền tảng" trước khi vào Giai đoạn 1 chính thức — ôn lại ở
// mức NHẸ NHÀNG những chủ điểm cơ bản nhất (sẽ được dạy đầy đủ lại đúng lúc
// trong Giai đoạn 1, không phải học 2 lần cùng độ sâu). Không tự thêm giáo
// án mới — tái dùng đúng bài học/luyện tập đã có cho các NP-xx này.
const FOUNDATION_BOOST_GROUPS: { title: string; topicIds: string[] }[] = [
  { title: 'Củng cố nền tảng 1: Danh từ & mạo từ cơ bản', topicIds: ['NP-01', 'NP-02'] },
  { title: 'Củng cố nền tảng 2: Đại từ & tính từ cơ bản', topicIds: ['NP-03', 'NP-05'] },
  { title: 'Củng cố nền tảng 3: Thì hiện tại đơn', topicIds: ['NP-11'] },
  { title: 'Củng cố nền tảng 4: Thì quá khứ đơn', topicIds: ['NP-13'] },
]

function foundationBoostBlocks(topicIds: string[]): LessonPlanBlock[] {
  const titles = topicIds.map(topicTitle).join(', ')
  return [
    {
      label: 'Khởi động',
      minutes: 5,
      description: 'Trò chơi khởi động nhẹ nhàng, tạo không khí thoải mái — chưa cần áp lực điểm số.',
    },
    {
      label: 'Ôn tập lý thuyết',
      minutes: 20,
      description: `Ôn lại nhanh, mức CƠ BẢN: ${titles}. Chỉ nhắc công thức cốt lõi và 1–2 ví dụ dễ hiểu nhất mỗi chủ điểm — phần đầy đủ sẽ được học kỹ lại đúng lúc trong Giai đoạn 1, không cần lo nhớ hết ngay bây giờ.`,
    },
    {
      label: 'Luyện tập có hướng dẫn',
      minutes: 20,
      description: 'Luyện 8–10 câu mức cơ bản (Luyện tập → Theo chủ điểm), đi chậm, chữa lỗi trực tiếp từng câu, ưu tiên hiểu đúng hơn làm nhanh.',
    },
    {
      label: 'Củng cố & giao bài tập',
      minutes: 15,
      description: 'Tổng kết ngắn gọn những gì đã vững, động viên tinh thần — nhắc rằng đây chỉ là bước khởi động, lộ trình chính thức ở Giai đoạn 1 sẽ dạy lại kỹ và đầy đủ hơn.',
    },
  ]
}

const FOUNDATION_BOOST_OBJECTIVES = [
  'Ôn lại vững các chủ điểm cơ bản nhất trước khi vào Giai đoạn 1 chính thức.',
  'Cảm thấy tự tin, thoải mái — chưa cần áp lực điểm số.',
]
const FOUNDATION_BOOST_SUCCESS_CRITERIA: SuccessCriterion[] = [
  { label: 'Hoàn thành cả 4 khối của buổi củng cố nền tảng', check: { type: 'blocksDone' } },
  { label: 'Luyện tối thiểu 8 câu mức cơ bản', check: { type: 'minAttempts', count: 8 } },
]
const FOUNDATION_BOOST_PARENT_NOTE =
  'Buổi củng cố nền tảng — không tính vào lộ trình chính, chỉ để con vững hơn trước khi vào Giai đoạn 1. Bố mẹ nên động viên nhẹ nhàng, tránh tạo áp lực vì đây chỉ là bước khởi động.'

/**
 * LT-06 — 3 mức cá nhân hóa theo điểm kiểm tra đầu vào (`DiagnosticScore`):
 *   - `foundation-boost` (< 50%): chèn thêm 4 buổi củng cố nền tảng (xem
 *     trên) trước Giai đoạn 1 — CỘNG THÊM buổi, không xóa/gộp buổi nào, nên
 *     không phá vỡ bất biến "mỗi chủ điểm ngữ pháp có đúng 1 buổi dạy".
 *   - `accelerated` (> 80%): KHÔNG cắt bớt nội dung — thay vào đó
 *     `CurriculumPage` gợi ý dùng chế độ "buổi rút gọn" (PP-06) cho các buổi
 *     Giai đoạn 1 để học nhanh hơn mà vẫn học đủ. Cân nhắc kỹ: gộp/xóa buổi
 *     sẽ phá vỡ bất biến 1 chủ điểm — 1 buổi mà `curriculum.test.ts` đang
 *     canh giữ, và có nguy cơ bỏ sót chủ điểm nếu suy đoán sai học sinh thật
 *     sự đã vững chủ điểm nào.
 *   - `standard` (còn lại, hoặc chưa làm bài kiểm tra đầu vào): giữ nguyên.
 */
export type CurriculumTier = 'foundation-boost' | 'standard' | 'accelerated'

function buildCurriculumPlan(tier: CurriculumTier = 'standard'): CurriculumSessionTemplate[] {
  const sessions: CurriculumSessionTemplate[] = []
  let order = 1
  let vocabIndex = 0
  // PP-07: đếm LIÊN TỤC qua cả 2 giai đoạn (không reset per-phase như `i` của
  // `forEach` trong `addGrammarPhase`) để 3 khuôn chia đều 12/12/12 trên tổng
  // 36 buổi, thay vì lệch theo số buổi lẻ của từng giai đoạn riêng (20 và 16).
  let grammarVariantIndex = 0

  const nextVocabTopicId = () => {
    const id = VOCAB_SEQUENCE[vocabIndex % VOCAB_SEQUENCE.length]
    vocabIndex += 1
    return id
  }

  const nextGrammarVariant = () => {
    const variant = GRAMMAR_VARIANTS[grammarVariantIndex % GRAMMAR_VARIANTS.length]
    grammarVariantIndex += 1
    return variant
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
    objectives: ORIENTATION_OBJECTIVES,
    successCriteria: ORIENTATION_SUCCESS_CRITERIA,
    parentNote: ORIENTATION_PARENT_NOTE,
  })

  function addSkillLesson(spec: SkillLessonSpec, phaseLabel: string) {
    pushSession({
      focus: 'skill-lesson',
      phaseLabel,
      title: spec.title,
      topicIds: [],
      skillId: spec.skillId,
      blocks: skillLessonBlocks(spec),
      homework: spec.homework,
      objectives: skillLessonObjectives(spec),
      successCriteria: SKILL_LESSON_SUCCESS_CRITERIA,
      parentNote: skillLessonParentNote(spec),
    })
  }

  // LT-01: `insertAfter[i]` chèn 1 buổi kỹ năng NGAY SAU khi dạy xong
  // `topicIds[i]` — dùng cùng `phaseLabel` với chủ điểm ngữ pháp xung quanh
  // để buổi kỹ năng vẫn thuộc đúng giai đoạn hiển thị (không tạo giai đoạn
  // rời rạc xen giữa, giữ đúng bất biến "các buổi trong 1 giai đoạn liên
  // tục" mà buildFullSchedule/CurriculumPage đang dựa vào).
  function addGrammarPhase(
    topicIds: string[],
    phaseLabel: string,
    insertAfter: Record<number, SkillLessonSpec> = {},
  ) {
    topicIds.forEach((topicId, i) => {
      const vocabTopicId = nextVocabTopicId()
      const title = topicTitle(topicId)
      const vocabLabel = getTopicLabel(vocabTopicId)
      pushSession({
        focus: 'grammar',
        phaseLabel,
        title,
        topicIds: [topicId],
        vocabTopicId,
        blocks: grammarBlocks(topicId, vocabTopicId, nextGrammarVariant()),
        homework: `Làm Quiz nhanh chủ điểm "${title}" đạt từ 80%, ôn từ vựng "${vocabLabel}" tới Hộp 3 trở lên.`,
        objectives: grammarObjectives(title, vocabLabel),
        successCriteria: grammarSuccessCriteria(title, vocabLabel),
        parentNote: grammarParentNote(title),
      })
      const skillLesson = insertAfter[i]
      if (skillLesson) addSkillLesson(skillLesson, phaseLabel)
    })
  }

  function addCheckpoint(topicIds: string[], phaseLabel: string, phaseTitle: string) {
    pushSession({
      focus: 'review',
      phaseLabel,
      title: `Ôn tập tổng hợp: ${phaseTitle}`,
      topicIds: [...topicIds],
      blocks: checkpointReviewBlocks(phaseTitle),
      homework: 'Luyện tập thêm các chủ điểm còn yếu trong giai đoạn vừa ôn.',
      objectives: checkpointReviewObjectives(phaseTitle),
      successCriteria: CHECKPOINT_REVIEW_SUCCESS_CRITERIA,
      parentNote: checkpointReviewParentNote(phaseTitle),
    })
    pushSession({
      focus: 'mock-test',
      phaseLabel,
      title: `Luyện đề chốt: ${phaseTitle}`,
      topicIds: [...topicIds],
      blocks: checkpointMockTestBlocks(phaseTitle),
      homework: 'Xem lại các câu làm sai trong đề luyện tập, ôn lại chủ điểm liên quan.',
      objectives: checkpointMockTestObjectives(phaseTitle),
      successCriteria: CHECKPOINT_MOCK_TEST_SUCCESS_CRITERIA,
      parentNote: checkpointMockTestParentNote(phaseTitle),
    })
  }

  // LT-06: học sinh điểm kiểm tra đầu vào thấp được học thêm 4 buổi củng cố
  // trước khi vào Giai đoạn 1 chính thức.
  if (tier === 'foundation-boost') {
    for (const group of FOUNDATION_BOOST_GROUPS) {
      pushSession({
        focus: 'review',
        phaseLabel: PHASE_LABEL.foundation,
        title: group.title,
        topicIds: group.topicIds,
        blocks: foundationBoostBlocks(group.topicIds),
        homework: 'Ôn lại flashcard chủ đề "Gia đình & bản thân" (TV-01) 10 phút.',
        objectives: FOUNDATION_BOOST_OBJECTIVES,
        successCriteria: FOUNDATION_BOOST_SUCCESS_CRITERIA,
        parentNote: FOUNDATION_BOOST_PARENT_NOTE,
      })
    }
  }

  // Giai đoạn 1 — Nền tảng. Chèn 2 buổi Ngữ âm giữa các buổi ngữ pháp (LT-01):
  // sau chủ điểm thứ 6 và thứ 13/20 — dàn đều thay vì dồn cả 2 buổi liền
  // nhau, để không ngắt quãng mạch học ngữ pháp quá lâu.
  addGrammarPhase(FOUNDATION_TOPIC_IDS, PHASE_LABEL.foundation, {
    5: PHONETICS_1,
    12: PHONETICS_2,
  })
  addCheckpoint(FOUNDATION_TOPIC_IDS, PHASE_LABEL.foundation, 'Giai đoạn 1 · Nền tảng')

  // Giai đoạn 2 — Nâng cao. Chèn 5 buổi kỹ năng (LT-01): Đọc hiểu 1 gần đầu,
  // Đọc hiểu 2 + Tìm lỗi sai ở giữa, Đọc hiểu 3 + Viết lại câu gần cuối
  // (trước khi chốt giai đoạn) — đúng thứ tự đề xuất trong bản rà soát.
  addGrammarPhase(ADVANCED_TOPIC_IDS, PHASE_LABEL.advanced, {
    2: READING_1,
    6: READING_2,
    8: ERROR_FINDING,
    11: READING_3,
    14: REWRITE,
  })
  addCheckpoint(ADVANCED_TOPIC_IDS, PHASE_LABEL.advanced, 'Giai đoạn 2 · Nâng cao')

  // Giai đoạn 3 — Luyện đề tăng tốc: mở đầu bằng buổi Viết đoạn văn (LT-01,
  // KN-07 chưa từng được dạy phương pháp ở giai đoạn nào trước đó), rồi mới
  // xen kẽ luyện chuyên sâu theo dạng bài còn yếu với luyện đề đầy đủ, tần
  // suất luyện đề tăng dần khi gần ngày thi (đúng tinh thần "luyện đề hàng
  // tuần đến ngày thi" của TAK12).
  addSkillLesson(WRITING, PHASE_LABEL.ramp)
  const RAMP_ROUNDS = 3
  for (let round = 1; round <= RAMP_ROUNDS; round++) {
    pushSession({
      focus: 'skill-drill',
      phaseLabel: PHASE_LABEL.ramp,
      title: `Luyện chuyên sâu theo dạng bài yếu — vòng ${round}/${RAMP_ROUNDS}`,
      topicIds: [],
      blocks: skillDrillBlocks(round),
      homework: 'Luyện thêm ở nhà đúng dạng bài vừa "bắt bệnh" trong buổi học.',
      objectives: SKILL_DRILL_OBJECTIVES,
      successCriteria: SKILL_DRILL_SUCCESS_CRITERIA,
      parentNote: SKILL_DRILL_PARENT_NOTE,
    })
    pushSession({
      focus: 'mock-test',
      phaseLabel: PHASE_LABEL.ramp,
      title: `Luyện đề tổng hợp — vòng ${round}/${RAMP_ROUNDS}`,
      topicIds: [],
      blocks: rampMockTestBlocks(round),
      homework: 'Xem lại toàn bộ câu sai, cập nhật danh sách chủ điểm còn yếu.',
      objectives: RAMP_MOCK_TEST_OBJECTIVES,
      successCriteria: RAMP_MOCK_TEST_SUCCESS_CRITERIA,
      parentNote: RAMP_MOCK_TEST_PARENT_NOTE,
    })
  }

  // Giai đoạn 4 — Nước rút cuối cùng: thi thử toàn diện liên tiếp, mỗi lần
  // đều chữa đề và ôn sâu đúng điểm yếu còn lại (TAK12 giai đoạn 5). LT-05:
  // nâng từ 3 → 9 vòng thi thử (dùng quỹ ~4 tuần lịch trước đây bỏ trống),
  // xen 3 buổi "chốt tủ" sau vòng 2/5/8 để không chỉ thi liên tục mà không
  // thực sự khắc phục điểm yếu.
  const FINAL_EXAM_ROUNDS = 9
  const REVIEW_AFTER_ROUNDS = new Set([2, 5, 8])
  let reviewRound = 1
  for (let round = 1; round <= FINAL_EXAM_ROUNDS; round++) {
    pushSession({
      focus: 'final-exam',
      phaseLabel: PHASE_LABEL.finalSprint,
      title: `Ôn thi tổng lực — Thi thử toàn diện lần ${round}/${FINAL_EXAM_ROUNDS}`,
      topicIds: [],
      blocks: finalExamBlocks(round, FINAL_EXAM_ROUNDS),
      homework: 'Nghỉ ngơi đầy đủ, xem lại tổng hợp lỗi thường gặp của các chủ điểm còn yếu nhất.',
      objectives: finalExamObjectives(round, FINAL_EXAM_ROUNDS),
      successCriteria: FINAL_EXAM_SUCCESS_CRITERIA,
      parentNote: finalExamParentNote(round, FINAL_EXAM_ROUNDS),
    })
    if (REVIEW_AFTER_ROUNDS.has(round)) {
      pushSession({
        focus: 'review',
        phaseLabel: PHASE_LABEL.finalSprint,
        title: `Chốt tủ: chữa sâu điểm yếu sau ${round} lần thi thử`,
        topicIds: [],
        blocks: finalReviewBlocks(reviewRound),
        homework: 'Mang theo "sổ tay lỗi sai" tới buổi thi thử tiếp theo, đọc lại trước khi làm bài.',
        objectives: FINAL_REVIEW_OBJECTIVES,
        successCriteria: FINAL_REVIEW_SUCCESS_CRITERIA,
        parentNote: FINAL_REVIEW_PARENT_NOTE,
      })
      reviewRound += 1
    }
  }

  return sessions
}

export const CURRICULUM_PLAN: CurriculumSessionTemplate[] = buildCurriculumPlan('standard')

// LT-06: bộ nhớ đệm theo tier — buildCurriculumPlan() không phải hàm rẻ
// (biên soạn ~60-70 buổi mỗi lần gọi) và CurriculumPage/SessionRunnerPage
// gọi lại ở mỗi lần render tương ứng với tier hiện tại của học sinh.
const planCache = new Map<CurriculumTier, CurriculumSessionTemplate[]>([
  ['standard', CURRICULUM_PLAN],
])

export function getCurriculumPlan(tier: CurriculumTier): CurriculumSessionTemplate[] {
  const cached = planCache.get(tier)
  if (cached) return cached
  const plan = buildCurriculumPlan(tier)
  planCache.set(tier, plan)
  return plan
}
