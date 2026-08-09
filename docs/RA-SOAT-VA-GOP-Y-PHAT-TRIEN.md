# Rà soát toàn diện & Góp ý phát triển ứng dụng

> **Ngày rà soát:** 08/08/2026
> **Phạm vi:** Toàn bộ ứng dụng "Ôn luyện Tiếng Anh vào lớp 6" (9.585 dòng mã, 53 file nguồn)
> **Góc nhìn:** (1) Chuyên môn luyện thi vào 6 CLC Hà Nội · (2) Kỹ thuật phần mềm · (3) UI/UX · (4) Multimedia trong giảng dạy
> **Mục đích:** Dùng làm tài liệu làm việc để sửa chữa và phát triển ứng dụng ở các giai đoạn sau. Mỗi mục có mã (`ND-xx`, `UX-xx`, `MM-xx`), mức ưu tiên, và đề xuất cụ thể để có thể chuyển thẳng thành task.

---

## ⚙️ Trạng thái triển khai (cập nhật 09/08/2026)

Toàn bộ khuyến nghị đã được triển khai, trừ **ND-08 (phần Nghe)** — mục mà chính bản rà soát này kết luận là hợp lý khi giữ ngoài phạm vi. Chi tiết quyết định thiết kế: [ADR 0006](./adr/0006-bo-sung-noi-dung-uiux-multimedia.md).

| Mã | Trạng thái | Ghi chú |
|---|---|---|
| ND-01 | ✅ Xong | `modules/lessons/quizThreshold.ts`, có test đơn vị; ngưỡng hiện công khai đầu quiz |
| ND-02 | ✅ Xong | 185 → **477 câu**; mọi chủ điểm ≥ 8 câu, có test canh ngưỡng |
| ND-03 | ✅ Xong | Thêm `KN-09`; blueprint sửa `KN-03: 8→4` + `KN-09: 4` (khác đề xuất gốc — xem ADR 0006) |
| ND-04 | ✅ Xong | 10 → **27 câu**, phủ đủ 10 dạng biến đổi, thêm trường `hint` |
| ND-05 | ✅ Xong | 8 → **15 bài**, 2 tầng độ khó, đủ 4 dạng câu hỏi |
| ND-06 | ✅ Xong | 5 → **15 đề**, `sampleAnswer` + `checklist` riêng từng đề |
| ND-07 | ✅ Xong | Chọn phương án (b): mastery từ vựng theo hộp Leitner |
| ND-08 | ⏸️ Giữ ngoài phạm vi | Đúng kết luận của chính mục này |
| UX-01 | ✅ Xong | Thanh tab đáy màn hình < 640px; header còn 1 dòng |
| UX-02 | ✅ Xong | Câu có đoạn văn: 2 cột `lg:` (đoạn văn sticky trái / câu hỏi phải). Các trang danh sách: lưới 2–3 cột. Câu không có đoạn văn **cố ý giữ** `max-w-2xl` |
| UX-03 | ✅ Xong | Nút Thoát + hộp xác nhận nêu rõ số câu đã làm |
| UX-04 | ✅ Xong | Thanh tiến trình tô màu theo kết quả từng câu |
| UX-05 | ✅ Xong | `TodaySessionCard` dùng chung lịch với trang Lộ trình học |
| UX-06 | ✅ Xong | Điều hướng bài trước/sau theo `LEARNING_SEQUENCE` |
| UX-07 | ✅ Xong | Phím `1`–`4` và `Enter` |
| UX-08 | ✅ Xong | `aria-live` cho phản hồi đúng/sai, `aria-label` cho nút emoji |
| UX-09 | ✅ Xong | Đoạn văn tự thu gọn từ câu thứ 2 của cùng bài đọc |
| UX-10 | ✅ Xong | `@media print` + nút "In báo cáo" |
| MM-01 | ✅ Xong | `modules/audio/speak.ts` + `SpeakButton`; KN-08 nghe được từng phương án (chậm 0.65×) |
| MM-02 | ✅ Xong | Nút nghe từng câu ví dụ + "Nghe tất cả" |
| MM-03 | ✅ Xong | `ReadAlongPassage`: nghe bài đọc, đọc chậm, và **tô sáng từ đang đọc** qua `onboundary` |
| MM-04 | ✅ Xong | `GrammarVisual.tsx`: trục thời gian, bảng chia động từ, sơ đồ cấu trúc câu |
| MM-05 | ✅ Xong | `content/vocab/emoji.ts`, chỉ gắn cho từ cụ thể |
| MM-06 | ✅ Xong | Web Audio API + công tắc bật/tắt ở trang Hồ sơ |
| MM-07 | ✅ Xong | `VoiceRecorder` ở flashcard và bài học; bản ghi chỉ nằm trong bộ nhớ tab, không lưu/không đồng bộ |

