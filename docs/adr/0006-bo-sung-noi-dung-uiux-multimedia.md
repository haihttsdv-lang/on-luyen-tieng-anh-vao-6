# ADR 0006 — Triển khai các khuyến nghị rà soát: nội dung, UI/UX, multimedia

- **Ngày:** 2026-08-09
- **Trạng thái:** Đã chốt
- **Nguồn yêu cầu:** [docs/RA-SOAT-VA-GOP-Y-PHAT-TRIEN.md](../RA-SOAT-VA-GOP-Y-PHAT-TRIEN.md) — người dùng yêu cầu "triển khai các nội dung khuyến nghị tại file rà soát".

## Bối cảnh

Bản rà soát toàn diện ngày 08/08/2026 chấm ứng dụng 9/10 về kiến trúc nhưng chỉ **4/10 khối lượng nội dung**, **6/10 giao diện** và **1/10 multimedia**, kèm 25 khuyến nghị có mã (`ND-xx`, `UX-xx`, `MM-xx`) và lộ trình 4 giai đoạn. ADR này ghi lại các quyết định thiết kế phát sinh khi thực hiện — phần nào làm khác khuyến nghị và vì sao.

## Quyết định

### Nội dung (ND)

- **ND-01 — ngưỡng đạt quiz.** Tách thành module riêng `src/modules/lessons/quizThreshold.ts` thay vì sửa tại chỗ trong `LessonQuizPage`, để logic có test đơn vị riêng. Quy tắc: giữ 80% làm chuẩn, nhưng bài **dưới 5 câu luôn được phép sai 1 câu**. Ngưỡng được **hiển thị công khai ngay đầu quiz** — vấn đề gốc không chỉ là con số khắt khe mà là học sinh không biết mình cần đúng bao nhiêu.
- **ND-02 — ngân hàng câu hỏi 185 → 477 câu.** Mọi chủ điểm ngữ pháp đạt ≥ 8 câu; nhóm hay ra nhất (các thì, so sánh, bị động, tường thuật, mệnh đề quan hệ) đạt 12–18 câu. Thêm trường `Question.challenging` đánh dấu câu ở mức vận dụng cao — mỗi chủ điểm có ≥ 2 câu như vậy, đúng lưu ý biên soạn của bản rà soát. **Thêm test tự động canh ngưỡng ≥ 8 câu/chủ điểm** để lần bổ sung nội dung sau không vô tình phá vỡ.
- **ND-03 — mã kỹ năng KN-09.** Bản rà soát đề xuất `KN-03: 8 → 6` và thêm `KN-09: 4`, nhưng như vậy tổng phần Vocabulary & Grammar thành 20 ≠ 18 câu của đề thật. **Đã sửa lại thành `KN-03: 8 → 4` + `KN-09: 4`**, giữ đúng tổng 18.
- **ND-04 — viết lại câu 10 → 27 câu.** Thêm trường `Question.hint` (gợi ý cấu trúc) và chỉ hiện **khi trả lời sai**, đúng cách giáo viên chữa dạng bài này. Phủ đủ 10 dạng biến đổi bắt buộc, mỗi dạng ≥ 2 câu.
- **ND-05 — bài đọc 8 → 15 bài.** Thêm `ReadingPassage.level`. 35 câu hỏi mới có đủ 4 dạng ý chính / suy luận / tham chiếu đại từ / đoán nghĩa theo ngữ cảnh — trước đây gần như chỉ có câu hỏi chi tiết.
- **ND-06 — đề viết 5 → 15 đề.** `sampleAnswer` khóa sau nút "Tôi đã viết xong" và **chỉ mở khi học sinh đã gõ ≥ 20 từ** — chỉ khóa bằng nút bấm thì học sinh sẽ bấm ngay để chép. `checklist` chia hai tầng: tiêu chí riêng của đề (nằm trong dữ liệu) + tiêu chí chung (nằm trong component).
- **ND-07 — mastery từ vựng theo hộp Leitner.** Chọn phương án (b) của bản rà soát. `computeVocabMasteryFromBoxes` quy đổi hộp 1→0 điểm, hộp 5→1 điểm, **lấy trung bình trên toàn bộ thẻ của chủ đề** (thẻ chưa ôn tính như hộp 1) — nếu chỉ tính trên thẻ đã ôn thì lật đúng 3 thẻ đã được "Thành thạo". Danh sách chủ đề từ vựng ở Hồ sơ nay lấy từ **bộ thẻ** chứ không từ câu hỏi, nên không chủ đề nào biến mất khỏi bản đồ nữa. Vẫn lùi về cách tính cũ (theo câu trắc nghiệm) khi chưa ôn đủ 3 thẻ.
- **ND-08 — phần Nghe.** Giữ nguyên ngoài phạm vi, đúng kết luận của bản rà soát.

