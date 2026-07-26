import type { WritingPrompt } from '../../types/domain'

// Đề viết đoạn văn (KN-07) — Mục 4.4: mục tiêu 15 chủ đề.
// Giai đoạn 1: 5 đề khởi động, biên soạn mới, chủ đề gần gũi học sinh tiểu học.
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
  },
]
