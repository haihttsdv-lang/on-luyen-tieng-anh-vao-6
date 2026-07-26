# URD — Ứng dụng Tổng hợp & Ôn luyện Tiếng Anh vào lớp 6 Chất lượng cao

| | |
|---|---|
| **Loại tài liệu** | User Requirements Document (URD) — đặc tả để triển khai bằng Claude Code |
| **Sản phẩm** | Ứng dụng học + luyện + cá nhân hóa lộ trình ôn thi tiếng Anh vào lớp 6 CLC (Hà Nội) |
| **Phiên bản** | 1.0 |
| **Ngày soạn** | 26/07/2026 |
| **Trạng thái** | Có 1 quyết định kiến trúc CHƯA CHỐT — xem Mục 8 |

---

## 0. Hướng dẫn dành cho Claude Code — đọc trước khi viết mã

1. **Đọc toàn bộ tài liệu này trước khi tạo bất kỳ tệp mã nào.** Tài liệu dài vì nội dung kiến thức (Mục 4) cần liệt kê đầy đủ để làm căn cứ xây dựng ngân hàng câu hỏi và bài học — không phải toàn bộ đều cần nạp lại vào ngữ cảnh ở mỗi lượt làm việc sau này.
2. **Mục 8 (Kiến trúc kỹ thuật) có một quyết định chưa chốt**: chọn giữa Phương án A (client-side, không backend) và Phương án B (có backend + cơ sở dữ liệu). Nếu người dùng chưa nêu rõ lựa chọn trong yêu cầu, hãy hỏi trước khi khởi tạo dự án. Tài liệu có nêu khuyến nghị ở Mục 8.5 nhưng đó là gợi ý, không phải quyết định cuối.
3. **Đề xuất kế hoạch trước khi sinh mã hàng loạt.** Trình bày cấu trúc thư mục, thứ tự xây dựng theo Mục 11, và chờ xác nhận trước khi viết toàn bộ.
4. **Xây dựng theo từng module độc lập, có thể chạy và kiểm thử riêng**: Học lý thuyết → Luyện tập → Hồ sơ/Tiến độ → Lộ trình cá nhân hóa. Không viết toàn bộ ứng dụng trong một lượt.
5. **Một bản demo tham khảo đã tồn tại** (xem Mục 3.4) — có thể dùng làm nguồn tham khảo về định dạng dữ liệu câu hỏi và ý tưởng giao diện, nhưng bản đầy đủ này cần kiến trúc lại (component hóa, phân module) vì phạm vi lớn hơn nhiều.
6. **Khi một yêu cầu chưa đủ rõ để cài đặt chính xác, hãy hỏi thay vì tự suy đoán** — đặc biệt với công thức tính "mức độ thành thạo" (Mục 6.3) và các ngưỡng số liệu, vì đây là những chỗ dễ đoán sai mà không lộ ra ngay.
7. Toàn bộ nội dung câu hỏi/bài học phải là **tài liệu biên soạn mới**, không sao chép nguyên văn đề thi thật của bất kỳ trường nào (xem Mục 14).

---

## 1. Bối cảnh và mục tiêu sản phẩm

Học sinh lớp 5 tại Hà Nội chuẩn bị thi vào lớp 6 tại các trường chất lượng cao/có tổ chức thi tuyển (ví dụ: THCS Nguyễn Tất Thành, Lương Thế Vinh, Archimedes, Ngôi Sao Hà Nội, Cầu Giấy, M.V. Lômônôxốp...) cần ôn luyện một khối lượng kiến thức tiếng Anh vượt ngoài chương trình chính khóa, với định dạng đề riêng biệt (chủ yếu trắc nghiệm Đọc–Viết, phạm vi A2–B1 theo khung CEFR).

Mục tiêu của ứng dụng: trở thành một **công cụ tự học toàn diện** — không chỉ luyện đề, mà còn dạy lý thuyết theo từng chủ điểm, theo dõi mức độ thành thạo của học sinh, và **chủ động gợi ý nên học/ôn gì tiếp theo** dựa trên điểm mạnh–yếu thực tế, thay vì để học sinh tự chọn ngẫu nhiên.

---

## 2. Đối tượng người dùng và vai trò

| Vai trò | Mô tả | Ghi chú |
|---|---|---|
| **Học sinh** | Người dùng chính, 10–11 tuổi, tự học trên điện thoại/máy tính, các lượt học ngắn (10–20 phút) | Vai trò bắt buộc ở mọi phương án kiến trúc |
| **Phụ huynh** | Thiết lập ban đầu, xem tổng quan tiến độ, không cần thao tác sâu | Bắt buộc ở mọi phương án |
| **Giáo viên/Trung tâm** | Giao bài theo lớp, xem tiến độ nhiều học sinh, quản lý nội dung | **Chỉ khả thi nếu chọn Phương án B (Mục 8)** — cần vai trò và phân quyền |

---

## 3. Phạm vi sản phẩm — ba trụ cột

