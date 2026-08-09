import type { ReadingPassage } from '../../types/domain'

/**
 * ND-05 · Bổ sung bài đọc hiểu (KN-02) từ 8 lên 15 bài — đạt mục tiêu Mục
 * 4.4 URD (15–20 bài).
 *
 * Hai điểm khác biệt so với 8 bài cũ:
 *
 * 1. **Phân tầng độ khó** (`level`): đề CLC luôn có ít nhất một bài "khó" để
 *    phân loại học sinh giỏi — bài `advanced` dài 200–250 từ, có từ vựng phải
 *    suy đoán theo ngữ cảnh, câu văn nhiều mệnh đề.
 * 2. **Chủ đề bám đề CLC**: môi trường, công nghệ, lễ hội truyền thống, danh
 *    lam Việt Nam, tiểu sử nhân vật, và dạng đọc lấy thông tin từ thời khóa
 *    biểu/lịch trình.
 */
export const readingPassagesExtra: ReadingPassage[] = [
  {
    id: 'RP-09',
    title: 'The Green Club',
    level: 'basic',
    text: `Nam is a student at Quang Trung Primary School. Last year, he and five of his friends started a group called the Green Club. Their aim is to make their school cleaner and greener. Every Friday afternoon, the members of the club collect plastic bottles and paper around the school yard. They put the bottles in a big blue box and the paper in a yellow one. At the end of each month, they sell these things to a recycling centre. With the money, the club buys young trees and plants them behind the library. So far, the students have planted more than forty trees. The club also makes colourful posters to remind everyone to turn off the lights and the fans before leaving the classroom. Their teacher, Ms. Lan, says that the electricity bill of the school has gone down since the club started. Now more than sixty students want to join the Green Club, and Nam is very happy about that.`,
    topicIds: ['TV-13', 'TV-02', 'NP-15'],
  },
  {
    id: 'RP-10',
    title: 'A Trip to Trang An',
    level: 'basic',
    text: `Trang An is a famous landscape complex in Ninh Binh Province, about ninety kilometres south of Ha Noi. It became a World Heritage Site in 2014. Visitors come here to sit on small boats and travel along quiet rivers between high limestone mountains. The boats are rowed by local women, and each trip takes about three hours. During the trip, the boat passes through several dark caves. Some caves are so low that visitors have to bend their heads. Inside, the air is cool and there are strange rocks of many shapes. Along the way, tourists can also stop and visit old temples hidden among the trees. The best time to visit Trang An is in spring, when the weather is dry and cool. In summer it can be very hot on the water, so visitors should bring a hat and some drinking water. Many foreign tourists say that Trang An is one of the most peaceful places they have ever been to.`,
    topicIds: ['TV-09', 'TV-11', 'NP-21'],
  },
  {
    id: 'RP-11',
    title: 'The Mid-Autumn Festival',
    level: 'basic',
    text: `The Mid-Autumn Festival is one of the most popular festivals for children in Viet Nam. It takes place on the fifteenth day of the eighth lunar month, when the moon is at its brightest and roundest. Before the festival, families buy or make mooncakes, which are round cakes with sweet or salty fillings. Children often carry colourful star-shaped lanterns and walk together in the streets after dinner. In many neighbourhoods, there is a lion dance with loud drums, and everyone comes out to watch. Families also prepare a tray of fruit, and the children eat it together while looking at the moon. Grandparents often tell the old story of Chu Cuoi, a man who lives on the moon under a banyan tree. For many Vietnamese people, the festival is not only about mooncakes and lanterns; it is also a time when the whole family gathers and the children feel that they are loved and remembered.`,
    topicIds: ['TV-11', 'NP-11'],
  },
  {
    id: 'RP-12',
    title: "Ha's Weekly Timetable",
    level: 'basic',
    text: `Ha is in Grade 5 at Le Loi Primary School. Her classes start at 7:00 a.m. and finish at 11:15 a.m. from Monday to Friday. On Monday and Wednesday, she has two Maths lessons in the morning, and on Tuesday and Thursday she has two English lessons. Friday morning is her favourite because she has Music and Art. In the afternoon, Ha has different activities. She goes to a swimming class at the sports centre on Monday and Thursday from 4:00 to 5:00 p.m. On Tuesday afternoon, she stays at home and does her homework. On Wednesday, she goes to the public library with her mother and borrows two books. She usually has a free afternoon on Friday, so she plays badminton with her cousin. At the weekend, Ha helps her mother in the kitchen on Saturday morning, and on Sunday the whole family visits her grandparents in the countryside.`,
    topicIds: ['TV-02', 'NP-11', 'NP-08'],
  },
  {
    id: 'RP-13',
    title: 'Nguyen Ngoc Ky: The Man Who Writes with His Feet',
    level: 'advanced',
    text: `Nguyen Ngoc Ky was born in 1947 in Nam Dinh Province. When he was four years old, he became seriously ill, and after that he could no longer use either of his arms. At first, his parents thought that he would never be able to go to school. However, when Ky was seven, he stood outside a classroom every day and watched the other children write. He was determined to learn, so he began to practise holding a pencil between his toes. It was extremely difficult, and for months his feet ached badly, but he refused to give up. Two years later, he was able to write neatly with his feet, and his teacher finally allowed him to take the class examinations. Ky went on to win prizes in provincial mathematics competitions and, in 1970, he graduated from university with a degree in literature. He then spent more than thirty years teaching in secondary schools, where his students admired not only his knowledge but also his patience. Even after he retired, he continued to travel around the country and give talks to young people. His message was always simple: difficulties can slow you down, but only you can decide to stop.`,
    topicIds: ['TV-08', 'NP-13', 'NP-15'],
  },
  {
    id: 'RP-14',
    title: 'Learning English with Technology',
    level: 'advanced',
    text: `Twenty years ago, most Vietnamese students learned English only from a textbook and a cassette player. Today, the situation is completely different. A student with a smartphone can look up an unfamiliar word in a second, listen to a native speaker pronounce it, and then record her own voice to compare the two. Many learners also join online groups where they exchange messages with students from other countries, which gives them a genuine reason to write in English rather than merely doing exercises for marks. Teachers, too, have benefited: they can show short videos in class and give each student different exercises according to his or her level. Nevertheless, technology alone does not guarantee progress. Some students spend hours downloading applications and watching videos, yet they hardly ever speak a full sentence aloud. Others rely so heavily on translation software that they never learn to guess the meaning of a new word from its context — a skill that every good reader needs. Experts therefore advise learners to treat technology as a useful tool rather than a substitute for effort. The most successful students, they say, are those who use these tools with a clear plan and who still practise every single day.`,
    topicIds: ['TV-12', 'TV-02', 'NP-15'],
  },
  {
    id: 'RP-15',
    title: 'Plastic in the Ocean',
    level: 'advanced',
    text: `Every year, millions of tonnes of plastic end up in the world's oceans. Much of this waste does not come from ships; it is carried from towns and cities by rivers after heavy rain. Once plastic reaches the sea, sunlight and waves slowly break it into tiny pieces smaller than a grain of rice. Scientists call these pieces microplastics, and they are now found almost everywhere — from the surface of tropical seas to the deepest parts of the ocean floor. The problem is that sea animals cannot tell the difference between microplastics and food. Fish, turtles and seabirds swallow them, and the plastic remains inside their bodies. In some areas, researchers have found plastic in more than half of the fish they examined. Since many of these fish are later sold in markets, the waste that people throw away may eventually return to their own dinner tables. Fortunately, the situation is not hopeless. Several countries have banned thin plastic bags, and a growing number of companies now use paper or glass instead. Volunteers around the world also organise beach clean-ups every month. However, experts warn that cleaning is not enough: unless we produce far less plastic in the first place, the amount in the ocean will continue to rise.`,
    topicIds: ['TV-13', 'TV-05', 'NP-21'],
  },
]