**Các con số trong Phần A và Phụ lục bên dưới là số liệu ĐO TẠI THỜI ĐIỂM RÀ SOÁT (08/08/2026)**, giữ nguyên để đối chiếu trước/sau; số liệu hiện hành xem bảng trên và README.

---

## 0. Tóm tắt điều hành

Ứng dụng đã có **bộ khung rất tốt và hiếm gặp ở các sản phẩm tự làm**: lộ trình học 4 giai đoạn bám giáo trình trung tâm, mastery tính theo trọng số hồi quy, spaced repetition kiểu Leitner, đề thi thử mô phỏng đúng cấu trúc Cầu Giấy, và đồng bộ đa thiết bị. Kiến trúc sạch (data-access trừu tượng, 66 unit test + 19 e2e test).

**Ba vấn đề lớn nhất cần xử lý trước khi mở rộng thêm tính năng:**

| # | Vấn đề | Ảnh hưởng |
|---|---|---|
| 1 | **Ngân hàng câu hỏi mỏng**: 28/36 chủ điểm chỉ có đúng 3 câu (URD yêu cầu 8–10 câu/chủ điểm) | Quiz "5 câu" thực tế chỉ 3 câu → ngưỡng đạt 80% biến thành **bắt buộc đúng 3/3 (100%)**. Học sinh học thuộc đáp án sau 2 lượt, điểm mastery bị thổi phồng |
| 2 | **Không có multimedia**: 0 file ảnh/audio/video trong toàn bộ ứng dụng | Học sinh lớp 5 học ngôn ngữ mà không nghe được câu ví dụ; phần Ngữ âm (KN-08) dạy phát âm **hoàn toàn bằng chữ** — phản giáo học pháp |
| 3 | **Giao diện chưa tối ưu cho thiết bị thật**: thanh điều hướng chiếm 3 dòng (~18% màn hình) trên điện thoại; desktop bỏ phí 50% chiều ngang | Học sinh chủ yếu dùng điện thoại/tablet — đây là màn hình bị ảnh hưởng nặng nhất |

**Đánh giá theo trục:**

| Trục | Điểm | Nhận xét |
|---|---|---|
| Kiến trúc & chất lượng mã | 9/10 | Sạch, có test, có ADR ghi lại quyết định. Rất tốt |
| Thiết kế lộ trình sư phạm | 8/10 | Bám sát giáo trình trung tâm, có kiểm tra định kỳ, tự đẩy lịch |
| **Khối lượng nội dung** | **4/10** | Từ vựng đạt chuẩn; câu hỏi/bài đọc/đề viết còn thiếu nhiều |
| **Giao diện & trải nghiệm** | **6/10** | Đẹp, nhất quán, nhưng chưa tối ưu mobile và thiếu nhiều tiện ích học tập |
| **Multimedia** | **1/10** | Chỉ có 1 tính năng duy nhất (đọc từ vựng bằng Web Speech) |
| Khả năng tiếp cận (a11y) | 5/10 | Có focus-visible tốt, nhưng thiếu `aria-live`, thiếu điều hướng bàn phím |

---

## Phần A — Nội dung chuyên môn

### A.1. Đối chiếu khối lượng nội dung với mục tiêu URD (Mục 4.4)

| Loại nội dung | Mục tiêu URD | Hiện có | Tỷ lệ | Trạng thái |
|---|---|---|---|---|
| Câu hỏi/chủ điểm ngữ pháp | 8–10 câu/chủ điểm (~290–360 câu cho 36 chủ điểm) | **185 câu**, 28/36 chủ điểm chỉ có 3 câu | ~55% | 🔴 Thiếu nặng |
| Từ vựng flashcard | 25–30 từ/chủ đề (~380 từ) | **420 từ** (30/chủ đề) | 110% | 🟢 Đạt |
| Bài đọc hiểu dài (KN-02) | 15–20 bài | **8 bài** | ~47% | 🔴 Thiếu |
| Viết lại câu (KN-05) | 20–25 câu | **10 câu** | ~44% | 🔴 Thiếu |
| Tìm lỗi sai (KN-06) | 20–25 câu | **44 câu** | 190% | 🟢 Đạt |
| Đề viết đoạn (KN-07) | 15 chủ đề | **5 đề** | 33% | 🔴 Thiếu |