### 3.1. Học lý thuyết
Bài học ngắn theo từng chủ điểm ngữ pháp/từ vựng (xem Mục 4), có ví dụ minh họa và một bài kiểm tra nhanh (3–5 câu) để xác nhận đã hiểu trước khi chuyển sang chủ điểm khác. Từ vựng được học qua flashcard theo chủ đề, có cơ chế ôn lặp lại ngắt quãng (spaced repetition) đơn giản.

### 3.2. Luyện tập
Ngân hàng câu hỏi lớn, phủ toàn bộ chủ điểm ở Mục 4, tổ chức theo 8 dạng bài giống cấu trúc đề thi thật (xem Mục 4.3 và bản demo). Học sinh có thể luyện theo dạng bài (như đề thi) **hoặc** luyện theo chủ điểm cụ thể (ví dụ: chỉ luyện "Thì hiện tại hoàn thành" dù chủ điểm đó xuất hiện rải rác ở nhiều dạng bài). Có chế độ thi thử tính giờ, sinh đề ngẫu nhiên.

### 3.3. Lộ trình cá nhân hóa
Hệ thống tính "mức độ thành thạo" cho từng chủ điểm dựa trên lịch sử làm bài, hiển thị bản đồ điểm mạnh/yếu, và chủ động đề xuất chủ điểm nên ôn tiếp theo. Có bài kiểm tra đầu vào (diagnostic test) để khởi tạo bản đồ năng lực khi học sinh dùng ứng dụng lần đầu.

### 3.4. Kế thừa từ bản demo đã có
Một bản prototype đã được xây dựng trước đó (tệp HTML độc lập, chạy trong Claude), gồm 55 câu trắc nghiệm, 1 bài điền từ, 5 đề viết, và giao diện theo phong cách "phiếu dự thi". Bản demo này **có thể dùng làm tài liệu tham khảo** cho:
- Định dạng dữ liệu câu hỏi (cấu trúc prompt/options/answer/explain đã chứng minh hoạt động tốt);
- Ý tưởng giao diện (thẻ số báo danh, phản hồi màu xanh/đỏ kiểu chấm bài, con dấu điểm số);
- Logic sinh đề thi thử ngẫu nhiên theo tỷ trọng.

Không nên sao chép nguyên khối mã của bản demo, vì bản đầy đủ cần kiến trúc component hóa để chứa thêm hai module mới (Học lý thuyết, Cá nhân hóa) mà bản demo chưa có.

---

## 4. Phạm vi kiến thức (Content Taxonomy)

Đây là danh mục kiến thức làm căn cứ xây dựng bài học và gắn thẻ (tag) cho từng câu hỏi. Mỗi chủ điểm có một mã để tham chiếu xuyên suốt tài liệu và trong dữ liệu ứng dụng.

### 4.1. Ngữ pháp (31 chủ điểm)

**Nhóm A — Từ loại & cụm từ cơ bản**
| Mã | Chủ điểm |
|---|---|
| NP-01 | Danh từ số ít/số nhiều, đếm được/không đếm được |
| NP-02 | Mạo từ a/an/the và trường hợp không dùng mạo từ |
| NP-03 | Đại từ nhân xưng (chủ ngữ/tân ngữ), tính từ & đại từ sở hữu |
| NP-04 | Đại từ bất định; đại từ/trạng từ quan hệ (giới thiệu cơ bản) |
| NP-05 | Tính từ: thứ tự tính từ, đuôi -ed/-ing |
| NP-06 | So sánh tính từ/trạng từ: hơn, nhất, bằng, so sánh kép, gấp nhiều lần |
| NP-07 | Trạng từ chỉ tần suất, cách thức |
| NP-08 | Giới từ chỉ thời gian, nơi chốn; giới từ đi kèm tính từ/động từ thông dụng |
| NP-09 | Liên từ kết hợp, phụ thuộc, nguyên nhân–kết quả–mục đích, tương phản |
| NP-10 | Từ định lượng: some/any, much/many, a lot of, a few/few, a little/little |

**Nhóm B — Thì động từ**
| Mã | Chủ điểm |
|---|---|
| NP-11 | Hiện tại đơn |
| NP-12 | Hiện tại tiếp diễn |
| NP-13 | Quá khứ đơn |
| NP-14 | Quá khứ tiếp diễn (kết hợp với quá khứ đơn) |
| NP-15 | Hiện tại hoàn thành (ever/never, since/for) |
| NP-16 | Tương lai đơn (will) & used to |

**Nhóm C — Cấu trúc câu & mệnh đề**
| Mã | Chủ điểm |
|---|---|
| NP-17 | Câu hỏi Wh-/How, câu hỏi đuôi |
| NP-18 | Mệnh đề quan hệ xác định & không xác định |
| NP-19 | Mệnh đề trạng ngữ (thời gian, tương phản, nguyên nhân) |
| NP-20 | Câu điều kiện loại 0 và loại 1 |
| NP-21 | Câu bị động (hiện tại đơn, quá khứ đơn) |
| NP-22 | Câu tường thuật/gián tiếp (câu kể, câu hỏi, mệnh lệnh) |

