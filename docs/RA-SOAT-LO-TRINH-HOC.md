# Rà soát mục "Lộ trình học" & Khuyến nghị phát triển

> **Ngày rà soát:** 09/08/2026
> **Phạm vi:** Module Lộ trình học — `src/content/curriculum/`, `src/modules/curriculum/` (1.275 dòng)
> **Góc nhìn:** Chuyên gia phần mềm giáo dục — thiết kế chương trình (instructional design), đo lường học tập, và trải nghiệm học của học sinh 10–11 tuổi
> **Mục đích:** Tài liệu làm việc để triển khai tiếp. Mỗi mục có mã (`LT-xx` lộ trình/dữ liệu, `PP-xx` phương pháp giảng dạy, `HA-xx` hình ảnh, `AT-xx` âm thanh), mức ưu tiên và đề xuất đủ cụ thể để chuyển thẳng thành task.

---

## ⚙️ Trạng thái triển khai (cập nhật 09/08/2026)

**Toàn bộ Giai đoạn 1–4 đã triển khai xong** (25/25 mục). Chi tiết quyết định thiết kế và lỗi phát hiện khi làm: [ADR 0007](./adr/0007-trien-khai-ra-soat-lo-trinh-hoc.md).

| Mã | Trạng thái | Ghi chú |
|---|---|---|
| LT-01 | ✅ Xong | 8 buổi "Học kỹ năng" (Ngữ âm ×2, Đọc hiểu ×3, Tìm lỗi sai, Viết lại câu, Viết đoạn văn), chèn xen giữa các buổi ngữ pháp |
| LT-02 | ✅ Xong | `?topics=...` trên URL, tự sinh đề ngay khi tới từ Lộ trình học |
| LT-03 | ✅ Xong | `weakTopicIds()` bắt bệnh động cho buổi `skill-drill`/`final-exam` |
| LT-04 | ✅ Xong | `buildVocabSequence()` — weighted fair queueing, chủ điểm khó ôn dày hơn |
| LT-05 | ✅ Xong | 9 vòng thi thử (3→9) + 3 buổi "Chốt tủ" sau vòng 2/5/8 — dùng quỹ ~4 tuần lịch trống |
| LT-06 | ✅ Xong | `CurriculumTier` suy từ điểm kiểm tra đầu vào — `foundation-boost`/`standard`/`accelerated` |
| LT-07 | ✅ Xong | Bỏ qua kiểm tra tuần trùng ngày buổi khai giảng đầu tiên |
| PP-01 | ✅ Xong | Session Runner (`/lo-trinh-hoc/:sessionId/hoc`) — đồng hồ + ghi nhận từng khối |
| PP-02 | ✅ Xong | `getBlockAction()` suy action theo `block.label` + ngữ cảnh buổi |
| PP-03 | ✅ Xong | `computeSessionCompletion()` — gợi ý chấm từ dữ liệu luyện tập thật |
| PP-04 | ✅ Xong | `objectives`/`successCriteria` — đối chiếu cuối buổi bằng dữ liệu thật |
| PP-05 | ✅ Xong | `getHomeworkDone`/`setHomeworkDone` — trang chủ nhắc nếu buổi trước còn bài chưa làm |
| PP-06 | ✅ Xong (điều chỉnh phạm vi) | "Học phiên rút gọn" tự bỏ qua khối `optional`; không thêm khối nghỉ — 60 phút/buổi đã giải quyết vấn đề gốc |
| PP-07 | ✅ Xong | 3 khuôn Dẫn dắt/Khám phá/Trò chơi hóa, xoay đều 12/12/12 trên 36 buổi ngữ pháp |
| PP-08 | ✅ Xong | `parentNote` — hiện ở Session Runner (gấp) và trang Phụ huynh (buổi gần nhất) |
| HA-01 | ✅ Xong | `JourneyMap` — dải chấm hành trình, bấm để mở giai đoạn + cuộn tới |
| HA-02 | ✅ Xong | `PhaseProgressRing` (vòng tiến độ mỗi giai đoạn) + `SkillRadarChart` (radar 9 dạng bài) |
| HA-03 | ✅ Xong | Dải màu theo `focus`, vòng tròn số buổi, thanh 6 ô theo khối, dấu ✅ buổi đã học |
| HA-04 | ✅ Xong | `GrammarVisual` nhúng thẳng vào khối "Bài mới" trong Session Runner |
| HA-05 | ✅ Xong | `computeEarnedBadges()` — 4 loại huy hiệu, hiện ở Lộ trình học + Hồ sơ |
| AT-01 | ✅ Xong | `WarmupWidget` — khởi động buổi ngữ pháp nghe được thẻ từ vựng |
| AT-02 | ✅ Xong | `WarmupWidget` cho buổi Ngữ âm dùng từ ví dụ thật từ ngân hàng KN-08 |
| AT-03 | ✅ Xong | `playBlockTimeUp()` — chuông nhẹ khi hết giờ 1 khối |
| AT-04 | ✅ Xong | `SpeakButton`/`speak.ts` thêm `lang='vi-VN'` — đọc to mục tiêu + tổng kết buổi |
| AT-05 | ✅ Xong (xác nhận) | `ReadAlongPassage` đã hoạt động sẵn ở buổi Đọc hiểu (KN-02) từ MM-03, không cần sửa code |

**Yêu cầu bổ sung ngoài tài liệu gốc:** thời lượng mỗi buổi đổi từ 90 → **60 phút** (giữ nguyên 4 khối cốt lõi, co giãn theo tỉ lệ), đồng thời viết lại toàn bộ mô tả khối chi tiết/hành động hơn.

