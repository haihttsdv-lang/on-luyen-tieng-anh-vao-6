/**
 * Domain types — ánh xạ trực tiếp theo Mục 9 (Mô hình dữ liệu) của URD.
 * Mã chủ điểm: NP-xx (ngữ pháp, Mục 4.1), TV-xx (từ vựng, Mục 4.2), KN-xx (kỹ năng/dạng bài, Mục 4.3).
 */

export type TopicGroup = 'grammar' | 'vocabulary'

export interface TopicExample {
  en: string
  vi: string
}

export interface Topic {
  id: string // NP-xx hoặc TV-xx
  group: TopicGroup
  title: string
  lesson: string[] // mảng gạch đầu dòng; hỗ trợ **in đậm** cho từ khóa quan trọng
  examples: TopicExample[]
  commonMistakes: string[] // FR-L02: lỗi thường gặp
}

// FR-L01: trạng thái hiển thị cho học sinh. Không lưu "not_started" — suy ra
// từ việc topicId không có mặt trong ProgressStore.getTopicStatuses().
export type TopicStatus = 'in_progress' | 'mastered'

export type SkillId =
  | 'KN-01'
  | 'KN-02'
  | 'KN-03'
  | 'KN-04'
  | 'KN-05'
  | 'KN-06'
  | 'KN-07'
  | 'KN-08'

export interface Question {
  id: string
  prompt: string
  options: [string, string, string, string]
  answerIndex: 0 | 1 | 2 | 3
  explain: string
  topicIds: string[] // bắt buộc >= 1, dùng để lọc luyện theo chủ điểm (FR-P03) và tính mastery (FR-M03)
  skillId: SkillId
  passageId?: string // liên kết tới ReadingPassage khi câu hỏi thuộc một bài đọc dài (KN-02)
}

/**
 * Bài đọc hiểu dài dùng chung cho một nhóm câu hỏi KN-02 (Mục 4.4: "15–20 bài,
 * mỗi bài 5 câu hỏi"). Không có trong bảng liệt kê thực thể gốc ở Mục 9 — bổ
 * sung vì Question không có chỗ chứa văn bản đọc dùng chung cho nhiều câu hỏi.
 */
export interface ReadingPassage {
  id: string
  title: string
  text: string
  topicIds: string[]
}

// Hộp Leitner 1–5 dùng cho spaced repetition (FR-L06). Đây là TIẾN ĐỘ của
// từng học sinh với từng thẻ, không phải nội dung tĩnh — lưu qua
// ProgressStore.getVocabBoxLevel/setVocabBoxLevel, không phải trên VocabCard.
export type BoxLevel = 1 | 2 | 3 | 4 | 5

export interface VocabCard {
  id: string
  word: string
  partOfSpeech: string // loại từ viết tắt: n. (danh từ), v. (động từ), adj., adv., phr.v. (cụm động từ), idiom...
  phonetic: string // phiên âm IPA theo giọng Anh-Mỹ (General American)
  meaning: string
  example: string
  topicId: string // TV-xx
}

export interface WritingPrompt {
  id: string
  title: string
  ideas: string[]
  vocab: string[]
}

export interface Attempt {
  id: string
  questionId?: string
  cardId?: string
  correct: boolean
  timestamp: string // ISO 8601
}

export interface MockTestResult {
  id: string
  date: string // ISO 8601
  score: number
  total: number
  byTopic: Record<string, { correct: number; total: number }>
  // FR-P05 yêu cầu "điểm theo dạng bài" bên cạnh "điểm theo chủ điểm", nhưng
  // Mục 9 gốc chỉ liệt kê byTopic — bổ sung bySkill để đủ yêu cầu.
  bySkill: Partial<Record<SkillId, { correct: number; total: number }>>
  durationUsedSeconds: number
}

export interface MasterySnapshot {
  topicId: string
  masteryScore: number // 0–1, suy ra từ Attempt — công thức đã xác nhận, xem src/modules/mastery/masteryCalc.ts
  lastUpdated: string // ISO 8601
}
// Ghi chú: MasterySnapshot không được lưu trữ trong Phương án A — Mục 9 URD
// cho phép "không cần lưu trữ nếu tính lại được nhanh". Với khối lượng dữ
// liệu hiện tại, masteryCalc.ts tính lại trực tiếp từ Attempt[] mỗi lần cần.

