import type { Topic } from '../../types/domain'

// Dữ liệu bài học theo từng chủ điểm (NP-xx, TV-xx) — Mục 4.1, 4.2 URD.
// Giai đoạn 3: biên soạn mẫu cho Nhóm B — Thì động từ (NP-11..16), để xác
// thực mô hình trước khi mở rộng toàn bộ 31 chủ điểm ngữ pháp ở Giai đoạn 5.
export const topics: Topic[] = [
  {
    id: 'NP-11',
    group: 'grammar',
    title: 'Hiện tại đơn (Present Simple)',
    lesson:
      'Thì hiện tại đơn diễn tả thói quen, sự thật hiển nhiên, hoặc lịch trình cố định. Công thức: Chủ ngữ + V(s/es) với ngôi thứ ba số ít (he/she/it), hoặc V nguyên thể với các ngôi còn lại. Thường đi cùng các trạng từ tần suất: always, usually, often, sometimes, never, every day...',
    examples: [
      { en: 'I go to school by bike every day.', vi: 'Hằng ngày tôi đi học bằng xe đạp.' },
      { en: 'She brushes her teeth twice a day.', vi: 'Cô ấy đánh răng hai lần một ngày.' },
      { en: 'The sun rises in the east.', vi: 'Mặt trời mọc ở đằng đông.' },
      { en: "My father doesn't drink coffee.", vi: 'Bố tôi không uống cà phê.' },
      { en: 'Does your brother play football?', vi: 'Anh trai bạn có chơi bóng đá không?' },
    ],
    commonMistakes: [
      "Quên thêm -s/-es cho động từ khi chủ ngữ là he/she/it (ví dụ: viết 'She go' thay vì 'She goes').",
      "Dùng 'don't' thay vì 'doesn't' với chủ ngữ số ít (he/she/it).",
      'Nhầm hiện tại đơn với hiện tại tiếp diễn khi diễn tả hành động đang xảy ra ngay lúc nói.',
    ],
  },
  {
    id: 'NP-12',
    group: 'grammar',
    title: 'Hiện tại tiếp diễn (Present Continuous)',
    lesson:
      'Thì hiện tại tiếp diễn diễn tả hành động đang xảy ra ngay tại thời điểm nói, hoặc một kế hoạch đã sắp xếp trong tương lai gần. Công thức: Chủ ngữ + am/is/are + V-ing. Thường đi cùng: now, right now, at the moment, Look!, Listen!...',
    examples: [
      { en: 'I am doing my homework now.', vi: 'Bây giờ tôi đang làm bài tập về nhà.' },
      { en: 'Look! The dog is running after the cat.', vi: 'Nhìn kìa! Con chó đang đuổi theo con mèo.' },
      { en: 'They are watching a movie at the moment.', vi: 'Lúc này họ đang xem phim.' },
      { en: 'Is she reading a book right now?', vi: 'Cô ấy có đang đọc sách ngay bây giờ không?' },
      { en: "We aren't playing games; we are studying.", vi: 'Chúng tôi không chơi trò chơi; chúng tôi đang học bài.' },
    ],
    commonMistakes: [
      "Quên chia đúng động từ 'to be' (am/is/are) theo chủ ngữ.",
      "Dùng hiện tại tiếp diễn với các động từ chỉ trạng thái (like, want, know, love) — những động từ này thường không chia ở dạng tiếp diễn.",
      'Quên thêm đuôi -ing cho động từ chính.',
    ],
  },
  {
    id: 'NP-13',
    group: 'grammar',
    title: 'Quá khứ đơn (Past Simple)',
    lesson:
      'Thì quá khứ đơn diễn tả hành động đã xảy ra và kết thúc trong quá khứ, tại một thời điểm xác định. Công thức: Chủ ngữ + V2/-ed (động từ có quy tắc thêm -ed, động từ bất quy tắc học thuộc bảng riêng). Thường đi cùng: yesterday, last week/year, ago, in 2020...',
    examples: [
      { en: 'I visited my grandparents last Sunday.', vi: 'Tôi đã thăm ông bà vào Chủ nhật tuần trước.' },
      { en: "She didn't finish her homework last night.", vi: 'Tối qua cô ấy đã không làm xong bài tập.' },
      { en: 'Did you watch the football match yesterday?', vi: 'Hôm qua bạn có xem trận bóng đá không?' },
      { en: 'He went to school by bus two days ago.', vi: 'Hai ngày trước cậu ấy đã đi học bằng xe buýt.' },
      { en: 'We were very happy at the party.', vi: 'Chúng tôi đã rất vui ở bữa tiệc.' },
    ],
    commonMistakes: [
      "Quên rằng động từ bất quy tắc không thêm -ed (go → went, không phải 'goed').",
      "Thêm -ed vào động từ trong câu phủ định/nghi vấn dù đã có did (ví dụ: 'Did you went' sai, phải là 'Did you go').",
      'Nhầm quá khứ đơn với hiện tại hoàn thành khi câu có mốc thời gian xác định trong quá khứ.',
    ],
  },
  {
    id: 'NP-14',
    group: 'grammar',
    title: 'Quá khứ tiếp diễn (kết hợp với quá khứ đơn)',
    lesson:
      "Thì quá khứ tiếp diễn diễn tả một hành động đang xảy ra tại một thời điểm trong quá khứ, thường bị một hành động khác (ở quá khứ đơn) xen vào. Công thức: Chủ ngữ + was/were + V-ing. Cấu trúc thường gặp: 'While + quá khứ tiếp diễn, quá khứ đơn' hoặc 'Quá khứ đơn + when + quá khứ tiếp diễn'.",
    examples: [
      { en: 'I was watching TV when he called me.', vi: 'Tôi đang xem TV thì anh ấy gọi cho tôi.' },
      { en: 'While she was cooking, the phone rang.', vi: 'Trong khi cô ấy đang nấu ăn thì điện thoại reo.' },
      { en: 'They were playing football at 5 pm yesterday.', vi: 'Họ đang chơi bóng đá lúc 5 giờ chiều hôm qua.' },
      { en: 'What were you doing at 8 pm last night?', vi: 'Tối qua lúc 8 giờ bạn đang làm gì?' },
      { en: 'It was raining, so we stayed at home.', vi: 'Trời đang mưa nên chúng tôi ở nhà.' },
    ],
    commonMistakes: [
      'Nhầm lẫn was/were: chủ ngữ số nhiều (they, we) phải dùng were, không dùng was.',
      'Quên thêm -ing vào động từ chính sau was/were.',
      'Dùng sai thì ở hai vế: hành động xen vào (ngắn) phải ở quá khứ đơn, hành động nền (dài, đang diễn ra) phải ở quá khứ tiếp diễn.',
    ],
  },
  {
    id: 'NP-15',
    group: 'grammar',
    title: 'Hiện tại hoàn thành (ever/never, since/for)',
    lesson:
      'Thì hiện tại hoàn thành diễn tả hành động đã xảy ra trong quá khứ nhưng không nói rõ thời điểm cụ thể, hoặc hành động bắt đầu trong quá khứ và còn tiếp diễn/liên quan đến hiện tại. Công thức: Chủ ngữ + have/has + V3/-ed. Thường đi cùng: ever, never, already, just, yet, since, for...',
    examples: [
      { en: 'I have never been to Da Lat.', vi: 'Tôi chưa từng đến Đà Lạt.' },
      { en: 'She has lived in Ha Noi for five years.', vi: 'Cô ấy đã sống ở Hà Nội được năm năm.' },
      { en: 'Have you finished your homework yet?', vi: 'Bạn đã làm xong bài tập chưa?' },
      { en: 'We have already had lunch.', vi: 'Chúng tôi đã ăn trưa rồi.' },
      { en: 'He has known her since 2019.', vi: 'Anh ấy đã quen biết cô ấy từ năm 2019.' },
    ],
    commonMistakes: [
      "Nhầm lẫn 'since' (dùng với mốc thời gian bắt đầu, ví dụ since 2019) và 'for' (dùng với khoảng thời gian, ví dụ for five years).",
      'Dùng hiện tại hoàn thành với mốc thời gian xác định trong quá khứ (yesterday, last year) — trường hợp này phải dùng quá khứ đơn.',
      'Chia sai have/has theo chủ ngữ (he/she/it dùng has, còn lại dùng have).',
    ],
  },
  {
    id: 'NP-16',
    group: 'grammar',
    title: 'Tương lai đơn (will) & used to',
    lesson:
      "Thì tương lai đơn dùng 'will' để diễn tả dự đoán, quyết định tức thời, hoặc lời hứa. Công thức: Chủ ngữ + will + V nguyên thể. Cấu trúc 'used to + V nguyên thể' diễn tả thói quen hoặc trạng thái đã từng xảy ra trong quá khứ nhưng nay không còn nữa.",
    examples: [
      { en: 'I think it will rain tomorrow.', vi: 'Tôi nghĩ ngày mai trời sẽ mưa.' },
      { en: 'I promise I will help you with your homework.', vi: 'Tôi hứa sẽ giúp bạn làm bài tập.' },
      { en: 'She will not (won\'t) come to the party.', vi: 'Cô ấy sẽ không đến bữa tiệc.' },
      { en: 'When I was young, I used to play in the park every day.', vi: 'Khi còn nhỏ, tôi từng chơi ở công viên mỗi ngày.' },
      { en: 'He used to be shy, but now he is very confident.', vi: 'Anh ấy từng nhút nhát, nhưng giờ rất tự tin.' },
    ],
    commonMistakes: [
      "Chia động từ sau 'will' ở dạng có 's' hoặc thêm '-ing' (đúng phải là V nguyên thể, ví dụ 'will go', không phải 'will goes').",
      "Nhầm 'used to + V' (thói quen quá khứ) với 'be used to + V-ing' (đã quen với việc gì đó) — hai cấu trúc có nghĩa khác nhau.",
      "Quên rằng 'used to' chỉ dùng cho quá khứ, không có dạng hiện tại ('use to' cho hiện tại là sai).",
    ],
  },

  // Giai đoạn 6: bổ sung bài học cho các chủ điểm đã xuất hiện trong ngân
  // hàng câu hỏi (Luyện tập/Thi thử) nhưng trước đó chưa có bài học lý
  // thuyết tương ứng — tránh lệch pha "luyện trước khi học".
  {
    id: 'NP-01',
    group: 'grammar',
    title: 'Danh từ số ít/số nhiều, đếm được/không đếm được',
    lesson:
      'Danh từ đếm được có dạng số ít và số nhiều (thêm -s/-es, hoặc bất quy tắc: man → men, child → children...). Danh từ không đếm được (nước, gạo, thông tin...) không có dạng số nhiều, không dùng a/an, và động từ luôn chia số ít.',
    examples: [
      { en: 'I have two brothers and one sister.', vi: 'Tôi có hai anh trai và một chị gái.' },
      { en: 'There are many children in the park.', vi: 'Có nhiều trẻ em trong công viên.' },
      { en: "She doesn't drink much water every day.", vi: 'Cô ấy không uống nhiều nước mỗi ngày.' },
      { en: 'I need some information about the trip.', vi: 'Tôi cần một số thông tin về chuyến đi.' },
      { en: 'There is a lot of rice in the bag.', vi: 'Có rất nhiều gạo trong túi.' },
    ],
    commonMistakes: [
      'Thêm -s vào danh từ không đếm được (water, rice, information) — những từ này không có dạng số nhiều.',
      "Dùng a/an trước danh từ không đếm được (sai: 'an information', đúng: 'some information').",
      "Quên số nhiều bất quy tắc: man → men, child → children, foot → feet, không phải 'mans', 'childs'.",
    ],
  },
  {
    id: 'NP-03',
    group: 'grammar',
    title: 'Đại từ nhân xưng, tính từ & đại từ sở hữu',
    lesson:
      'Đại từ nhân xưng làm chủ ngữ (I, you, he, she, it, we, they) hoặc tân ngữ (me, you, him, her, it, us, them). Tính từ sở hữu đứng trước danh từ (my, your, his, her, its, our, their). Đại từ sở hữu thay cho cả "tính từ sở hữu + danh từ" (mine, yours, his, hers, its, ours, theirs).',
    examples: [
      { en: 'She gave him her book.', vi: 'Cô ấy đưa cho anh ấy cuốn sách của cô ấy.' },
      { en: 'This pencil is mine, not yours.', vi: 'Cây bút chì này là của tôi, không phải của bạn.' },
      { en: 'We love our new classroom.', vi: 'Chúng tôi yêu thích lớp học mới của mình.' },
      { en: 'Is this bag theirs?', vi: 'Cái túi này là của họ à?' },
      { en: 'I saw them at the park yesterday.', vi: 'Tôi đã thấy họ ở công viên hôm qua.' },
    ],
    commonMistakes: [
      "Nhầm 'his/her' (tính từ sở hữu, đứng trước danh từ) với 'him/her' (đại từ tân ngữ).",
      "Thêm danh từ sau đại từ sở hữu (sai: 'This is mine book', đúng: 'This book is mine').",
      "Viết 'it's' (viết tắt của 'it is') thay vì 'its' (tính từ sở hữu).",
    ],
  },
  {
    id: 'NP-06',
    group: 'grammar',
    title: 'So sánh tính từ/trạng từ',
    lesson:
      'So sánh hơn: tính từ ngắn + "-er" hoặc "more" + tính từ dài, theo sau là "than". So sánh nhất: "the" + tính từ + "-est" hoặc "the most" + tính từ dài. So sánh bằng: "as...as". So sánh kép (càng...càng): "the + so sánh hơn..., the + so sánh hơn...". Gấp nhiều lần: "twice/three times as...as".',
    examples: [
      { en: 'Minh is taller than Nam.', vi: 'Minh cao hơn Nam.' },
      { en: 'This is the most interesting book I have read.', vi: 'Đây là cuốn sách thú vị nhất tôi từng đọc.' },
      { en: 'My bag is as heavy as yours.', vi: 'Cặp của tôi nặng bằng cặp của bạn.' },
      { en: 'The more you practice, the better you speak.', vi: 'Bạn càng luyện tập nhiều, bạn càng nói giỏi hơn.' },
      { en: 'This box is twice as big as that one.', vi: 'Hộp này to gấp đôi hộp kia.' },
    ],
    commonMistakes: [
      "Dùng cả 'more' và '-er' cùng lúc (sai: 'more taller', đúng: 'taller').",
      "Quên 'the' trước so sánh nhất (sai: 'She is tallest in class', đúng: 'She is the tallest in class').",
      "Sai dạng tính từ bất quy tắc: good → better → best, bad → worse → worst, không phải 'gooder', 'badder'.",
    ],
  },
  {
    id: 'NP-07',
    group: 'grammar',
    title: 'Trạng từ chỉ tần suất, cách thức',
    lesson:
      'Trạng từ chỉ tần suất (always, usually, often, sometimes, rarely, never) thường đứng trước động từ thường nhưng sau động từ "to be". Trạng từ chỉ cách thức thường được thành lập bằng cách thêm "-ly" vào tính từ (quick → quickly), diễn tả hành động được thực hiện như thế nào, thường đứng cuối câu.',
    examples: [
      { en: 'I always brush my teeth before bed.', vi: 'Tôi luôn đánh răng trước khi ngủ.' },
      { en: 'She is never late for school.', vi: 'Cô ấy không bao giờ đến trường muộn.' },
      { en: 'He speaks English fluently.', vi: 'Anh ấy nói tiếng Anh trôi chảy.' },
      { en: 'They walked slowly to the park.', vi: 'Họ đi bộ chậm rãi tới công viên.' },
      { en: 'My mother cooks dinner carefully.', vi: 'Mẹ tôi nấu bữa tối cẩn thận.' },
    ],
    commonMistakes: [
      "Đặt sai vị trí trạng từ tần suất: phải đứng sau 'to be' nhưng trước động từ thường.",
      "Nhầm tính từ và trạng từ cách thức: 'good' (tính từ) → 'well' (trạng từ), không phải 'goodly'.",
      "Quên đổi 'y' thành 'i' trước khi thêm '-ly': happy → happily, không phải 'happyly'.",
    ],
  },
  {
    id: 'NP-08',
    group: 'grammar',
    title: 'Giới từ chỉ thời gian, nơi chốn',
    lesson:
      'Giới từ thời gian: "at" (giờ cụ thể: at 7 o\'clock), "on" (ngày, thứ: on Monday), "in" (tháng, năm, mùa: in July). Giới từ nơi chốn: "at" (địa điểm cụ thể: at the bus stop), "on" (bề mặt: on the table), "in" (không gian kín/khu vực lớn: in the box, in Ha Noi).',
    examples: [
      { en: 'We have an English test at 8 a.m. on Monday.', vi: 'Chúng tôi có bài kiểm tra tiếng Anh lúc 8 giờ sáng thứ Hai.' },
      { en: 'My birthday is in October.', vi: 'Sinh nhật của tôi vào tháng Mười.' },
      { en: 'The cat is sleeping on the sofa.', vi: 'Con mèo đang ngủ trên ghế sofa.' },
      { en: 'There are many books in my bag.', vi: 'Có nhiều sách trong cặp của tôi.' },
      { en: "Let's meet at the school gate.", vi: 'Hãy gặp nhau ở cổng trường.' },
    ],
    commonMistakes: [
      "Nhầm 'in the morning/afternoon/evening' với 'at night' — 'night' luôn dùng 'at'.",
      "Dùng 'in' thay vì 'on' với ngày/thứ (sai: 'in Monday', đúng: 'on Monday').",
      "Dùng 'at' cho địa điểm rộng (sai: 'at Ha Noi', đúng: 'in Ha Noi').",
    ],
  },
  {
    id: 'NP-20',
    group: 'grammar',
    title: 'Câu điều kiện loại 0 và loại 1',
    lesson:
      'Câu điều kiện loại 0 diễn tả sự thật hiển nhiên, quy luật tự nhiên: "If + hiện tại đơn, hiện tại đơn". Câu điều kiện loại 1 diễn tả tình huống có thể xảy ra ở hiện tại/tương lai: "If + hiện tại đơn, will + V nguyên thể".',
    examples: [
      { en: 'If you heat ice, it melts.', vi: 'Nếu bạn làm nóng đá, nó tan chảy.' },
      { en: 'If it rains tomorrow, we will stay at home.', vi: 'Nếu ngày mai trời mưa, chúng tôi sẽ ở nhà.' },
      { en: 'If she studies hard, she will pass the exam.', vi: 'Nếu cô ấy học chăm chỉ, cô ấy sẽ vượt qua kỳ thi.' },
      { en: 'Water boils if you heat it to 100 degrees.', vi: 'Nước sôi nếu bạn đun nóng đến 100 độ.' },
      { en: 'If I have free time, I will play football.', vi: 'Nếu tôi có thời gian rảnh, tôi sẽ chơi bóng đá.' },
    ],
    commonMistakes: [
      "Dùng 'will' ở cả hai mệnh đề (sai: 'If it will rain...', đúng: 'If it rains...').",
      'Nhầm loại 0 (sự thật luôn đúng) với loại 1 (khả năng xảy ra cụ thể).',
      "Quên chia động từ mệnh đề 'if' ở hiện tại đơn dù chủ ngữ số ít (if she study → if she studies).",
    ],
  },
  {
    id: 'NP-21',
    group: 'grammar',
    title: 'Câu bị động (hiện tại đơn, quá khứ đơn)',
    lesson:
      'Câu bị động dùng khi muốn nhấn mạnh vào đối tượng chịu tác động thay vì người/vật thực hiện hành động. Công thức: "be (chia theo thì) + V3/-ed". Hiện tại đơn: am/is/are + V3. Quá khứ đơn: was/were + V3.',
    examples: [
      { en: 'Rice is grown in Vietnam.', vi: 'Gạo được trồng ở Việt Nam.' },
      { en: 'This book was written by a famous author.', vi: 'Cuốn sách này được viết bởi một tác giả nổi tiếng.' },
      { en: 'The windows are cleaned every week.', vi: 'Cửa sổ được lau mỗi tuần.' },
      { en: 'The letter was sent yesterday.', vi: 'Bức thư đã được gửi hôm qua.' },
      { en: 'English is spoken in many countries.', vi: 'Tiếng Anh được nói ở nhiều quốc gia.' },
    ],
    commonMistakes: [
      "Quên chia động từ 'to be' theo đúng thì và số của chủ ngữ.",
      "Dùng V-ing hoặc V nguyên thể thay vì V3/-ed sau 'to be' trong câu bị động.",
      'Dịch máy móc chủ động sang bị động mà quên đổi vị trí tân ngữ lên đầu câu.',
    ],
  },
  {
    id: 'NP-22',
    group: 'grammar',
    title: 'Câu tường thuật/gián tiếp',
    lesson:
      'Câu tường thuật (gián tiếp) thuật lại lời nói của người khác mà không cần trích dẫn nguyên văn. Khi động từ tường thuật ("said", "told") ở quá khứ, thì của câu trực tiếp thường lùi lại một bậc (hiện tại đơn → quá khứ đơn, hiện tại tiếp diễn → quá khứ tiếp diễn...). Câu hỏi gián tiếp giữ trật tự từ như câu kể, không đảo ngữ.',
    examples: [
      { en: '"I am tired," she said. → She said (that) she was tired.', vi: '"Tôi mệt," cô ấy nói. → Cô ấy nói rằng cô ấy mệt.' },
      { en: 'He said, "I will call you." → He said he would call me.', vi: 'Anh ấy nói: "Tôi sẽ gọi cho bạn." → Anh ấy nói anh ấy sẽ gọi cho tôi.' },
      { en: 'She asked, "Where do you live?" → She asked where I lived.', vi: 'Cô ấy hỏi: "Bạn sống ở đâu?" → Cô ấy hỏi tôi sống ở đâu.' },
      { en: 'He told me to close the door.', vi: 'Anh ấy bảo tôi đóng cửa lại.' },
      { en: 'They said (that) they had finished their homework.', vi: 'Họ nói rằng họ đã làm xong bài tập.' },
    ],
    commonMistakes: [
      'Quên lùi thì khi động từ tường thuật ở quá khứ.',
      "Đảo ngữ trong câu hỏi gián tiếp (sai: 'She asked where did I live', đúng: 'She asked where I lived').",
      'Quên đổi đại từ nhân xưng và tính từ sở hữu cho phù hợp (I → she/he, my → her/his).',
    ],
  },
  {
    id: 'NP-23',
    group: 'grammar',
    title: 'Động từ khuyết thiếu',
    lesson:
      'Động từ khuyết thiếu (modal verbs) theo sau là động từ nguyên thể không "to": can/could (khả năng, xin phép), must (bắt buộc, suy luận chắc chắn), have to (bắt buộc do hoàn cảnh), should (lời khuyên), need to (sự cần thiết).',
    examples: [
      { en: 'You must wear a helmet when riding a motorbike.', vi: 'Bạn phải đội mũ bảo hiểm khi đi xe máy.' },
      { en: 'Can I borrow your pen, please?', vi: 'Mình mượn bút của bạn được không?' },
      { en: 'She has to finish her homework before dinner.', vi: 'Cô ấy phải làm xong bài tập trước bữa tối.' },
      { en: 'You should drink more water every day.', vi: 'Bạn nên uống nhiều nước hơn mỗi ngày.' },
      { en: 'We need to leave now, or we will be late.', vi: 'Chúng ta cần đi ngay, nếu không sẽ muộn.' },
    ],
    commonMistakes: [
      "Thêm 'to' sau động từ khuyết thiếu (sai: 'must to go', đúng: 'must go') — riêng 'have to' và 'need to' có 'to'.",
      "Chia động từ khuyết thiếu theo ngôi (sai: 'She musts go', đúng: 'She must go') — modal verbs không thêm -s.",
      "Nhầm 'must' (bắt buộc từ người nói) với 'have to' (bắt buộc từ hoàn cảnh bên ngoài).",
    ],
  },
  {
    id: 'NP-25',
    group: 'grammar',
    title: 'Cấu trúc với V-ing/to-V khác',
    lesson:
      'Một số cụm từ/động từ luôn theo sau bởi V-ing: "look forward to", "be interested in", "be good at". Một số cấu trúc dùng "to V" để diễn tả mục đích ("to V" = "để làm gì").',
    examples: [
      { en: 'I look forward to seeing you soon.', vi: 'Tôi mong sớm được gặp bạn.' },
      { en: 'She is interested in learning new languages.', vi: 'Cô ấy thích thú với việc học ngôn ngữ mới.' },
      { en: 'He is good at playing football.', vi: 'Cậu ấy giỏi chơi bóng đá.' },
      { en: 'I go to the library to borrow some books.', vi: 'Tôi đến thư viện để mượn vài cuốn sách.' },
      { en: 'She woke up early to catch the bus.', vi: 'Cô ấy dậy sớm để kịp chuyến xe buýt.' },
    ],
    commonMistakes: [
      "Dùng 'to V' sau 'look forward to' (sai: 'look forward to see', đúng: 'look forward to seeing') — 'to' ở đây là giới từ.",
      "Nhầm cấu trúc chỉ mục đích 'to V' với 'for + V-ing'.",
      "Quên rằng 'be good at / interested in' theo sau bởi V-ing vì 'at/in' là giới từ.",
    ],
  },
  {
    id: 'NP-26',
    group: 'grammar',
    title: 'so...that / such...that',
    lesson:
      '"So + tính từ/trạng từ + that" và "such + (a/an) + tính từ + danh từ + that" đều diễn tả kết quả của một mức độ rất cao. Dùng "so" khi sau nó là tính từ/trạng từ một mình; dùng "such" khi sau nó là cụm danh từ.',
    examples: [
      { en: "The bag is so heavy that I can't carry it.", vi: 'Cái túi nặng đến nỗi tôi không thể xách được.' },
      { en: "It is such a heavy bag that I can't carry it.", vi: 'Đó là một cái túi nặng đến nỗi tôi không thể xách được.' },
      { en: 'She was so tired that she fell asleep quickly.', vi: 'Cô ấy mệt đến nỗi ngủ thiếp đi rất nhanh.' },
      { en: 'It was such an interesting story that everyone loved it.', vi: 'Đó là một câu chuyện thú vị đến nỗi ai cũng thích.' },
      { en: "He speaks so fast that I can't understand him.", vi: 'Anh ấy nói nhanh đến nỗi tôi không hiểu được.' },
    ],
    commonMistakes: [
      "Dùng 'so' trước cụm danh từ (sai: 'so a heavy bag', đúng: 'such a heavy bag').",
      "Quên mạo từ 'a/an' trong cấu trúc 'such + a/an + tính từ + danh từ số ít'.",
      "Nhầm lẫn thứ tự từ trong 'such a + adj + noun' (sai: 'such heavy a bag').",
    ],
  },
  {
    id: 'NP-28',
    group: 'grammar',
    title: 'Would like, would rather',
    lesson:
      '"Would like" (muốn, lịch sự hơn "want") theo sau bởi "to V". "Would rather" (thích hơn) theo sau bởi V nguyên thể không "to".',
    examples: [
      { en: 'I would like to have some tea, please.', vi: 'Tôi muốn dùng một chút trà.' },
      { en: 'Would you like to join us for lunch?', vi: 'Bạn có muốn tham gia ăn trưa cùng chúng tôi không?' },
      { en: 'I would rather stay at home than go out today.', vi: 'Hôm nay tôi thích ở nhà hơn là đi ra ngoài.' },
      { en: 'She would rather study English than Math.', vi: 'Cô ấy thích học tiếng Anh hơn là học Toán.' },
      { en: 'Would you rather have juice or water?', vi: 'Bạn thích nước ép hay nước lọc hơn?' },
    ],
    commonMistakes: [
      "Dùng V nguyên thể sau 'would like' (sai: 'would like have', đúng: 'would like to have').",
      "Dùng 'to V' sau 'would rather' (sai: 'would rather to stay', đúng: 'would rather stay').",
      "Nhầm 'would like' với 'like' (thì hiện tại đơn diễn tả sở thích chung, không dùng để đề nghị).",
    ],
  },
]
