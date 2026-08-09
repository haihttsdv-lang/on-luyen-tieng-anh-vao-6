# ADR 0004 — Thiết kế lại Lộ trình học theo giai đoạn (không tuần tự theo mã chủ điểm)

- **Ngày:** 2026-08-08
- **Trạng thái:** Đã chốt

## Bối cảnh

Lộ trình học (feature bổ sung ngoài URD, xem ghi chú tại `CurriculumSessionTemplate` trong `src/types/domain.ts`) ở phiên bản đầu dạy 36 chủ điểm ngữ pháp tuần tự theo nhóm chủ đề (từ loại → thì → mệnh đề → ...), xen 1 buổi ôn tập + 1 buổi luyện đề sau mỗi nhóm, dàn đều 3 buổi/tuần Thứ Hai/Tư/Sáu.

Người dùng yêu cầu nghiên cứu kỹ giáo trình các trung tâm luyện thi vào 6 (Casalink, MyPas, Up, Xưởng) để điều chỉnh lộ trình cho "phù hợp nhất", nêu rõ **không nhất thiết theo đúng thứ tự phần học lý thuyết**, đồng thời đổi lịch học sang Thứ Ba/Năm/Bảy và luôn bắt đầu từ ngày mở app.

## Nghiên cứu (WebSearch, 2026-08-08)

- **Casalink**: bài viết "Ôn thi chuyên tiếng Anh 6" (casalink.edu.vn) nêu rõ roadmap 4 giai đoạn: *"Ngữ pháp & từ vựng → Đọc hiểu & tự luận → Ngữ âm & luyện nghe → Giải đề & các kỹ năng khi làm đề thi"*. Có 2 lộ trình (dài hạn/ngắn hạn), dạy tích hợp 4 kỹ năng thay vì chỉ ngữ pháp thuần túy.
- **TAK12** (trang tổng hợp tài liệu ôn thi, dùng làm nguồn đối chiếu chính vì có nội dung tường minh nhất): bài "Lộ trình ôn luyện tiếng Anh vào lớp 6 tối ưu" mô tả **5 giai đoạn**:
  1. Đánh giá sơ bộ (0.5–1 tuần) — làm đề các năm trước để xác định trình độ và chủ điểm cần bổ sung.
  2. Nền tảng (4–6 tuần) — ngữ âm, từ vựng, ngữ pháp căn bản + các dạng bài dễ ăn điểm.
  3. Kiến thức thường gặp (3–6 tuần) — ngữ pháp nâng cao + dạng bài phức tạp hơn (đọc hiểu, viết lại câu).
  4. Luyện đề (hàng tuần đến ngày thi) — đề thi thử mới liên tục + ôn nâng cao theo dạng bài.
  5. Ôn luyện cuối cùng (3–6 tuần trước thi) — luyện sâu đúng chủ điểm chưa vững.
  Có thể bỏ qua giai đoạn 2–3 nếu đánh giá sơ bộ đạt ≥9 điểm. Cấu trúc học từng chủ điểm: **lý thuyết → thực hành → kiểm tra "Master level"**.
- **MyPas**: trang khóa luyện viết mô tả có "khung chương trình từ đầu đến cuối" nhưng không công khai chi tiết lộ trình/số buổi.
- **"Up"**: xác định được là **Trung tâm Anh ngữ UP** (anhnguup.com, Cầu Giấy, Hà Nội) — chuyên luyện thi chuyển cấp lớp 6/10 tại đúng khu vực trường mục tiêu (Cầu Giấy) của ADR 0001, tỷ lệ đỗ >85%. Trang chủ hiện là landing page trống, không tra được chi tiết khóa học.
- **"Xưởng"**: vẫn không xác định được trung tâm luyện thi vào 6 nào khớp tên này qua tìm kiếm công khai (giống kết luận ở ADR 0003) — có thể là tên gọi tắt nội bộ không có hiện diện online.

## Quyết định

Áp dụng chung 2 nguồn có dữ liệu tường minh (TAK12 5 giai đoạn, Casalink 4 giai đoạn) — cả hai đều thống nhất ở điểm mấu chốt: **dạy theo giai đoạn lớn (nền tảng → nâng cao → luyện đề), KHÔNG dạy 36 chủ điểm tuần tự theo đúng 1 trật tự cố định xuyên suốt cả khóa, và tăng mạnh tần suất luyện đề khi gần ngày thi**. Thiết kế lại `CURRICULUM_PLAN` (xem `src/content/curriculum/index.ts`) thành 4 giai đoạn:

1. **🧱 Giai đoạn 1 · Nền tảng** (20 chủ điểm dễ ăn điểm, tần suất cao trong đề: từ loại cơ bản, các thì, câu hỏi Wh-/tag cơ bản, động từ khuyết thiếu thông dụng, hòa hợp chủ-vị) → 1 buổi ôn tập + 1 buổi luyện đề chốt giai đoạn.
2. **🚀 Giai đoạn 2 · Nâng cao** (16 chủ điểm còn lại: mệnh đề, điều kiện, bị động, tường thuật, cấu trúc động từ phức tạp, cấu trúc nhấn mạnh, từ dễ nhầm...) → 1 buổi ôn tập + 1 buổi luyện đề chốt giai đoạn.
3. **🎯 Giai đoạn 3 · Luyện đề tăng tốc** (6 buổi: 3 vòng, mỗi vòng xen 1 buổi "luyện chuyên sâu theo dạng bài yếu" + 1 buổi luyện đề đầy đủ) — mô phỏng đúng tinh thần "luyện đề hàng tuần đến ngày thi, ôn nâng cao theo dạng bài" của TAK12 và "Giải đề & kỹ năng làm bài" của Casalink.
4. **🏁 Giai đoạn 4 · Nước rút cuối cùng** (3 buổi thi thử toàn diện định dạng đầy đủ liên tiếp, mỗi buổi đều chữa đề + ôn sâu điểm yếu) — tương ứng giai đoạn 5 TAK12.

