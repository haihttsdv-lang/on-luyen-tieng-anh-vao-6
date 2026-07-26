# Ôn luyện Tiếng Anh vào lớp 6

Đặc tả đầy đủ: [`URD-ung-dung-on-luyen-tieng-anh-vao-6.md`](./URD-ung-dung-on-luyen-tieng-anh-vao-6.md). Quyết định kiến trúc và các quyết định phát sinh: [`docs/adr/`](./docs/adr/).

## Kiến trúc

Phương án A (Mục 8.2 URD): client-side thuần, React + TypeScript + Vite, không backend. Tiến độ học sinh lưu trong `localStorage` của trình duyệt, luôn đi qua interface trừu tượng ở [`src/data-access/types.ts`](./src/data-access/types.ts) (`ProgressStore`, `ContentStore`) — xem [ADR 0001](./docs/adr/0001-kien-truc-phuong-an-a.md).

## Chạy dự án

```bash
npm install
npm run dev        # http://localhost:5173
npm run build       # build production vào dist/
npm run build:offline # build 1 file HTML duy nhất vào dist-offline/ (xem bên dưới)
npm run test         # unit test (Vitest)
npm run e2e           # e2e test (Playwright)
npm run lint           # oxlint
```

## Bản offline (1 file HTML)

`npm run build:offline` đóng gói toàn bộ ứng dụng (JS + CSS + nội dung) vào **một file `dist-offline/index.html` duy nhất** (~470KB), mở trực tiếp bằng trình duyệt qua `file://` mà không cần máy chủ hay Internet — dùng `vite-plugin-singlefile`.

Khác biệt kỹ thuật so với bản hosted: dùng `HashRouter` (URL dạng `#/luyen-tap`) thay vì `BrowserRouter`, vì mở qua `file://` không có máy chủ xử lý đường dẫn — xem [`src/app/router.tsx`](./src/app/router.tsx). Chỉ áp dụng khi build với `--mode offline`; bản hosted (`npm run build`) không đổi.

**Lưu ý:** tiến độ lưu trong `localStorage` của bản offline **tách biệt hoàn toàn** với bản hosted (khác origin: `file://` so với domain đã deploy) và cũng tách biệt giữa các bản sao file HTML khác nhau (ví dụ giữa máy tính và điện thoại). Dùng chức năng **Sao lưu & khôi phục** ở trang Hồ sơ (xuất/nhập file JSON) để chuyển tiến độ qua lại giữa các bản.

## Ghi chú môi trường

- `@playwright/test` và trình duyệt Chromium được ghim ở phiên bản 1.45.0 vì máy phát triển đang chạy macOS 12 (Monterey), không được Playwright bản mới hỗ trợ. Khi nâng cấp macOS, có thể `npm install -D @playwright/test@latest && npx playwright install` để dùng bản mới nhất.

## Triển khai lên hosting thật

Dự án đã có git repo cục bộ (commit đầu tiên đã tạo) và cấu hình SPA fallback sẵn cho 2 nền tảng phổ biến (`vercel.json`, `public/_redirects`). Vì việc tạo tài khoản/kết nối hosting cần đăng nhập trình duyệt của bạn, các bước dưới đây bạn tự thực hiện (miễn phí, ~5 phút):

**1. Đẩy code lên GitHub**
```bash
# Tạo repo mới trên https://github.com/new (không tick "Initialize with README")
git remote add origin https://github.com/<ten-tai-khoan>/<ten-repo>.git
git branch -M main
git push -u origin main
```

**2. Kết nối Vercel (khuyến nghị) hoặc Netlify**
- Vercel: vào https://vercel.com/new → "Import Git Repository" → chọn repo vừa tạo. Vercel tự nhận diện Vite, không cần chỉnh gì (build command `npm run build`, output `dist`).
- Netlify: vào https://app.netlify.com/start → chọn repo → build command `npm run build`, publish directory `dist`.

Sau bước này, mỗi lần bạn nhờ tôi sửa code, chỉ cần:
```bash
git add -A && git commit -m "mô tả thay đổi" && git push
```
Vercel/Netlify sẽ tự động build và deploy lại — không cần làm lại bước kết nối.

