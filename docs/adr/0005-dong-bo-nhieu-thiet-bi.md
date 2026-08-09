# ADR 0005 — Đồng bộ tiến độ học tự động giữa nhiều thiết bị qua Firebase

- **Ngày:** 2026-08-08
- **Trạng thái:** Đã chốt

## Bối cảnh

ADR 0001 chọn Phương án A (client-side thuần, không backend) cho quy mô 1–2 học sinh, tiến độ lưu trong `localStorage` của từng trình duyệt. Hệ quả: tiến độ **không tự chuyển được** giữa các thiết bị (điện thoại ⇄ máy tính) hay giữa các trình duyệt khác nhau trên cùng máy — chỉ có cách thủ công là **Sao lưu & khôi phục** (xuất/nhập file JSON, đã có sẵn, đáp ứng NFR-05).

Người dùng yêu cầu bổ sung tính năng đồng bộ **tự động** để học trên nhiều thiết bị. Vì ứng dụng cố tình không có backend riêng (ADR 0001), việc này bắt buộc phải dùng một dịch vụ lưu trữ trên mạng nào đó.

## Các lựa chọn cân nhắc

Đã hỏi người dùng lựa chọn giữa: Firebase, Supabase, nâng cấp Xuất/Nhập thủ công (QR code), hoặc để Claude tự chọn. Người dùng chọn **để Claude tự quyết định giải pháp tốt nhất**.

| Lựa chọn | Ưu điểm | Nhược điểm |
|---|---|---|
| **Firebase Firestore** | Miễn phí (gói Spark) đủ dùng quy mô 1–2 học sinh; SDK JS chính thức, real-time listener sẵn có (`onSnapshot`) — không cần tự viết polling; tài liệu/cộng đồng lớn, dễ tạo project không cần biết lập trình backend | Phụ thuộc Google; cấu hình ban đầu cần ~5 phút thao tác trên console |
| Supabase | Tương tự Firebase, mã nguồn mở | Ít khác biệt thực chất với Firebase ở quy mô này; không có lợi thế rõ rệt để đổi |
| Chỉ nâng cấp Xuất/Nhập thủ công | Không cần tài khoản/dịch vụ ngoài | Không thỏa yêu cầu "tự động" — vẫn phải chủ động thao tác mỗi lần đổi thiết bị |

**Quyết định: dùng Firebase Firestore.** Realtime listener có sẵn giúp bản kéo-về gần như tức thời mà không cần tự dựng cơ chế polling hay WebSocket, và việc tạo project qua console.firebase.google.com được đánh giá dễ tiếp cận nhất với người dùng không rành kỹ thuật.

## Thiết kế

- **Không thêm API mới cho từng loại dữ liệu ở tầng `ProgressStore`.** Tái dùng nguyên `exportAll()`/`importAll()` đã có (NFR-05) — cả cục bộ (file JSON) và cloud đều dùng chung 1 định dạng dữ liệu, chỉ khác "nơi lưu trữ trung gian".
- **Document Firestore duy nhất mỗi mã đồng bộ:** `progress_sync/{syncCode}` chứa `{ data: <json từ exportAll()>, updatedAt, updatedBy }`. Không tách theo từng loại tiến độ — đơn giản hơn, phù hợp quy mô nhỏ.
- **"Mã đồng bộ"** (8 ký tự, sinh ngẫu nhiên, bỏ ký tự dễ nhầm 0/O/1/I/L) đóng vai trò vừa là khóa tra cứu document vừa là "mật khẩu" — không xây hệ thống tài khoản người dùng thật (email/mật khẩu) vì không cần thiết ở quy mô gia đình. Kết hợp Firebase Anonymous Auth để Firestore Rules có thể chặn truy cập hoàn toàn không xác thực (`request.auth != null`), dù không phân biệt được "ai" trong số những người biết mã.
- **Xung đột:** last-write-wins theo mốc thời gian (xem "Cập nhật" bên dưới). Không xây cơ chế merge — chấp nhận được ở quy mô 1–2 học sinh, hai thiết bị hiếm khi sửa đồng thời cùng một lúc. Cảnh báo rõ trong UI khi liên kết mã có sẵn: dữ liệu cục bộ sẽ bị ghi đè bởi dữ liệu cloud.
- Cần Internet để gọi Firestore — hoạt động ở mọi bản build miễn thiết bị có mạng (xem "Cập nhật 2026-08-08 (2)" bên dưới về bản đóng gói 1 file HTML).

## Cập nhật 2026-08-08 — đổi từ đồng bộ liên tục sang đồng bộ lúc mở/rời ứng dụng

Bản đầu tiên đồng bộ **liên tục**: lắng nghe realtime (`onSnapshot`) suốt phiên làm việc, và tự đẩy dữ liệu lên cloud (debounce 2 giây) sau mỗi thay đổi cục bộ (sự kiện `ol6:progress-changed`, phát từ mọi lần ghi ở `localProgressStore.ts`). Người dùng phản hồi không muốn giữ kết nối/đồng bộ online liên tục, yêu cầu đổi sang **chỉ đồng bộ lúc mở và lúc rời ứng dụng**. Đã đổi:

