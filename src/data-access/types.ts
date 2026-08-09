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
  DiagnosticScore,
  DiagnosticStatus,
  LearnerProfile,
  MockTestResult,
  Question,
  ReadingPassage,
  SessionOutcome,
  SessionOutcomeRecord,
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

  // LT-06: điểm bài kiểm tra đầu vào — dùng để cá nhân hóa lộ trình theo
  // trình độ ban đầu (xem src/modules/curriculum/personalize.ts). Tách khỏi
  // `DiagnosticStatus` (chỉ có completed/skipped) vì URD Mục 9 gốc không có
  // trường điểm số cho thực thể này.
  getDiagnosticScore(): Promise<DiagnosticScore | undefined>
  setDiagnosticScore(score: DiagnosticScore): Promise<void>

  // Phần thưởng cho các dạng trò chơi ở Module Luyện tập (không phải yêu cầu
  // gốc trong URD — bổ sung theo yêu cầu người dùng để tăng động lực học).
  getCoins(): Promise<number>
  addCoins(amount: number): Promise<void>

  addMockTestResult(result: MockTestResult): Promise<void>
  getMockTestResults(): Promise<MockTestResult[]>

  // Lộ trình học theo buổi (không có trong URD gốc — xem ghi chú tại
  // CurriculumSessionTemplate trong types/domain.ts). Kết quả tự đánh giá
  // mỗi buổi học — 1 buổi được coi là "đã học" khi có outcome; xóa outcome
  // (truyền undefined) tương đương "chưa học". `completedAt` do chính
  // implementation gán bằng giờ hiện tại lúc gọi (không phải tham số) —
  // dùng làm mốc neo để tự động đẩy lịch các buổi chưa học (xem
  // src/modules/curriculum/schedule.ts). Việc cộng/trừ xu theo outcome do
  // module gọi tính toán (xem src/modules/curriculum/rewards.ts),
  // ProgressStore chỉ lưu trạng thái.
  getSessionOutcomes(): Promise<Record<string, SessionOutcomeRecord>>
  setSessionOutcome(sessionId: string, outcome: SessionOutcome | undefined): Promise<void>

  // PP-01: ghi nhận đã hoàn thành khối nào trong một buổi học — cho phép
  // "Vào học" (Session Runner) chạy tuần tự từng khối, đóng app giữa chừng
  // rồi mở lại vẫn tiếp tục đúng từ khối dở dang, thay vì buổi học chỉ là
  // một danh sách chữ để đọc suông. Lưu dưới dạng mảng CHỈ SỐ khối đã xong
  // (không phải boolean[] cố định độ dài, vì số khối mỗi buổi khác nhau).
  getSessionBlockProgress(sessionId: string): Promise<number[]>
  setSessionBlockProgress(sessionId: string, doneBlockIndexes: number[]): Promise<void>

  // PP-05: theo dõi đã làm bài tập về nhà của buổi hay chưa — trước đây
  // `homework` chỉ là dòng chữ hiển thị, không lưu trạng thái, nên trang chủ
  // không thể nhắc "còn bài tập buổi trước chưa làm". Cố ý dùng 1 cờ boolean
  // mỗi buổi (không chẻ nhỏ thành checklist từng ý) — đơn giản, đủ cho nhu
  // cầu nhắc nhở, tránh phải viết lại toàn bộ 67 buổi thành dữ liệu có cấu
  // trúc chỉ để phục vụ một danh sách tick nhỏ.
  getHomeworkDone(sessionId: string): Promise<boolean>
  setHomeworkDone(sessionId: string, done: boolean): Promise<void>

  // NFR-05 (độ bền dữ liệu): Phương án A chỉ lưu trong localStorage, dễ mất
  // khi xóa cache hoặc đổi thiết bị. Cho phép xuất/nhập toàn bộ tiến độ dưới
  // dạng file JSON làm lớp an toàn bổ sung (không có trong URD gốc).
  exportAll(): Promise<string>
  importAll(json: string): Promise<void>
}