**Số liệu trong Phần A/Phụ lục bên dưới là số liệu ĐO TẠI THỜI ĐIỂM RÀ SOÁT (09/08/2026, trước triển khai)**, giữ nguyên để đối chiếu trước/sau — số liệu hiện hành: **67 buổi học chính** (50→58→67), mỗi buổi **60 phút** (trước là 90).

---

## 0. Tóm tắt điều hành

Lộ trình học là phần **có thiết kế sư phạm tốt nhất** của ứng dụng: 4 giai đoạn bám giáo trình trung tâm (ADR 0004), cấu trúc 90 phút/buổi đúng mô hình lớp luyện thi, lịch tự đẩy theo tiến độ thực tế, có kiểm tra tuần/tháng và thưởng xu.

Nhưng khi rà soát ở mức chi tiết, nó bộc lộ một vấn đề nền tảng:

> **Lộ trình đang là một BẢN KẾ HOẠCH ĐỂ ĐỌC, chưa phải một BUỔI HỌC ĐỂ CHẠY.**
>
> Mỗi buổi chỉ mô tả bằng chữ ("Luyện tập theo chủ điểm X (Luyện tập → Theo chủ điểm)") và để học sinh tự điều hướng, tự bấm giờ, tự nhớ đã làm tới đâu, rồi tự chấm mình bằng 3 nút cảm tính. Không có gì dẫn dắt học sinh **đi hết 90 phút** đó.

### Ba vấn đề lớn nhất

| # | Vấn đề | Bằng chứng đo được | Ảnh hưởng |
|---|---|---|---|
| 1 | **Lộ trình bỏ trắng 5/9 dạng bài của đề thi** | Toàn bộ 50 buổi **không có một buổi nào** dạy Đọc hiểu (KN-02), Viết đoạn (KN-07), Ngữ âm (KN-08), Tìm lỗi sai (KN-06), Đồng/trái nghĩa (KN-09). Cụm từ "Viết đoạn văn" xuất hiện **0 lần**; "Đọc hiểu"/"Ngữ âm" chỉ có trong *chú thích mã nguồn*, không có trong mô tả buổi học nào | 15 bài đọc, 15 đề viết, 12 câu ngữ âm, 44 câu tìm lỗi, 24 câu đồng/trái nghĩa đã biên soạn **nhưng lộ trình không bao giờ dẫn học sinh tới**. Đề thật có 22/40 câu (55%) thuộc các dạng này |
| 2 | **Không có cơ chế chạy buổi học** | 0 nút hành động ở cấp khối, 0 đồng hồ, 0 ghi nhận hoàn thành từng khối, 0 theo dõi bài tập về nhà | Học sinh lớp 5 tự học 90 phút liên tục theo một danh sách chữ — thực tế sẽ bỏ dở giữa chừng |
| 3 | **Tự chấm hoàn toàn cảm tính** | 3 nút 🌟/🙂/😅 không đọc bất kỳ dữ liệu thật nào (quiz đã làm chưa, mastery bao nhiêu, flashcard lên hộp mấy) | Bấm "Xuất sắc" mà không học vẫn được +8 xu và lịch vẫn tự đẩy như đã học xong → **cả hệ thống xu lẫn lịch thích ứng đều dựa trên dữ liệu không đáng tin** |

### Đánh giá theo trục

| Trục | Điểm | Nhận xét |
|---|---|---|
| Khung giai đoạn & trình tự chủ điểm | 8/10 | Bám sát giáo trình trung tâm, có căn cứ trong ADR 0004 |
| Cấu trúc buổi học (khung 6 khối) | 7/10 | Đúng mô hình lớp học, nhưng 36/36 buổi ngữ pháp dùng **y hệt một khuôn** |
| **Độ phủ kỹ năng thi** | **3/10** | Chỉ phủ ngữ pháp + từ vựng; bỏ trắng 5/9 dạng bài |
| **Khả năng thực thi buổi học** | **3/10** | Không có nút hành động, đồng hồ, hay ghi nhận tiến trình trong buổi |
| **Độ tin cậy của dữ liệu tiến độ** | **3/10** | Tự chấm cảm tính, không đối chiếu dữ liệu thật |
| **Multimedia trong lộ trình** | **0/10** | 0 hình, 0 âm thanh, 0 biểu tượng trực quan ngoài emoji nhãn |
| Phù hợp lứa tuổi 10–11 | 5/10 | 90 phút liên tục không nghỉ; không phân biệt có/không có người lớn kèm |

---

## Phần A — Dữ liệu & nội dung lộ trình

### Số liệu hiện trạng (đo ngày 09/08/2026)

| Chỉ số | Giá trị |
|---|---|
| Buổi học chính | **50** (khai giảng 1 · ngữ pháp 36 · ôn tập 2 · luyện đề 5 · luyện dạng bài 3 · thi thử 3) |
| Bài kiểm tra định kỳ | **17** (tuần 13 · tháng 4) |
| Tổng buổi hiển thị | **67** |
| Tổng thời lượng | **75 giờ** (4.500 phút) |
| Độ dài mỗi buổi | 90 phút — **không có biến thể nào** |
| Buổi ngữ pháp / tổng | **36/50 = 72%** |
| Buổi luyện đề+thi thử / tổng | 8/50 = 16% |
| Buổi không gắn chủ điểm nào (`topicIds` rỗng) | **10** |
| Bài kiểm tra định kỳ không gắn chủ điểm nào | 2/17 |
| Ngày kết thúc dự kiến | 01/12/2026 — **sớm hơn hạn 30 ngày** |

