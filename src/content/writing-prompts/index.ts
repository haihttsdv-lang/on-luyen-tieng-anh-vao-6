import type { WritingPrompt } from '../../types/domain'

/**
 * Đề viết đoạn văn (KN-07) — Mục 4.4 URD: mục tiêu 15 chủ đề. Đã đạt đủ 15
 * theo ND-06.
 *
 * Mỗi đề có thêm:
 *   - `sampleAnswer` — bài mẫu 50–70 từ, CHỈ hiện sau khi học sinh bấm "Tôi
 *     đã viết xong" (tránh chép). Trong lớp, giáo viên luôn cho xem bài mẫu
 *     sau khi học sinh tự viết — đây là bước học quan trọng nhất của kỹ năng
 *     viết, mà bản trước của ứng dụng thiếu hẳn.
 *   - `checklist` — tiêu chí tự chấm riêng cho từng đề (ngoài các tiêu chí
 *     chung áp dụng cho mọi đề, xem WritingPromptDetailPage).
 */
export const writingPrompts: WritingPrompt[] = [
  {
    id: 'WP-01',
    title: 'My Favorite Sport',
    ideas: [
      'Tên môn thể thao em thích',
      'Em chơi môn đó ở đâu, khi nào, với ai',
      'Vì sao em thích môn thể thao này',
      'Cảm giác của em khi chơi',
    ],
    vocab: ['play', 'team', 'practice', 'exciting', 'score a goal'],
    checklist: [
      'Có nêu tên môn thể thao ngay câu đầu tiên',
      'Có nói rõ chơi ở đâu và khi nào',
      'Có ít nhất một câu giải thích lý do (because / so)',
    ],
    sampleAnswer:
      'My favorite sport is football. I play it with my classmates on the school playground every Tuesday and Thursday afternoon. We usually practice for about an hour before we start a real match. I like football because it keeps me healthy and teaches me how to work in a team. I feel very excited whenever I score a goal. After each match, my friends and I go home together and talk about the game.',
  },
  {
    id: 'WP-02',
    title: 'My Favorite Video Game',
    ideas: [
      'Tên trò chơi điện tử em thích',
      'Em chơi trò đó khi nào, ở đâu',
      'Cách chơi trò chơi đó như thế nào',
      'Vì sao em thích trò chơi này',
    ],
    vocab: ['play a game', 'level', 'win', 'team up', 'have fun'],
    checklist: [
      'Có mô tả cách chơi bằng ít nhất hai câu',
      'Có nói rõ chơi bao lâu mỗi ngày',
      'Có một câu về mặt tích cực của trò chơi',
    ],
    sampleAnswer:
      'My favorite video game is a puzzle game on my father\'s tablet. I usually play it for thirty minutes after I finish my homework. In this game, I have to move colourful blocks to complete each level. The higher the level is, the more difficult it becomes. I like this game because it makes me think carefully and remember many shapes. Sometimes I team up with my brother, and we have a lot of fun together.',
  },
  {
    id: 'WP-03',
    title: 'If I Had a Robot',
    ideas: [
      'Robot của em trông như thế nào',
      'Robot có thể giúp em làm những việc gì',
      'Em sẽ đặt tên robot là gì',
      'Vì sao em muốn có robot đó',
    ],
    vocab: ['robot', 'helpful', 'invent', 'control', 'amazing'],
    checklist: [
      'Có dùng cấu trúc "If I had..., I would..."',
      'Có mô tả hình dáng robot',
      'Có ít nhất hai việc robot giúp em',
    ],
    sampleAnswer:
      'If I had a robot, I would call it Bo. It would be small, white and blue, with two big round eyes. Bo could help me clean my room, water the flowers in the garden and carry my heavy schoolbag. It could also test my English vocabulary before an exam. I would like to have such an amazing robot because then I would have more free time to read books and play with my friends.',
  },
  {
    id: 'WP-04',
    title: 'My Favorite Animal',
    ideas: [
      'Tên con vật em thích',
      'Con vật đó trông như thế nào',
      'Con vật đó sống ở đâu, ăn gì',
      'Vì sao em thích con vật này',
    ],
    vocab: ['wild animal', 'pet', 'strong', 'friendly', 'take care of'],
    checklist: [
      'Có ít nhất ba tính từ mô tả con vật',
      'Có nói con vật sống ở đâu và ăn gì',
      'Có một câu về cảm xúc của em với con vật đó',
    ],
    sampleAnswer:
      'My favorite animal is the dolphin. Dolphins are grey, smooth and very intelligent. They live in the ocean and eat small fish. I once saw them on a television programme, and I was surprised because they can understand what people say. Dolphins are also friendly and often help swimmers in danger. I love them very much, and I hope that people will stop polluting the sea so that dolphins can live safely.',
  },
  {
    id: 'WP-05',
    title: 'A Memorable Trip',
    ideas: [
      'Em đã đi đâu, khi nào, với ai',
      'Em đã làm gì trong chuyến đi',
      'Điều gì làm em nhớ nhất',
      'Cảm giác của em sau chuyến đi',
    ],
    vocab: ['go on a trip', 'visit', 'exciting', 'unforgettable', 'memory'],
    checklist: [
      'Toàn bộ đoạn văn dùng THÌ QUÁ KHỨ',
      'Có nêu rõ đi đâu, khi nào, với ai',
      'Có một câu nói về điều nhớ nhất',
    ],
    sampleAnswer:
      'Last summer, my family went on a trip to Ha Long Bay. We travelled by coach and arrived there in the afternoon. On the first day, we took a boat to visit some beautiful caves. The next morning, I swam in the clear blue water with my younger sister. What I remember most is the sunset over the islands; it was really wonderful. It was an unforgettable trip, and I hope we will come back next year.',
  },
  {
    id: 'WP-06',
    title: 'My Best Friend',
    ideas: [
      'Bạn thân của em tên gì, bao nhiêu tuổi',
      'Bạn ấy trông như thế nào, tính cách ra sao',
      'Em và bạn thường làm gì cùng nhau',
      'Vì sao em quý bạn ấy',
    ],
    vocab: ['friendly', 'get along with', 'share', 'helpful', 'sense of humour'],
    checklist: [
      'Có mô tả cả ngoại hình và tính cách',
      'Có ít nhất hai hoạt động làm cùng nhau',
      'Có dùng ít nhất một tính từ chỉ tính cách',
    ],
    sampleAnswer:
      'My best friend is Mai. She is eleven years old and lives next to my house. Mai is quite tall and has long black hair. She is friendly, generous and always ready to help other people. We often do our homework together and play badminton in the schoolyard after class. I like her because she never tells lies and she always listens to me when I am sad. I hope we will study at the same secondary school.',
  },
  {
    id: 'WP-07',
    title: 'My Daily Routine',
    ideas: [
      'Em thức dậy lúc mấy giờ, làm gì buổi sáng',
      'Em học ở trường thế nào',
      'Buổi chiều và buổi tối em làm gì',
      'Em đi ngủ lúc mấy giờ',
    ],
    vocab: ['get up', 'have breakfast', 'in the afternoon', 'usually', 'go to bed'],
    checklist: [
      'Toàn bộ đoạn văn dùng THÌ HIỆN TẠI ĐƠN',
      'Có ít nhất ba trạng từ tần suất (always, usually, often...)',
      'Các mốc thời gian được sắp xếp theo thứ tự trong ngày',
    ],
    sampleAnswer:
      'I usually get up at six o\'clock every morning. First, I brush my teeth and wash my face, then I have breakfast with my family. I go to school at half past six by bicycle. My lessons start at seven and finish at half past eleven. In the afternoon, I do my homework and help my mother cook dinner. I often read a book before I go to bed at ten o\'clock.',
  },
  {
    id: 'WP-08',
    title: 'How to Protect the Environment',
    ideas: [
      'Vì sao phải bảo vệ môi trường',
      'Hai đến ba việc học sinh có thể làm',
      'Trường em đã làm gì',
      'Lời kêu gọi ở cuối đoạn',
    ],
    vocab: ['pollution', 'recycle', 'save energy', 'plant trees', 'reduce'],
    checklist: [
      'Có nêu ít nhất ba hành động cụ thể',
      'Có dùng "should" hoặc "must" ít nhất một lần',
      'Câu cuối là một lời kêu gọi',
    ],
    sampleAnswer:
      'Our environment is becoming more and more polluted, so we must protect it. First, we should reduce the amount of plastic we use and always put rubbish in the bin. Second, we can recycle paper and bottles instead of throwing them away. We should also save water and turn off the lights when we leave a room. Last month, my school planted fifty trees in the schoolyard. Let us start today, because a small action can make a big difference.',
  },
  {
    id: 'WP-09',
    title: 'My Dream Job',
    ideas: [
      'Em muốn làm nghề gì',
      'Nghề đó làm những công việc gì',
      'Vì sao em muốn làm nghề đó',
      'Em cần chuẩn bị gì từ bây giờ',
    ],
    vocab: ['career', 'hardworking', 'take care of', 'help people', 'study hard'],
    checklist: [
      'Có dùng "would like to be" hoặc "want to be"',
      'Có ít nhất hai lý do chọn nghề',
      'Có một câu về việc cần chuẩn bị (dùng thì tương lai)',
    ],
    sampleAnswer:
      'I would like to be a doctor when I grow up. Doctors examine patients, give them medicine and take care of them in hospital. I want to do this job because my grandmother was very ill last year and the doctors helped her get better. I also think it is wonderful to save people\'s lives. To make my dream come true, I will study hard, especially biology and English, and I will try to be patient and careful.',
  },
  {
    id: 'WP-10',
    title: 'Tet Holiday in My Family',
    ideas: [
      'Tết diễn ra vào thời gian nào',
      'Gia đình em chuẩn bị những gì',
      'Em làm gì trong những ngày Tết',
      'Cảm nghĩ của em về Tết',
    ],
    vocab: ['Tet holiday', 'decorate', 'lucky money', 'relatives', 'traditional food'],
    checklist: [
      'Có nêu ít nhất hai việc chuẩn bị trước Tết',
      'Có nhắc tới một món ăn hoặc phong tục truyền thống',
      'Có một câu nêu cảm nghĩ ở cuối đoạn',
    ],
    sampleAnswer:
      'Tet is the most important holiday in Viet Nam. It usually takes place in late January or early February. A few days before Tet, my family clean the house and decorate it with peach blossoms. My mother and my grandmother make banh chung, which is my favourite traditional food. On the first day of the new year, I wear new clothes, visit my relatives and receive lucky money. I love Tet because the whole family is together.',
  },
  {
    id: 'WP-11',
    title: 'My House',
    ideas: [
      'Nhà em ở đâu, loại nhà gì',
      'Nhà có mấy phòng',
      'Phòng em thích nhất và vì sao',
      'Cảm nghĩ của em về ngôi nhà',
    ],
    vocab: ['living room', 'furniture', 'tidy', 'cozy', 'next to'],
    checklist: [
      'Có dùng "There is / There are" ít nhất hai lần',
      'Có ít nhất hai giới từ chỉ vị trí (next to, in front of, between...)',
      'Có nói rõ phòng em thích nhất',
    ],
    sampleAnswer:
      'My family lives in a small house in the countryside, about five kilometres from the town. There are four rooms in my house: a living room, a kitchen and two bedrooms. In the living room, there is a brown sofa in front of the television. My bedroom is next to my parents\' bedroom. It is my favourite room because it is quiet and I can read there. I love my house because it is small but very cozy.',
  },
  {
    id: 'WP-12',
    title: 'A Person I Admire',
    ideas: [
      'Người em ngưỡng mộ là ai',
      'Người đó làm nghề gì / nổi tiếng vì điều gì',
      'Điều gì ở người đó khiến em ngưỡng mộ',
      'Em học được gì từ người đó',
    ],
    vocab: ['admire', 'hardworking', 'kind-hearted', 'succeed', 'learn from'],
    checklist: [
      'Có nói rõ người đó là ai và làm gì',
      'Có ít nhất hai phẩm chất được nêu tên',
      'Có một câu về bài học em rút ra',
    ],
    sampleAnswer:
      'The person I admire most is my mother. She is a primary school teacher and she has taught for more than twenty years. My mother is very hardworking; she prepares her lessons carefully every evening. She is also kind-hearted and never shouts at her students. Although she is busy, she always finds time to help me with my homework. From my mother, I have learnt that patience and hard work are the keys to success.',
  },
  {
    id: 'WP-13',
    title: 'My Favorite Subject at School',
    ideas: [
      'Môn học em thích nhất',
      'Em học môn đó mấy tiết một tuần',
      'Em thường làm gì trong giờ học đó',
      'Vì sao em thích môn học này',
    ],
    vocab: ['subject', 'interesting', 'useful', 'take notes', 'get good marks'],
    checklist: [
      'Có nêu số tiết học mỗi tuần',
      'Có mô tả một hoạt động trong giờ học',
      'Có ít nhất hai lý do yêu thích môn học',
    ],
    sampleAnswer:
      'My favorite subject at school is English. I have four English lessons a week, on Monday, Wednesday, Thursday and Friday. In each lesson, we listen to short stories, practise new words and play language games in pairs. I like English because it is very interesting and useful. If I speak English well, I can make friends from many countries and read books in English. I always take notes carefully so that I can get good marks.',
  },
  {
    id: 'WP-14',
    title: 'The Weather in My Hometown',
    ideas: [
      'Quê em ở đâu, có mấy mùa',
      'Thời tiết từng mùa thế nào',
      'Mùa em thích nhất và vì sao',
      'Hoạt động em thường làm vào mùa đó',
    ],
    vocab: ['season', 'humid', 'temperature', 'weather forecast', 'go on a picnic'],
    checklist: [
      'Có nêu tên ít nhất ba mùa',
      'Có ít nhất ba tính từ tả thời tiết',
      'Có nói rõ mùa yêu thích và lý do',
    ],
    sampleAnswer:
      'My hometown is in the north of Viet Nam, so it has four seasons. Spring is warm and there is often light rain. Summer is very hot and humid, and the temperature is sometimes over thirty-five degrees. Autumn is cool and dry, while winter is quite cold. Autumn is my favourite season because the weather is pleasant and the sky is clear. In autumn, my family often goes on a picnic in the park near our house.',
  },
  {
    id: 'WP-15',
    title: 'Technology in My Daily Life',
    ideas: [
      'Em dùng thiết bị công nghệ nào',
      'Em dùng chúng để làm gì',
      'Lợi ích của công nghệ với việc học',
      'Một điều cần lưu ý khi dùng công nghệ',
    ],
    vocab: ['device', 'smartphone', 'the Internet', 'look up', 'spend too much time'],
    checklist: [
      'Có nêu ít nhất hai thiết bị và công dụng',
      'Có ít nhất một lợi ích và một điều cần lưu ý',
      'Có dùng "should" hoặc "shouldn\'t" ít nhất một lần',
    ],
    sampleAnswer:
      'Technology is very important in my daily life. I use a smartphone to call my parents and a laptop to study online. When I do not understand a new word, I look it up on the Internet in a few seconds. Thanks to technology, I can also watch English videos and talk to my teacher after school. However, I think we should not spend too much time on our phones, because it is bad for our eyes and our health.',
  },
]