- **Bỏ hẳn `onSnapshot`** (không còn lắng nghe realtime) và bỏ việc lắng nghe `ol6:progress-changed` để tự đẩy lên — `firebaseSync.ts` giờ chỉ gọi Firestore tại 3 thời điểm rõ ràng, không có kết nối/tiến trình nền nào chạy giữa các thời điểm đó:
  1. **Mở ứng dụng** (`initAutoSync`, gọi 1 lần khi `Layout` mount nếu đã có mã lưu sẵn): `getDoc` một lần — nếu dữ liệu cloud mới hơn lần đồng bộ gần nhất trên máy này thì kéo về (`importAll`), ngược lại đẩy dữ liệu hiện tại lên (bù cho các thay đổi từ phiên trước chưa kịp đẩy).
  2. **Rời ứng dụng** (`visibilitychange` → `hidden`, và `pagehide`): đẩy dữ liệu lên 1 lần, best-effort (các sự kiện này không đảm bảo 100% chạy xong nếu trình duyệt đóng tiến trình đột ngột, nhưng là cách đáng tin cậy nhất hiện có cho SPA — đáng tin hơn `beforeunload`/`unload` vốn bị nhiều trình duyệt di động bỏ qua).
  3. **Bấm "Đồng bộ ngay"** (`syncNow`, thủ công): làm cả hai bước trên ngay lập tức, cho người dùng chủ động đồng bộ giữa chừng nếu muốn, không phải đợi rời ứng dụng.
- **So sánh mốc thời gian thay vì so `updatedBy` liên tục:** vì không còn `onSnapshot`, không cần cờ `suppressNextPush` để chống vòng lặp đẩy-kéo-đẩy nữa (không có gì lắng nghe realtime để tạo vòng lặp). Thay vào đó, lưu `ol6.sync.lastSyncedAt` (epoch ms, `localStorage`) mỗi khi đẩy/kéo thành công; lúc mở ứng dụng, chỉ kéo về nếu `updatedAt` trên cloud mới hơn mốc này — tránh kéo về dữ liệu không đổi mỗi lần mở app.
- **Hệ quả tích cực ngoài dự kiến:** giảm đáng kể số lượt đọc/ghi Firestore (quan trọng vì gói miễn phí Spark có hạn mức) — trước đây mỗi thao tác nhỏ (mỗi câu trả lời, mỗi lần tick "Đã học buổi này"...) đều kích hoạt 1 lượt ghi; giờ tối đa 2 lượt ghi/phiên sử dụng (lúc mở + lúc rời) trừ khi bấm "Đồng bộ ngay" thêm.

## Cập nhật 2026-08-08 (2) — đổi tên bản đóng gói 1 file HTML từ "offline" sang "online", không còn loại trừ Firebase

Bản đóng gói 1 file HTML (`vite --mode offline`, xem README) ban đầu cố tình **loại hẳn SDK Firebase** ra khỏi bundle qua điều kiện tĩnh `import.meta.env.MODE === 'offline'` lúc build, với giả định file này chỉ dùng khi không có Internet nên Đồng bộ nhiều thiết bị (vốn cần mạng) không có ý nghĩa. Người dùng yêu cầu đổi lại: **tích hợp Đồng bộ nhiều thiết bị vào chính file đóng gói này**, không tách riêng bản "offline" nữa.

- Đổi tên chế độ build từ `offline` → `online` (`npm run build:online`, thư mục ra `dist-online/`) — xem `vite.config.ts`, `package.json`, `src/app/router.tsx`.
- Bỏ hẳn điều kiện loại trừ Firebase khỏi bundle: `loadFirebaseSync` ở `Layout.tsx`/`CloudSyncSection.tsx` giờ luôn là `() => import('.../firebaseSync')`, không còn nhánh `undefined`. Chunk Firebase vẫn tách riêng và chỉ tải khi thật sự có mã đồng bộ (lazy `import()`), nhưng không còn bị loại khỏi bundle theo chế độ build nữa.
- Bản chất không đổi: file vẫn dùng `HashRouter` (không có máy chủ xử lý URL) và vẫn hoạt động đầy đủ khi không có Internet — chỉ riêng tính năng Đồng bộ nhiều thiết bị (vốn luôn cần mạng, ở mọi chế độ build) mới cần kết nối.

## Hệ quả

- Thêm dependency `firebase` (SDK client, không cần cài đặt máy chủ).
- `localProgressStore.ts`: mọi lần ghi dữ liệu phát sự kiện DOM `ol6:progress-changed` (qua `writeJson`) — hiện chỉ còn dùng để `Layout.tsx` cập nhật số xu hiển thị ngay trên cùng trang, không còn dùng để kích hoạt đồng bộ cloud (xem mục "Cập nhật" ở trên).
- Tính năng hoàn toàn tùy chọn: không cấu hình `VITE_FIREBASE_*` thì `isCloudSyncAvailable()` trả về `false`, UI hiện hướng dẫn thay vì crash, mọi tính năng khác không bị ảnh hưởng.
- SDK Firebase (~550KB) tách thành chunk riêng, chỉ tải khi thật sự dùng (`import()` động) — ở mọi chế độ build, kể cả bản đóng gói 1 file HTML (chế độ "online").
- Bảo mật ở mức "chấp nhận được cho dữ liệu học tập không nhạy cảm", không tương đương hệ thống tài khoản thật — đã ghi rõ trong README và cảnh báo ngay trong UI khi tạo/nhập mã.