---

### LT-01 · 🔴 P0 — Lộ trình bỏ trắng 5/9 dạng bài, chiếm 55% số câu đề thật

**Hiện trạng.** Đối chiếu blueprint đề Cầu Giấy (`blueprint.ts`) với nội dung 50 buổi:

| Dạng bài | Số câu trong đề thật | Số buổi lộ trình dành riêng |
|---|---|---|
| KN-03 Đọc & điền từ (ngữ pháp/từ vựng) | 4 | 36 buổi ✅ |
| KN-02 Đọc hiểu văn bản dài | 10 | **0** 🔴 |
| KN-06 Tìm & sửa lỗi sai | 8 | **0** 🔴 |
| KN-08 Ngữ âm | 4 | **0** 🔴 |
| KN-09 Đồng/trái nghĩa | 4 | **0** 🔴 |
| KN-05 Viết lại câu | 4 | **0** 🔴 |
| KN-01 Đọc thông báo ngắn | 4 | **0** 🔴 |
| KN-07 Viết đoạn văn | (tự luận) | **0** 🔴 |

**Vì sao nghiêm trọng (góc nhìn dạy học).** Đây không phải "thiếu bài tập" — mà là **thiếu hẳn phần dạy KỸ NĂNG LÀM BÀI**. Học sinh nắm đủ 36 chủ điểm ngữ pháp vẫn có thể mất điểm đọc hiểu vì không được dạy *chiến thuật đọc lướt tìm thông tin*, mất điểm viết lại câu vì không được dạy *quy trình nhận diện dạng biến đổi*. Giáo trình Casalink đặt "Đọc hiểu & tự luận" và "Ngữ âm" thành **hai giai đoạn riêng** chính vì lý do này (ADR 0004) — bản triển khai hiện tại đã bỏ mất phần đó khi rút gọn còn 4 giai đoạn.

**Đề xuất.** Chèn **8 buổi kỹ năng** (`focus: 'skill-lesson'` — mã mới) vào lộ trình, mỗi buổi dạy *phương pháp* cho một dạng bài rồi mới luyện:

| Buổi mới | Vị trí chèn | Nội dung trọng tâm |
|---|---|---|
| Ngữ âm 1 — quy tắc phát âm `-s/-es`, `-ed` | Sau ~6 buổi nền tảng | Nghe & phân biệt bằng nút 🔊 (xem AT-02) |
| Ngữ âm 2 — quy tắc trọng âm 2–3 âm tiết | Giữa giai đoạn 1 | |
| Đọc hiểu 1 — đọc lướt tìm thông tin (scanning) | Đầu giai đoạn 2 | Bài `basic`, dạy đọc câu hỏi trước |
| Đọc hiểu 2 — câu hỏi ý chính & suy luận | Giữa giai đoạn 2 | Bài `advanced` |
| Đọc hiểu 3 — tham chiếu đại từ & đoán nghĩa theo ngữ cảnh | Cuối giai đoạn 2 | |
| Tìm lỗi sai — 6 nhóm lỗi hay gặp | Giữa giai đoạn 2 | Dùng 44 câu KN-06 sẵn có |
| Viết lại câu — 10 dạng biến đổi bắt buộc | Cuối giai đoạn 2 | Dùng trường `hint` sẵn có |
| Viết đoạn văn — dàn ý 3 phần & tự chấm | Giai đoạn 3 | Dùng `sampleAnswer` + `checklist` sẵn có |

Ngoài ra, **mỗi buổi ngữ pháp thêm 1 khối 10 phút "Luyện dạng bài xen kẽ"** (xoay vòng KN-01/02/05/06/08/09) để không dồn hết kỹ năng vào 8 buổi.

**Nguồn lực cần:** ~0 nội dung mới — toàn bộ câu hỏi đã có sẵn trong ngân hàng. Chỉ cần viết phần *lý thuyết chiến thuật* cho 8 buổi và nối `topicIds`/`skillIds` vào.

---

### LT-02 · 🔴 P0 — Buổi ôn tập và bài kiểm tra không sinh được đề đúng nội dung đã học

**Hiện trạng.** `buildPeriodicTests()` tính rất cẩn thận danh sách chủ điểm của tuần/tháng:

```ts
const weekTopicIds = [...new Set(sortedByDate.filter(...).flatMap((s) => s.topicIds))]
```

…rồi **chỉ dùng để in tên chủ điểm vào phần mô tả**. Link nhanh của bài kiểm tra tuần trỏ tới `/thi-thu` — trang sinh đề **ngẫu nhiên trên toàn bộ ngân hàng 477 câu**, không lọc theo tuần.

**Hệ quả.** "Kiểm tra kiến thức tuần" thực chất là một đề ngẫu nhiên có thể **không chứa một câu nào** thuộc các chủ điểm vừa học trong tuần. Cùng vấn đề với 2 buổi ôn tập chốt giai đoạn và 5 buổi luyện đề — tất cả đều đã có `topicIds` đúng nhưng không được dùng.

