/**
 * Interface trừu tượng cho lớp truy cập dữ liệu (Mục 8.5 URD).
 * UI/modules chỉ được gọi qua các interface này, không bao giờ gọi thẳng
 * localStorage/IndexedDB hay API. Nhờ vậy, nếu sau này chuyển từ Phương án A
 * sang Phương án B, chỉ cần viết implementation mới (ví dụ src/data-access/remote/)
 * mà không phải sửa lại giao diện.
 */

import type {
  Attempt,
  BoxLevel,
  DiagnosticStatus,
  LearnerProfile,
  MockTestResult,
  Question,
  ReadingPassage,
  SessionOutcome,
  Topic,
  TopicStatus,
  VocabCard,
  WritingPrompt,
} from '../types/domain'

export interface ContentStore {
  getTopics(): Promise<Topic[]>
  getTopic(id: string): Promise<Topic | undefined>
  getQuestions(): Promise<Question[]>
  getReadingPassages(): Promise<ReadingPassage[]>
  getVocabCards(): Promise<VocabCard[]>
  getWritingPrompts(): Promise<WritingPrompt[]>
}

export interface ProgressStore {
  getProfile(): Promise<LearnerProfile | undefined>
  saveProfile(profile: LearnerProfile): Promise<void>

  addAttempt(attempt: Attempt): Promise<void>
  getAttempts(): Promise<Attempt[]>

  getVocabBoxLevel(cardId: string): Promise<BoxLevel | undefined>
  setVocabBoxLevel(cardId: string, boxLevel: BoxLevel): Promise<void>

  getTopicStatuses(): Promise<Record<string, TopicStatus>>
  setTopicStatus(topicId: string, status: TopicStatus): Promise<void>

  getDiagnosticStatus(): Promise<DiagnosticStatus | undefined>
  setDiagnosticStatus(status: DiagnosticStatus): Promise<void>

  // Phần thưởng cho các dạng trò chơi ở Module Luyện tập (không phải yêu cầu
  // gốc trong URD — bổ sung theo yêu cầu người dùng để tăng động lực học).
  getCoins(): Promise<number>
  addCoins(amount: number): Promise<void>

  addMockTestResult(result: MockTestResult): Promise<void>
  getMockTestResults(): Promise<MockTestResult[]>

  // Lộ trình học theo buổi (không có trong URD gốc — xem ghi chú tại
  // CurriculumSessionTemplate trong types/domain.ts). Ngày bắt đầu được
  // chốt lại lần đầu học sinh mở trang Lộ trình học, để lịch không bị dịch
  // chuyển mỗi lần mở lại app.
  getCurriculumStartDate(): Promise<string | undefined>
  setCurriculumStartDate(isoDate: string): Promise<void>
  // Kết quả tự đánh giá mỗi buổi học — 1 buổi được coi là "đã học" khi có
  // outcome; xóa outcome (truyền undefined) tương đương "chưa học". Việc
  // cộng/trừ xu theo outcome do module gọi tính toán (xem
  // src/modules/curriculum/rewards.ts), ProgressStore chỉ lưu trạng thái.
  getSessionOutcomes(): Promise<Record<string, SessionOutcome>>
  setSessionOutcome(sessionId: string, outcome: SessionOutcome | undefined): Promise<void>

  // NFR-05 (độ bền dữ liệu): Phương án A chỉ lưu trong localStorage, dễ mất
  // khi xóa cache hoặc đổi thiết bị. Cho phép xuất/nhập toàn bộ tiến độ dưới
  // dạng file JSON làm lớp an toàn bổ sung (không có trong URD gốc).
  exportAll(): Promise<string>
  importAll(json: string): Promise<void>
}
