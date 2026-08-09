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
  // Đề Cầu Giấy có 4 câu đồng/trái nghĩa (ADR 0002) nhưng trước đây bị gộp
  // lẫn vào KN-03/KN-04 nên đề thi thử có thể sinh ra 0 câu dạng này — tách
  // riêng mã kỹ năng để blueprint đặt đúng tỷ trọng (ND-03).
  | 'KN-09'

export interface Question {
  id: string
  prompt: string
  options: [string, string, string, string]
  answerIndex: 0 | 1 | 2 | 3
  explain: string
  topicIds: string[] // bắt buộc >= 1, dùng để lọc luyện theo chủ điểm (FR-P03) và tính mastery (FR-M03)
  skillId: SkillId
  passageId?: string // liên kết tới ReadingPassage khi câu hỏi thuộc một bài đọc dài (KN-02)
  // Gợi ý cấu trúc, chỉ hiện SAU khi trả lời sai — cách giáo viên thường
  // chữa dạng viết lại câu (KN-05), xem ND-04.
  hint?: string
  // Đánh dấu câu ở mức vận dụng cao (bẫy quen thuộc trong đề CLC) để bộ đề
  // luôn có đủ câu phân loại, không chỉ câu nhận biết công thức (ND-02).
  challenging?: boolean
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
  // Đề CLC luôn có ít nhất 1 bài "khó" để phân loại: bài `advanced` dài
  // 200–250 từ, có từ mới cần suy đoán theo ngữ cảnh (ND-05). Thiếu trường
  // này thì coi như 'basic'.
  level?: 'basic' | 'advanced'
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
  // Hình minh họa bằng emoji — cách rẻ nhất để thẻ từ vựng có hình ảnh mà
  // không thêm 1 byte tài nguyên nào (MM-05). Không phải từ nào cũng có
  // emoji hợp lý, nên đây là trường tùy chọn.
  emoji?: string
}