**Nhóm D — Động từ khuyết thiếu & dạng động từ**
| Mã | Chủ điểm |
|---|---|
| NP-23 | Động từ khuyết thiếu: can/could, must/have to, should, need to |
| NP-24 | Danh động từ & động từ nguyên thể (V-ing / to-V) sau động từ thông dụng |
| NP-25 | Cấu trúc với V-ing/to-V khác (look forward to, cấu trúc chỉ mục đích) |

**Nhóm E — Cấu trúc nâng cao thường gặp trong đề**
| Mã | Chủ điểm |
|---|---|
| NP-26 | so...that / such...that |
| NP-27 | Đồng tình: so, too, either, neither |
| NP-28 | Would like, would rather |
| NP-29 | Câu ước: wish, if only |
| NP-30 | Hòa hợp chủ ngữ – động từ (each, every và các trường hợp đặc biệt) |
| NP-31 | Cặp từ dễ nhầm lẫn (commonly confused words) |

### 4.2. Từ vựng theo chủ đề (14 nhóm)

| Mã | Chủ đề |
|---|---|
| TV-01 | Gia đình & bản thân |
| TV-02 | Trường học & môn học |
| TV-03 | Nhà cửa & đồ vật trong nhà |
| TV-04 | Thức ăn & đồ uống |
| TV-05 | Động vật & thiên nhiên |
| TV-06 | Thời tiết & các mùa |
| TV-07 | Thể thao & sở thích |
| TV-08 | Nghề nghiệp |
| TV-09 | Thành phố, phương hướng & phương tiện giao thông |
| TV-10 | Sức khỏe & cơ thể người |
| TV-11 | Ngày lễ, văn hóa Việt Nam & thế giới |
| TV-12 | Công nghệ & truyền thông |
| TV-13 | Môi trường & bảo vệ thiên nhiên |
| TV-14 | Cụm động từ & thành ngữ thông dụng ở tiểu học |

### 4.3. Kỹ năng (8 nhóm, tương ứng các dạng bài thi)

| Mã | Kỹ năng | Ghi chú |
|---|---|---|
| KN-01 | Đọc hiểu thông báo/tin nhắn/biển hiệu ngắn | |
| KN-02 | Đọc hiểu văn bản dài phi hư cấu (ý chính, chi tiết, suy luận, từ vựng theo ngữ cảnh, tham chiếu) | |
| KN-03 | Đọc và điền từ / hoàn thành đoạn tóm tắt | |
| KN-04 | Hoàn thành hội thoại & chức năng giao tiếp (mời, đề nghị, xin lỗi, hỏi đường...) | |
| KN-05 | Viết lại câu giữ nguyên nghĩa | |
| KN-06 | Tìm và sửa lỗi sai trong câu | |
| KN-07 | Viết đoạn văn ngắn theo chủ đề quen thuộc (50–70 từ) | |
| KN-08 | Ngữ âm: trọng âm từ, nhận diện âm khác biệt | **Chưa xác minh** — một số trường có đưa phần này vào đề, một số không. Cần xác nhận với trường mục tiêu trước khi đầu tư nội dung; xem Mục 15 |

### 4.4. Mục tiêu khối lượng nội dung (khuyến nghị, có thể xây dựng tăng dần)

| Loại nội dung | Mục tiêu tối thiểu cho bản đầy đủ | Có thể bắt đầu từ |
|---|---|---|
| Câu hỏi luyện tập / chủ điểm ngữ pháp (31 chủ điểm) | 8–10 câu/chủ điểm (~ 280–310 câu) | Ưu tiên xây trước các chủ điểm xuất hiện nhiều trong đề: NP-06, NP-11–16, NP-18, NP-21–24 |
| Từ vựng có flashcard / chủ đề (14 chủ đề) | 25–30 từ/chủ đề (~ 380 từ) | Có thể bắt đầu 12–15 từ/chủ đề rồi mở rộng |
| Bài đọc hiểu dài (KN-02) | 15–20 bài, mỗi bài 5 câu hỏi | Kế thừa 2 bài từ bản demo (Ha Long Bay, Honeybees) |
| Câu viết lại / tìm lỗi (KN-05, KN-06) | 20–25 câu/dạng | Kế thừa 8 câu/dạng từ bản demo |
| Chủ đề viết đoạn (KN-07) | 15 chủ đề | Kế thừa 5 chủ đề từ bản demo |

---

## 5. Yêu cầu người dùng (URD)