**Đề xuất.** Ứng dụng **đã có sẵn** `CustomMockTestPage` + `generateMockTest(topicIds)` lọc theo chủ điểm. Chỉ cần:
1. Cho phép truyền chủ điểm qua URL: `/thi-thu/tu-tao-de?topics=NP-11,NP-12,TV-03`.
2. `quickLinksFor()` sinh link đó từ `session.topicIds` cho mọi buổi `review` / `mock-test` / `weekly-test` / `monthly-test`.
3. Bài kiểm tra tháng dùng thêm `&format=cau-giay` để đúng định dạng đề thật 40 câu.

**Chi phí:** thấp — tái dùng hàm sinh đề sẵn có, không thêm nội dung.

---

### LT-03 · 🟠 P1 — 10 buổi không gắn chủ điểm nào

**Hiện trạng.** 3 buổi `skill-drill`, 3 buổi `mock-test` giai đoạn 3, 3 buổi `final-exam` và buổi khai giảng đều có `topicIds: []`.

**Hệ quả.** Ngoài việc không sinh được đề đúng trọng tâm (LT-02), các buổi này **không đóng góp gì vào bản đồ năng lực** và không thể trả lời câu hỏi "buổi này ôn cái gì" khi học sinh xem lại lịch sử.

**Đề xuất.** Buổi `skill-drill` và `final-exam` nên gắn `topicIds` **động theo điểm yếu thực tế**: đọc `computeAllTopicMastery` lúc render, lấy 3–5 chủ điểm `weak` nhất. Đây đúng tinh thần "bắt bệnh" mà mô tả buổi học đã nêu nhưng chưa thực hiện.

---

### LT-04 · 🟠 P1 — Thứ tự ôn từ vựng đang ngược với độ khó

**Hiện trạng (đo thực tế).** Trong 36 buổi ngữ pháp, chu kỳ `VOCAB_SEQUENCE` 14 chủ đề lặp lại khiến:

- TV-01…TV-08 (gia đình, trường học, đồ ăn, nhà cửa, động vật, thời tiết, thể thao, nghề nghiệp): **3 lần ôn**
- TV-09…TV-14 (giao thông, sức khỏe, lễ hội, **công nghệ**, **môi trường**, **cụm động từ & thành ngữ**): **2 lần ôn**

Chủ đề trừu tượng và khó nhất lại được ôn **ít hơn** chủ đề dễ nhất.

**Đề xuất.**
1. Đảo trọng số: chủ đề khó (TV-12, TV-13, TV-14) xuất hiện **≥ 4 lần**, chủ đề dễ 2 lần.
2. Mỗi lần ôn không nên lặp lại cả 30 thẻ. Chia **10 thẻ/lượt** theo 3 vòng (lượt 1: thẻ 1–10, lượt 2: 11–20, lượt 3: ôn thẻ đang ở Hộp 1–2 của cả chủ đề) — đúng nguyên lý Leitner mà `FlashcardsPage` đã cài.

---

### LT-05 · 🟠 P1 — Lộ trình kết thúc sớm 30 ngày, bỏ phí 4 tuần cuối

**Hiện trạng.** Buổi cuối rơi vào **01/12/2026**, trong khi hạn là 31/12/2026 — thừa khoảng **13 buổi trống**.

**Đề xuất.** Dùng quỹ thời gian này cho đúng giai đoạn có giá trị nhất — **nước rút**:
- +4 buổi kỹ năng (LT-01) đặt xen vào giai đoạn 1–2.
- +6 buổi thi thử toàn diện (nâng giai đoạn 4 từ 3 → 9 buổi), vì TAK12 nêu rõ giai đoạn cuối cần **luyện đề liên tục hàng tuần**.
- +3 buổi "Chữa đề & ôn tủ điểm yếu" xen kẽ giữa các buổi thi thử.

Nếu người dùng đổi hạn (ví dụ theo ngày thi thật vào 5–6/2027), thuật toán trong `schedule.ts` đã tự giãn — chỉ cần sửa hằng số `CURRICULUM_DEADLINE`.

---

### LT-06 · 🟡 P2 — Kiểm tra đầu vào không ảnh hưởng gì tới lộ trình

**Hiện trạng.** Buổi 1 dành **45/90 phút** cho bài kiểm tra đầu vào, nhưng kết quả không được dùng để điều chỉnh bất cứ điều gì — mọi học sinh đều nhận đúng 50 buổi giống hệt nhau.

**Vì sao đáng tiếc.** TAK12 nêu rõ: *"có thể bỏ qua giai đoạn 2–3 nếu đánh giá sơ bộ đạt ≥ 9 điểm"* (ADR 0004 đã ghi nhận nhưng chưa triển khai).

**Đề xuất.** Sau khi có kết quả `DiagnosticTestPage`, sinh 3 biến thể lộ trình:

| Kết quả đầu vào | Lộ trình |
|---|---|
| < 5/10 | **Đầy đủ** 50 buổi + thêm 4 buổi củng cố nền tảng |
| 5–8/10 | **Chuẩn** 50 buổi (như hiện tại) |
| > 8/10 | **Rút gọn**: gộp các buổi nền tảng mà bài kiểm tra đã làm đúng hết thành 6 buổi ôn nhanh, dồn thời gian cho luyện đề |

---

### LT-07 · 🟡 P2 — Ngày đầu tiên có thể trùng với bài kiểm tra tuần

**Hiện trạng (tái hiện được).** Mở ứng dụng lần đầu vào **Chủ nhật** → buổi khai giảng bị ép vào đúng hôm đó (yêu cầu "bắt đầu luôn từ hôm nay"), trong khi Chủ nhật cũng là ngày sinh bài kiểm tra tuần:

