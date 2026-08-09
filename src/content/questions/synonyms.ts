import type { Question } from '../../types/domain'

/**
 * KN-09 · Từ đồng nghĩa / trái nghĩa — ND-03.
 *
 * ADR 0002 xác định đề THCS Cầu Giấy có 4 câu dạng này trong phần Vocabulary
 * & Grammar, nhưng trước đây không có mã kỹ năng riêng nên `blueprint.ts`
 * gộp lẫn vào KN-03/KN-04 và đề thi thử "Giống đề Cầu Giấy" có thể sinh ra 0
 * câu đồng/trái nghĩa. 24 câu dưới đây đủ để 6 lần thi thử liên tiếp không
 * lặp lại câu nào.
 *
 * Quy ước trình bày: từ cần xét đặt trong dấu **...** giống cách đề thật gạch
 * chân, và luôn nằm trong một câu hoàn chỉnh để học sinh đoán được nghĩa
 * theo ngữ cảnh — đúng kỹ năng mà dạng bài này kiểm tra.
 *
 * `topicIds` gắn với chủ đề từ vựng TV-xx tương ứng, vừa để lọc luyện tập
 * theo chủ điểm vừa để nuôi bản đồ năng lực từ vựng (liên quan ND-07).
 */
export const kn09: Question[] = [
  // ---- Đồng nghĩa ----
  {
    id: 'KN09-01',
    prompt:
      'Choose the word CLOSEST in meaning to the underlined word.\nMy grandmother is a very **kind** woman; she always helps her neighbors.',
    options: ['lazy', 'generous', 'strict', 'quiet'],
    answerIndex: 1,
    explain:
      '"kind" = tốt bụng. "generous" (rộng lượng, hào phóng) gần nghĩa nhất; "strict" là nghiêm khắc, trái nghĩa với ngữ cảnh giúp đỡ hàng xóm.',
    topicIds: ['TV-01'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-02',
    prompt:
      'Choose the word CLOSEST in meaning to the underlined word.\nThe soup my mother cooked was really **delicious**.',
    options: ['tasty', 'salty', 'cheap', 'hot'],
    answerIndex: 0,
    explain: '"delicious" = ngon, đồng nghĩa với "tasty". "salty" chỉ là mặn, không phải ngon.',
    topicIds: ['TV-04'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-03',
    prompt:
      'Choose the word CLOSEST in meaning to the underlined word.\nThe streets of Hanoi are very **crowded** in the morning.',
    options: ['empty', 'narrow', 'full of people', 'noisy'],
    answerIndex: 2,
    explain:
      '"crowded" = đông đúc, tức là "full of people". "noisy" (ồn ào) là hệ quả thường đi kèm nhưng không cùng nghĩa.',
    topicIds: ['TV-09'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-04',
    prompt:
      'Choose the word CLOSEST in meaning to the underlined word.\nMy father is a **hardworking** engineer; he never leaves the office early.',
    options: ['diligent', 'careless', 'famous', 'wealthy'],
    answerIndex: 0,
    explain: '"hardworking" = chăm chỉ, đồng nghĩa với "diligent".',
    topicIds: ['TV-08'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-05',
    prompt:
      'Choose the word CLOSEST in meaning to the underlined word.\nWe must **protect** wild animals in the forest.',
    options: ['hunt', 'catch', 'take care of', 'sell'],
    answerIndex: 2,
    explain: '"protect" = bảo vệ, gần nghĩa nhất với "take care of" (chăm sóc, giữ gìn).',
    topicIds: ['TV-05', 'TV-13'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-06',
    prompt:
      'Choose the word CLOSEST in meaning to the underlined word.\nThe weather in Sa Pa is **freezing** in December.',
    options: ['very cold', 'quite warm', 'changeable', 'humid'],
    answerIndex: 0,
    explain: '"freezing" = lạnh buốt, tức là "very cold" — mức độ mạnh hơn "cold" thông thường.',
    topicIds: ['TV-06'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-07',
    prompt:
      'Choose the word CLOSEST in meaning to the underlined word.\nMinh felt **exhausted** after running ten kilometers.',
    options: ['excited', 'very tired', 'hungry', 'relaxed'],
    answerIndex: 1,
    explain:
      '"exhausted" = kiệt sức = "very tired". Bẫy quen thuộc: "excited" nhìn na ná nhưng nghĩa là hào hứng.',
    topicIds: ['TV-10', 'TV-07'],
    skillId: 'KN-09',
    challenging: true,
  },
  {
    id: 'KN09-08',
    prompt:
      'Choose the word CLOSEST in meaning to the underlined word.\nMy classmate is **fond of** playing badminton after school.',
    options: ['tired of', 'afraid of', 'keen on', 'bored with'],
    answerIndex: 2,
    explain:
      '"be fond of" = thích, đồng nghĩa với "be keen on". Ba lựa chọn còn lại đều mang nghĩa tiêu cực.',
    topicIds: ['TV-07'],
    skillId: 'KN-09',
    challenging: true,
  },
  {
    id: 'KN09-09',
    prompt:
      'Choose the word CLOSEST in meaning to the underlined word.\nThis old temple is an important part of our **heritage**.',
    options: ['tradition', 'building', 'holiday', 'village'],
    answerIndex: 0,
    explain: '"heritage" = di sản, gần nghĩa nhất với "tradition" (truyền thống) trong ngữ cảnh văn hóa.',
    topicIds: ['TV-11'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-10',
    prompt:
      'Choose the word CLOSEST in meaning to the underlined word.\nWe should **reduce** the amount of plastic we use every day.',
    options: ['increase', 'cut down', 'collect', 'burn'],
    answerIndex: 1,
    explain: '"reduce" = giảm bớt = "cut down". "increase" là trái nghĩa.',
    topicIds: ['TV-13'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-11',
    prompt:
      'Choose the word CLOSEST in meaning to the underlined word.\nMy new smartphone is a very **modern** device.',
    options: ['ancient', 'up-to-date', 'expensive', 'heavy'],
    answerIndex: 1,
    explain: '"modern" = hiện đại = "up-to-date". "expensive" (đắt) là đặc điểm khác, không đồng nghĩa.',
    topicIds: ['TV-12'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-12',
    prompt:
      'Choose the word CLOSEST in meaning to the underlined word.\nThe room was so **tidy** that I could find everything at once.',
    options: ['dirty', 'neat', 'dark', 'large'],
    answerIndex: 1,
    explain: '"tidy" = gọn gàng = "neat".',
    topicIds: ['TV-03'],
    skillId: 'KN-09',
  },

  // ---- Trái nghĩa ----
  {
    id: 'KN09-13',
    prompt:
      'Choose the word OPPOSITE in meaning to the underlined word.\nThe test was quite **difficult** for most students in my class.',
    options: ['hard', 'boring', 'easy', 'long'],
    answerIndex: 2,
    explain: '"difficult" = khó, trái nghĩa là "easy". "hard" lại là từ ĐỒNG nghĩa — bẫy hay gặp nhất.',
    topicIds: ['TV-02'],
    skillId: 'KN-09',
    challenging: true,
  },
  {
    id: 'KN09-14',
    prompt:
      'Choose the word OPPOSITE in meaning to the underlined word.\nThe streets near my house are always **noisy** in the evening.',
    options: ['crowded', 'quiet', 'busy', 'dirty'],
    answerIndex: 1,
    explain: '"noisy" = ồn ào, trái nghĩa là "quiet". "crowded" và "busy" cùng hướng nghĩa với noisy.',
    topicIds: ['TV-09'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-15',
    prompt:
      'Choose the word OPPOSITE in meaning to the underlined word.\nMy little sister is very **shy** when she meets new people.',
    options: ['polite', 'confident', 'kind', 'careful'],
    answerIndex: 1,
    explain: '"shy" = nhút nhát, trái nghĩa là "confident" (tự tin).',
    topicIds: ['TV-01'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-16',
    prompt:
      'Choose the word OPPOSITE in meaning to the underlined word.\nThe river near our village is getting more **polluted** every year.',
    options: ['clean', 'deep', 'wide', 'dangerous'],
    answerIndex: 0,
    explain: '"polluted" = ô nhiễm, trái nghĩa là "clean" (sạch).',
    topicIds: ['TV-13'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-17',
    prompt:
      'Choose the word OPPOSITE in meaning to the underlined word.\nRemember to **turn on** the lights when you enter the room.',
    options: ['switch on', 'put on', 'turn off', 'take on'],
    answerIndex: 2,
    explain:
      '"turn on" = bật, trái nghĩa là "turn off" = tắt. "switch on" là đồng nghĩa; "put on" là mặc vào.',
    topicIds: ['TV-14'],
    skillId: 'KN-09',
    challenging: true,
  },
  {
    id: 'KN09-18',
    prompt:
      'Choose the word OPPOSITE in meaning to the underlined word.\nAfter two weeks in hospital, my grandfather is **healthy** again.',
    options: ['strong', 'sick', 'tired', 'old'],
    answerIndex: 1,
    explain: '"healthy" = khỏe mạnh, trái nghĩa là "sick" (ốm). "tired" chỉ là mệt, chưa phải ốm.',
    topicIds: ['TV-10'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-19',
    prompt:
      'Choose the word OPPOSITE in meaning to the underlined word.\nThe soup tastes rather **sour** today.',
    options: ['fresh', 'spicy', 'sweet', 'salty'],
    answerIndex: 2,
    explain: '"sour" = chua, trái nghĩa là "sweet" = ngọt.',
    topicIds: ['TV-04'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-20',
    prompt:
      'Choose the word OPPOSITE in meaning to the underlined word.\nThis species of turtle is now **endangered** in Viet Nam.',
    options: ['common', 'wild', 'rare', 'small'],
    answerIndex: 0,
    explain:
      '"endangered" = có nguy cơ tuyệt chủng (còn rất ít), trái nghĩa là "common" (phổ biến). "rare" (hiếm) lại cùng hướng nghĩa.',
    topicIds: ['TV-05', 'TV-13'],
    skillId: 'KN-09',
    challenging: true,
  },
  {
    id: 'KN09-21',
    prompt:
      'Choose the word OPPOSITE in meaning to the underlined word.\nOur teacher was **absent** from school yesterday.',
    options: ['late', 'present', 'busy', 'free'],
    answerIndex: 1,
    explain: '"absent" = vắng mặt, trái nghĩa là "present" = có mặt.',
    topicIds: ['TV-02'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-22',
    prompt:
      'Choose the word OPPOSITE in meaning to the underlined word.\nMy uncle usually arrives **early** for every family meeting.',
    options: ['soon', 'late', 'fast', 'quickly'],
    answerIndex: 1,
    explain:
      '"early" = sớm, trái nghĩa là "late" = muộn. Bẫy: "fast/quickly" nói về tốc độ, không phải thời điểm.',
    topicIds: ['TV-01'],
    skillId: 'KN-09',
    challenging: true,
  },
  {
    id: 'KN09-23',
    prompt:
      'Choose the word OPPOSITE in meaning to the underlined word.\nThe weather today is **mild**, so we can play outside.',
    options: ['warm', 'severe', 'pleasant', 'dry'],
    answerIndex: 1,
    explain: '"mild" = ôn hòa, dễ chịu; trái nghĩa là "severe" = khắc nghiệt.',
    topicIds: ['TV-06'],
    skillId: 'KN-09',
  },
  {
    id: 'KN09-24',
    prompt:
      'Choose the word OPPOSITE in meaning to the underlined word.\nDon\'t **give up** — you can finish this exercise!',
    options: ['carry on', 'look for', 'find out', 'run out of'],
    answerIndex: 0,
    explain: '"give up" = bỏ cuộc, trái nghĩa là "carry on" = tiếp tục.',
    topicIds: ['TV-14'],
    skillId: 'KN-09',
    challenging: true,
  },
]