| Mã | Yêu cầu người dùng | Vai trò | Ưu tiên |
|---|---|---|---|
| YC-01 | Là học sinh, tôi muốn học lý thuyết ngắn gọn cho từng chủ điểm trước khi luyện tập, để hiểu bản chất chứ không chỉ đoán đáp án | Học sinh | Cao |
| YC-02 | Là học sinh, tôi muốn học từ vựng bằng flashcard và được ôn lại đúng lúc sắp quên | Học sinh | Cao |
| YC-03 | Là học sinh, tôi muốn luyện tập theo dạng bài giống đề thi thật | Học sinh | Cao |
| YC-04 | Là học sinh, tôi muốn luyện riêng theo một chủ điểm ngữ pháp cụ thể mà tôi đang yếu, không phải làm lẫn lộn mọi chủ điểm | Học sinh | Cao |
| YC-05 | Là học sinh, tôi muốn làm bài thi thử có tính giờ và xem lại chi tiết sau khi nộp | Học sinh | Cao |
| YC-06 | Là học sinh, tôi muốn được gợi ý "hôm nay nên học gì" thay vì tự chọn ngẫu nhiên mỗi lần mở ứng dụng | Học sinh | Cao |
| YC-07 | Là học sinh, tôi muốn biết mình đang mạnh/yếu ở những chủ điểm nào một cách trực quan | Học sinh | Cao |
| YC-08 | Là học sinh, tôi muốn làm một bài kiểm tra ngắn ban đầu để ứng dụng biết trình độ hiện tại của tôi | Học sinh | Trung bình |
| YC-09 | Là phụ huynh, tôi muốn xem tổng quan tiến độ của con mà không cần hỏi trực tiếp | Phụ huynh | Cao |
| YC-10 | Là phụ huynh, tôi muốn chắc chắn ứng dụng không thu thập thông tin cá nhân của con | Phụ huynh | Cao |
| YC-11 | *(Chỉ nếu chọn Phương án B)* Là giáo viên, tôi muốn giao một nhóm chủ điểm cho cả lớp và xem ai đang yếu ở đâu | Giáo viên | Trung bình |
| YC-12 | Là học sinh, tôi muốn dùng ứng dụng được trên cả điện thoại và máy tính | Học sinh | Cao |

---

## 6. Yêu cầu chức năng theo module

### 6.1. Module Học lý thuyết

| Mã | Yêu cầu chức năng | Truy vết |
|---|---|---|
| FR-L01 | Hiển thị danh sách chủ điểm ngữ pháp (Mục 4.1) theo nhóm, mỗi chủ điểm có trạng thái: Chưa học / Đang học / Đã nắm | YC-01, YC-07 |
| FR-L02 | Mỗi chủ điểm có một trang bài học: giải thích ngắn gọn (tiếng Việt), 3–5 câu ví dụ tiếng Anh có dịch nghĩa, và các lỗi thường gặp | YC-01 |
| FR-L03 | Cuối mỗi bài học có bài kiểm tra nhanh 3–5 câu; đạt từ 80% trở lên mới đánh dấu chủ điểm là "Đã nắm" | YC-01 |
| FR-L04 | Hiển thị flashcard từ vựng theo từng chủ đề (Mục 4.2): mặt trước là từ tiếng Anh, mặt sau là nghĩa tiếng Việt + câu ví dụ | YC-02 |
| FR-L05 | Học sinh tự đánh giá mỗi flashcard là "Đã thuộc" / "Chưa thuộc" sau khi xem; hệ thống dùng đánh giá này để lên lịch ôn lại (xem FR-L06) | YC-02 |
| FR-L06 | Áp dụng nguyên tắc ôn lặp lại ngắt quãng đơn giản (spaced repetition kiểu Leitner 3–5 hộp): từ "Chưa thuộc" xuất hiện lại sớm hơn, từ "Đã thuộc" giãn cách xa dần | YC-02 |

### 6.2. Module Luyện tập

| Mã | Yêu cầu chức năng | Truy vết |
|---|---|---|
| FR-P01 | Cung cấp 8 dạng bài luyện tập tương ứng cấu trúc đề (KN-01 đến KN-07, xem Mục 4.3), mỗi câu hỏi hiển thị phản hồi đúng/sai tức thì kèm giải thích | YC-03 |
| FR-P02 | Mỗi câu hỏi được gắn ít nhất một mã chủ điểm (NP-xx hoặc TV-xx) để phục vụ luyện tập theo chủ điểm và tính mức độ thành thạo | YC-04, YC-07 |
| FR-P03 | Cho phép học sinh chọn luyện tập theo một hoặc nhiều chủ điểm cụ thể, hệ thống lọc câu hỏi từ toàn bộ ngân hàng theo mã đã chọn, bất kể câu hỏi thuộc dạng bài nào | YC-04 |
| FR-P04 | Cung cấp chế độ thi thử có tính giờ, tối thiểu 2 mức độ dài (ví dụ 20 câu/20 phút, 30 câu/30 phút), đề sinh ngẫu nhiên theo tỷ trọng giữa các dạng bài | YC-05 |
| FR-P05 | Sau khi nộp bài thi thử, hiển thị điểm tổng, điểm theo dạng bài, điểm theo chủ điểm, và bảng xem lại từng câu | YC-05, YC-07 |
| FR-P06 | Module Đọc & điền từ chấm điểm theo danh sách đáp án chấp nhận được (không phân biệt hoa/thường, cho phép biến thể hợp lý) | YC-03 |
| FR-P07 | Module Viết đoạn văn cung cấp gợi ý dàn ý, từ vựng gợi ý, đếm số từ, danh mục tự kiểm tra; không chấm điểm tự động ở bản v1.0 (xem Mục 13 — Ngoài phạm vi) | YC-03 |