```
Mở app 2026-08-09 (CN): 67 buổi, 1 ngày bị trùng
   2026-08-09 (CN): orientation + weekly-test = 135 phút/ngày
Mở app 2026-08-11 (T3): 66 buổi, 0 ngày bị trùng
```

Ngày rà soát này rơi đúng vào Chủ nhật nên màn hình thật đang hiển thị lỗi đó.

**Đề xuất.** Trong `buildPeriodicTests`, **bỏ qua Chủ nhật đầu tiên** nếu ngày đó đã có buổi học chính (hoặc nếu tuần đó có < 2 buổi học — chưa đủ nội dung để kiểm tra).

---

## Phần B — Phương pháp giảng dạy

### PP-01 · 🔴 P0 — Biến buổi học từ "danh sách để đọc" thành "phiên học có thể chạy"

**Hiện trạng.** Mỗi khối chỉ có `label`, `minutes`, `description`. Học sinh phải tự đọc mô tả, tự mở tab khác, tự nhớ đã làm tới đâu.

**Đề xuất — chế độ "Vào học" (Session Runner).** Thêm route `/lo-trinh-hoc/:sessionId/hoc`, chạy tuần tự từng khối:

```
┌──────────────────────────────────────────┐
│ Buổi 12 · Hiện tại đơn      ⏱ 18:32 còn │
│ ●●●○○○   Khối 3/6 · Bài mới (25 phút)   │
├──────────────────────────────────────────┤
│  📖 Học lý thuyết: Hiện tại đơn          │
│  [ Mở bài học ]  ← nhúng thẳng nội dung  │
│                                          │
│  Mục tiêu khối này:                      │
│  ☐ Đọc hết 5 gạch đầu dòng lý thuyết     │
│  ☐ Nghe 5 câu ví dụ                      │
│  ☐ Xem sơ đồ trục thời gian              │
├──────────────────────────────────────────┤
│  [ ⏭ Bỏ qua ]        [ ✓ Xong khối này ] │
└──────────────────────────────────────────┘
```

Yêu cầu tối thiểu:
1. **Đồng hồ đếm ngược theo `block.minutes`**, có thể tạm dừng — thứ giáo viên luôn làm trên lớp.
2. **Ghi nhận hoàn thành từng khối** (lưu vào `ProgressStore`), để đóng app giữa chừng rồi mở lại vẫn "Học tiếp từ khối 4".
3. **Nút hành động thật ở mỗi khối** thay cho mô tả bằng chữ (xem PP-02).
4. Kết thúc buổi → tự chuyển sang màn hình tổng kết (PP-04).

---

### PP-02 · 🔴 P0 — Mỗi khối phải có nút hành động, không chỉ mô tả đường đi

**Hiện trạng.** `quickLinksFor()` chỉ sinh link ở **cấp buổi** (tối đa 4 link), trong khi mô tả từng khối lại ghi đường đi bằng chữ: *"(Luyện tập → Theo chủ điểm)"*, *"(Thi thử → Đề 20 câu)"*.

**Đề xuất.** Thêm trường `action?: { label: string; to: string }` vào `LessonPlanBlock`, ánh xạ sẵn cho từng loại khối:

| Khối | Hành động |
|---|---|
| Khởi động (ôn từ vựng) | `/hoc-ly-thuyet/tu-vung/{vocabTopicId}` |
| Kiểm tra bài cũ | `/hoc-ly-thuyet/{topicIdBuổiTrước}/quiz` |
| Bài mới | `/hoc-ly-thuyet/{topicId}` |
| Luyện tập có hướng dẫn | `/luyen-tap/chu-diem?topics={topicId}` |
| Luyện dạng bài xen kẽ | `/luyen-tap/dang-bai?skill={skillId}` |
| Luyện đề / kiểm tra | `/thi-thu/tu-tao-de?topics={topicIds}` |
| Củng cố | `/hoc-ly-thuyet/{topicId}/quiz` |

**Lưu ý kỹ thuật:** các trang đích hiện chưa đọc query param — cần bổ sung, nhưng đó là thay đổi nhỏ và làm cho toàn ứng dụng "deep-link được", có lợi cho cả các tính năng khác.

---

### PP-03 · 🔴 P0 — Tự chấm phải đối chiếu dữ liệu thật

**Hiện trạng.** 3 nút 🌟/🙂/😅 hoàn toàn cảm tính. Bấm "Xuất sắc" không cần học gì vẫn +8 xu, và `completedAt` vẫn được ghi → **lịch thích ứng đẩy các buổi sau như thể đã học xong**.

**Đề xuất — chấm lai (dữ liệu thật + tự đánh giá).** Khi kết thúc buổi, hệ thống tự tính "mức hoàn thành" từ dữ liệu đã có:

| Nguồn dữ liệu (đã có sẵn) | Đóng góp |
|---|---|
| Quiz chủ điểm buổi này đã đạt "Đã nắm" chưa | 40% |
| Số câu luyện tập đã làm trong khung giờ buổi học (`Attempt.timestamp`) | 30% |
| Số thẻ từ vựng đã ôn lên hộp cao hơn | 20% |
| Số khối đã bấm "Xong" (PP-01) | 10% |

Rồi **gợi ý sẵn** mức tự đánh giá tương ứng, cho học sinh xác nhận hoặc hạ xuống (không cho tự nâng lên "Xuất sắc" nếu dữ liệu < 50%). Kèm một dòng giải thích minh bạch:

> *"Em đã làm 18 câu luyện tập, đạt quiz 4/5 và ôn 12 thẻ từ vựng → gợi ý: 🌟 Xuất sắc"*