**Phân bố câu hỏi theo chủ điểm ngữ pháp (đo thực tế):**
- 3 câu: **28 chủ điểm** · 4 câu: 1 · 5 câu: 5 · 7 câu: 1 · 9 câu: 1

---

### ND-01 · 🔴 P0 — Quiz cuối bài thực chất yêu cầu đúng tuyệt đối 100%

**Hiện trạng.** `LessonQuizPage.tsx` lấy `QUIZ_LENGTH = 5` câu, ngưỡng đạt `PASS_RATIO = 0.8`. Nhưng 28/36 chủ điểm chỉ có 3 câu trong ngân hàng, nên `.slice(0, 5)` chỉ trả về 3 câu.

**Hệ quả sư phạm.** Với 3 câu: 2/3 = 66,7% < 80% → **trượt**. Học sinh buộc phải đúng cả 3 câu mới được đánh dấu "Đã nắm". Đây là ngưỡng khắt khe hơn hẳn ý định thiết kế, lại **không được thông báo** — học sinh lớp 5 sai 1 câu do bất cẩn sẽ thấy "mình dốt", đúng kiểu trải nghiệm làm mất động lực mà giáo viên luôn tránh.

**Đề xuất.**
1. **Ngắn hạn (nửa ngày):** hiển thị rõ "Cần đúng X/Y câu" ngay đầu quiz; nếu pool < 5 câu thì hạ ngưỡng theo số câu thực tế (ví dụ dùng `Math.ceil(n * 0.8)` và làm tròn xuống khi n ≤ 3 → cho phép sai 1 câu).
2. **Dài hạn:** bổ sung câu hỏi cho đủ tối thiểu 8 câu/chủ điểm (xem ND-02).

---

### ND-02 · 🔴 P0 — Bổ sung ngân hàng câu hỏi lên 8–10 câu/chủ điểm

**Hiện trạng.** 185 câu / 36 chủ điểm. Cần thêm khoảng **110–180 câu** để đạt mục tiêu URD.

**Vì sao quan trọng (góc nhìn giảng dạy).**
- Với 3 câu/chủ điểm, học sinh **thuộc lòng đáp án** sau 2 lượt luyện. Mastery score (`masteryCalc.ts` lấy 10 lượt gần nhất) khi đó đo trí nhớ vị trí đáp án, **không đo năng lực** → bản đồ năng lực ở Hồ sơ báo "Thành thạo" sai lệch, dẫn tới gợi ý ôn tập sai.
- Buổi "Luyện tập có hướng dẫn" (20 phút) trong lộ trình không đủ câu để lấp đầy.

**Đề xuất — ưu tiên theo tần suất xuất hiện trong đề CLC:**

| Nhóm ưu tiên | Chủ điểm | Số câu nên có |
|---|---|---|
| Ưu tiên 1 (hay ra nhất) | NP-11→16 (các thì), NP-06 (so sánh), NP-21 (bị động), NP-22 (tường thuật), NP-18 (mệnh đề quan hệ) | 12–15 câu |
| Ưu tiên 2 | NP-02 (mạo từ), NP-08 (giới từ), NP-10 (định lượng), NP-20 (điều kiện), NP-23→25 (động từ), NP-33 (too/enough) | 10 câu |
| Ưu tiên 3 | Còn lại | 8 câu |

**Lưu ý biên soạn:** mỗi chủ điểm nên có **ít nhất 2 câu ở mức vận dụng cao** (bẫy quen thuộc trong đề CLC), không chỉ câu nhận biết công thức — hiện đa số câu đang ở mức nhận biết.

---

### ND-03 · 🔴 P0 — Thiếu dạng bài Từ đồng nghĩa / trái nghĩa (4 câu trong đề thật)

**Hiện trạng.** ADR 0002 xác định đề Cầu Giấy có **4 câu đồng/trái nghĩa** trong phần Vocabulary & Grammar. Nhưng `blueprint.ts` quy đổi phần này thành `KN-03 (8) + KN-04 (2) + KN-06 (8)` — **không có mã kỹ năng riêng cho đồng/trái nghĩa**. Ngân hàng chỉ có ~9 câu dạng này, nằm lẫn trong các mã khác.

**Hệ quả.** Đề thi thử "Giống đề Cầu Giấy" **có thể sinh ra 0 câu đồng/trái nghĩa** — sai lệch so với đề thật ở đúng phần học sinh hay mất điểm.