export interface WritingPrompt {
  id: string
  title: string
  ideas: string[]
  vocab: string[]
  // Bài mẫu 50–70 từ, CHỈ hiện sau khi học sinh bấm "Tôi đã viết xong" để
  // tránh chép — bước chữa bài quan trọng nhất của kỹ năng viết (ND-06).
  sampleAnswer?: string
  // Tiêu chí để học sinh tự chấm bài viết của mình (ND-06).
  checklist?: string[]
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

// LT-06 (docs/RA-SOAT-LO-TRINH-HOC.md): điểm bài kiểm tra đầu vào — trước
// đây chỉ lưu ĐÃ LÀM hay chưa (`DiagnosticStatus`), không lưu điểm số, nên
// không có gì để cá nhân hóa lộ trình theo trình độ ban đầu. `total` không
// cố định (phụ thuộc `selectDiagnosticQuestions`/ngân hàng câu hỏi hiện có
// lúc làm bài), nên phải lưu kèm để tính đúng tỷ lệ %.
export interface DiagnosticScore {
  correctCount: number
  total: number
}

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
  // Buổi dạy PHƯƠNG PHÁP làm một dạng bài (Ngữ âm, Đọc hiểu, Tìm lỗi sai,
  // Viết lại câu, Viết đoạn văn) — bổ sung theo LT-01 (docs/RA-SOAT-LO-TRINH-HOC.md):
  // trước đây lộ trình chỉ dạy 36 chủ điểm ngữ pháp, bỏ trắng 5/9 dạng bài
  // của đề thật (chiếm 55% số câu). Khác buổi 'grammar' ở chỗ không gắn
  // NP-xx/TV-xx mà gắn `skillId` (KN-xx) — xem CurriculumSessionTemplate.
  | 'skill-lesson'

export interface LessonPlanBlock {
  label: string // tên hoạt động, ví dụ "Khởi động", "Bài mới"
  minutes: number
  description: string
  // PP-06: khối thuộc "phần mở rộng" (không phải 1 trong 4 khối cốt lõi) —
  // chế độ "Học phiên rút gọn" trong Session Runner tự động bỏ qua các khối
  // này để buổi học nhanh hơn mà vẫn đủ nội dung chính, dồn thời gian cho
  // luyện đề. KHÔNG dùng cho buổi kiểm tra/thi thử (nội dung nào cũng cần).
  optional?: boolean
  // PP-06: khối nên có người lớn cùng theo dõi (giảng bài, chữa đề, luyện
  // phát âm) — hiển thị nhắc nhở cho phụ huynh biết lúc nào cần có mặt,
  // KHÔNG chặn học sinh tự học nếu không có người lớn.
  needsAdult?: boolean
}

// PP-04 (docs/RA-SOAT-LO-TRINH-HOC.md) — tiêu chí "coi như đã đạt" của buổi
// học, đối chiếu lại bằng DỮ LIỆU THẬT ở màn hình tổng kết cuối buổi (không
// phải tự học sinh tick tay). `check` giới hạn trong 4 loại vì đó là toàn bộ
// dữ liệu thật đã có sẵn từ `computeSessionCompletion` (PP-03) — không phát
// minh thêm nguồn dữ liệu mới chỉ để phục vụ hiển thị.
export type SuccessCriterionCheck =
  | { type: 'blocksDone' } // đã hoàn thành hết các khối trong buổi (không bấm "Bỏ qua")
  | { type: 'quizMastered' } // Quiz nhanh chủ điểm buổi này đạt trạng thái "Đã nắm"
  | { type: 'vocabProgress'; minRatio: number } // từ vựng ôn cùng buổi đạt tối thiểu minRatio (0–1, tỉ lệ hộp Leitner)
  | { type: 'minAttempts'; count: number } // làm tối thiểu `count` câu luyện tập/luyện đề trong buổi

export interface SuccessCriterion {
  label: string
  check: SuccessCriterionCheck
}

export interface CurriculumSessionTemplate {
  id: string // B01, B02... (buổi học tĩnh từ CURRICULUM_PLAN); bài kiểm tra tuần/tháng sinh động có id W-yyyy-mm-dd / M-yyyy-mm-dd — xem src/modules/curriculum/periodicTests.ts
  order: number // thứ tự hiển thị, gán lại tuần tự sau khi gộp buổi học + bài kiểm tra theo ngày (xem mergeSchedule)
  focus: SessionFocus
  phaseLabel: string // nhãn giai đoạn (kèm icon) dùng để nhóm buổi học trong UI
  title: string
  topicIds: string[] // chủ điểm ngữ pháp NP-xx trọng tâm buổi này (0 hoặc nhiều với buổi ôn tập/luyện đề/kiểm tra)
  vocabTopicId?: string // chủ đề từ vựng TV-xx ôn cùng buổi (học theo chu kỳ lặp lại — spaced repetition)
  // Dạng bài (KN-xx) trọng tâm của buổi 'skill-lesson' (LT-01) — ví dụ KN-08
  // cho 2 buổi Ngữ âm, KN-02 cho 3 buổi Đọc hiểu. Buổi 'grammar' KHÔNG dùng
  // trường này (dùng topicIds); tách riêng vì một buổi kỹ năng dạy PHƯƠNG
  // PHÁP làm dạng bài, không gắn với 1 chủ điểm ngữ pháp/từ vựng cụ thể nào.
  skillId?: SkillId
  blocks: LessonPlanBlock[] // tổng minutes = 60 với buổi học thường; bài kiểm tra tuần/tháng ngắn hơn (30/50 phút)
  homework: string
  // PP-04: "Sau buổi này, em có thể…" — 2–3 câu, hiển thị đầu buổi trong
  // Session Runner để buổi học có mở đầu rõ ràng thay vì vào thẳng khối 1.
  objectives: string[]
  // PP-04: đối chiếu lại ở màn hình tổng kết cuối buổi, tick bằng dữ liệu
  // luyện tập thật (xem SuccessCriterionCheck) — không phải tự đánh giá.
  successCriteria: SuccessCriterion[]
  // PP-08: 1–2 câu gợi ý cho phụ huynh biết buổi này con học gì và có thể
  // hỏi/kiểm tra con thế nào — trước đây `ParentOverviewPage` chỉ có số liệu
  // tổng hợp, không gắn được với buổi học cụ thể nào.
  parentNote?: string
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

// Ghi kèm thời điểm hoàn thành thực tế — bổ sung theo yêu cầu người dùng
// "ghi nhận việc đã hoàn thành và tự động điều chỉnh đẩy thời gian học cho
// buổi tiếp theo cho phù hợp". `completedAt` do ProgressStore tự gán bằng
// giờ hiện tại lúc gọi setSessionOutcome (không phải tham số truyền vào),
// dùng làm mốc neo lịch cho các buổi CHƯA hoàn thành trong
// src/modules/curriculum/schedule.ts (buildAdaptiveSchedule) — học chậm/bỏ
// buổi thì các buổi sau tự bị đẩy lùi; học nhanh hơn dự kiến thì các buổi
// sau cũng được xếp sớm hơn tương ứng.
export interface SessionOutcomeRecord {
  outcome: SessionOutcome
  completedAt: string // ISO 8601 datetime
}