Đây vừa giữ tinh thần tự đánh giá (tốt cho siêu nhận thức của trẻ), vừa khiến xu và lịch dựa trên dữ liệu thật.

---

### PP-04 · 🟠 P1 — Thiếu mục tiêu buổi học và tổng kết cuối buổi

**Hiện trạng.** Buổi học bắt đầu thẳng bằng khối "Khởi động" và kết thúc bằng dòng chữ "Bài tập về nhà". Không có phần *"hôm nay em sẽ làm được gì"* và *"hôm nay em đã làm được gì"*.

**Vì sao quan trọng.** Nêu **mục tiêu học tập** đầu buổi và **đối chiếu lại** cuối buổi là kỹ thuật cơ bản nhất của thiết kế bài giảng — nó biến 90 phút rời rạc thành một buổi có mở–thân–kết.

**Đề xuất.**
1. Thêm `objectives: string[]` (2–3 câu, viết ở ngôi "Em có thể…") vào `CurriculumSessionTemplate`, hiển thị ngay đầu buổi:
   > *Sau buổi này, em có thể: ① Chia đúng động từ thì hiện tại đơn với he/she/it · ② Nhận ra 5 dấu hiệu nhận biết thì này trong đề · ③ Dùng đúng 10 từ vựng chủ đề Trường học.*
2. Thêm `successCriteria: string[]` — tiêu chí "coi như đã đạt" (ví dụ: *Quiz nhanh đạt ≥ 4/5 · Ôn được ≥ 15 thẻ*).
3. Màn hình tổng kết cuối buổi tick lại đúng các tiêu chí đó bằng dữ liệu thật, rồi mới tới phần chấm (PP-03) và bài tập về nhà.

---

### PP-05 · 🟠 P1 — Bài tập về nhà không theo dõi được

**Hiện trạng.** `homework` là một chuỗi text hiển thị trong phần chi tiết. Không có checkbox, không lưu, không nhắc.

**Đề xuất.** Chuyển thành `homework: HomeworkItem[]` với `{ label, to?, done }`, lưu trạng thái vào `ProgressStore`, hiển thị ở:
- Cuối màn hình tổng kết buổi;
- **Thẻ "Buổi học hôm nay" ở trang chủ**: nếu buổi trước còn bài chưa làm → hiện nhắc *"Còn 2 bài tập của buổi trước chưa làm"*.

---

### PP-06 · 🟠 P1 — 90 phút liên tục không phù hợp lứa tuổi 10–11

**Hiện trạng.** Cả 50 buổi đều đúng 90 phút, không có biến thể, không có giờ nghỉ.

**Vì sao đáng lo.** Khả năng tập trung liên tục của trẻ 10–11 tuổi vào khoảng **20–25 phút**. Khối "Bài mới" 25 phút + "Luyện tập có hướng dẫn" 20 phút liên tiếp là 45 phút không ngơi nghỉ.

**Đề xuất.**
1. Chèn **2 khối nghỉ 5 phút** (`type: 'break'`) sau khối 2 và khối 4 → buổi thành 100 phút thực tế, 90 phút học.
2. Thêm **chế độ buổi rút gọn 45 phút** (`variant: 'short'`) — giữ 4 khối cốt lõi, bỏ phần mở rộng. Dùng khi học sinh bận, thay vì bỏ hẳn buổi (bỏ buổi làm cả lịch bị đẩy lùi).
3. Đánh dấu khối nào **cần người lớn kèm** (`needsAdult: true`) — ví dụ chữa đề, luyện phát âm — để phụ huynh biết mình cần có mặt lúc nào.

---

### PP-07 · 🟡 P2 — 36 buổi ngữ pháp dùng y hệt một khuôn

**Hiện trạng.** `grammarBlocks()` sinh **cùng 6 khối, cùng số phút, cùng câu chữ** cho cả 36 buổi — chỉ thay tên chủ điểm.

**Hệ quả.** Buổi thứ 30 giống hệt buổi thứ 2 → mất hiệu ứng mới lạ, học sinh đoán trước được và chán.

**Đề xuất.** Xoay vòng **3 biến thể khuôn buổi học**, đều dạy đủ nội dung nhưng khác nhịp:
- **Khuôn A "Dẫn dắt"** (như hiện tại): lý thuyết → luyện có hướng dẫn → luyện tự do.
- **Khuôn B "Khám phá"**: cho làm 5 câu TRƯỚC khi học lý thuyết, rồi mới giảng để giải thích vì sao sai — kỹ thuật *productive failure*, rất hiệu quả với chủ điểm có bẫy (NP-31 từ dễ nhầm, NP-24 V-ing/to-V).
- **Khuôn C "Trò chơi hóa"**: thay khối luyện tập bằng **Đua tốc độ / Săn kho báu** (2 trò chơi đã có sẵn nhưng **lộ trình chưa bao giờ dẫn tới**).

---

### PP-08 · 🟡 P2 — Không có phần dành cho phụ huynh trong từng buổi

**Hiện trạng.** Có trang `ParentOverviewPage` riêng, nhưng không gắn với buổi học cụ thể.

**Đề xuất.** Thêm `parentNote?: string` cho mỗi buổi — 1–2 câu ngắn: *"Buổi này con học thì hiện tại đơn. Bố mẹ có thể kiểm tra bằng cách hỏi con: 'She ... (go) to school every day' — đáp án đúng là goes."* Hiển thị trong khối gập riêng, và gom vào bản in báo cáo tuần (UX-10 đã có).