### Giao diện (UX)

- **UX-02 — bố cục màn hình rộng.** Câu hỏi **có đoạn văn** thì khung nới lên `lg:max-w-6xl` và xếp 2 cột (đoạn văn `lg:sticky` bên trái, câu hỏi bên phải) — mô phỏng đúng cách làm bài trên giấy, mắt không phải cuộn lên xuống. Câu **không có đoạn văn** vẫn giữ `max-w-2xl` theo nguyên tắc độ dài dòng chữ dễ đọc. Các trang danh sách (Học lý thuyết, Thi thử, Luyện tập, Viết đoạn văn) chuyển sang lưới 2–3 cột từ `lg:`, có `h-full` để các ô trong cùng hàng cao bằng nhau.
- **UX-01 — điều hướng.** Thanh ngang chỉ hiện từ `sm:` trở lên; dưới đó là **thanh tab cố định ở đáy màn hình**. Header rút còn 1 dòng (tiêu đề rút gọn dưới `lg:`). `main` có `pb-20 sm:pb-0` để nội dung không bị thanh tab che.
- **UX-03/04 — nút thoát + thanh tiến trình** trong `QuestionRunner`: thanh tiến trình tô màu theo kết quả từng câu (xanh/đỏ/xám), nút Thoát có hộp xác nhận nêu rõ **đã làm bao nhiêu câu và kết quả từng câu vẫn được ghi nhận** — để học sinh không sợ mất trắng.
- **UX-05 — trang chủ.** Hero tĩnh thay bằng `TodaySessionCard`, dùng **đúng `buildFullSchedule` của trang Lộ trình học** nên hai màn hình không bao giờ lệch nhau. Có 3 trạng thái: buổi hôm nay / đang trễ lịch / buổi tiếp theo, kèm thanh tiến độ toàn khóa.
- **UX-07 — phím tắt** `1`–`4` chọn đáp án, `Enter`/`Space` sang câu tiếp; số thứ tự hiện trên từng phương án (chỉ ở `sm:` trở lên, vì trên điện thoại không có bàn phím vật lý).
- **UX-09 — đoạn văn đọc hiểu** tự thu gọn từ câu thứ 2 trở đi của cùng một bài, mở lại được bằng một cú bấm.
- **UX-10 — bản in** dùng `@media print` trong `index.css` (ẩn `header`/`nav`, nền trắng) + `print:hidden` cho cụm điều hướng của trang phụ huynh.

### Multimedia (MM)