**Không muốn dùng GitHub?** Có thể deploy thủ công bằng CLI (không cần git, nhưng vẫn cần đăng nhập tài khoản):
```bash
npm run build
npx vercel --prod       # hoặc: npx netlify deploy --prod --dir=dist
```

## Cấu trúc thư mục

Xem Mục 10 của URD. Trạng thái hiện tại — đã đổi thứ tự Mục 11 (Học lý thuyết trước Luyện tập, theo YC-01):

- `src/types/domain.ts` — type theo schema Mục 9, có bổ sung so với bảng gốc:
  - `ReadingPassage` — Question không có chỗ chứa văn bản đọc dùng chung cho nhiều câu hỏi KN-02.
  - `Topic.commonMistakes` — FR-L02 yêu cầu "lỗi thường gặp" nhưng bảng gốc Mục 9 không liệt kê trường này.
  - `VocabCard` **không** có `boxLevel` tĩnh — hộp Leitner là tiến độ riêng của học sinh, lưu qua `ProgressStore.getVocabBoxLevel/setVocabBoxLevel`, không phải nội dung tĩnh.
- `src/data-access/` — interface `ProgressStore`/`ContentStore`, implementation `local/` (localStorage), và `index.ts` là điểm import duy nhất cho UI.
- `src/content/` — dữ liệu nội dung, biên soạn mới (không sao chép đề thi thật — Mục 14):
  - `questions/` — 86 câu hỏi trắc nghiệm: 55 câu luyện tập (KN-01–06) + 19 câu quiz nhanh cho bài học Nhóm B + 12 câu Ngữ âm (KN-08, xem [ADR 0002](./docs/adr/0002-ngu-am-va-cau-truc-de-thi-thu.md)).
  - `reading-passages/` — 2 bài đọc hiểu dài (KN-02), mỗi bài 5 câu hỏi liên kết qua `passageId`.
  - `writing-prompts/` — 5 đề viết đoạn văn (KN-07).
  - `topics/` — 6 bài học Nhóm B (NP-11–16, Thì động từ), mẫu xác thực mô hình module Học lý thuyết.
  - `vocab/` — 14 flashcard chủ đề TV-07 (Thể thao & sở thích).
- `src/modules/lessons/` — module Học lý thuyết hoạt động đầy đủ (FR-L01–L06): danh sách chủ điểm có trạng thái, trang bài học, quiz nhanh (ngưỡng 80% để "Đã nắm"), flashcard với spaced repetition kiểu Leitner (5 hộp).
- `src/modules/practice/` — module Luyện tập hoạt động đầy đủ (FR-P01–P03, P07):
  - `QuestionRunner.tsx` — component dùng chung cho mọi phiên luyện (chuẩn/tốc độ/sinh tồn), phản hồi đúng/sai tức thì kèm giải thích ngay sau mỗi câu (FR-P01).
  - Luyện theo dạng bài (KN-01–06) và theo chủ điểm chọn nhiều (FR-P03, lọc trên toàn bộ ngân hàng qua `topic-labels.ts`).
  - Viết đoạn văn (FR-P07): gợi ý dàn ý/từ vựng, đếm số từ, tự kiểm tra — không chấm điểm tự động.
  - **2 trò chơi có thưởng** (bổ sung theo yêu cầu người dùng, không có trong URD gốc): "Đua tốc độ" (đếm ngược 60s) và "Săn kho báu" (3 mạng, hết mạng dừng); cả hai dùng lại `QuestionRunner` biến thể `speed`/`survival`, thưởng xu (`ProgressStore.getCoins/addCoins`) theo chuỗi trả lời đúng liên tiếp, xu hiển thị ở huy hiệu trên `Layout`.
  - **Lưu ý:** FR-P06 (chấm điểm KN-03 "Đọc & điền từ" theo danh sách đáp án chấp nhận được, không phân biệt hoa/thường) giả định câu trả lời dạng nhập chữ tự do; nội dung KN-03 đã biên soạn ở Giai đoạn 1 lại theo dạng trắc nghiệm 4 đáp án (nhất quán với toàn bộ schema `Question`), nên FR-P06 không áp dụng — chấm bằng so khớp `answerIndex` như mọi câu trắc nghiệm khác.
