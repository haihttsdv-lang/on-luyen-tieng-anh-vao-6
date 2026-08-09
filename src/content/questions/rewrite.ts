import type { Question } from '../../types/domain'

/**
 * KN-05 · Viết lại câu — bổ sung theo ND-04.
 *
 * Phần này chiếm 4/40 câu đề thật (10% điểm) và là phần phân loại học sinh
 * giỏi, nhưng ngân hàng cũ chỉ có 10 câu và chưa phủ đều các dạng biến đổi
 * bắt buộc. 15 câu dưới đây bổ sung để đạt 25 câu, mỗi dạng ≥ 2 câu:
 *
 *   so...that ↔ such...that · too...to ↔ not enough to · chủ động ↔ bị động
 *   trực tiếp ↔ gián tiếp · câu điều kiện · wish/if only
 *   so sánh hơn ↔ nhất ↔ bằng · because ↔ because of / although ↔ despite
 *   It takes ↔ spend · used to
 *
 * Mỗi câu có `hint` (công thức cần nhớ) — chỉ hiện SAU khi trả lời sai, đúng
 * cách giáo viên chữa dạng bài này trên lớp.
 */
export const kn05Extra: Question[] = [
  // ---- too...to ↔ not enough to ----
  {
    id: 'KN05-11',
    prompt:
      'Which sentence has the same meaning as "This box is too heavy for me to carry"?',
    options: [
      "This box isn't light enough for me to carry.",
      'This box is light enough for me to carry.',
      "This box isn't heavy enough for me to carry.",
      'This box is so light that I can carry it.',
    ],
    answerIndex: 0,
    explain:
      'too + adj (heavy) ↔ not + adj TRÁI NGHĨA (light) + enough. Đổi "heavy" thành "light" rồi thêm "not ... enough".',
    hint: 'S + be + too + adj + to V ⇔ S + be + NOT + adj(trái nghĩa) + enough + to V',
    topicIds: ['NP-33'],
    skillId: 'KN-05',
    challenging: true,
  },
  {
    id: 'KN05-12',
    prompt:
      'Which sentence has the same meaning as "Nam isn\'t old enough to ride a motorbike"?',
    options: [
      'Nam is old enough to ride a motorbike.',
      'Nam is too young to ride a motorbike.',
      'Nam is too old to ride a motorbike.',
      'Nam is so old that he can ride a motorbike.',
    ],
    answerIndex: 1,
    explain: 'not old enough ⇔ too young. Phải đổi sang tính từ trái nghĩa khi chuyển hai chiều.',
    hint: 'not + adj + enough + to V ⇔ too + adj(trái nghĩa) + to V',
    topicIds: ['NP-33'],
    skillId: 'KN-05',
  },

  // ---- so...that ↔ such...that ----
  {
    id: 'KN05-13',
    prompt:
      'Which sentence has the same meaning as "It was such an interesting film that we watched it twice"?',
    options: [
      'The film was so interesting that we watched it twice.',
      'The film was such interesting that we watched it twice.',
      'The film was too interesting for us to watch twice.',
      'The film was so an interesting that we watched it twice.',
    ],
    answerIndex: 0,
    explain:
      'such + a/an + adj + N ⇔ so + adj (bỏ danh từ, đưa danh từ lên làm chủ ngữ). "such interesting" sai vì thiếu danh từ.',
    hint: 'such + a/an + adj + N + that ⇔ S + be + so + adj + that',
    topicIds: ['NP-26'],
    skillId: 'KN-05',
  },

  // ---- Chủ động ↔ bị động ----
  {
    id: 'KN05-14',
    prompt:
      'Which sentence has the same meaning as "My father repaired the bicycle yesterday"?',
    options: [
      'The bicycle is repaired by my father yesterday.',
      'The bicycle was repaired by my father yesterday.',
      'The bicycle was repair by my father yesterday.',
      'The bicycle has been repaired by my father yesterday.',
    ],
    answerIndex: 1,
    explain:
      '"yesterday" ⇒ quá khứ đơn ⇒ bị động dùng "was/were + V3". Có mốc quá khứ nên không dùng hiện tại hoàn thành.',
    hint: 'Bị động quá khứ đơn: S + was/were + V3/V-ed + (by O)',
    topicIds: ['NP-21', 'NP-13'],
    skillId: 'KN-05',
  },
  {
    id: 'KN05-15',
    prompt:
      'Which sentence has the same meaning as "The teacher gives us a lot of homework every week"?',
    options: [
      'A lot of homework is given to us every week.',
      'A lot of homework are given to us every week.',
      'A lot of homework was given to us every week.',
      'We are given a lot of homework by the teacher last week.',
    ],
    answerIndex: 0,
    explain:
      '"homework" là danh từ KHÔNG đếm được ⇒ chia số ít "is given". "every week" ⇒ hiện tại đơn.',
    hint: 'Bị động hiện tại đơn: S + am/is/are + V3/V-ed. Danh từ không đếm được luôn chia số ít.',
    topicIds: ['NP-21', 'NP-01'],
    skillId: 'KN-05',
    challenging: true,
  },

  // ---- Trực tiếp ↔ gián tiếp ----
  {
    id: 'KN05-16',
    prompt:
      'Which sentence has the same meaning as \'"I will visit my grandparents tomorrow," Mai said\'?',
    options: [
      'Mai said she will visit her grandparents tomorrow.',
      'Mai said she would visit her grandparents the next day.',
      'Mai said she would visit my grandparents tomorrow.',
      'Mai says she would visit her grandparents the next day.',
    ],
    answerIndex: 1,
    explain:
      'Lùi thì will → would, đổi đại từ my → her, và đổi trạng ngữ tomorrow → the next day. Phải đổi ĐỦ cả ba.',
    hint: 'will → would · my → her/his · tomorrow → the next day · today → that day',
    topicIds: ['NP-22'],
    skillId: 'KN-05',
    challenging: true,
  },
  {
    id: 'KN05-17',
    prompt:
      'Which sentence has the same meaning as \'"Don\'t play football in the yard," my mother said to me\'?',
    options: [
      'My mother told me not to play football in the yard.',
      'My mother told me to not play football in the yard.',
      "My mother said me don't play football in the yard.",
      'My mother told me not playing football in the yard.',
    ],
    answerIndex: 0,
    explain:
      'Câu mệnh lệnh phủ định ⇒ told + O + NOT + to V. "said me" sai vì "say" không đi kèm tân ngữ trực tiếp.',
    hint: 'Mệnh lệnh: told + O + (not) + to V. Nhớ: say TO somebody, nhưng tell somebody.',
    topicIds: ['NP-22'],
    skillId: 'KN-05',
  },

  // ---- Câu điều kiện ----
  {
    id: 'KN05-18',
    prompt:
      'Which sentence has the same meaning as "Study harder or you will fail the exam"?',
    options: [
      "If you study harder, you will fail the exam.",
      "If you don't study harder, you will fail the exam.",
      "Unless you don't study harder, you will fail the exam.",
      'If you studied harder, you would fail the exam.',
    ],
    answerIndex: 1,
    explain:
      '"Mệnh lệnh + or + hậu quả xấu" ⇔ "If + KHÔNG làm việc đó, hậu quả xấu xảy ra". Phải thêm phủ định vào vế If.',
    hint: 'V + or + S will... ⇔ If + S + don\'t/doesn\'t + V, S + will...',
    topicIds: ['NP-20'],
    skillId: 'KN-05',
    challenging: true,
  },
  {
    id: 'KN05-19',
    prompt:
      'Which sentence has the same meaning as "Lan doesn\'t have a bike, so she goes to school on foot"?',
    options: [
      'If Lan has a bike, she will go to school on foot.',
      "If Lan had a bike, she wouldn't go to school on foot.",
      "If Lan doesn't have a bike, she goes to school on foot.",
      'If Lan had a bike, she would go to school on foot.',
    ],
    answerIndex: 1,
    explain:
      'Sự thật trái ngược ở hiện tại ⇒ điều kiện loại 2: If + quá khứ đơn, S + would + V. Đảo nghĩa cả hai vế.',
    hint: 'Loại 2 (trái sự thật hiện tại): If + S + V-ed, S + would + V',
    topicIds: ['NP-20'],
    skillId: 'KN-05',
    challenging: true,
  },

  // ---- wish / if only ----
  {
    id: 'KN05-20',
    prompt:
      'Which sentence has the same meaning as "I am sorry that I can\'t swim"?',
    options: [
      'I wish I can swim.',
      'I wish I could swim.',
      'I wish I swim.',
      'I wish I will swim.',
    ],
    answerIndex: 1,
    explain: 'Câu ước ở hiện tại lùi một thì: can → could.',
    hint: 'wish ở hiện tại: S + wish(es) + S + V-ed / could + V (không dùng hiện tại hay will)',
    topicIds: ['NP-29'],
    skillId: 'KN-05',
  },
  {
    id: 'KN05-21',
    prompt: 'Which sentence has the same meaning as "My house is very small"?',
    options: [
      'I wish my house is bigger.',
      'I wish my house were bigger.',
      'I wish my house will be bigger.',
      'I wish my house is not small.',
    ],
    answerIndex: 1,
    explain:
      'Ước trái với hiện tại dùng "were" cho mọi ngôi (dạng giả định), và đổi sang tính từ trái nghĩa "bigger".',
    hint: 'wish + S + were + ... (dùng "were" cho MỌI ngôi trong câu ước)',
    topicIds: ['NP-29'],
    skillId: 'KN-05',
  },

  // ---- So sánh ----
  {
    id: 'KN05-22',
    prompt:
      'Which sentence has the same meaning as "No student in my class is taller than Hung"?',
    options: [
      'Hung is the tallest student in my class.',
      'Hung is taller than any student in my class.',
      'Hung is as tall as other students in my class.',
      'Hung is the shortest student in my class.',
    ],
    answerIndex: 0,
    explain: '"No ... is + so sánh hơn + than X" ⇔ X là NHẤT ⇒ so sánh nhất.',
    hint: 'No one is + adj-er + than X ⇔ X is the + adj-est',
    topicIds: ['NP-06'],
    skillId: 'KN-05',
    challenging: true,
  },
  {
    id: 'KN05-23',
    prompt:
      'Which sentence has the same meaning as "My bag is not as expensive as yours"?',
    options: [
      'My bag is more expensive than yours.',
      'Your bag is cheaper than mine.',
      'Your bag is more expensive than mine.',
      'My bag and your bag cost the same.',
    ],
    answerIndex: 2,
    explain:
      '"A không đắt bằng B" ⇒ B đắt hơn A. Bẫy: đáp án 1 đảo ngược sai chiều so sánh.',
    hint: 'A + not as + adj + as + B ⇔ B + adj-er/more adj + than + A',
    topicIds: ['NP-06'],
    skillId: 'KN-05',
    challenging: true,
  },

  // ---- because ↔ because of / although ↔ despite ----
  {
    id: 'KN05-24',
    prompt:
      'Which sentence has the same meaning as "Because the weather was bad, we stayed at home"?',
    options: [
      'Because of the weather was bad, we stayed at home.',
      'Because of the bad weather, we stayed at home.',
      'Although the bad weather, we stayed at home.',
      'Despite the weather was bad, we stayed at home.',
    ],
    answerIndex: 1,
    explain:
      'because + MỆNH ĐỀ (S+V) ⇔ because of + CỤM DANH TỪ. "because of the weather was bad" sai vì sau because of không được có S+V.',
    hint: 'because + S + V ⇔ because of + N/V-ing (không có động từ chia)',
    topicIds: ['NP-09', 'NP-19'],
    skillId: 'KN-05',
  },
  {
    id: 'KN05-25',
    prompt:
      'Which sentence has the same meaning as "Although he was tired, he finished his homework"?',
    options: [
      'Despite he was tired, he finished his homework.',
      'In spite of he was tired, he finished his homework.',
      'Despite his tiredness, he finished his homework.',
      'Because of his tiredness, he finished his homework.',
    ],
    answerIndex: 2,
    explain:
      'although + mệnh đề ⇔ despite / in spite of + cụm danh từ. Phải danh từ hóa "he was tired" thành "his tiredness".',
    hint: 'Although + S + V ⇔ Despite / In spite of + N / V-ing',
    topicIds: ['NP-19', 'NP-09'],
    skillId: 'KN-05',
    challenging: true,
  },

  // ---- It takes ↔ spend · used to ----
  {
    id: 'KN05-26',
    prompt:
      'Which sentence has the same meaning as "It takes me twenty minutes to walk to school"?',
    options: [
      'I spend twenty minutes to walk to school.',
      'I spend twenty minutes walking to school.',
      'I take twenty minutes walking to school.',
      'It spends me twenty minutes walking to school.',
    ],
    answerIndex: 1,
    explain:
      'It takes + O + thời gian + TO V ⇔ S + spend + thời gian + V-ING. Sau "spend" phải là V-ing, không phải to V.',
    hint: 'It takes + sb + time + to V ⇔ sb + spend(s) + time + V-ing',
    topicIds: ['NP-25'],
    skillId: 'KN-05',
    challenging: true,
  },
  {
    id: 'KN05-27',
    prompt:
      'Which sentence has the same meaning as "I often went fishing with my grandfather when I was young, but I don\'t now"?',
    options: [
      'I use to go fishing with my grandfather.',
      'I used to going fishing with my grandfather.',
      'I used to go fishing with my grandfather.',
      'I am used to going fishing with my grandfather.',
    ],
    answerIndex: 2,
    explain:
      '"used to + V nguyên thể" = thói quen CŨ nay không còn. Phân biệt với "be used to + V-ing" = đã quen với việc gì.',
    hint: 'used to + V (thói quen cũ) ≠ be used to + V-ing (đã quen làm gì)',
    topicIds: ['NP-16'],
    skillId: 'KN-05',
    challenging: true,
  },
]