---

## Phần C — Hình ảnh trong Lộ trình học

> Toàn bộ trang Lộ trình học hiện có **0 hình ảnh, 0 biểu đồ, 0 SVG** — chỉ có emoji trong nhãn giai đoạn.

### HA-01 · 🔴 P0 — Không có bản đồ hành trình trực quan

**Hiện trạng.** 67 buổi hiển thị dưới dạng 5 khối `<details>` gập/mở. Học sinh không bao giờ nhìn thấy toàn cảnh mình đang ở đâu trên hành trình.

**Đề xuất — "Bản đồ hành trình" (SVG/CSS thuần, không cần file ảnh).** Một dải ngang ở đầu trang:

```
🚩──🧱🧱🧱🧱🧱🧱🧱🧱──🚀🚀🚀🚀🚀──🎯🎯🎯──🏁🏁🏁──🎓
    ▲ em đang ở đây (buổi 12/67)
```

- Mỗi buổi là một chấm; màu theo trạng thái (đã học 🟢 / hôm nay 🔵 nhấp nháy / chưa học ⚪ / bỏ lỡ 🔴).
- Các mốc giai đoạn có biểu tượng lớn hơn.
- Bấm vào chấm → cuộn tới buổi đó.
- Trên điện thoại: cuộn ngang, tự căn giữa vào buổi hiện tại.

Đây là yếu tố tạo động lực mạnh nhất trong các ứng dụng học tập (Duolingo path, Khan Academy mastery map) và **làm hoàn toàn bằng CSS/SVG nên không tăng dung lượng**.

---

### HA-02 · 🟠 P1 — Biểu đồ tiến độ theo giai đoạn và theo kỹ năng

**Đề xuất.** Trong mỗi khối giai đoạn, thêm:
1. **Vòng tròn tiến độ** (SVG `stroke-dasharray`) — % buổi đã hoàn thành của riêng giai đoạn đó.
2. **Biểu đồ radar 9 trục** (KN-01…KN-09) lấy từ `computeAllSkillMastery` — cho thấy ngay "em mạnh ngữ pháp nhưng yếu đọc hiểu", đúng thông tin cần để chọn buổi `skill-drill`.

*Lưu ý:* Khi làm biểu đồ, cần chú ý bảng màu phải phân biệt được ở cả nền sáng/tối và với người mù màu — dùng khác biệt về độ đậm nhạt, không chỉ khác màu.

---

### HA-03 · 🟠 P1 — Thẻ buổi học thiếu tín hiệu thị giác phân biệt

**Hiện trạng.** 67 thẻ buổi học gần như giống hệt nhau; chỉ khác nhãn màu nhỏ ở góc phải.

**Đề xuất.**
1. **Dải màu dọc bên trái thẻ** theo `focus` (xanh lá = bài mới, cam = luyện đề, đỏ = thi thử…) — nhận ra loại buổi bằng ngoại vi thị giác, không cần đọc chữ.
2. **Vòng tròn số buổi** thay cho dòng chữ "Buổi 12 ·".
3. **Thanh 6 ô nhỏ** thể hiện 6 khối, tô dần khi hoàn thành từng khối (nối với PP-01).
4. Buổi đã học: đóng dấu ✅ mờ phía sau thẻ + hiện ngày hoàn thành thực tế.

---

### HA-04 · 🟡 P2 — Đưa sơ đồ ngữ pháp vào ngay trong buổi học

**Hiện trạng.** `GrammarVisual.tsx` (trục thời gian, bảng chia động từ, sơ đồ cấu trúc câu) đã có nhưng **chỉ xuất hiện ở trang Bài học**, lộ trình không dùng.

**Đề xuất.** Ở khối "Bài mới", nhúng thẳng `<GrammarVisual topicId={...} />` vào phiên học (PP-01) — học sinh thấy sơ đồ ngay mà không phải rời màn hình lộ trình.

---

### HA-05 · 🟡 P2 — Huy hiệu mốc thành tích

**Đề xuất.** Cấp huy hiệu (emoji lớn + tên) tại các mốc: hoàn thành mỗi giai đoạn, chuỗi 5 buổi liên tiếp đúng lịch, đạt 100% bài tập về nhà một tuần, thi thử đạt > 80%. Hiển thị ở bản đồ hành trình (HA-01) và trang Hồ sơ. Chi phí gần như bằng 0, tác động động lực cao với lứa tuổi này.

---

## Phần D — Âm thanh trong Lộ trình học

> Lộ trình học hiện **không dùng một chút nào** hạ tầng âm thanh đã xây (`speak.ts`, `sfx.ts`, `SpeakButton`, `VoiceRecorder`).

### AT-01 · 🔴 P0 — Khối "Khởi động" ôn từ vựng nhưng không phát âm được

**Hiện trạng.** Khối đầu mỗi buổi là *"Trò chơi ôn nhanh từ vựng chủ đề X"* — thuần chữ, không có nút nghe.

**Đề xuất.** Trong phiên học (PP-01), khối Khởi động hiển thị **10 thẻ từ vựng của chủ đề đó** kèm nút 🔊 và emoji minh họa (đã có ở `emoji.ts`), cho phép nghe cả loạt bằng `speakSequence`. Đây là **tái dùng 100%** hạ tầng sẵn có.

---

### AT-02 · 🔴 P0 — Hai buổi Ngữ âm mới (LT-01) bắt buộc phải có âm thanh

