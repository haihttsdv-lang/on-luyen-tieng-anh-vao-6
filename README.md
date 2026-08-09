# Ôn luyện Tiếng Anh vào lớp 6

Đặc tả đầy đủ: [`URD-ung-dung-on-luyen-tieng-anh-vao-6.md`](./URD-ung-dung-on-luyen-tieng-anh-vao-6.md). Quyết định kiến trúc và các quyết định phát sinh: [`docs/adr/`](./docs/adr/).

## Kiến trúc

Phương án A (Mục 8.2 URD): client-side thuần, React + TypeScript + Vite, không backend. Tiến độ học sinh lưu trong `localStorage` của trình duyệt, luôn đi qua interface trừu tượng ở [`src/data-access/types.ts`](./src/data-access/types.ts) (`ProgressStore`, `ContentStore`) — xem [ADR 0001](./docs/adr/0001-kien-truc-phuong-an-a.md).

## Chạy dự án

```bash
npm install
npm run dev        # http://localhost:5173
npm run build       # build production vào dist/
npm run build:online # build 1 file HTML duy nhất vào dist-online/ (xem bên dưới)
npm run test         # unit test (Vitest)
npm run e2e           # e2e test (Playwright)
npm run lint           # oxlint
```

## Bản đóng gói 1 file HTML ("online")

`npm run build:online` đóng gói toàn bộ ứng dụng (JS + CSS + nội dung) vào **một file `dist-online/index.html` duy nhất** (~620KB), mở trực tiếp bằng trình duyệt qua `file://` mà không cần máy chủ — dùng `vite-plugin-singlefile`. Vẫn dùng được **Đồng bộ nhiều thiết bị** nếu có mạng (trước đây gọi là bản "offline" và cố tình loại Firebase ra khỏi file vì cho rằng chỉ dùng khi không có Internet; đã đổi tên và bỏ loại trừ đó vì bản thân tính năng đồng bộ cần mạng để chạy — không có lý do gì phải cắt nó khỏi file, còn phần còn lại của ứng dụng vẫn chạy tốt khi không có mạng như trước).

Khác biệt kỹ thuật so với bản hosted: dùng `HashRouter` (URL dạng `#/luyen-tap`) thay vì `BrowserRouter`, vì mở qua `file://` không có máy chủ xử lý đường dẫn — xem [`src/app/router.tsx`](./src/app/router.tsx). Chỉ áp dụng khi build với `--mode online`; bản hosted (`npm run build`) không đổi.

**Lưu ý:** tiến độ lưu trong `localStorage` của file này **tách biệt hoàn toàn** với bản hosted (khác origin: `file://` so với domain đã deploy) và cũng tách biệt giữa các bản sao file HTML khác nhau (ví dụ giữa máy tính và điện thoại) — trừ khi bật **Đồng bộ nhiều thiết bị** (mục dưới đây) để tự động đồng bộ qua cloud. Dùng chức năng **Sao lưu & khôi phục** ở trang Hồ sơ (xuất/nhập file JSON) nếu muốn chuyển thủ công thay vì qua cloud.

## Đồng bộ nhiều thiết bị

Tính năng **tùy chọn** (bổ sung theo yêu cầu người dùng, không có trong URD gốc — xem [ADR 0005](./docs/adr/0005-dong-bo-nhieu-thiet-bi.md)): tự động đồng bộ tiến độ học giữa các thiết bị (điện thoại, máy tính...) qua Firebase Firestore, không cần backend riêng. Đồng bộ **lúc mở và lúc rời ứng dụng** — không giữ kết nối/đồng bộ liên tục trong lúc học, để tiết kiệm hạn mức Firestore miễn phí và không cần mạng ổn định suốt phiên học (có thể bấm "Đồng bộ ngay" bất cứ lúc nào để đồng bộ thủ công giữa chừng). Không bật thì ứng dụng vẫn hoạt động bình thường như trước (chỉ tiến độ cục bộ từng thiết bị, dùng **Sao lưu & khôi phục** thủ công nếu cần chuyển).

**Thiết lập (một lần, ~5 phút, cần tài khoản Google, miễn phí):**