Buổi khai giảng (1 buổi, có kiểm tra đầu vào) giữ nguyên ở đầu lộ trình — tương ứng "Giai đoạn 1: Đánh giá sơ bộ" của TAK12.

Đổi lịch học từ Thứ Hai/Tư/Sáu sang **Thứ Ba/Năm/Bảy** và buổi đầu tiên **luôn là ngày mở lộ trình lần đầu** (không chờ tới thứ cố định) — xem `computeScheduleDates` trong `src/modules/curriculum/schedule.ts`. Hạn hoàn thành 31/12/2026 (ADR trước) không đổi.

## Hệ quả

- Tổng số buổi: 54 → 50 (giai đoạn 3 gộp lại còn 6 buổi thay vì rải đều 14 buổi ôn tập/luyện đề như bản cũ).
- `CurriculumSessionTemplate` bỏ field `groupId` (không còn dùng THEMATIC_GROUPS để nhóm hiển thị), thay bằng `phaseLabel` gắn trực tiếp theo 1 trong 4 giai đoạn — tách biệt rõ với trang "Học lý thuyết" (vẫn dùng THEMATIC_GROUPS để tra cứu theo chủ đề, không đổi).
- Thêm `SessionFocus` mới: `'skill-drill'` (buổi luyện chuyên sâu theo dạng bài yếu, khác buổi luyện đề đầy đủ `'mock-test'`).
- Vì "Xưởng" không xác định được, quyết định không tự suy diễn nội dung riêng cho trung tâm này — chỉ áp dụng 2 khung đã đối chiếu được (TAK12, Casalink), đúng tinh thần "không tự bịa nguồn" đã đặt ra ở ADR 0003.

## Nguồn tham khảo

- Casalink — Ôn thi chuyên tiếng Anh 6: https://casalink.edu.vn/blogs/on-thi-chuyen-tieng-anh-6-chuan-bi-hanh-trang-cho-con/
- TAK12 — Lộ trình ôn luyện tiếng Anh vào lớp 6 tối ưu: https://tak12.com/news/n/1322/lo-trinh-on-luyen-tieng-anh-vao-lop-6-toi-uu-cho-2k9
- MyPas — Khóa luyện viết: https://mypas.edu.vn/?p=1874
- Trung tâm Anh ngữ UP: https://www.anhnguup.com/ , https://eduspace.vn/trung-tam-tieng-anh/ha-noi/cau-giay/trung-tam-tieng-anh-up

## Cập nhật 2026-08-08 — lịch tự động đẩy theo tiến độ hoàn thành thực tế

Trước bản cập nhật này, ngày của các buổi học được tính 1 lần từ 1 "ngày bắt đầu lộ trình" cố định (`ProgressStore.getCurriculumStartDate`, chốt lại lúc mở trang lần đầu) — nếu học chậm hơn dự kiến hoặc bỏ buổi, các buổi sau vẫn giữ nguyên ngày đã tính, không phản ánh đúng tiến độ thực tế. Người dùng yêu cầu: "tại mỗi buổi học ghi nhận việc đã hoàn thành và tự động điều chỉnh đẩy thời gian học cho buổi tiếp theo cho phù hợp".

**Thiết kế:**

- `SessionOutcomeRecord` (xem `types/domain.ts`) — kết quả tự đánh giá mỗi buổi nay đi kèm `completedAt` (ISO datetime), do `ProgressStore.setSessionOutcome` tự gán bằng giờ hiện tại lúc gọi.
- `buildAdaptiveSchedule` (mới, thay `buildSchedule` trong `schedule.ts`): buổi **đã hoàn thành** hiển thị đúng `completedAt` (nhật ký lịch sử, không tính lại); buổi **chưa hoàn thành** được xếp lịch bắt đầu từ điểm neo = ngày kế tiếp buổi hoàn thành gần nhất **theo thứ tự lộ trình** (không phải theo thời điểm hoàn thành thực — tránh trường hợp học nhảy cóc làm sai mốc neo), hoặc hôm nay nếu mốc đó đã ở quá khứ hoặc chưa hoàn thành buổi nào.
- Hệ quả tự nhiên: học chậm/bỏ buổi → mốc neo trễ hơn → các buổi sau tự động bị đẩy lùi (nhưng không bao giờ vượt hạn 31/12/2026, nhờ `computeScheduleDates` đã có cơ chế nén lịch). Học nhanh hơn dự kiến → mốc neo sớm hơn → các buổi sau cũng được xếp sớm hơn tương ứng.
- **Không cần lưu "ngày bắt đầu" nữa** — bỏ hẳn `ProgressStore.getCurriculumStartDate`/`setCurriculumStartDate`; `CurriculumPage.tsx` tính lại lịch bằng `useMemo` mỗi khi `outcomes` đổi (thay vì fetch 1 lần lúc mount), nên vừa chấm kết quả 1 buổi là các buổi sau cập nhật ngay trên màn hình.
- Áp dụng nhất quán cho cả bài kiểm tra tuần/tháng (`periodicTests.ts`): nếu đã hoàn thành cũng hiển thị đúng `completedAt` thay vì ngày Chủ nhật được sinh tự động.