- **MM-01/02/03 — Web Speech API.** `speakWord()` vốn nằm riêng trong `FlashcardsPage` được tách thành `src/modules/audio/speak.ts` + component dùng chung `SpeakButton`. Nút tự ẩn khi trình duyệt không hỗ trợ, và **tự hủy giọng đọc khi rời trang** (nếu không, giọng đọc vẫn chạy tiếp ở trang mới). Câu Ngữ âm (KN-08) có nút nghe **từng phương án ở tốc độ chậm** (`rate 0.65`) và nút nghe cả 4 phương án.
- **MM-03 (read-along đầy đủ).** `components/ReadAlongPassage.tsx` **tô sáng đúng từ đang được đọc** bằng `SpeechSynthesisUtterance.onboundary`: cắt đoạn văn thành 3 phần (trước / từ đang đọc / sau) và bọc phần giữa trong `<mark>`. Có thêm nút "🐢 Đọc chậm" cho học sinh đọc yếu. Trình duyệt không bắn `onboundary` thì phần tô sáng đơn giản không xuất hiện — vẫn nghe được bình thường, không vỡ giao diện.
- **MM-04 — sơ đồ trực quan** làm bằng React + Tailwind thuần (không SVG file, không ảnh) nên vẫn chạy trong bản đóng gói 1 file HTML. Ba loại: trục thời gian (các thì), bảng chia động từ, sơ đồ cấu trúc câu tô màu theo vai trò ngữ pháp. Chủ điểm chưa có sơ đồ thì component tự ẩn.
- **MM-05 — emoji minh họa thẻ từ vựng.** Bảng tra `content/vocab/emoji.ts` tách riêng khỏi 420 dòng dữ liệu từ vựng, gắn vào thẻ tại tầng `ContentStore`. **Cố ý chỉ gắn cho từ cụ thể**: gán emoji bừa cho từ trừu tượng (`personality`, `sustainable`, `figure out`) sẽ làm học sinh hiểu sai nghĩa — còn hại hơn là không có hình.
- **MM-06 — hiệu ứng âm thanh** sinh bằng Web Audio API (dao động sin ngắn), không thêm file. Có công tắc ở trang Hồ sơ, lưu trong `localStorage`; tiếng báo sai cố ý **trầm và ngắn, không chói tai**.
- **MM-07 — ghi âm giọng nói.** `components/VoiceRecorder.tsx` dùng `MediaRecorder`, đặt ở flashcard (đọc lại từ) và cuối phần Ví dụ của bài học (đọc lại câu), tạo vòng lặp **nghe mẫu → tự đọc → nghe lại chính mình**.
  **Nguyên tắc riêng tư** (quan trọng vì đây là giọng nói của trẻ em): bản ghi chỉ tồn tại dưới dạng blob URL trong bộ nhớ tab — KHÔNG lưu `localStorage`, KHÔNG vào bản sao lưu, KHÔNG đồng bộ cloud; đổi thẻ hoặc rời trang là mất. Micro được tắt ngay khi dừng ghi (`stream.getTracks().forEach(stop)`) để đèn báo micro của thiết bị tắt hẳn, và blob URL cũ luôn được `revokeObjectURL` để không rò rỉ bộ nhớ.

## Hệ quả

- Ngân hàng nội dung: câu hỏi 185 → **477**, bài đọc 8 → **15**, đề viết 5 → **15**. Bundle chính 721 KB (gzip 206 KB) — tăng chủ yếu do dữ liệu nội dung, vẫn nằm trong ngưỡng chấp nhận được cho ứng dụng chạy hoàn toàn phía client.
- `SkillId` thêm `KN-09` ⇒ mọi `Record<SkillId, ...>` phải cập nhật (`SKILL_LABELS`, blueprint, test schema).
- Test: **75 unit** (thêm `quizThreshold`, `vocabMastery`) + **29 e2e** (thêm `improvements.spec.ts` 9 test, và test thanh tab mobile trong `home.spec.ts`).
- Mọi mục điều hướng nay xuất hiện ở **hai** thanh (ngang + tab dưới) ⇒ test phải khoanh vùng theo `getByRole('navigation', { name, exact: true })`, không tìm liên kết trên toàn trang nữa.

## Lỗi phát hiện thêm khi triển khai

- **`<button>` lồng trong `<button>`** (HTML không hợp lệ, trình duyệt tự tách thẻ và làm hỏng bố cục): nút 🔊 của câu Ngữ âm ban đầu được đặt bên trong nút chọn đáp án. Đã tách thành hai thẻ **anh em** trong một `<div>` bọc ngoài. Tương tự ở quiz cuối bài, nút 🔊 được đưa ra ngoài `<label>` — nếu để bên trong, bấm nút nghe sẽ kích hoạt luôn radio và học sinh vô tình chọn đáp án chỉ vì muốn nghe thử từ đó.
- **Thiếu nhãn `NP-32`–`NP-36` trong `TOPIC_LABELS`**: điều hướng "bài trước/sau" (UX-06) hiển thị trơ mã `NP-32` thay vì tên bài. Đã bổ sung đủ 36 nhãn.

## Việc chưa làm (có chủ đích)

- **ND-08** (phần Nghe): giữ nguyên ngoài phạm vi, đúng kết luận của chính bản rà soát — chỉ xem lại nếu đổi/thêm trường mục tiêu.
