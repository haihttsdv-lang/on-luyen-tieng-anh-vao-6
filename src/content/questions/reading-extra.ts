import type { Question } from '../../types/domain'

/**
 * ND-05 · Câu hỏi đọc hiểu cho 7 bài đọc mới (RP-09 → RP-15), 5 câu/bài.
 *
 * Điểm khác biệt so với bộ câu hỏi cũ (chủ yếu là câu hỏi CHI TIẾT): mỗi bài
 * đều có đủ 4 dạng chiếm tỷ trọng lớn trong đề CLC —
 *   • ý chính (main idea)
 *   • suy luận (inference)
 *   • tham chiếu đại từ ("The word *it* refers to...")
 *   • đoán nghĩa từ theo ngữ cảnh (guess meaning from context)
 */
export const readingExtra: Question[] = [
  // ==================== RP-09 · The Green Club ====================
  {
    id: 'RE-09-01',
    prompt: 'What is the passage mainly about?',
    options: [
      'How to sell plastic bottles for money',
      'A student club that makes their school greener',
      'The history of Quang Trung Primary School',
      'Why students should not use electricity',
    ],
    answerIndex: 1,
    explain:
      'Câu hỏi Ý CHÍNH: cả bài xoay quanh Green Club và những việc câu lạc bộ làm cho trường. Các phương án khác chỉ là chi tiết nhỏ trong bài.',
    topicIds: ['TV-13'],
    skillId: 'KN-02',
    passageId: 'RP-09',
  },
  {
    id: 'RE-09-02',
    prompt: 'What do the members do with the money from the recycling centre?',
    options: [
      'They buy posters for the classrooms.',
      'They give it to their teacher.',
      'They buy young trees and plant them.',
      'They pay the electricity bill.',
    ],
    answerIndex: 2,
    explain: 'Bài ghi rõ: "With the money, the club buys young trees and plants them behind the library."',
    topicIds: ['TV-13'],
    skillId: 'KN-02',
    passageId: 'RP-09',
  },
  {
    id: 'RE-09-03',
    prompt: 'The word "them" in "plants them behind the library" refers to ______.',
    options: ['the members', 'young trees', 'plastic bottles', 'posters'],
    answerIndex: 1,
    explain:
      'Câu hỏi THAM CHIẾU: "them" thay cho danh từ gần nhất phía trước hợp nghĩa — "young trees" (trồng cây, không thể trồng thành viên hay chai nhựa).',
    topicIds: ['NP-03'],
    skillId: 'KN-02',
    passageId: 'RP-09',
    challenging: true,
  },
  {
    id: 'RE-09-04',
    prompt: 'What can be inferred about the students of the school?',
    options: [
      'They now use less electricity than before.',
      'They do not like the Green Club.',
      'They plant trees every Friday.',
      'They have to pay for the recycling centre.',
    ],
    answerIndex: 0,
    explain:
      'Câu hỏi SUY LUẬN: bài không nói thẳng, nhưng "the electricity bill has gone down since the club started" cho thấy học sinh đã dùng ít điện hơn.',
    topicIds: ['TV-13'],
    skillId: 'KN-02',
    passageId: 'RP-09',
    challenging: true,
  },
  {
    id: 'RE-09-05',
    prompt: 'The word "aim" in the passage is closest in meaning to ______.',
    options: ['problem', 'goal', 'rule', 'name'],
    answerIndex: 1,
    explain:
      'Câu hỏi ĐOÁN NGHĨA: "Their aim is to make their school cleaner" — điều họ muốn đạt tới ⇒ "goal" (mục tiêu).',
    topicIds: ['TV-02'],
    skillId: 'KN-02',
    passageId: 'RP-09',
  },

  // ==================== RP-10 · A Trip to Trang An ====================
  {
    id: 'RE-10-01',
    prompt: 'How long does one boat trip in Trang An last?',
    options: ['About one hour', 'About two hours', 'About three hours', 'About five hours'],
    answerIndex: 2,
    explain: '"each trip takes about three hours".',
    topicIds: ['TV-09'],
    skillId: 'KN-02',
    passageId: 'RP-10',
  },
  {
    id: 'RE-10-02',
    prompt: 'Why do visitors sometimes have to bend their heads?',
    options: [
      'Because the boats are very small',
      'Because some caves are very low',
      'Because they want to see the rocks',
      'Because the sun is too bright',
    ],
    answerIndex: 1,
    explain: '"Some caves are so low that visitors have to bend their heads."',
    topicIds: ['NP-26'],
    skillId: 'KN-02',
    passageId: 'RP-10',
  },
  {
    id: 'RE-10-03',
    prompt: 'According to the passage, why is spring the best time to visit Trang An?',
    options: [
      'Because there are fewer tourists then',
      'Because the caves are open only in spring',
      'Because the weather is dry and cool',
      'Because the boats are cheaper',
    ],
    answerIndex: 2,
    explain: '"The best time to visit Trang An is in spring, when the weather is dry and cool."',
    topicIds: ['TV-06'],
    skillId: 'KN-02',
    passageId: 'RP-10',
  },
  {
    id: 'RE-10-04',
    prompt: 'What can be inferred about a summer trip to Trang An?',
    options: [
      'It is impossible to go there in summer.',
      'Visitors may feel uncomfortable because of the heat.',
      'The caves are closed in summer.',
      'The trip becomes much shorter in summer.',
    ],
    answerIndex: 1,
    explain:
      'SUY LUẬN: bài khuyên mang mũ và nước vì "in summer it can be very hot on the water" ⇒ đi mùa hè sẽ khó chịu, chứ không phải không đi được.',
    topicIds: ['TV-06'],
    skillId: 'KN-02',
    passageId: 'RP-10',
    challenging: true,
  },
  {
    id: 'RE-10-05',
    prompt: 'The word "peaceful" in the last sentence is closest in meaning to ______.',
    options: ['crowded', 'quiet and calm', 'expensive', 'far away'],
    answerIndex: 1,
    explain:
      'ĐOÁN NGHĨA: bài đã mô tả "quiet rivers", "the air is cool" ⇒ "peaceful" = yên bình, tĩnh lặng.',
    topicIds: ['TV-09'],
    skillId: 'KN-02',
    passageId: 'RP-10',
  },

  // ==================== RP-11 · The Mid-Autumn Festival ====================
  {
    id: 'RE-11-01',
    prompt: 'What is the best title for the last part of the passage?',
    options: [
      'How to make mooncakes',
      'The story of Chu Cuoi',
      'More than lanterns: a family festival',
      'Lion dances in Viet Nam',
    ],
    answerIndex: 2,
    explain:
      'Ý CHÍNH của đoạn cuối: lễ hội không chỉ là bánh và đèn lồng mà còn là dịp cả gia đình sum họp.',
    topicIds: ['TV-11'],
    skillId: 'KN-02',
    passageId: 'RP-11',
    challenging: true,
  },
  {
    id: 'RE-11-02',
    prompt: 'When does the Mid-Autumn Festival take place?',
    options: [
      'On the first day of the lunar year',
      'On the fifteenth day of the eighth lunar month',
      'On the eighth day of the fifteenth month',
      'In late August every year',
    ],
    answerIndex: 1,
    explain: 'Câu thứ hai của bài nêu rõ ngày rằm tháng Tám âm lịch.',
    topicIds: ['TV-11'],
    skillId: 'KN-02',
    passageId: 'RP-11',
  },
  {
    id: 'RE-11-03',
    prompt: 'What do children usually carry during the festival?',
    options: ['Trays of fruit', 'Drums', 'Star-shaped lanterns', 'Banyan branches'],
    answerIndex: 2,
    explain: '"Children often carry colourful star-shaped lanterns".',
    topicIds: ['TV-11'],
    skillId: 'KN-02',
    passageId: 'RP-11',
  },
  {
    id: 'RE-11-04',
    prompt: 'The word "it" in "the children eat it together" refers to ______.',
    options: ['the moon', 'the tray of fruit', 'the lantern', 'the lion dance'],
    answerIndex: 1,
    explain:
      'THAM CHIẾU: câu trước nói "Families also prepare a tray of fruit" ⇒ "it" chính là mâm hoa quả.',
    topicIds: ['NP-03'],
    skillId: 'KN-02',
    passageId: 'RP-11',
    challenging: true,
  },
  {
    id: 'RE-11-05',
    prompt: 'What can be inferred from the passage?',
    options: [
      'Only children enjoy the Mid-Autumn Festival.',
      'Older family members take part in the festival too.',
      'Mooncakes are only sweet.',
      'The lion dance happens inside the house.',
    ],
    answerIndex: 1,
    explain:
      'SUY LUẬN: ông bà kể chuyện Chú Cuội, gia đình cùng chuẩn bị mâm quả ⇒ người lớn cũng tham gia.',
    topicIds: ['TV-01'],
    skillId: 'KN-02',
    passageId: 'RP-11',
    challenging: true,
  },

  // ==================== RP-12 · Ha's Weekly Timetable ====================
  {
    id: 'RE-12-01',
    prompt: 'On which days does Ha have English lessons?',
    options: [
      'Monday and Wednesday',
      'Tuesday and Thursday',
      'Wednesday and Friday',
      'Monday and Thursday',
    ],
    answerIndex: 1,
    explain: '"on Tuesday and Thursday she has two English lessons".',
    topicIds: ['TV-02'],
    skillId: 'KN-02',
    passageId: 'RP-12',
  },
  {
    id: 'RE-12-02',
    prompt: 'What does Ha do on Wednesday afternoon?',
    options: [
      'She goes swimming.',
      'She plays badminton.',
      'She goes to the library with her mother.',
      'She does her homework at home.',
    ],
    answerIndex: 2,
    explain: '"On Wednesday, she goes to the public library with her mother".',
    topicIds: ['TV-02'],
    skillId: 'KN-02',
    passageId: 'RP-12',
  },
  {
    id: 'RE-12-03',
    prompt: 'How many hours a week does Ha spend at her swimming class?',
    options: ['One hour', 'Two hours', 'Three hours', 'Four hours'],
    answerIndex: 1,
    explain:
      'Bơi vào Thứ Hai và Thứ Năm, mỗi buổi từ 4:00 đến 5:00 = 1 giờ ⇒ 2 giờ/tuần. Dạng đọc lấy thông tin rồi TÍNH.',
    topicIds: ['TV-07'],
    skillId: 'KN-02',
    passageId: 'RP-12',
    challenging: true,
  },
  {
    id: 'RE-12-04',
    prompt: 'Why is Friday morning Ha\'s favourite?',
    options: [
      'Because she has no lessons',
      'Because she has Music and Art',
      'Because she plays badminton',
      'Because school finishes early',
    ],
    answerIndex: 1,
    explain: '"Friday morning is her favourite because she has Music and Art."',
    topicIds: ['TV-02'],
    skillId: 'KN-02',
    passageId: 'RP-12',
  },
  {
    id: 'RE-12-05',
    prompt: 'Which statement is NOT true according to the passage?',
    options: [
      'Ha finishes her morning classes at 11:15 a.m.',
      'Ha visits her grandparents on Sunday.',
      'Ha has a free afternoon on Tuesday.',
      'Ha helps her mother on Saturday morning.',
    ],
    answerIndex: 2,
    explain:
      'Chiều Thứ Ba Hà ở nhà LÀM BÀI TẬP, không phải rảnh. Buổi chiều rảnh là Thứ Sáu — dạng câu hỏi NOT TRUE rất hay ra.',
    topicIds: ['TV-02'],
    skillId: 'KN-02',
    passageId: 'RP-12',
    challenging: true,
  },

  // ==================== RP-13 · Nguyen Ngoc Ky (advanced) ====================
  {
    id: 'RE-13-01',
    prompt: 'What is the main idea of the passage?',
    options: [
      'How a serious illness can change a family',
      'How one man overcame his disability to become a teacher',
      'How to write with your feet',
      'The history of education in Nam Dinh',
    ],
    answerIndex: 1,
    explain: 'Ý CHÍNH: hành trình vượt qua khiếm khuyết để đi học và trở thành thầy giáo.',
    topicIds: ['TV-08'],
    skillId: 'KN-02',
    passageId: 'RP-13',
  },
  {
    id: 'RE-13-02',
    prompt: 'How old was Ky when he started practising writing with his toes?',
    options: ['Four', 'Seven', 'Nine', 'Twenty-three'],
    answerIndex: 1,
    explain: '"when Ky was seven, he stood outside a classroom every day... he began to practise".',
    topicIds: ['NP-13'],
    skillId: 'KN-02',
    passageId: 'RP-13',
  },
  {
    id: 'RE-13-03',
    prompt: 'The word "determined" in the passage is closest in meaning to ______.',
    options: [
      'afraid of failing',
      'firmly decided to do something',
      'good at studying',
      'able to walk far',
    ],
    answerIndex: 1,
    explain:
      'ĐOÁN NGHĨA: "He was determined to learn, so he began to practise... he refused to give up" ⇒ quyết tâm.',
    topicIds: ['TV-01'],
    skillId: 'KN-02',
    passageId: 'RP-13',
    challenging: true,
  },
  {
    id: 'RE-13-04',
    prompt: 'What can be inferred about Ky\'s first two years of practice?',
    options: [
      'He learned to write easily and quickly.',
      'His teacher helped him every day.',
      'He suffered physical pain but continued anyway.',
      'He stopped going to school during that time.',
    ],
    answerIndex: 2,
    explain:
      'SUY LUẬN: "for months his feet ached badly, but he refused to give up" ⇒ đau đớn nhưng vẫn kiên trì.',
    topicIds: ['NP-19'],
    skillId: 'KN-02',
    passageId: 'RP-13',
    challenging: true,
  },
  {
    id: 'RE-13-05',
    prompt: 'According to the passage, what did his students admire most?',
    options: [
      'His prizes in mathematics',
      'His university degree',
      'His knowledge and his patience',
      'His talks around the country',
    ],
    answerIndex: 2,
    explain: '"his students admired not only his knowledge but also his patience".',
    topicIds: ['TV-08'],
    skillId: 'KN-02',
    passageId: 'RP-13',
  },

  // ==================== RP-14 · Learning English with Technology (advanced) ====================
  {
    id: 'RE-14-01',
    prompt: 'What is the writer\'s main point in this passage?',
    options: [
      'Technology has made textbooks useless.',
      'Technology helps language learners only if they still make an effort.',
      'Students should not use translation software at all.',
      'Teachers no longer need to prepare lessons.',
    ],
    answerIndex: 1,
    explain:
      'Ý CHÍNH: công nghệ là công cụ hữu ích nhưng "does not guarantee progress" — vẫn cần nỗ lực và luyện tập hằng ngày.',
    topicIds: ['TV-12'],
    skillId: 'KN-02',
    passageId: 'RP-14',
    challenging: true,
  },
  {
    id: 'RE-14-02',
    prompt: 'According to the passage, why do online groups help learners?',
    options: [
      'They give learners a real reason to write in English.',
      'They correct all the learners\' mistakes.',
      'They replace the English teacher.',
      'They are cheaper than textbooks.',
    ],
    answerIndex: 0,
    explain: '"which gives them a genuine reason to write in English rather than merely doing exercises for marks".',
    topicIds: ['TV-12'],
    skillId: 'KN-02',
    passageId: 'RP-14',
  },
  {
    id: 'RE-14-03',
    prompt: 'The word "genuine" in the passage is closest in meaning to ______.',
    options: ['difficult', 'real', 'strange', 'final'],
    answerIndex: 1,
    explain: 'ĐOÁN NGHĨA: đối lập với "merely doing exercises for marks" ⇒ lý do THẬT SỰ.',
    topicIds: ['TV-02'],
    skillId: 'KN-02',
    passageId: 'RP-14',
    challenging: true,
  },
  {
    id: 'RE-14-04',
    prompt: 'What problem does the writer mention about some students?',
    options: [
      'They cannot afford a smartphone.',
      'They download many apps but rarely speak aloud.',
      'They refuse to use any technology.',
      'They spend too much time with their teachers.',
    ],
    answerIndex: 1,
    explain:
      '"Some students spend hours downloading applications and watching videos, yet they hardly ever speak a full sentence aloud."',
    topicIds: ['TV-12'],
    skillId: 'KN-02',
    passageId: 'RP-14',
  },
  {
    id: 'RE-14-05',
    prompt: 'What can be inferred about learners who rely heavily on translation software?',
    options: [
      'They will learn new words faster than others.',
      'They may struggle to work out meaning from context.',
      'They never make spelling mistakes.',
      'They usually get the highest marks.',
    ],
    answerIndex: 1,
    explain:
      'SUY LUẬN: bài nói họ "never learn to guess the meaning of a new word from its context — a skill that every good reader needs".',
    topicIds: ['TV-12'],
    skillId: 'KN-02',
    passageId: 'RP-14',
    challenging: true,
  },

  // ==================== RP-15 · Plastic in the Ocean (advanced) ====================
  {
    id: 'RE-15-01',
    prompt: 'What is the passage mainly about?',
    options: [
      'How to organise a beach clean-up',
      'Where plastic in the ocean comes from and why it matters',
      'Why fish are disappearing from the sea',
      'Which countries produce the most plastic',
    ],
    answerIndex: 1,
    explain: 'Ý CHÍNH: nguồn gốc rác nhựa trên biển, hậu quả và giải pháp.',
    topicIds: ['TV-13'],
    skillId: 'KN-02',
    passageId: 'RP-15',
  },
  {
    id: 'RE-15-02',
    prompt: 'According to the passage, how does most plastic reach the ocean?',
    options: [
      'It is thrown away by ships.',
      'It is carried from towns by rivers after heavy rain.',
      'It falls from the sky with the rain.',
      'It is dropped by seabirds.',
    ],
    answerIndex: 1,
    explain:
      '"Much of this waste does not come from ships; it is carried from towns and cities by rivers after heavy rain."',
    topicIds: ['TV-13'],
    skillId: 'KN-02',
    passageId: 'RP-15',
  },
  {
    id: 'RE-15-03',
    prompt: 'The word "them" in "Fish, turtles and seabirds swallow them" refers to ______.',
    options: ['the scientists', 'microplastics', 'the rivers', 'the markets'],
    answerIndex: 1,
    explain:
      'THAM CHIẾU: câu trước nói động vật biển không phân biệt được "microplastics" với thức ăn ⇒ "them" = microplastics.',
    topicIds: ['NP-03'],
    skillId: 'KN-02',
    passageId: 'RP-15',
    challenging: true,
  },
  {
    id: 'RE-15-04',
    prompt: 'Why does the writer mention that fish are sold in markets?',
    options: [
      'To show that fishing is an important job',
      'To explain why fish are expensive',
      'To show that plastic waste can come back to people',
      'To suggest that people should stop eating fish',
    ],
    answerIndex: 2,
    explain:
      'SUY LUẬN mục đích của tác giả: "the waste that people throw away may eventually return to their own dinner tables".',
    topicIds: ['TV-13'],
    skillId: 'KN-02',
    passageId: 'RP-15',
    challenging: true,
  },
  {
    id: 'RE-15-05',
    prompt: 'What do experts warn at the end of the passage?',
    options: [
      'Beach clean-ups are a waste of time.',
      'Cleaning alone will not solve the problem.',
      'Paper and glass are also dangerous.',
      'No country has banned plastic bags yet.',
    ],
    answerIndex: 1,
    explain:
      '"experts warn that cleaning is not enough: unless we produce far less plastic in the first place, the amount... will continue to rise."',
    topicIds: ['TV-13', 'NP-20'],
    skillId: 'KN-02',
    passageId: 'RP-15',
    challenging: true,
  },
]
