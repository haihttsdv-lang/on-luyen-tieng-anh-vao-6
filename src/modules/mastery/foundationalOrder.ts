// FR-M02/M07: lộ trình nền tảng mặc định cho chủ điểm chưa từng được luyện.
// Mục 4.4 URD nêu rõ thứ tự ưu tiên: NP-06, NP-11–16, NP-18, NP-21–24 (các
// chủ điểm xuất hiện nhiều trong đề). Phần còn lại nối tiếp theo thứ tự số.
const PRIORITY_NP = [
  'NP-06',
  'NP-11',
  'NP-12',
  'NP-13',
  'NP-14',
  'NP-15',
  'NP-16',
  'NP-18',
  'NP-21',
  'NP-22',
  'NP-23',
  'NP-24',
]

function allNpIds(): string[] {
  return Array.from({ length: 31 }, (_, i) => `NP-${String(i + 1).padStart(2, '0')}`)
}

function allTvIds(): string[] {
  return Array.from({ length: 14 }, (_, i) => `TV-${String(i + 1).padStart(2, '0')}`)
}

export const FOUNDATIONAL_TOPIC_ORDER: string[] = [
  ...PRIORITY_NP,
  ...allNpIds().filter((id) => !PRIORITY_NP.includes(id)),
  ...allTvIds(),
]