**Đề xuất.**
1. Thêm mã kỹ năng **`KN-09: Từ đồng nghĩa / trái nghĩa`** vào `SkillId`, `SKILL_LABELS`.
2. Cập nhật `CAU_GIAY_BLUEPRINT`: `KN-03: 8 → 6`, thêm `'KN-09': 4` (giữ tổng phần Vocab&Grammar = 18).
3. Biên soạn **20–25 câu** dạng này (đủ để không lặp giữa các lần thi thử).
4. Gắn `topicIds` là các `TV-xx` tương ứng để nuôi bản đồ năng lực từ vựng.

---

### ND-04 · 🟠 P1 — Viết lại câu (KN-05) chỉ 10 câu, chưa phủ hết dạng biến đổi

**Hiện trạng.** 10 câu cho phần chiếm 4/40 câu đề thật (10% điểm) — đây là phần **khó ăn điểm nhất** và phân loại học sinh giỏi.

**Các dạng biến đổi bắt buộc phải có trong đề CLC** (kiểm tra chéo: hiện chưa phủ đều):
`so...that ↔ such...that` · `too...to ↔ not enough to` · `chủ động ↔ bị động` · `trực tiếp ↔ gián tiếp` · `câu điều kiện` · `wish/if only` · `so sánh hơn ↔ so sánh nhất ↔ so sánh bằng` · `because ↔ because of / although ↔ despite` · `It takes... ↔ spend` · `used to`

**Đề xuất.** Nâng lên **25 câu**, mỗi dạng ≥ 2 câu. Bổ sung trường `hint` (gợi ý cấu trúc) hiển thị sau khi trả lời sai — đây là cách giáo viên thường chữa dạng bài này.

---

### ND-05 · 🟠 P1 — Bài đọc hiểu 8/15–20 bài; nội dung chưa phân tầng độ khó

**Hiện trạng.** 8 bài, độ dài khá đồng đều (~150 từ), chủ đề tốt và gần gũi.

**Đề xuất.**
1. Bổ sung **7–12 bài** để đạt mục tiêu, ưu tiên các chủ đề đề CLC hay dùng: môi trường, công nghệ, lễ hội truyền thống, danh lam Việt Nam, tiểu sử nhân vật, biểu đồ/thời khóa biểu (dạng đọc lấy thông tin).
2. **Phân 2 tầng độ khó** (`level: 'basic' | 'advanced'`): bài nâng cao dài 200–250 từ, có từ vựng suy đoán theo ngữ cảnh — đề CLC luôn có 1 bài "khó" để phân loại.
3. Đa dạng **dạng câu hỏi đọc hiểu**, hiện chủ yếu là câu hỏi chi tiết. Cần thêm: câu hỏi ý chính (main idea), suy luận (inference), tham chiếu đại từ ("The word *it* refers to..."), và đoán nghĩa từ (guess meaning from context) — 4 dạng này chiếm tỷ trọng lớn trong đề CLC.

---

### ND-06 · 🟠 P1 — Đề viết đoạn (KN-07) 5/15, và không có gì để học sinh tự đối chiếu

**Hiện trạng.** 5 đề, mỗi đề có gợi ý ý tưởng + từ vựng, học sinh tự viết, **không chấm** (đúng như URD ghi nhận là giới hạn có chủ đích).

**Vấn đề sư phạm.** Học sinh viết xong **không biết mình viết đúng hay sai**. Trong lớp, giáo viên luôn cho xem một bài mẫu sau khi học sinh tự viết — đây là bước học quan trọng nhất của kỹ năng viết.

**Đề xuất.**
1. Bổ sung lên **15 đề**.
2. Thêm trường **`sampleAnswer`** (bài mẫu 50–70 từ) — chỉ hiện **sau khi** học sinh bấm "Tôi đã viết xong", tránh chép.
3. Thêm **`checklist` tự chấm** (5–6 tiêu chí): đủ số từ? có mở–thân–kết? dùng đúng thì? có dùng ≥3 từ vựng gợi ý? có lỗi chính tả? — cho học sinh tự tick, lưu vào tiến độ.

---

### ND-07 · 🟡 P2 — Bản đồ năng lực từ vựng gần như luôn trống

**Hiện trạng.** Mastery cần `MIN_ATTEMPTS_FOR_SCORE = 3` lượt. Nhưng 4 chủ đề từ vựng (TV-03, TV-10, TV-11, TV-13) chỉ có **1 câu hỏi** gắn `topicId`, TV-06 có 2 câu.

