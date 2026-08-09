// Tên hiển thị ngắn gọn cho toàn bộ 31 chủ điểm ngữ pháp + 14 chủ đề từ vựng
// (Mục 4.1, 4.2 URD). Dùng cho bộ chọn "Luyện theo chủ điểm" (FR-P03) khi
// chủ điểm đó chưa có bài học lý thuyết đầy đủ (Topic) — xem Giai đoạn 5.
export const TOPIC_LABELS: Record<string, string> = {
  'NP-01': 'Danh từ số ít/số nhiều, đếm được/không đếm được',
  'NP-02': 'Mạo từ a/an/the',
  'NP-03': 'Đại từ nhân xưng, tính từ & đại từ sở hữu',
  'NP-04': 'Đại từ bất định; đại từ/trạng từ quan hệ',
  'NP-05': 'Tính từ: thứ tự, đuôi -ed/-ing',
  'NP-06': 'So sánh tính từ/trạng từ',
  'NP-07': 'Trạng từ chỉ tần suất, cách thức',
  'NP-08': 'Giới từ thời gian, nơi chốn',
  'NP-09': 'Liên từ',
  'NP-10': 'Từ định lượng: some/any, much/many...',
  'NP-11': 'Hiện tại đơn',
  'NP-12': 'Hiện tại tiếp diễn',
  'NP-13': 'Quá khứ đơn',
  'NP-14': 'Quá khứ tiếp diễn',
  'NP-15': 'Hiện tại hoàn thành',
  'NP-16': 'Tương lai đơn (will) & used to',
  'NP-17': 'Câu hỏi Wh-/How, câu hỏi đuôi',
  'NP-18': 'Mệnh đề quan hệ',
  'NP-19': 'Mệnh đề trạng ngữ',
  'NP-20': 'Câu điều kiện loại 0 và loại 1',
  'NP-21': 'Câu bị động',
  'NP-22': 'Câu tường thuật/gián tiếp',
  'NP-23': 'Động từ khuyết thiếu',
  'NP-24': 'Danh động từ & động từ nguyên thể',
  'NP-25': 'Cấu trúc với V-ing/to-V khác',
  'NP-26': 'so...that / such...that',
  'NP-27': 'Đồng tình: so, too, either, neither',
  'NP-28': 'Would like, would rather',
  'NP-29': 'Câu ước: wish, if only',
  'NP-30': 'Hòa hợp chủ ngữ – động từ',
  'NP-31': 'Cặp từ dễ nhầm lẫn',
  // NP-32..36: bổ sung sau khi đối chiếu giáo trình các trung tâm luyện thi
  // (docs/adr/0003). Thiếu nhãn ở đây thì các chỗ tra cứu theo mã (bộ chọn
  // chủ điểm, điều hướng bài trước/sau — UX-06) hiển thị trơ mã "NP-32".
  'NP-32': 'Câu tồn tại: There is/There are',
  'NP-33': 'too...to / adj + enough + to V',
  'NP-34': 'Biến đổi từ loại (word form)',
  'NP-35': 'Đại từ thay thế: one/ones, another/other(s)',
  'NP-36': 'Câu cầu khiến: make/let/have + O + V',
  'TV-01': 'Gia đình & bản thân',
  'TV-02': 'Trường học & môn học',
  'TV-03': 'Nhà cửa & đồ vật trong nhà',
  'TV-04': 'Thức ăn & đồ uống',
  'TV-05': 'Động vật & thiên nhiên',
  'TV-06': 'Thời tiết & các mùa',
  'TV-07': 'Thể thao & sở thích',
  'TV-08': 'Nghề nghiệp',
  'TV-09': 'Thành phố, phương hướng & phương tiện giao thông',
  'TV-10': 'Sức khỏe & cơ thể người',
  'TV-11': 'Ngày lễ, văn hóa Việt Nam & thế giới',
  'TV-12': 'Công nghệ & truyền thông',
  'TV-13': 'Môi trường & bảo vệ thiên nhiên',
  'TV-14': 'Cụm động từ & thành ngữ thông dụng',
}

export function getTopicLabel(topicId: string): string {
  return TOPIC_LABELS[topicId] ?? topicId
}