### 6.3. Module Hồ sơ & Lộ trình cá nhân hóa

| Mã | Yêu cầu chức năng | Truy vết |
|---|---|---|
| FR-M01 | Khi dùng lần đầu, đề xuất một bài kiểm tra đầu vào (diagnostic test) khoảng 25–30 câu, phủ đều các nhóm chủ điểm chính, để khởi tạo bản đồ năng lực ban đầu | YC-08 |
| FR-M02 | Nếu học sinh bỏ qua bài kiểm tra đầu vào, hệ thống dùng trạng thái "chưa có dữ liệu" cho mọi chủ điểm và đề xuất một lộ trình mặc định theo thứ tự chủ điểm nền tảng trước | YC-08 |
| FR-M03 | Tính **mức độ thành thạo** cho từng chủ điểm (NP-xx/TV-xx) dựa trên độ chính xác các lần làm gần nhất, có trọng số ưu tiên lần làm gần đây hơn lần làm cũ. Công thức cụ thể **cần được xác nhận khi triển khai** — xem gợi ý ở Mục 15 | YC-07 |
| FR-M04 | Phân loại mức độ thành thạo thành 3 mức hiển thị cho học sinh: **Cần ôn lại** (dưới một ngưỡng thấp), **Đang tiến bộ** (khoảng giữa), **Thành thạo** (trên một ngưỡng cao). Giá trị ngưỡng cụ thể cần xác nhận — xem Mục 15 | YC-07 |
| FR-M05 | Hiển thị bản đồ năng lực trực quan (ví dụ dạng lưới hoặc biểu đồ) theo 3 nhóm ngữ pháp/từ vựng/kỹ năng, dùng màu sắc thể hiện 3 mức thành thạo | YC-07 |
| FR-M06 | Trên trang chủ, đề xuất tối đa 3 hành động tiếp theo cụ thể (ví dụ: "Ôn lại NP-15 — Hiện tại hoàn thành" hoặc "Luyện 10 câu TV-05 — Động vật & thiên nhiên"), ưu tiên chủ điểm có mức thành thạo thấp NHẤT trong số các chủ điểm **đã từng được luyện ít nhất một lần** | YC-06 |
| FR-M07 | Chủ điểm chưa từng được luyện lần nào không bị coi là "yếu" để tránh gợi ý sai lệch; thay vào đó được đưa vào gợi ý theo một lộ trình nền tảng mặc định (xem FR-M02) | YC-06 |
| FR-M08 | Với từ vựng, kết hợp gợi ý ôn theo lịch ngắt quãng (FR-L06) vào danh sách đề xuất, kể cả khi từ đó đã ở mức "Đã thuộc", nếu đã lâu chưa ôn lại | YC-02, YC-06 |
| FR-M09 | Trang tổng quan cho phụ huynh: hiển thị số buổi học trong tuần, điểm thi thử gần nhất, và 2–3 chủ điểm yếu nhất hiện tại, bằng ngôn ngữ dễ hiểu (không dùng thuật ngữ kỹ thuật) | YC-09 |
| FR-M10 | *(Chỉ nếu chọn Phương án B)* Giao diện giáo viên: tạo lớp, thêm học sinh, giao một nhóm chủ điểm luyện tập, xem bảng tổng hợp mức thành thạo của cả lớp theo từng chủ điểm | YC-11 |

---

## 7. Yêu cầu phi chức năng (NFR)

| Mã | Yêu cầu | Chỉ tiêu đo được |
|---|---|---|
| NFR-01 | Phản hồi giao diện nhanh | Chuyển màn hình và hiển thị phản hồi câu hỏi dưới 150ms trên thiết bị tầm trung |
| NFR-02 | Tương thích thiết bị | Bố cục đúng từ màn hình 360px đến 1440px |
| NFR-03 | Bảo vệ dữ liệu trẻ em | Không thu thập tên thật, số điện thoại, địa chỉ, hình ảnh cá nhân của học sinh dưới bất kỳ hình thức nào, kể cả ở Phương án B |
| NFR-04 | Khả năng tiếp cận | Mọi thao tác thực hiện được bằng bàn phím; trạng thái focus rõ ràng; tôn trọng cài đặt giảm chuyển động |
| NFR-05 | Độ bền dữ liệu tiến độ | Tiến độ và bản đồ năng lực không mất khi đóng/mở lại ứng dụng (cơ chế cụ thể phụ thuộc phương án kiến trúc — xem Mục 8) |
| NFR-06 | Khả năng mở rộng nội dung | Thêm câu hỏi/bài học/từ vựng mới không yêu cầu sửa logic hiển thị, chỉ cần thêm dữ liệu đúng schema (Mục 9) |
| NFR-07 | Minh bạch thuật toán gợi ý | Học sinh/phụ huynh có thể xem vì sao một chủ điểm được đề xuất (ví dụ hiển thị "vì bạn đúng 3/10 câu gần nhất") — tránh cảm giác "hộp đen" |
| NFR-08 | Tính đa dạng đề thi thử | Với cùng độ dài, xác suất trùng đề hoàn toàn giữa hai lần sinh liên tiếp dưới 1% |