**Hệ quả.** Ô năng lực các chủ đề này ở trang Hồ sơ hiển thị "Chưa có dữ liệu" gần như vĩnh viễn, dù học sinh đã học flashcard rất nhiều.

**Đề xuất.** Hoặc (a) bổ sung câu hỏi cho các TV này (kết hợp làm luôn ở ND-03), hoặc (b) tính mastery từ vựng dựa trên **hộp Leitner** (`getVocabBoxLevel`) thay vì chỉ dựa vào câu hỏi trắc nghiệm — cách (b) đúng bản chất hơn vì học sinh học từ vựng bằng flashcard là chính.

---

### ND-08 · 🟡 P2 — Cân nhắc phần Nghe (Listening)

URD Mục 13 đã loại Nghe khỏi phạm vi vì "đa số trường CLC không thi Nghe" — **quyết định này vẫn hợp lý cho Cầu Giấy**. Tuy nhiên lưu ý để cân nhắc sau:
- Casalink dạy đủ 4 kỹ năng gồm Nghe (theo ADR 0004).
- Một số trường CLC khác (Ngoại ngữ – ĐHQG, Nguyễn Tất Thành) **có** phần Nghe.
- Nếu sau này đổi/thêm trường mục tiêu, cần bổ sung `KN-10: Nghe hiểu` + file audio. Nên **xác minh lại đề Cầu Giấy năm gần nhất** trước mỗi mùa thi.

---

## Phần B — Giao diện & Trải nghiệm (UI/UX)

### UX-01 · 🔴 P0 — Thanh điều hướng chiếm 3 dòng trên điện thoại

**Hiện trạng (đo trên viewport 390×844 — iPhone 14):** 6 mục điều hướng + tiêu đề ứng dụng bị wrap thành **3 dòng, chiếm ~150px = 18% chiều cao màn hình**, ở **mọi trang**.

**Vì sao nghiêm trọng.** Học sinh lớp 5 học chủ yếu trên điện thoại/tablet. Mất 18% màn hình vĩnh viễn cho điều hướng là lãng phí rất lớn, đẩy nội dung học xuống dưới nếp gấp.

**Đề xuất.**
- **Mobile (< 640px):** chuyển sang **thanh tab dưới cùng** (bottom navigation) 5 mục, icon + nhãn ngắn — chuẩn mực của mọi ứng dụng học tập trên di động (Duolingo, Khan Academy). Header chỉ giữ tên app + huy hiệu xu, cao 1 dòng.
- **Desktop:** giữ nguyên thanh ngang, nhưng rút gọn tiêu đề để không wrap 2 dòng ở 1280px.

---

### UX-02 · 🟠 P1 — Desktop bỏ phí ~50% chiều ngang

**Hiện trạng.** Hầu hết trang dùng `max-w-2xl` (672px) trên màn hình 1280–1920px.

**Đề xuất.** Dùng layout thích ứng: giữ `max-w-2xl` cho nội dung đọc (bài học — đúng nguyên tắc độ dài dòng chữ dễ đọc), nhưng chuyển sang **lưới 2 cột** cho các trang danh sách (Luyện tập, Lộ trình học, Hồ sơ) ở `lg:` trở lên. Riêng trang làm bài có thể đặt **đoạn văn đọc hiểu bên trái, câu hỏi bên phải** trên desktop — mô phỏng đúng cách làm bài trên giấy.

---

### UX-03 · 🟠 P1 — Không thoát được giữa chừng khi đang luyện tập

**Hiện trạng.** `QuestionRunner.tsx` chỉ hiện nút thoát (`onExit`) ở **màn hình kết quả**. Đang làm dở 20 câu mà muốn dừng thì chỉ còn cách bấm nút Back của trình duyệt (mất toàn bộ tiến trình phiên đó).

**Đề xuất.** Thêm nút "Thoát" ở góc trên, có hộp thoại xác nhận + hiển thị số câu đã làm. Cân nhắc lưu tạm phiên đang dở để "Học tiếp".

---

### UX-04 · 🟠 P1 — Thiếu thanh tiến trình trực quan khi làm bài

**Hiện trạng.** Chỉ có dòng chữ "Câu 3/20".

**Đề xuất.** Thêm thanh tiến trình mảnh phía trên, tô màu theo kết quả từng câu (xanh = đúng, đỏ = sai, xám = chưa làm). Đây là yếu tố tạo động lực đã được chứng minh trong các ứng dụng học tập — học sinh nhìn thấy "sắp xong" sẽ ít bỏ dở.

---

### UX-05 · 🟠 P1 — Trang chủ chưa trả lời câu hỏi "Hôm nay học gì?"