**Đề xuất.** Hai buổi Ngữ âm đề xuất ở LT-01 phải xây quanh nghe–nói, không phải đọc quy tắc:
1. **Nghe & phân loại**: phát 4 từ, học sinh xếp vào nhóm `/s/`, `/z/`, `/ɪz/` — dùng `speak()` với `rate: 0.65`.
2. **Nghe & chọn trọng âm**: nghe từ, chọn âm tiết mang trọng âm.
3. **Đọc lại & so sánh**: `VoiceRecorder` (đã có) để tự ghi âm rồi nghe đối chiếu với bản mẫu.

---

### AT-03 · 🟠 P1 — Âm thanh nhịp buổi học

**Đề xuất.** Tái dùng `sfx.ts` (Web Audio API, không cần file):
- Chuông nhẹ khi **hết giờ một khối** — thay vai trò giáo viên nhắc chuyển hoạt động.
- Chuông khác khi **bắt đầu/kết thúc giờ nghỉ** (PP-06).
- Nhạc hiệu ngắn khi **hoàn thành cả buổi** (đã có `playFinish()`).

Tất cả phải tuân theo công tắc âm thanh sẵn có ở trang Hồ sơ.

---

### AT-04 · 🟠 P1 — Đọc to mục tiêu và tổng kết buổi học

**Đề xuất.** Nút 🔊 cạnh phần **mục tiêu buổi học** (PP-04) và phần **tổng kết**. Với học sinh đọc chậm, nghe mục tiêu dễ tiếp thu hơn đọc. Phần tiếng Việt cần đặt `lang = 'vi-VN'` — hiện `speak.ts` đang cố định `en-US`, cần thêm tham số ngôn ngữ.

---

### AT-05 · 🟡 P2 — Đọc to đoạn văn trong buổi Đọc hiểu

**Đề xuất.** Ba buổi Đọc hiểu mới (LT-01) dùng `ReadAlongPassage` (đã có, kèm tô sáng từ đang đọc) cho khối luyện tập — đúng kỹ thuật *read-along* đã triển khai ở MM-03.

---

## Phần E — Đề xuất lộ trình triển khai

### Giai đoạn 1 — "Lộ trình chạy được" (ưu tiên cao nhất)
`PP-01` phiên học có đồng hồ + ghi nhận từng khối · `PP-02` nút hành động mỗi khối · `LT-02` sinh đề đúng chủ điểm · `PP-03` chấm theo dữ liệu thật

> Sau giai đoạn này, học sinh **mở app là học được**, không cần người lớn dẫn đường.

### Giai đoạn 2 — "Đủ kỹ năng thi"
`LT-01` 8 buổi kỹ năng mới · `AT-02` buổi ngữ âm có âm thanh · `AT-01` khởi động từ vựng có phát âm · `LT-03` gắn chủ điểm động cho buổi luyện điểm yếu

> Sau giai đoạn này, lộ trình phủ đủ **9/9 dạng bài** của đề thật.

### Giai đoạn 3 — "Nhìn thấy hành trình"
`HA-01` bản đồ hành trình · `HA-03` thẻ buổi học trực quan · `HA-02` biểu đồ tiến độ & radar kỹ năng · `PP-04` mục tiêu + tổng kết buổi · `HA-05` huy hiệu

### Giai đoạn 4 — "Tinh chỉnh sư phạm"
`PP-06` nghỉ giải lao + buổi rút gọn · `PP-07` 3 biến thể khuôn buổi học · `LT-04` cân lại chu kỳ từ vựng · `LT-05` dùng 4 tuần trống · `PP-05` theo dõi bài tập về nhà · `LT-06` cá nhân hóa theo kiểm tra đầu vào · `LT-07` sửa trùng ngày Chủ nhật · `PP-08` ghi chú cho phụ huynh · `AT-03`/`AT-04`/`AT-05`/`HA-04`

---

## Phụ lục — Cách đo lại các số liệu trong tài liệu này

```bash
# Số buổi, thời lượng, phân bố loại buổi, chu kỳ từ vựng
npx vite-node /tmp/an.mjs      # xem script trong lịch sử rà soát

# Kiểm tra trùng ngày khi mở app vào các thứ khác nhau
npx vite-node /tmp/an2.mjs

# Độ phủ kỹ năng trong mô tả buổi học
grep -io "Viết đoạn\|Đọc hiểu\|Ngữ âm\|Tìm lỗi" src/content/curriculum/index.ts
```

**Các thay đổi cấu trúc dữ liệu mà tài liệu này đề xuất** (gom lại để tiện ước lượng):

```ts
// types/domain.ts
type SessionFocus = ... | 'skill-lesson'          // LT-01

interface LessonPlanBlock {
  label: string
  minutes: number
  description: string
  type?: 'study' | 'practice' | 'break'           // PP-06
  action?: { label: string; to: string }          // PP-02
  needsAdult?: boolean                            // PP-06
}

interface CurriculumSessionTemplate {
  // ...giữ nguyên các trường hiện có
  objectives?: string[]                           // PP-04
  successCriteria?: string[]                      // PP-04
  parentNote?: string                             // PP-08
  variant?: 'full' | 'short'                      // PP-06
  homework: HomeworkItem[]                        // PP-05 (đổi từ string)
}

// ProgressStore
getBlockProgress(sessionId): Promise<number[]>    // PP-01
setBlockDone(sessionId, blockIndex): Promise<void>
getHomeworkDone(sessionId): Promise<boolean[]>    // PP-05
```