---

## 8. Kiến trúc kỹ thuật — QUYẾT ĐỊNH CHƯA CHỐT

### 8.1. Bối cảnh quyết định

Phạm vi bản đầy đủ (học lý thuyết + luyện tập lớn + cá nhân hóa) đòi hỏi lưu trữ nhiều hơn bản demo: bản đồ năng lực theo ~45 chủ điểm, lịch sử flashcard, lịch sử thi thử dài hạn. Ứng dụng lần này **sẽ được xây dựng như một dự án độc lập qua Claude Code** (không chạy trong môi trường artifact của Claude như bản demo), nên **không thể tiếp tục dùng cơ chế lưu trữ đặc thù của Claude** — cần chọn cơ chế lưu trữ chuẩn của web.

### 8.2. Phương án A — Client-side thuần

| | |
|---|---|
| Mô tả | Toàn bộ chạy trong trình duyệt, không có máy chủ ứng dụng riêng |
| Lưu trữ | IndexedDB hoặc localStorage của trình duyệt (theo từng thiết bị) |
| Stack đề xuất | React + TypeScript + Vite |
| Ưu điểm | Triển khai cực nhanh (hosting tĩnh, miễn phí); không chi phí máy chủ; không rủi ro bảo mật phía server |
| Nhược điểm | Không đồng bộ đa thiết bị; không thể có vai trò Giáo viên (FR-M10, YC-11); mất dữ liệu nếu xóa bộ nhớ trình duyệt |
| Phù hợp khi | Một học sinh/một gia đình dùng, ưu tiên triển khai nhanh |

### 8.3. Phương án B — Full-stack có backend

| | |
|---|---|
| Mô tả | Có máy chủ ứng dụng và cơ sở dữ liệu, hỗ trợ hồ sơ học sinh có định danh tối thiểu (không cần thông tin cá nhân thật — có thể chỉ là mã lớp + biệt danh) |
| Lưu trữ | Cơ sở dữ liệu (ví dụ PostgreSQL/SQLite) |
| Stack đề xuất | Next.js (React + TypeScript, kèm API routes) + Prisma ORM + SQLite (cho quy mô nhỏ) hoặc PostgreSQL (cho quy mô lớn hơn) |
| Ưu điểm | Đồng bộ đa thiết bị; hỗ trợ vai trò Giáo viên/Trung tâm; dễ nâng cấp thêm tính năng chấm bài viết bằng AI ở phiên bản sau |
| Nhược điểm | Cần vận hành và bảo trì máy chủ/cơ sở dữ liệu; thời gian triển khai ban đầu lâu hơn; cần thiết kế xác thực (auth) dù ở mức tối giản |
| Phù hợp khi | Dùng cho nhiều học sinh, có giáo viên/trung tâm theo dõi, hoặc dự định phát triển thành sản phẩm dài hạn |

### 8.4. Bảng so sánh nhanh

| Tiêu chí | Phương án A | Phương án B |
|---|---|---|
| Thời gian triển khai MVP | Nhanh | Chậm hơn |
| Chi phí vận hành | ~0đ (hosting tĩnh) | Có chi phí máy chủ/DB |
| Đồng bộ đa thiết bị | Không | Có |
| Vai trò Giáo viên (FR-M10) | Không khả thi | Khả thi |
| Rủi ro bảo mật | Thấp (không có server) | Cần kiểm soát (auth, DB) |
| Sẵn sàng cho chấm bài viết bằng AI (tương lai) | Cần thêm lớp gọi API riêng | Có sẵn lớp backend để mở rộng |

### 8.5. Khuyến nghị (không phải quyết định cuối)

Tài liệu khuyến nghị: **bắt đầu bằng Phương án A**, nhưng thiết kế lớp truy cập dữ liệu (data access layer) dưới dạng một interface trừu tượng (ví dụ `ProgressStore`, `ContentStore`) thay vì gọi thẳng `localStorage`/`IndexedDB` rải rác trong code. Nhờ vậy, nếu sau này chuyển sang Phương án B, chỉ cần viết một implementation mới cho interface đó (gọi API thay vì đọc bộ nhớ trình duyệt) mà không phải viết lại toàn bộ giao diện.

**Đây là khuyến nghị, không phải quyết định.** Claude Code cần xác nhận với người dùng trước khi bắt đầu (xem Mục 0, điểm 2).

---

## 9. Mô hình dữ liệu (logic, áp dụng cho cả hai phương án)