- `src/modules/mock-test/` — module Thi thử hoạt động đầy đủ (FR-P04–P05), mô phỏng sát cấu trúc đề thật THCS Cầu Giấy — xem [ADR 0002](./docs/adr/0002-ngu-am-va-cau-truc-de-thi-thu.md):
  - `blueprint.ts` — 3 chế độ: 20 câu/20 phút, 30 câu/30 phút, và **"Giống đề THCS Cầu Giấy"** 40 câu/45 phút với tỷ trọng đúng số câu 4 phần thật (Ngữ âm 4, Từ vựng-Ngữ pháp 18, Đọc hiểu 14, Viết lại câu 4).
  - `generateMockTest.ts` — sinh đề ngẫu nhiên theo blueprint, giữ thứ tự các phần như đề thật, xáo trộn trong từng phần để giảm trùng đề (NFR-08).
  - `MockTestRunner.tsx` — có tính giờ, điều hướng tự do giữa các câu qua bảng số câu, **không** phản hồi đúng/sai ngay (khác Luyện tập) — chỉ chấm sau khi nộp bài, đúng FR-P05: điểm tổng, điểm theo dạng bài, điểm theo chủ điểm (yếu nhất trước), và bảng xem lại từng câu.
- `src/modules/mastery/` — module Hồ sơ & Lộ trình cá nhân hóa hoạt động đầy đủ (FR-M01–M09). Công thức mastery và ngưỡng phân loại đã xác nhận với người dùng trước khi cài đặt (Mục 0.6):
  - `masteryCalc.ts` — **FR-M03**: trung bình có trọng số của tối đa 10 lượt làm gần nhất/chủ điểm, trọng số giảm dần tuyến tính theo độ cũ, cần tối thiểu 3 lượt mới hiển thị điểm. **FR-M04**: <50% Cần ôn lại, 50–80% Đang tiến bộ, >80% Thành thạo. Có unit test riêng (`tests/unit/masteryCalc.test.ts`).
  - `DiagnosticTestPage.tsx` — **FR-M01/M02**: bài kiểm tra đầu vào ~26 câu phủ đa dạng chủ điểm (dùng lại `QuestionRunner`), có thể bỏ qua; nếu bỏ qua thì mọi chủ điểm ở trạng thái "chưa có dữ liệu" và gợi ý dùng lộ trình nền tảng mặc định.
  - `getSuggestions.ts` — **FR-M06/M07/M08**: tối đa 3 gợi ý, ưu tiên chủ điểm yếu nhất trong số đã luyện ≥1 lần (chủ điểm chưa luyện không bị coi là yếu), kết hợp gợi ý ôn flashcard sắp quên, có lý do minh bạch (NFR-07) — dùng chung ở cả `HomePage` (YC-06) và `MasteryPage`.
  - `MasteryPage.tsx` — **FR-M05**: bản đồ năng lực dạng lưới, 3 nhóm Ngữ pháp/Từ vựng/Kỹ năng, màu theo 4 mức.
  - `ParentOverviewPage.tsx` — **FR-M09**: số buổi học trong tuần, điểm thi thử gần nhất, 2–3 chủ điểm yếu nhất, ngôn ngữ đơn giản không thuật ngữ kỹ thuật.
- `src/app/` — điểm khởi chạy, router, trang chủ (có widget "Gợi ý hôm nay").
- `src/components/` — UI dùng chung (`Layout` có huy hiệu xu), theme "Game/Level-up" (màu sắc tươi sáng, icon, huy hiệu) phù hợp học sinh nam lớp 5.
- `tests/unit/` — `content.schema.test.ts` (toàn bộ ngân hàng nội dung), `masteryCalc.test.ts`, `getSuggestions.test.ts`.
- `tests/e2e/` — `lessons.spec.ts`, `practice.spec.ts`, `mock-test.spec.ts`, `mastery.spec.ts` (kiểm tra đầu vào, bản đồ năng lực, trang phụ huynh, gợi ý).