**Hiện trạng.** Trang chủ có hero lớn (chiếm ~1/3 màn hình mobile) với nội dung tĩnh, rồi tới "Gợi ý hôm nay", rồi 5 thẻ điều hướng.

**Vấn đề.** Ứng dụng đã có **Lộ trình học** với buổi học cụ thể của hôm nay — nhưng trang chủ **không hiển thị nó**. Học sinh mở app vào phải tự nghĩ xem nên làm gì.

**Đề xuất.** Thay hero tĩnh bằng **thẻ "Buổi học hôm nay"**: ngày, tên buổi, giai đoạn, nút "Bắt đầu buổi học" đi thẳng vào nội dung. Nếu hôm nay không có buổi → hiện buổi gần nhất + streak (chuỗi ngày học liên tiếp).

---

### UX-06 · 🟠 P1 — Bài học thiếu điều hướng "bài trước / bài sau"

**Hiện trạng.** `LessonDetailPage` chỉ có "← Quay lại danh sách". Học xong bài 5 muốn sang bài 6 phải: quay lại danh sách → cuộn tìm → bấm.

**Đề xuất.** Thêm cụm điều hướng cuối trang: `← Bài trước · Bài 5/36 · Bài sau →` dựa trên `LEARNING_SEQUENCE` sẵn có.

---

### UX-07 · 🟡 P2 — Thiếu điều hướng bằng bàn phím khi làm bài

**Đề xuất.** Phím `1`–`4` chọn đáp án, `Enter`/`Space` sang câu tiếp theo. Rất hữu ích khi luyện đề trên máy tính và là cách luyện phản xạ nhanh cho phần thi tính giờ.

---

### UX-08 · 🟡 P2 — Khả năng tiếp cận: thiếu vùng thông báo động

**Hiện trạng.** Toàn ứng dụng có 8 `aria-label`, **0 `aria-live`**.

**Đề xuất.** Bọc phần phản hồi đúng/sai và phần giải thích trong `aria-live="polite"` để trình đọc màn hình đọc được kết quả. Bổ sung `aria-label` cho các nút chỉ có emoji.

---

### UX-09 · 🟡 P2 — Đoạn văn đọc hiểu lặp lại toàn văn ở mỗi câu

**Hiện trạng.** 5 câu hỏi cùng 1 bài đọc → đoạn văn ~150 từ được hiển thị lại đầy đủ ở cả 5 câu, đẩy câu hỏi xuống dưới.

**Đề xuất.** Trên mobile: cho phép **thu gọn/mở rộng** đoạn văn (mặc định mở ở câu đầu, thu gọn từ câu 2). Trên desktop: bố cục 2 cột, đoạn văn dính (`sticky`) bên trái.

---

### UX-10 · 🟡 P2 — Trang phụ huynh nên có bản in / chia sẻ

**Đề xuất.** Trang `ParentOverviewPage` nên có nút "In báo cáo" (CSS `@media print`) — phụ huynh và giáo viên kèm thường muốn bản giấy để trao đổi hàng tuần.

---

## Phần C — Multimedia trong giảng dạy

> **Đây là khoảng trống lớn nhất của ứng dụng.** Toàn bộ 53 file nguồn có **0 thẻ `<img>`, `<audio>`, `<video>`, `<svg>`**. Tính năng multimedia duy nhất là đọc từ vựng bằng Web Speech API ở `FlashcardsPage`.

### MM-01 · 🔴 P0 — Phần Ngữ âm (KN-08) dạy phát âm mà không có âm thanh

**Hiện trạng.** 12 câu hỏi Ngữ âm (trọng âm, phân biệt âm) trình bày **hoàn toàn bằng chữ**. Học sinh phải tự đoán `/ʌ/` khác `/ɑː/` thế nào.

**Vì sao nghiêm trọng.** Đây là phản giáo học pháp rõ rệt nhất trong ứng dụng — dạy kỹ năng nghe/nói bằng văn bản thuần túy. Học sinh không có nền tảng ngữ âm sẽ **học vẹt mẹo trọng âm** thay vì nghe được sự khác biệt.

**Đề xuất (không cần file audio, không cần Internet).**
Mở rộng hàm `speakWord()` sẵn có ở `FlashcardsPage.tsx` thành **module dùng chung** `src/modules/audio/speak.ts`, rồi:
1. Thêm nút 🔊 vào **từng phương án** của câu hỏi KN-08 để nghe từng từ.
2. Thêm nút "Nghe cả 4 từ" đọc tuần tự.
3. Ở phần giải thích, đọc chậm (`rate: 0.7`) âm tiết mang trọng âm.