// FR-M01/M02: trạng thái bài kiểm tra đầu vào.
export type DiagnosticStatus = 'completed' | 'skipped'

export interface LearnerProfile {
  candidateAlias: string
  createdAt: string // ISO 8601
}

/**
 * Lộ trình học theo buổi — không có trong Mục 9 URD gốc, bổ sung theo yêu
 * cầu người dùng: "lộ trình dạy học 3 buổi/tuần, 90 phút/buổi, cấu trúc bài
 * dạy giống các trung tâm luyện thi". Nội dung tĩnh (đề mục, chủ điểm, cấu
 * trúc buổi học) nằm trong CurriculumSessionTemplate; ngày học thật được
 * tính động từ ngày hiện tại bởi src/modules/curriculum/schedule.ts (không
 * hard-code ngày trong dữ liệu, để lộ trình luôn đúng dù mở app ngày nào).
 *
 * Cấu trúc theo giai đoạn (xem docs/adr/0004): đối chiếu lộ trình các trung
 * tâm luyện thi (TAK12 tổng hợp 5 giai đoạn; Casalink 4 giai đoạn) cho thấy
 * các trung tâm KHÔNG dạy 36 chủ điểm ngữ pháp theo đúng thứ tự dễ→khó liên
 * tục, mà chia theo giai đoạn lớn: Nền tảng → Nâng cao → Luyện đề tăng tốc
 * (tần suất luyện đề tăng dần khi gần ngày thi) → Nước rút cuối cùng (luyện
 * sâu điểm yếu). `phaseLabel` phản ánh giai đoạn này, dùng để nhóm buổi học
 * trong CurriculumPage — khác với THEMATIC_GROUPS (nhóm theo chủ đề, dùng
 * cho trang Học lý thuyết) ở chỗ một giai đoạn có thể gộp nhiều nhóm chủ đề.
 */
export type SessionFocus =
  | 'orientation'
  | 'grammar'
  | 'review'
  | 'mock-test'
  | 'skill-drill'
  | 'final-exam'
  | 'weekly-test' // bài kiểm tra kiến thức tuần, tự động sinh vào mỗi Chủ nhật
  | 'monthly-test' // bài kiểm tra kiến thức tháng, thay cho weekly-test vào Chủ nhật cuối tháng

export interface LessonPlanBlock {
  label: string // tên hoạt động, ví dụ "Khởi động", "Bài mới"
  minutes: number
  description: string
}

export interface CurriculumSessionTemplate {
  id: string // B01, B02... (buổi học tĩnh từ CURRICULUM_PLAN); bài kiểm tra tuần/tháng sinh động có id W-yyyy-mm-dd / M-yyyy-mm-dd — xem src/modules/curriculum/periodicTests.ts
  order: number // thứ tự hiển thị, gán lại tuần tự sau khi gộp buổi học + bài kiểm tra theo ngày (xem mergeSchedule)
  focus: SessionFocus
  phaseLabel: string // nhãn giai đoạn (kèm icon) dùng để nhóm buổi học trong UI
  title: string
  topicIds: string[] // chủ điểm ngữ pháp NP-xx trọng tâm buổi này (0 hoặc nhiều với buổi ôn tập/luyện đề/kiểm tra)
  vocabTopicId?: string // chủ đề từ vựng TV-xx ôn cùng buổi (học theo chu kỳ lặp lại — spaced repetition)
  blocks: LessonPlanBlock[] // tổng minutes = 90 với buổi học thường; bài kiểm tra tuần/tháng ngắn hơn (45/75 phút)
  homework: string
}

export interface ScheduledSession extends CurriculumSessionTemplate {
  date: string // ISO date (yyyy-mm-dd) — do schedule.ts/periodicTests.ts tính ra
}

// Kết quả tự đánh giá của học sinh sau mỗi buổi học — không có trong URD
// gốc, bổ sung theo yêu cầu người dùng "cộng và trừ xu đối với kết quả mỗi
// buổi học". Một buổi được coi là "đã học" khi và chỉ khi có outcome (xem
// ProgressStore.getSessionOutcomes) — không có khái niệm "đã học nhưng
// chưa chấm kết quả" để tránh 2 nguồn sự thật. Số xu cộng/trừ theo từng
// outcome nằm ở src/modules/curriculum/rewards.ts (business logic, không
// đặt trong domain type).
export type SessionOutcome = 'great' | 'ok' | 'weak'