| Thực thể | Trường chính | Ghi chú |
|---|---|---|
| `Topic` (Chủ điểm) | `id` (mã NP-xx/TV-xx), `group`, `title`, `lesson` (nội dung bài học), `examples[]` | Nguồn cho Module Học lý thuyết |
| `Question` (Câu hỏi) | `id`, `prompt`, `options[4]`, `answerIndex`, `explain`, `topicIds[]`, `skillId` (KN-xx) | `topicIds` bắt buộc để lọc luyện theo chủ điểm (FR-P03) và tính thành thạo (FR-M03) |
| `VocabCard` (Flashcard) | `id`, `word`, `meaning`, `example`, `topicId` (TV-xx), `boxLevel` (cho spaced repetition) | |
| `WritingPrompt` (Đề viết) | `id`, `title`, `ideas[]`, `vocab[]` | Không có trường chấm điểm ở v1.0 |
| `Attempt` (Lượt làm bài) | `questionId` hoặc `cardId`, `correct` (bool), `timestamp` | Nguồn tính mức thành thạo — cần lưu đủ lịch sử để tính trọng số theo thời gian, không chỉ lưu số tổng |
| `MockTestResult` (Kết quả thi thử) | `date`, `score`, `total`, `byTopic{}`, `durationUsed` | |
| `MasterySnapshot` (Bản đồ năng lực — dữ liệu suy ra) | `topicId`, `masteryScore`, `lastUpdated` | Được TÍNH từ `Attempt`, không cần lưu trữ nếu tính lại được nhanh; nên cache nếu tính toán nặng |
| `LearnerProfile` (Hồ sơ học sinh) | `candidateAlias` (biệt danh, không phải tên thật), `createdAt` | Ở Phương án B: thêm `classCode` nếu có vai trò Giáo viên |

---

## 10. Cấu trúc thư mục dự án đề xuất

```
project-root/
├── URD-ung-dung-on-luyen-tieng-anh-vao-6.md   ← chính tài liệu này
├── src/
│   ├── content/
│   │   ├── topics/            # dữ liệu bài học theo NP-xx, TV-xx (JSON hoặc TS)
│   │   ├── questions/         # ngân hàng câu hỏi, chia theo dạng bài KN-xx
│   │   ├── vocab/              # flashcard theo TV-xx
│   │   └── writing-prompts/
│   ├── modules/
│   │   ├── lessons/            # Module Học lý thuyết
│   │   ├── practice/            # Module Luyện tập
│   │   ├── mock-test/           # Thi thử
│   │   └── mastery/             # Module Lộ trình cá nhân hóa
│   ├── data-access/             # interface ProgressStore/ContentStore (xem Mục 8.5)
│   │   ├── local/                # implementation Phương án A
│   │   └── remote/               # implementation Phương án B (nếu chọn)
│   ├── components/               # UI dùng chung
│   └── app/                      # điểm khởi chạy, định tuyến
├── tests/
│   ├── unit/                     # logic tính mastery, sinh đề ngẫu nhiên
│   └── e2e/                      # kịch bản Playwright mô phỏng học sinh
└── docs/
    └── adr/                       # ghi các quyết định kiến trúc phát sinh thêm
```

---

## 11. Kế hoạch xây dựng theo giai đoạn (đề xuất cho Claude Code)

| Giai đoạn | Nội dung | Điều kiện hoàn thành |
|---|---|---|
| 0 | Xác nhận Phương án kiến trúc (Mục 8) với người dùng; khởi tạo dự án, cấu trúc thư mục | Dự án chạy được, hiển thị trang trống |
| 1 | Nhập dữ liệu lõi: seed nội dung kế thừa từ bản demo (55 câu hỏi, 2 bài đọc, 5 đề viết) theo schema Mục 9, gắn `topicIds` | Dữ liệu load được, có thể duyệt qua console/test |
| 2 | Module Luyện tập (FR-P01–P07), tái sử dụng ý tưởng giao diện từ bản demo | Luyện được theo dạng bài; thi thử tính giờ hoạt động |
| 3 | Module Học lý thuyết (FR-L01–L06) cho một nhóm chủ điểm mẫu (ví dụ Nhóm B — Thì động từ) để xác thực mô hình trước khi mở rộng toàn bộ 31+14 chủ điểm | Học xong 1 bài, làm quiz nhanh, flashcard hoạt động |
| 4 | Module Lộ trình cá nhân hóa (FR-M01–M09): bài kiểm tra đầu vào, tính mastery, trang gợi ý | Gợi ý hiển thị đúng logic với dữ liệu giả lập |
| 5 | Mở rộng nội dung đạt mục tiêu khối lượng ở Mục 4.4 | Đạt tối thiểu theo bảng Mục 4.4 |
| 6 | *(Nếu Phương án B)* Vai trò Giáo viên (FR-M10) | Giáo viên tạo lớp, giao bài, xem tổng hợp |
| 7 | Kiểm thử toàn diện (unit cho logic mastery/sinh đề, e2e cho luồng học sinh) | Bộ test chạy xanh |