**Chi phí:** thấp — tái dùng Web Speech API đã hoạt động tốt, không thêm dependency, không tăng dung lượng bundle.

---

### MM-02 · 🔴 P0 — Câu ví dụ trong bài học không nghe được

**Hiện trạng.** Mỗi bài học có 5 câu ví dụ Anh–Việt, chỉ hiển thị bằng chữ.

**Đề xuất.** Thêm nút 🔊 cho **từng câu ví dụ** trong `LessonDetailPage`. Đây là thay đổi nhỏ (tái dùng `speak.ts` ở MM-01) nhưng tác động sư phạm rất lớn: học sinh nghe được ngữ điệu câu, không chỉ đọc.

**Mở rộng:** nút "Nghe toàn bộ ví dụ" đọc liên tiếp 5 câu — dùng cho phần "Khởi động" 10 phút trong lộ trình.

---

### MM-03 · 🟠 P1 — Bài đọc hiểu nên nghe được (luyện đọc theo)

**Đề xuất.** Nút "🔊 Nghe bài đọc" ở hộp đoạn văn, có thể tạm dừng. Kỹ thuật *read-along* (vừa nghe vừa nhìn chữ) là phương pháp chuẩn để tăng tốc độ đọc và ngữ điệu ở lứa tuổi tiểu học.

**Nâng cao (nếu làm được):** dùng `SpeechSynthesisUtterance.onboundary` để **tô sáng từ đang đọc** — hiệu quả rất cao với học sinh đọc chậm.

---

### MM-04 · 🟠 P1 — Bài học ngữ pháp thiếu sơ đồ trực quan

**Hiện trạng.** Bài học đã trình bày gạch đầu dòng + in đậm rất tốt, nhưng vẫn **thuần chữ**.

**Đề xuất — 3 loại hình trực quan có giá trị dạy học cao nhất, làm bằng SVG/CSS thuần (không cần file ảnh):**

| Loại | Áp dụng cho | Mô tả |
|---|---|---|
| **Trục thời gian (timeline)** | NP-11→16 (các thì) | Mốc quá khứ – hiện tại – tương lai, đánh dấu vùng thời gian của thì đang học. Đây là công cụ dạy thì kinh điển trong lớp |
| **Bảng chia động từ** | NP-11→16, NP-21 | 3 dòng: khẳng định / phủ định / nghi vấn × 3 ngôi. Rõ hơn hẳn văn xuôi |
| **Sơ đồ cấu trúc câu** | NP-18, NP-20, NP-22, NP-26, NP-33 | Tô màu từng thành phần: `S + V + so + adj + that + S + V` |

**Ghi chú kỹ thuật:** làm bằng component React + Tailwind, không tăng dung lượng đáng kể và vẫn hoạt động trong file HTML đóng gói.

---

### MM-05 · 🟠 P1 — Flashcard nên có hình minh họa cho từ cụ thể

**Hiện trạng.** 420 thẻ từ vựng chỉ có chữ + phiên âm + nút phát âm.

**Vì sao quan trọng.** Với danh từ cụ thể (animals, food, body parts, transport — chiếm ~40% ngân hàng), **hình ảnh giúp ghi nhớ trực tiếp không qua tiếng Việt** (direct association), là kỹ thuật dạy từ vựng tiểu học hiệu quả nhất.

**Đề xuất theo thứ tự ưu tiên chi phí:**
1. **Rẻ nhất — emoji:** thêm trường `emoji?: string` cho các từ có emoji tương ứng (dog 🐕, apple 🍎, bus 🚌...). Phủ được khoảng 150–200 từ, **0 KB dung lượng**, hoạt động offline.
2. **Trung bình — SVG icon set:** dùng bộ icon mở (ví dụ OpenMoji SVG) nhúng inline cho các từ không có emoji.
3. **Đắt nhất — ảnh thật:** chỉ nên làm nếu chấp nhận tăng dung lượng file đóng gói.

**Khuyến nghị:** làm phương án 1 trước — tỷ lệ lợi ích/chi phí cao nhất trong toàn bộ danh sách này.

---

### MM-06 · 🟡 P2 — Hiệu ứng âm thanh & phản hồi động cho trò chơi

**Hiện trạng.** 2 trò chơi (Đua tốc độ, Săn kho báu) hoàn toàn im lặng, không có hiệu ứng.