1. Vào [console.firebase.google.com](https://console.firebase.google.com/) → **Add project** → đặt tên bất kỳ → có thể tắt Google Analytics → **Create**.
2. Trong project vừa tạo: **Build → Firestore Database → Create database** → chọn **Start in production mode** → chọn vùng gần Việt Nam (ví dụ `asia-southeast1`) → **Enable**.
3. **Build → Authentication → Get started** → tab **Sign-in method** → bật **Anonymous**.
4. **⚙️ Project settings** (góc trên bên trái) → tab **General** → cuộn xuống "Your apps" → bấm biểu tượng **</>** (Web) → đặt tên app bất kỳ → **Register app** (không cần Firebase Hosting) → Firebase hiện ra khối `firebaseConfig` — copy lại.
5. Trong thư mục dự án, sao chép `.env.example` thành `.env`, dán 6 giá trị từ `firebaseConfig` vào đúng biến tương ứng (`apiKey` → `VITE_FIREBASE_API_KEY`, v.v.).
6. Vẫn trong Firestore, tab **Rules**, thay bằng:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /progress_sync/{syncCode} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   rồi **Publish**. (Chặn truy cập hoàn toàn không xác thực; vì không có tài khoản người dùng thật, coi "mã đồng bộ" như một mật khẩu — ai biết mã đều đọc/ghi được đúng dữ liệu ứng với mã đó, nên giữ kín mã.)
7. Chạy lại `npm run dev` (hoặc deploy lại nếu đã lên Vercel/Netlify — nhớ thêm 6 biến `VITE_FIREBASE_*` vào **Environment Variables** của project trên đó).

Sau khi cấu hình xong, vào **Hồ sơ → ☁️ Đồng bộ nhiều thiết bị**: bấm **"Tạo mã mới"** trên thiết bị đầu tiên, rồi nhập đúng mã đó ở mục **"Liên kết"** trên các thiết bị còn lại. Từ đó mỗi lần **mở ứng dụng**, tiến độ mới nhất từ thiết bị khác (nếu có) sẽ tự kéo về; mỗi lần **rời ứng dụng** (chuyển tab/đóng tab), tiến độ trên máy sẽ tự đẩy lên — không cần thao tác gì thêm, và cũng không tốn dữ liệu di động do giữ kết nối liên tục.

**Lưu ý:** cần Internet để kết nối Firestore lúc mở/rời ứng dụng — hoạt động bình thường ở cả bản hosted (`npm run dev`/đã deploy) lẫn bản đóng gói 1 file HTML (`npm run build:online`) miễn là thiết bị đang mở file đó có mạng.

## Ghi chú môi trường

- `@playwright/test` ở bản `^1.55.1` (đã kiểm tra chạy được trên máy phát triển macOS 12 Monterey — Playwright vẫn cung cấp build Chromium "frozen" riêng cho mac12, dù cảnh báo sẽ không cập nhật tiếp cho hệ điều hành này). Nếu sau này Playwright ngừng hẳn hỗ trợ mac12, cần ghim lại về bản cũ hơn (`npm install -D @playwright/test@1.45.0 && npx playwright install`) cho tới khi nâng cấp macOS.

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
- `src/data-access/` — interface `ProgressStore`/`ContentStore`, implementation `local/` (localStorage), và `index.ts` là điểm import duy nhất cho UI. `cloud/firebaseSync.ts` — đồng bộ nhiều thiết bị qua Firebase Firestore (tùy chọn, xem mục "Đồng bộ nhiều thiết bị" và [ADR 0005](./docs/adr/0005-dong-bo-nhieu-thiet-bi.md)); tái dùng `exportAll/importAll` sẵn có thay vì thêm API mới, không đụng tới interface `ProgressStore`.
- `src/content/` — dữ liệu nội dung, biên soạn mới (không sao chép đề thi thật — Mục 14). Đã rà soát đủ **31/31 chủ điểm ngữ pháp + 14/14 chủ đề từ vựng** (Mục 4.1, 4.2), và đối chiếu thêm với giáo trình các trung tâm luyện thi (Casalink, MyPas, TAK12...) để bổ sung **5 chủ điểm NP-32..36** còn thiếu — xem [ADR 0003](./docs/adr/0003-doi-chieu-giao-trinh-va-mindmap.md):
  - `questions/` — **477 câu hỏi trắc nghiệm**, phủ KN-01–06, KN-08 (Ngữ âm) và KN-09 (Từ đồng/trái nghĩa) — xem [ADR 0002](./docs/adr/0002-ngu-am-va-cau-truc-de-thi-thu.md) và [ADR 0006](./docs/adr/0006-bo-sung-noi-dung-uiux-multimedia.md). **Mọi chủ điểm ngữ pháp đều có ≥ 8 câu** (Mục 4.4 URD), có test tự động canh giữ ngưỡng này. Ngân hàng tách theo file: `grammar-extra-1/2/3.ts` (ngữ pháp), `rewrite.ts` (viết lại câu, kèm `hint`), `synonyms.ts` (đồng/trái nghĩa), `reading-extra.ts` (đọc hiểu).
  - `reading-passages/` — **15 bài đọc hiểu dài** (KN-02), mỗi bài 5 câu hỏi liên kết qua `passageId`; có 2 tầng độ khó (`level: 'basic' | 'advanced'`) và đủ 4 dạng câu hỏi hay ra trong đề CLC (ý chính, suy luận, tham chiếu đại từ, đoán nghĩa theo ngữ cảnh).
  - `writing-prompts/` — **15 đề viết đoạn văn** (KN-07), mỗi đề có `sampleAnswer` (bài mẫu, chỉ mở sau khi học sinh tự viết ≥ 20 từ) và `checklist` tự chấm riêng.
  - `topics/` — 36 bài học ngữ pháp (Nhóm A–E theo Mục 4.1 + Nhóm F bổ sung), nhóm theo [`topic-groups.ts`](./src/content/topic-groups.ts) dùng chung cho danh sách bài học và sơ đồ tư duy.
  - `vocab/` — 420 flashcard, đủ 14/14 chủ đề từ vựng Mục 4.2 (30 thẻ/chủ đề). `vocab/emoji.ts` — bảng tra emoji minh họa gắn vào thẻ ở tầng `ContentStore` (chỉ gắn cho từ cụ thể; từ trừu tượng cố ý để trống).
- `src/components/` — UI dùng chung: `Layout` (điều hướng ngang trên desktop + thanh tab đáy màn hình trên điện thoại), `SpeakButton` (đọc tiếng Anh bằng Web Speech API), `ReadAlongPassage` (nghe bài đọc và **tô sáng từ đang đọc**), `VoiceRecorder` (ghi âm để tự luyện phát âm — bản ghi chỉ nằm trong bộ nhớ tab, không lưu và không đồng bộ đi đâu).
- `src/modules/audio/` — `speak.ts` (Web Speech API) và `sfx.ts` (hiệu ứng âm thanh sinh bằng Web Audio API, có công tắc bật/tắt ở trang Hồ sơ). Không dùng file âm thanh nào, nên bản đóng gói 1 file HTML vẫn chạy đủ.
- `src/modules/lessons/` — module Học lý thuyết hoạt động đầy đủ (FR-L01–L06): danh sách chủ điểm có trạng thái (nhóm theo Nhóm A–F), trang bài học, quiz nhanh (ngưỡng 80% để "Đã nắm"), flashcard với spaced repetition kiểu Leitner (5 hộp). `MindmapPage.tsx` — **"Sơ đồ tư duy"** (bổ sung theo yêu cầu người dùng): tổng hợp toàn bộ 36 chủ điểm ngữ pháp + 14 chủ đề từ vựng trên một trang, nhóm theo màu, bấm vào từng ô để đi thẳng tới bài học/flashcard — phục vụ tra cứu nhanh.
- `src/modules/practice/` — module Luyện tập hoạt động đầy đủ (FR-P01–P03, P07):
  - `QuestionRunner.tsx` — component dùng chung cho mọi phiên luyện (chuẩn/tốc độ/sinh tồn), phản hồi đúng/sai tức thì kèm giải thích ngay sau mỗi câu (FR-P01).
  - Luyện theo dạng bài (KN-01–06) và theo chủ điểm chọn nhiều (FR-P03, lọc trên toàn bộ ngân hàng qua `topic-labels.ts`).
  - Viết đoạn văn (FR-P07): gợi ý dàn ý/từ vựng, đếm số từ, tự kiểm tra — không chấm điểm tự động.
  - **2 trò chơi có thưởng** (bổ sung theo yêu cầu người dùng, không có trong URD gốc): "Đua tốc độ" (đếm ngược 60s) và "Săn kho báu" (3 mạng, hết mạng dừng); cả hai dùng lại `QuestionRunner` biến thể `speed`/`survival`, thưởng xu (`ProgressStore.getCoins/addCoins`) theo chuỗi trả lời đúng liên tiếp, xu hiển thị ở huy hiệu trên `Layout`.
  - **Lưu ý:** FR-P06 (chấm điểm KN-03 "Đọc & điền từ" theo danh sách đáp án chấp nhận được, không phân biệt hoa/thường) giả định câu trả lời dạng nhập chữ tự do; nội dung KN-03 đã biên soạn ở Giai đoạn 1 lại theo dạng trắc nghiệm 4 đáp án (nhất quán với toàn bộ schema `Question`), nên FR-P06 không áp dụng — chấm bằng so khớp `answerIndex` như mọi câu trắc nghiệm khác.
- `src/modules/mock-test/` — module Thi thử hoạt động đầy đủ (FR-P04–P05), mô phỏng sát cấu trúc đề thật THCS Cầu Giấy — xem [ADR 0002](./docs/adr/0002-ngu-am-va-cau-truc-de-thi-thu.md):
  - `blueprint.ts` — 3 chế độ cố định: 20 câu/20 phút, 30 câu/30 phút, và **"Giống đề THCS Cầu Giấy"** 40 câu/45 phút với tỷ trọng đúng số câu 4 phần thật (Ngữ âm 4, Từ vựng-Ngữ pháp 18, Đọc hiểu 14, Viết lại câu 4).
  - `CustomMockTestPage.tsx` — **"Tự tạo đề"**: chọn thủ công hoặc chọn ngẫu nhiên các chủ điểm muốn ôn; đề sinh ra vẫn giữ đúng cấu trúc 40 câu/45 phút như đề Cầu Giấy — `generateMockTest` ưu tiên câu thuộc chủ điểm đã chọn, phần nào không đủ câu sẽ tự lấp đầy bằng câu khác cùng dạng bài để không bao giờ thiếu câu.
  - `generateMockTest.ts` — sinh đề ngẫu nhiên theo blueprint (có thể lọc theo chủ điểm), giữ thứ tự các phần như đề thật, xáo trộn trong từng phần để giảm trùng đề (NFR-08).
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
