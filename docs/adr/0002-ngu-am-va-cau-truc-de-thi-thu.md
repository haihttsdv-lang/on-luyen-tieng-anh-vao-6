# ADR 0002 — Đưa Ngữ âm (KN-08) vào phạm vi + đề thi thử mô phỏng cấu trúc THCS Cầu Giấy

- **Ngày:** 2026-07-26
- **Trạng thái:** Đã chốt

## Bối cảnh

URD Mục 13 để KN-08 (Ngữ âm) ngoài phạm vi v1.0 cho tới khi xác minh được trường mục tiêu có thi phần này không (Mục 15, câu hỏi 3). Trường mục tiêu đã chọn ở ADR 0001 là THCS Cầu Giấy.

Khi bắt đầu xây Module Thi thử, người dùng yêu cầu đề thi thử "sát với format thi thật trên thực tế nhất có thể". Tra cứu công khai (TAK12, VnDoc — xem Nguồn) cho thấy cấu trúc đề thi thật của THCS Cầu Giấy:

| Phần | Số câu | Tỷ trọng | Nội dung |
|---|---|---|---|
| Phonetics | 4 | 10% | 2 câu phát âm + 2 câu trọng âm |
| Vocabulary & Grammar | 18 | 45% | 12 câu hoàn thành câu + 4 câu đồng/trái nghĩa + 2 câu hội thoại |
| Reading | 14 | 35% | Đọc hiểu + đọc điền từ |
| Writing | 4 | 10% | 2 câu viết lại câu (bắt đầu cho sẵn) + 2 câu viết lại (từ cho sẵn) |
| **Tổng** | **40** | | **45 phút** |

Nguồn: thời gian làm bài 45 phút; TAK12 (hướng dẫn ôn luyện + cấu trúc đề THCS Cầu Giấy); VnDoc (đề thi thử THCS Cầu Giấy). Đây là các bài phân tích công khai của bên thứ ba, không phải đề thi chính thức — đúng tinh thần Mục 14 URD.

## Quyết định

1. **Đưa KN-08 vào phạm vi v1.0** (đảo ngược một phần quyết định Mục 13), biên soạn 12 câu hỏi ngữ âm mới (6 phát âm + 6 trọng âm) — xem `src/content/questions/index.ts`, nhóm `kn08`.
2. **Thêm chế độ thi thử "Giống đề Cầu Giấy" (40 câu / 45 phút)** bên cạnh 2 mức độ dài chung theo FR-P04 (20 câu/20 phút, 30 câu/30 phút).
3. Vì taxonomy 8 mã KN-xx của URD (Mục 4.3) không có mã riêng cho "hoàn thành câu đơn" hay "đồng/trái nghĩa", quy đổi 4 phần thật của Cầu Giấy sang các mã KN-xx sẵn có theo tỷ lệ **đúng số câu từng nhóm lớn**, xem `src/modules/mock-test/blueprint.ts`:

| Phần thật (Cầu Giấy) | Số câu thật | Mã KN-xx dùng thay | Số câu trong đề mô phỏng |
|---|---|---|---|
| Phonetics | 4 | KN-08 | 4 |
| Vocabulary & Grammar | 18 | KN-03 (hoàn thành câu) + KN-04 (hội thoại) + KN-06 (ngữ pháp/từ vựng, thay cho đồng/trái nghĩa) | 8 + 2 + 8 = 18 |
| Reading | 14 | KN-01 (đọc ngắn) + KN-02 (đọc dài) | 4 + 10 = 14 |
| Writing | 4 | KN-05 (viết lại câu) | 4 |

Quy đổi này khớp đúng số câu ở cấp 4-phần lớn, nhưng **không** tái tạo đúng 100% dạng bài con (ví dụ chưa có dạng "chọn từ đồng/trái nghĩa" riêng — KN-06 "tìm câu đúng" được dùng thay). Ghi nhận đây là giới hạn hiện tại, có thể bổ sung mã KN-xx riêng cho "đồng/trái nghĩa" ở Giai đoạn 5 nếu cần độ chính xác cao hơn.

4. 2 mức độ dài chung (20 câu, 30 câu) dùng cùng tỷ lệ 4 nhóm lớn (10/45/35/10%), co giãn theo tổng số câu.

## Hệ quả

- Bổ sung trường `MockTestResult.bySkill` (không có trong bảng gốc Mục 9) để đủ hiển thị "điểm theo dạng bài" theo FR-P05, song song với `byTopic` đã có sẵn.
- `PracticeBySkillPage` (Luyện tập) thêm lựa chọn luyện riêng KN-08.
- Vì ngân hàng câu hỏi KN-02 hiện chỉ có đúng 10 câu (2 bài đọc × 5 câu, bằng đúng nhu cầu của đề Cầu Giấy), phần Reading của mọi đề thi thử "Giống Cầu Giấy" sẽ luôn dùng cùng 10 câu này cho tới khi bổ sung thêm bài đọc ở Giai đoạn 5 — không vi phạm NFR-08 (đa dạng đề) ở các phần khác nhưng là giới hạn cần biết.

## Nguồn tham khảo

- Cấu trúc đề thi Tiếng Anh vào lớp 6 THCS Cầu Giấy — TAK12: https://tak12.com/news/n/1254/huong-dan-on-luyen-va-bo-de-on-thi-tieng-anh-vao-lop-6-truong-thcs-cau-giay
- Đề thi thử Tiếng Anh vào lớp 6 trường Cầu Giấy — VnDoc: https://vndoc.com/de-thi-tieng-anh-vao-lop-6-truong-cau-giay-232209