**Đề xuất.** Âm thanh ngắn đúng/sai + hiệu ứng khi lên chuỗi (streak), tạo bằng **Web Audio API** (dao động sin ~200ms) — không cần file, vài chục dòng mã. Kèm **công tắc bật/tắt âm thanh** trong Hồ sơ (bắt buộc — trẻ thường học ở nơi cần yên tĩnh).

---

### MM-07 · 🟡 P2 — Ghi âm để tự luyện nói

**Đề xuất (dài hạn).** Cho phép học sinh **ghi âm đọc lại** câu ví dụ (MediaRecorder API) và nghe lại đối chiếu với giọng máy. Không chấm điểm — chỉ để tự so sánh. Phù hợp nếu sau này mở rộng sang trường có thi Nói.

---

## Phần D — Đề xuất lộ trình triển khai

### Giai đoạn 1 — "Sửa nền móng" (ưu tiên tuyệt đối)
Mục tiêu: nội dung đủ dày để các thuật toán đã có (mastery, gợi ý, sinh đề) hoạt động **đúng**.

1. `ND-01` Sửa ngưỡng đạt quiz theo số câu thực tế *(nửa ngày)*
2. `ND-02` Bổ sung câu hỏi → 8 câu/chủ điểm, ưu tiên nhóm 1 trước *(việc lớn nhất, nên chia nhiều đợt)*
3. `ND-03` Thêm `KN-09` đồng/trái nghĩa + 20 câu + sửa blueprint *(1–2 ngày)*
4. `MM-01` + `MM-02` Tách `speak.ts` dùng chung, thêm nút nghe cho Ngữ âm và câu ví dụ *(1 ngày, lợi ích sư phạm rất cao)*
5. `UX-01` Thanh tab dưới cho mobile *(1 ngày)*

### Giai đoạn 2 — "Trải nghiệm học"
6. `UX-05` Trang chủ hiển thị buổi học hôm nay + streak
7. `UX-03` `UX-04` `UX-06` Nút thoát, thanh tiến trình, điều hướng bài trước/sau
8. `MM-05` Emoji cho flashcard
9. `MM-04` Trục thời gian + bảng chia động từ cho 6 bài về thì

### Giai đoạn 3 — "Đầy đủ nội dung"
10. `ND-04` KN-05 lên 25 câu, phủ đủ 10 dạng biến đổi
11. `ND-05` Bài đọc lên 15–20 bài, phân tầng độ khó, đa dạng dạng câu hỏi
12. `ND-06` 15 đề viết + bài mẫu + checklist tự chấm
13. `MM-03` Nghe bài đọc hiểu

### Giai đoạn 4 — "Hoàn thiện"
14. `UX-02` Layout desktop 2 cột
15. `UX-07` `UX-08` Bàn phím + khả năng tiếp cận
16. `ND-07` Mastery từ vựng theo hộp Leitner
17. `MM-06` Âm thanh trò chơi + công tắc tắt
18. `UX-10` In báo cáo phụ huynh

---

## Phụ lục — Số liệu đo được (08/08/2026)

```
Mã nguồn:        53 file, 9.585 dòng
Test:            66 unit test, 19 e2e test — tất cả pass
Bundle:          582 KB (chính) + 546 KB (Firebase, tải theo yêu cầu)
File all-in-one: 1,17 MB

Câu hỏi:  185 tổng
  KN-01 Đọc hiểu thông báo ngắn      7
  KN-02 Đọc hiểu văn bản dài        40
  KN-03 Đọc và điền từ              62
  KN-04 Hoàn thành hội thoại        10
  KN-05 Viết lại câu                10   ← thiếu (mục tiêu 20–25)
  KN-06 Tìm và sửa lỗi sai          44
  KN-08 Ngữ âm                      12
  KN-09 Đồng/trái nghĩa              0   ← chưa có mã kỹ năng

Chủ điểm ngữ pháp: 36/36 có bài học ✅
  Phân bố câu hỏi: 3 câu×28 · 4×1 · 5×5 · 7×1 · 9×1   ← 78% chủ điểm dưới chuẩn

Từ vựng:      420 thẻ (30/chủ đề × 14) ✅ đạt chuẩn
Bài đọc:      8 bài    ← mục tiêu 15–20
Đề viết:      5 đề     ← mục tiêu 15
Lộ trình:     50 buổi + kiểm tra tuần/tháng ✅

Multimedia:   0 ảnh · 0 audio · 0 video · 0 SVG
              1 tính năng Web Speech (flashcard)
A11y:         8 aria-label · 0 aria-live
```
