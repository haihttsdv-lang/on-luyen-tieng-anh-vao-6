# ADR 0001 — Chọn Phương án A (client-side thuần)

- **Ngày:** 2026-07-26
- **Trạng thái:** Đã chốt

## Bối cảnh

URD Mục 8 để ngỏ giữa Phương án A (client-side, không backend) và Phương án B (full-stack có backend + database), vì Phương án B mới hỗ trợ được vai trò Giáo viên (FR-M10, YC-11).

## Quyết định

Chọn **Phương án A**: React + TypeScript + Vite, lưu tiến độ trong `localStorage` của trình duyệt, không có máy chủ ứng dụng.

## Lý do

- Quy mô người dùng dự kiến ban đầu: 1–2 học sinh trong gia đình, không có kế hoạch chia sẻ/kinh doanh cho nhiều gia đình khác (Mục 15, câu hỏi 4) — không cần đồng bộ đa thiết bị hay vai trò Giáo viên ngay từ đầu.
- Ưu tiên tốc độ triển khai, chi phí vận hành bằng 0.
- Trường mục tiêu tham chiếu: THCS Cầu Giấy — không ảnh hưởng tới quyết định kiến trúc, chỉ ảnh hưởng tới tỷ trọng dạng bài/nội dung ở Giai đoạn 2 và 5.

## Hệ quả

- Không triển khai FR-M10 (giao diện Giáo viên) và Giai đoạn 6 (Mục 11) trong v1.0.
- Lớp truy cập dữ liệu (`src/data-access/`) bắt buộc đi qua interface `ProgressStore`/`ContentStore` (Mục 8.5), không gọi thẳng `localStorage` từ UI, để có thể thêm implementation `remote/` sau này nếu chuyển sang Phương án B mà không phải viết lại giao diện.
- Nếu sau này số lượng học sinh dùng tăng lên hoặc cần vai trò Giáo viên, cân nhắc viết lại ADR mới để chuyển sang Phương án B.
