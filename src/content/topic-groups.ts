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
