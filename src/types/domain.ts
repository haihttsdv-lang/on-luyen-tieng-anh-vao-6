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
