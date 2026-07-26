import type { ReadingPassage } from '../../types/domain'

// Bài đọc hiểu dài (KN-02) — Mục 4.4: mục tiêu 15–20 bài, mỗi bài 5 câu hỏi.
// Giai đoạn 1: 2 bài khởi động. Giai đoạn 6: +6 bài (RP-03..08), biên soạn
// mới, đa dạng chủ đề để giảm trùng lặp trong đề thi thử.
export const readingPassages: ReadingPassage[] = [
  {
    id: 'RP-01',
    title: 'The Football Match',
    text: `Last Saturday afternoon, Class 5A played a football match against Class 5B in the school yard. When the match started, the sun was shining brightly and many students were watching from the side. In the first half, Class 5B scored two goals, so the players of Class 5A felt worried. However, everything changed in the second half. While the goalkeeper of Class 5B was talking to his teammate, Minh, the captain of Class 5A, kicked the ball into the goal. A few minutes later, he scored two more goals! His teammates cheered loudly and ran to hug him. In the end, Class 5A won the match three goals to two. After the game, both teams shook hands and thanked their teacher, Mr. Hung, for organizing such an exciting event. Minh said he felt very proud, but he also thanked his friends for their hard work as a team.`,
    topicIds: ['TV-07', 'NP-13', 'NP-14'],
  },
  {
    id: 'RP-02',
    title: 'Robots at School',
    text: `Nowadays, many schools around the world are using robots to help students learn. Some robots can talk, sing, and even dance! In a primary school in Ha Noi, a small robot named Robi helps the teacher during English lessons. Robi can ask questions, play word games, and give stars to students who answer correctly. Students love Robi because it never gets angry and it always waits patiently for their answers. However, teachers say that robots cannot replace humans completely. A robot can help students practice vocabulary, but it cannot understand a student's feelings the way a real teacher can. In the future, more schools may use robots like Robi, but teachers will always play the most important role in the classroom.`,
    topicIds: ['TV-12', 'NP-11', 'NP-23'],
  },
  {
    id: 'RP-03',
    title: 'A Weekend with Grandparents',
    text: `Last weekend, Minh and his sister went to visit their grandparents in the countryside. Their grandparents live in a small house near a river, surrounded by rice fields. When they arrived, their grandmother was cooking a delicious lunch in the kitchen. After lunch, their grandfather took them fishing by the river. Minh caught two small fish, and he felt very proud. In the evening, they sat together and listened to their grandfather's stories about his childhood. Minh's sister said she wanted to visit more often because she loved spending time with her grandparents. Before leaving on Sunday, their grandmother gave them a bag of fresh vegetables from her garden. Minh promised to come back again next month.`,
    topicIds: ['TV-01', 'NP-13'],
  },
  {
    id: 'RP-04',
    title: 'Our School Sports Day',
    text: `Every March, our school organizes a Sports Day for all students. This year, the event took place on a sunny Saturday morning. Students from every class took part in different games, such as running races, jumping competitions, and tug of war. Class 5B, Nam's class, worked very hard to win the relay race. At first, they were behind the other teams, but in the final round, Nam ran extremely fast and helped his team finish first. Everyone cheered loudly for Class 5B. After the games, the principal gave out medals to the winners. Nam felt very happy because it was the first time his class had won a medal. He said that Sports Day taught him the importance of teamwork.`,
    topicIds: ['TV-02', 'TV-07', 'NP-13'],
  },
  {
    id: 'RP-05',
    title: 'Vietnamese Street Food',
    text: `Vietnam is famous for its delicious street food. In every city, you can find small stalls selling noodles, spring rolls, and fresh fruit. One popular dish is "pho," a warm noodle soup with meat and herbs. Many people eat pho for breakfast because it is both tasty and filling. Another common snack is "banh mi," a type of sandwich made with bread, meat, and vegetables. Tourists often say that Vietnamese street food is cheap but very delicious. Food sellers usually start working early in the morning and prepare fresh ingredients every day. Many families have their own recipes that have been passed down for generations. Trying street food is one of the best ways to learn about Vietnamese culture.`,
    topicIds: ['TV-04', 'NP-11'],
  },
  {
    id: 'RP-06',
    title: 'A Day at the Zoo',
    text: `Last Sunday, Lan's class went on a school trip to the city zoo. The students were very excited to see many different animals. First, they visited the elephants, which were eating leaves near a big pond. Next, they walked to see the tigers, but the tigers were sleeping under a tree. Lan's favorite part was watching the monkeys, because they were jumping and playing happily in their cage. The zookeeper explained that the zoo protects wild animals and teaches visitors about nature. At the end of the trip, the teacher reminded the students not to feed the animals or throw rubbish. Lan learned that everyone should help protect wild animals and keep their homes clean.`,
    topicIds: ['TV-05', 'NP-13'],
  },
  {
    id: 'RP-07',
    title: 'Getting Around Ha Noi',
    text: `Ha Noi is a busy city with millions of people, so getting around can sometimes be difficult. Many people use motorbikes because they are fast and easy to park. Students often ride bicycles or take the bus to school. In recent years, the city has built new bus routes to help reduce traffic jams. Some streets in the Old Quarter are very crowded, especially in the evening. Visitors are often surprised by how many motorbikes there are on the road. To cross a busy street safely, people usually walk slowly and let the traffic flow around them. The city is also building new train lines to make travel faster and more convenient in the future.`,
    topicIds: ['TV-09', 'NP-11'],
  },
  {
    id: 'RP-08',
    title: 'The Robot Football Team',
    text: `At a technology fair in Ha Noi, a group of students showed off something amazing: a team of small robots that could play football! The students, all around eleven years old, had spent six months building and programming the robots. Each robot could move, kick a small ball, and even avoid crashing into other robots. During the demonstration, the robot team played a short match against another school's robots. The crowd cheered as the robots moved quickly across the small field. One of the students explained that the hardest part was teaching the robots to find the ball by themselves. Many visitors were impressed and said that these students might become great engineers in the future. The team hopes to build an even smarter robot next year.`,
    topicIds: ['TV-12', 'NP-13'],
  },
]
