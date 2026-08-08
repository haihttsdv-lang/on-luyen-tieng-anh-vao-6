# ADR 0003 — Đối chiếu giáo trình các trung tâm luyện thi + bổ sung chủ điểm còn thiếu

- **Ngày:** 2026-08-08
- **Trạng thái:** Đã chốt

## Bối cảnh

Người dùng yêu cầu đối chiếu nội dung ứng dụng với giáo trình ôn thi vào lớp 6 CLC của các trung tâm được cho là uy tín: Casalink, MyPas, Up, Xưởng. Tra cứu công khai (xem Nguồn) cho kết quả:

- **Casalink**: dùng giáo trình độc quyền dựa trên sách Oxford, không công khai danh mục chủ điểm chi tiết.
- **MyPas**: có khóa ngữ pháp từ cơ bản đến nâng cao, không công khai danh mục chi tiết.
- **"Up"** và **"Xưởng"**: không tìm thấy trung tâm luyện thi vào lớp 6 nào khớp tên này trong kết quả tìm kiếm công khai — có thể là tên viết tắt/gọi tắt khác với tên đăng ký chính thức, hoặc không có hiện diện online đủ để tra cứu. Không đối chiếu được trực tiếp hai nguồn này.
- **TAK12** (trang tổng hợp tài liệu luyện thi, đã dùng làm nguồn cho ADR 0002) có bài "Tổng hợp ngữ pháp tiếng Anh ôn thi vào lớp 6" liệt kê đầy đủ danh mục chủ điểm — dùng làm nguồn đối chiếu chính vì có danh mục tường minh, so được từng đầu mục với Mục 4.1 URD.

## So sánh với Mục 4.1 URD (31 chủ điểm)

Đối chiếu danh mục TAK12 với 31 chủ điểm hiện có, phát hiện 5 chủ điểm xuất hiện phổ biến trong tài liệu luyện thi nhưng **không có** trong Mục 4.1 URD gốc:

| Chủ điểm phát hiện thiếu | Mã mới |
|---|---|
| Câu tồn tại There is/There are | NP-32 |
| too...to / adj + enough + to V | NP-33 |
| Biến đổi từ loại (word form) | NP-34 |
| Đại từ thay thế: one/ones, another/other(s) | NP-35 |
| Câu cầu khiến/sai khiến: make/let/have + O + V | NP-36 |

## Quyết định

1. Mở rộng taxonomy thêm mã **NP-32 đến NP-36** (ngoài phạm vi liệt kê gốc ở Mục 4.1 — bổ sung có căn cứ đối chiếu, không tự suy diễn).
2. Biên soạn đầy đủ bài học + tối thiểu 3 câu quiz/chủ điểm cho cả 5 mã mới, theo đúng khuôn mẫu các chủ điểm trước.
3. Không thêm nội dung cho "các tình huống giao tiếp thường gặp" (mục 1 trong danh mục TAK12) như một bài học ngữ pháp riêng — nội dung này đã được phủ dưới dạng câu hỏi KN-04 (hoàn thành hội thoại) trong ngân hàng luyện tập, bản chất là từ vựng/mẫu câu giao tiếp hơn là quy tắc ngữ pháp.
4. Thêm trang **"Sơ đồ tư duy" (mindmap)** tổng hợp toàn bộ 36 chủ điểm ngữ pháp + 14 chủ đề từ vựng theo nhóm, có thể bấm để đi thẳng tới từng bài học/flashcard — phục vụ tra cứu nhanh, không thay thế trang danh sách bài học đã có.

## Hệ quả

- Tổng chủ điểm ngữ pháp có bài học: 31 → 36.
- Ngân hàng câu hỏi: +15 câu (185 câu tổng).
- Vì NP-32..36 nằm ngoài Mục 4.1 gốc, các quy tắc/công thức tính mastery, blueprint đề thi thử... vẫn hoạt động bình thường vì đều tính toán động theo `topicIds` xuất hiện trong ngân hàng câu hỏi, không phụ thuộc danh sách cứng 31 mã.

## Nguồn tham khảo

- Tổng hợp ngữ pháp tiếng Anh ôn thi vào lớp 6 — TAK12: https://tak12.com/news/n/1413/on-thi-vao-lop-6-tong-hop-cac-bai-on-tap-ngu-phap-tieng-anh-cho-ky-thi-tuyen-sinh-vao-lop-6
- Casalink — trang chủ: https://casalink.edu.vn/
- MyPas — khóa học ngữ pháp: https://mypas.edu.vn/?p=1878
