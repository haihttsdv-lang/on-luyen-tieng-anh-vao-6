// Nhóm chủ điểm ngữ pháp theo Mục 4.1 URD (Nhóm A–E) + Nhóm F bổ sung sau khi
// đối chiếu giáo trình các trung tâm luyện thi (xem docs/adr/0003). Dùng
// chung cho LessonListPage (danh sách) và MindmapPage (sơ đồ tư duy).
export interface GrammarGroup {
  label: string
  shortLabel: string
  icon: string
  color: string
  range: [number, number]
}

export const GRAMMAR_GROUPS: GrammarGroup[] = [
  {
    label: 'Nhóm A — Từ loại & cụm từ cơ bản',
    shortLabel: 'Nhóm A',
    icon: '🔤',
    color: 'sky',
    range: [1, 10],
  },
  {
    label: 'Nhóm B — Thì động từ',
    shortLabel: 'Nhóm B',
    icon: '⏳',
    color: 'emerald',
    range: [11, 16],
  },
  {
    label: 'Nhóm C — Cấu trúc câu & mệnh đề',
    shortLabel: 'Nhóm C',
    icon: '🧩',
    color: 'amber',
    range: [17, 22],
  },
  {
    label: 'Nhóm D — Động từ khuyết thiếu & dạng động từ',
    shortLabel: 'Nhóm D',
    icon: '⚙️',
    color: 'rose',
    range: [23, 25],
  },
  {
    label: 'Nhóm E — Cấu trúc nâng cao thường gặp trong đề',
    shortLabel: 'Nhóm E',
    icon: '🚀',
    color: 'purple',
    range: [26, 31],
  },
  {
    label: 'Nhóm F — Bổ sung đối chiếu giáo trình luyện thi',
    shortLabel: 'Nhóm F',
    icon: '➕',
    color: 'orange',
    range: [32, 36],
  },
]

export function groupLabelFor(topicId: string): string {
  const num = Number(topicId.split('-')[1])
  return GRAMMAR_GROUPS.find((g) => num >= g.range[0] && num <= g.range[1])?.label ?? 'Khác'
}

export function groupFor(topicId: string): GrammarGroup | undefined {
  const num = Number(topicId.split('-')[1])
  return GRAMMAR_GROUPS.find((g) => num >= g.range[0] && num <= g.range[1])
}

// Nhóm chủ đề ôn thi — hệ thống hóa 36 bài học theo mảng kiến thức thay vì
// mã NP-xx hay Nhóm A–F (vốn chỉ chia theo thứ tự đánh số, không theo mạch
// kiến thức). Thứ tự các nhóm và thứ tự bài trong từng nhóm CHÍNH LÀ thứ tự
// học tuần tự (LEARNING_SEQUENCE bên dưới suy ra từ đây): từ loại & cấu trúc
// câu cơ bản → các thì động từ → câu hỏi & mệnh đề → bị động/tường thuật →
// động từ khuyết thiếu & cấu trúc động từ → cấu trúc nhấn mạnh/cảm thán →
// hòa hợp, từ dễ nhầm & kỹ năng nâng cao. Dùng cho LessonListPage để học
// sinh học lần lượt theo từng nhóm, dễ hệ thống hóa kiến thức khi ôn tập.
export interface ThematicGroup {
  id: string
  label: string
  icon: string
  color: string
  topicIds: string[]
}

export const THEMATIC_GROUPS: ThematicGroup[] = [
  {
    id: 'basics',
    label: 'Nhóm 1 · Từ loại & cấu trúc câu cơ bản',
    icon: '🔤',
    color: 'sky',
    topicIds: [
      'NP-01',
      'NP-02',
      'NP-03',
      'NP-04',
      'NP-05',
      'NP-06',
      'NP-07',
      'NP-08',
      'NP-09',
      'NP-10',
      'NP-32',
    ],
  },
  {
    id: 'tenses',
    label: 'Nhóm 2 · Các thì động từ',
    icon: '⏳',
    color: 'emerald',
    topicIds: ['NP-11', 'NP-12', 'NP-13', 'NP-14', 'NP-15', 'NP-16'],
  },
  {
    id: 'questions-clauses',
    label: 'Nhóm 3 · Câu hỏi & mệnh đề',
    icon: '🧩',
    color: 'amber',
    topicIds: ['NP-17', 'NP-18', 'NP-19', 'NP-20'],
  },
  {
    id: 'passive-reported',
    label: 'Nhóm 4 · Câu bị động & câu tường thuật',
    icon: '🔄',
    color: 'purple',
    topicIds: ['NP-21', 'NP-22'],
  },
  {
    id: 'verb-patterns',
    label: 'Nhóm 5 · Động từ khuyết thiếu & cấu trúc động từ',
    icon: '⚙️',
    color: 'rose',
    topicIds: ['NP-23', 'NP-24', 'NP-25', 'NP-33', 'NP-28'],
  },
  {
    id: 'emphasis',
    label: 'Nhóm 6 · Cấu trúc nhấn mạnh & câu ước',
    icon: '❗',
    color: 'fuchsia',
    topicIds: ['NP-26', 'NP-27', 'NP-29'],
  },
  {
    id: 'advanced',
    label: 'Nhóm 7 · Hòa hợp, từ dễ nhầm & kỹ năng nâng cao',
    icon: '🚀',
    color: 'orange',
    topicIds: ['NP-30', 'NP-31', 'NP-34', 'NP-35', 'NP-36'],
  },
]

export function thematicGroupFor(topicId: string): ThematicGroup | undefined {
  return THEMATIC_GROUPS.find((g) => g.topicIds.includes(topicId))
}

// Thứ tự học tuần tự — suy ra trực tiếp từ THEMATIC_GROUPS ở trên để luôn
// đồng bộ giữa "học theo nhóm chủ đề" và "học lần lượt".
export const LEARNING_SEQUENCE: string[] = THEMATIC_GROUPS.flatMap(
  (g) => g.topicIds,
)

export function sequenceIndexFor(topicId: string): number {
  const i = LEARNING_SEQUENCE.indexOf(topicId)
  return i === -1 ? LEARNING_SEQUENCE.length : i
}