---

## 12. Tiêu chí nghiệm thu (Definition of Done cho v1.0)

- [ ] Học sinh học được lý thuyết và làm quiz nhanh cho toàn bộ 31 chủ điểm ngữ pháp + 14 chủ đề từ vựng
- [ ] Luyện tập được theo cả 8 dạng bài lẫn theo chủ điểm cụ thể
- [ ] Làm được bài thi thử tính giờ, xem lại chi tiết sau khi nộp
- [ ] Có bài kiểm tra đầu vào và trang gợi ý "nên học gì tiếp theo" hoạt động đúng logic đã đặc tả
- [ ] Tiến độ không mất khi đóng/mở lại ứng dụng (đúng theo phương án kiến trúc đã chọn)
- [ ] Không có trường thu thập thông tin định danh cá nhân của học sinh
- [ ] Đạt tối thiểu khối lượng nội dung ở Mục 4.4
- [ ] Có bộ kiểm thử tự động cho logic tính mastery và logic sinh đề ngẫu nhiên

---

## 13. Ngoài phạm vi ở phiên bản v1.0 (Out of scope)

- Chấm điểm tự động bài luyện viết đoạn văn (KN-07) bằng AI
- Nội dung Ngữ âm (KN-08) cho tới khi được xác minh là cần thiết (Mục 15)
- Ứng dụng di động native (chỉ web, responsive)
- Thông báo đẩy/nhắc lịch học
- Nội dung phần Nghe (Listening) — theo khảo sát trước đó, đa số trường CLC không thi Nghe ở phần tiếng Anh

---

## 14. Giả định và rủi ro

| Giả định / Rủi ro | Ảnh hưởng | Ghi chú |
|---|---|---|
| Toàn bộ nội dung câu hỏi/bài học là biên soạn mới, không sao chép đề thi thật | Cao | Bắt buộc để tránh vi phạm bản quyền và tránh gây hiểu nhầm là đề chính thức |
| Công thức tính mức độ thành thạo (FR-M03) và các ngưỡng phân loại (FR-M04) chưa được xác nhận cụ thể | Cao | Ảnh hưởng trực tiếp tới độ tin cậy của lộ trình cá nhân hóa — xem câu hỏi mở ở Mục 15 |
| Chưa xác nhận Phương án kiến trúc A hay B | Cao | Ảnh hưởng toàn bộ cách triển khai — bắt buộc chốt trước khi code (Mục 0) |
| Nội dung KN-08 (Ngữ âm) có thực sự cần thiết hay không tùy trường mục tiêu | Trung bình | Xem Mục 15 |

---

## 15. Câu hỏi còn mở — cần xác nhận với chủ dự án trước hoặc trong lúc triển khai

1. **Công thức tính mức độ thành thạo (FR-M03):** đề xuất mặc định nếu không có chỉ định khác — trung bình có trọng số của N lượt làm gần nhất (ví dụ N=10) theo từng chủ điểm, lượt gần đây có trọng số cao hơn lượt cũ; cần bao nhiêu lượt làm tối thiểu mới bắt đầu tính điểm thành thạo (đề xuất mặc định: 3 lượt)?
2. **Ngưỡng phân loại 3 mức (FR-M04):** đề xuất mặc định nếu không có chỉ định khác — dưới 50% = Cần ôn lại, 50–80% = Đang tiến bộ, trên 80% = Thành thạo.
3. **Trường mục tiêu cụ thể**: có nhắm tới một trường cụ thể (để ưu tiên đúng tỷ trọng dạng bài, và xác nhận KN-08 – Ngữ âm có cần không) hay xây dựng tổng quát cho nhiều trường?
4. **Quy mô người dùng dự kiến**: chỉ 1–2 học sinh trong gia đình, hay có ý định chia sẻ/kinh doanh cho nhiều gia đình khác (ảnh hưởng tới việc có nên đầu tư Phương án B ngay từ đầu hay không dù triển khai chậm hơn)?
5. **Múc độ ưu tiên giữa tốc độ ra bản dùng thử và độ đầy đủ nội dung**: nên ưu tiên có đủ 3 module chạy được với nội dung mẫu trước (theo Mục 11), hay ưu tiên nội dung đầy đủ ngay từ đầu cho một phạm vi module hẹp hơn?

---

## Phụ lục — Nguồn tham khảo cấu trúc đề (đã khảo sát ở giai đoạn trước)

- Phân tích cấu trúc đề thi Tiếng Anh vào lớp 6 trường Nguyễn Tất Thành, Lương Thế Vinh, Archimedes — TAK12
- Bộ đề luyện thi vào lớp 6 trường Chất lượng cao môn Tiếng Anh — HOCMAI
- Bộ đề thi tuyển sinh vào lớp 6 Tiếng Anh — VietJack, VnDoc, FLYER.vn

*Đây là các bài phân tích công khai của bên thứ ba, không phải đề thi chính thức của các trường.*

— Hết tài liệu —
