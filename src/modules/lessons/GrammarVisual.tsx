/**
 * Sơ đồ trực quan cho bài học ngữ pháp (MM-04). Ba loại hình có giá trị dạy
 * học cao nhất trong lớp luyện thi được dựng bằng React + Tailwind thuần —
 * không dùng file ảnh, nên vẫn hoạt động trong bản đóng gói 1 file HTML và
 * không tăng dung lượng đáng kể:
 *
 *   1. Trục thời gian  — dạy các thì (NP-11→16): thấy ngay vùng thời gian.
 *   2. Bảng chia động từ — khẳng định/phủ định/nghi vấn, rõ hơn hẳn văn xuôi.
 *   3. Sơ đồ cấu trúc câu — tô màu từng thành phần của công thức.
 *
 * Chủ điểm nào chưa có sơ đồ thì component tự ẩn (trả về null).
 */

interface TimelineMark {
  /** Vị trí trên trục 0–100 (0 = quá khứ xa, 50 = hiện tại, 100 = tương lai). */
  at: number
  label: string
}

interface TimelineSpec {
  kind: 'timeline'
  /** Vùng thời gian được tô sáng, [từ, đến] trên thang 0–100. */
  span: [number, number]
  spanLabel: string
  marks?: TimelineMark[]
  note: string
}

interface TableSpec {
  kind: 'table'
  title: string
  headers: string[]
  rows: string[][]
  note?: string
}

interface StructurePart {
  text: string
  /** Vai trò ngữ pháp, quyết định màu ô. */
  role: 'subject' | 'verb' | 'keyword' | 'complement' | 'object'
}

interface StructureSpec {
  kind: 'structure'
  title: string
  parts: StructurePart[]
  example: string
  note?: string
}

type VisualSpec = TimelineSpec | TableSpec | StructureSpec

const ROLE_CLASS: Record<StructurePart['role'], string> = {
  subject: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
  verb: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  keyword: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  complement: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
  object: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
}

const ROLE_LABEL: Record<StructurePart['role'], string> = {
  subject: 'Chủ ngữ',
  verb: 'Động từ',
  keyword: 'Từ khóa cấu trúc',
  complement: 'Bổ ngữ',
  object: 'Tân ngữ',
}

const VISUALS: Record<string, VisualSpec[]> = {
  'NP-11': [
    {
      kind: 'timeline',
      span: [8, 92],
      spanLabel: 'Đúng ở mọi thời điểm — thói quen, sự thật',
      marks: [{ at: 50, label: 'Bây giờ' }],
      note: 'Hiện tại đơn KHÔNG chỉ nói về "lúc này", mà nói việc lặp đi lặp lại hoặc luôn đúng.',
    },
    {
      kind: 'table',
      title: 'Bảng chia động từ — Hiện tại đơn (động từ thường)',
      headers: ['', 'I / You / We / They', 'He / She / It'],
      rows: [
        ['Khẳng định', 'play football', 'plays football'],
        ['Phủ định', "don't play football", "doesn't play football"],
        ['Nghi vấn', 'Do ... play football?', 'Does ... play football?'],
      ],
      note: 'Đã có do/does thì động từ chính LUÔN ở nguyên thể: doesn\'t plays ❌',
    },
  ],
  'NP-12': [
    {
      kind: 'timeline',
      span: [42, 58],
      spanLabel: 'Đang diễn ra ngay lúc nói',
      marks: [{ at: 50, label: 'Bây giờ' }],
      note: 'Dấu hiệu: now, at the moment, right now, Look!, Listen!',
    },
    {
      kind: 'table',
      title: 'Bảng chia động từ — Hiện tại tiếp diễn',
      headers: ['', 'I', 'He / She / It', 'You / We / They'],
      rows: [
        ['Khẳng định', 'am reading', 'is reading', 'are reading'],
        ['Phủ định', 'am not reading', "isn't reading", "aren't reading"],
        ['Nghi vấn', 'Am I reading?', 'Is he reading?', 'Are they reading?'],
      ],
    },
  ],
  'NP-13': [
    {
      kind: 'timeline',
      span: [18, 30],
      spanLabel: 'Xong hẳn trong quá khứ',
      marks: [
        { at: 24, label: 'yesterday' },
        { at: 50, label: 'Bây giờ' },
      ],
      note: 'Có mốc thời gian quá khứ rõ ràng: yesterday, last week, in 2020, ago.',
    },
    {
      kind: 'table',
      title: 'Bảng chia động từ — Quá khứ đơn',
      headers: ['', 'Mọi ngôi'],
      rows: [
        ['Khẳng định', 'watched / went'],
        ['Phủ định', "didn't watch / didn't go"],
        ['Nghi vấn', 'Did ... watch/go?'],
      ],
      note: 'Sau did/didn\'t thì về nguyên thể: didn\'t went ❌ → didn\'t go ✅',
    },
  ],
  'NP-14': [
    {
      kind: 'timeline',
      span: [15, 38],
      spanLabel: 'Hành động DÀI đang diễn ra (was/were + V-ing)',
      marks: [
        { at: 27, label: 'Hành động NGẮN cắt ngang (quá khứ đơn)' },
        { at: 50, label: 'Bây giờ' },
      ],
      note: 'Hành động dài làm nền, hành động ngắn xen vào: While I was cooking, the phone rang.',
    },
  ],
  'NP-15': [
    {
      kind: 'timeline',
      span: [20, 50],
      spanLabel: 'Bắt đầu trong quá khứ → kéo dài tới hiện tại',
      marks: [
        { at: 20, label: 'since 2020' },
        { at: 50, label: 'Bây giờ' },
      ],
      note: 'KHÔNG dùng với mốc quá khứ đã kết thúc: I have seen him yesterday ❌',
    },
    {
      kind: 'table',
      title: 'Bảng chia động từ — Hiện tại hoàn thành',
      headers: ['', 'I / You / We / They', 'He / She / It'],
      rows: [
        ['Khẳng định', 'have finished', 'has finished'],
        ['Phủ định', "haven't finished", "hasn't finished"],
        ['Nghi vấn', 'Have ... finished?', 'Has ... finished?'],
      ],
    },
  ],
  'NP-16': [
    {
      kind: 'timeline',
      span: [62, 95],
      spanLabel: 'Sự việc ở tương lai (will + V)',
      marks: [
        { at: 50, label: 'Bây giờ' },
        { at: 78, label: 'tomorrow / next week' },
      ],
      note: 'used to thì ngược lại — thói quen CŨ trong quá khứ, nay không còn.',
    },
  ],
  'NP-21': [
    {
      kind: 'table',
      title: 'Chủ động → Bị động',
      headers: ['Thì', 'Chủ động', 'Bị động'],
      rows: [
        ['Hiện tại đơn', 'They clean the room.', 'The room is cleaned.'],
        ['Quá khứ đơn', 'They cleaned the room.', 'The room was cleaned.'],
      ],
      note: 'Tân ngữ nhảy lên làm chủ ngữ; động từ chính LUÔN ở dạng V3/V-ed.',
    },
    {
      kind: 'structure',
      title: 'Công thức câu bị động',
      parts: [
        { text: 'S (tân ngữ cũ)', role: 'subject' },
        { text: 'be', role: 'keyword' },
        { text: 'V3/V-ed', role: 'verb' },
        { text: '(by + tác nhân)', role: 'complement' },
      ],
      example: 'This song was written by my brother.',
    },
  ],
  'NP-18': [
    {
      kind: 'structure',
      title: 'Mệnh đề quan hệ xác định',
      parts: [
        { text: 'Danh từ', role: 'subject' },
        { text: 'who / which / that', role: 'keyword' },
        { text: 'V ...', role: 'verb' },
      ],
      example: 'The girl who sits next to me is my best friend.',
      note: 'who → người · which → vật · that → cả hai (chỉ dùng cho mệnh đề XÁC ĐỊNH, không có dấu phẩy).',
    },
  ],
  'NP-20': [
    {
      kind: 'structure',
      title: 'Câu điều kiện loại 1',
      parts: [
        { text: 'If', role: 'keyword' },
        { text: 'S + V(hiện tại đơn)', role: 'subject' },
        { text: ',', role: 'complement' },
        { text: 'S + will + V', role: 'verb' },
      ],
      example: 'If it rains, we will stay at home.',
      note: 'Vế If KHÔNG dùng will: If it will rain ❌. Loại 0 thì cả 2 vế đều hiện tại đơn.',
    },
  ],
  'NP-22': [
    {
      kind: 'table',
      title: 'Lùi thì khi chuyển sang câu tường thuật',
      headers: ['Trực tiếp', 'Gián tiếp'],
      rows: [
        ['hiện tại đơn', 'quá khứ đơn'],
        ['hiện tại tiếp diễn', 'quá khứ tiếp diễn'],
        ['quá khứ đơn / hiện tại hoàn thành', 'quá khứ hoàn thành'],
        ['will', 'would'],
        ['can', 'could'],
      ],
      note: 'Đổi kèm: today → that day · tomorrow → the next day · here → there · this → that.',
    },
  ],
  'NP-26': [
    {
      kind: 'structure',
      title: 'so ... that / such ... that',
      parts: [
        { text: 'S + V', role: 'subject' },
        { text: 'so', role: 'keyword' },
        { text: 'adj/adv', role: 'complement' },
        { text: 'that', role: 'keyword' },
        { text: 'S + V', role: 'verb' },
      ],
      example: 'The box was so heavy that I couldn\'t lift it.',
      note: 'such đi với CỤM DANH TỪ: such a heavy box that... — so đi với tính từ/trạng từ trần.',
    },
  ],
  'NP-33': [
    {
      kind: 'structure',
      title: 'too ... to / adj + enough + to V',
      parts: [
        { text: 'S + be', role: 'subject' },
        { text: 'too', role: 'keyword' },
        { text: 'adj', role: 'complement' },
        { text: 'to V', role: 'verb' },
      ],
      example: 'He is too young to drive. = He isn\'t old enough to drive.',
      note: 'enough đứng SAU tính từ nhưng TRƯỚC danh từ: old enough ✅ · enough money ✅',
    },
  ],
}

function Timeline({ spec }: { spec: TimelineSpec }) {
  const [from, to] = spec.span
  return (
    <div className="rounded-xl border-2 border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-slate-900">
      <p className="text-xs font-bold tracking-wide text-sky-600 uppercase dark:text-sky-400">
        ⏱ Trục thời gian
      </p>
      <div className="relative mt-8 mb-10 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="absolute inset-y-0 rounded-full bg-linear-to-r from-emerald-400 to-lime-400"
          style={{ left: `${from}%`, width: `${to - from}%` }}
        />
        <span
          className="absolute -top-7 -translate-x-1/2 rounded-full bg-emerald-100 px-2 py-0.5 text-center text-[11px] leading-tight font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
          style={{ left: `${(from + to) / 2}%` }}
        >
          {spec.spanLabel}
        </span>
        {/* Vạch mốc "hiện tại" luôn ở giữa trục để làm hệ quy chiếu. */}
        <span className="absolute top-1/2 left-1/2 h-6 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-slate-400 dark:bg-slate-500" />
        {spec.marks?.map((mark) => (
          <span
            key={mark.label}
            className="absolute top-4 -translate-x-1/2 text-center text-[11px] leading-tight font-bold text-slate-500 dark:text-slate-400"
            style={{ left: `${mark.at}%`, maxWidth: '38%' }}
          >
            ▲<br />
            {mark.label}
          </span>
        ))}
      </div>
      <div className="flex justify-between text-[11px] font-bold text-slate-400">
        <span>◀ Quá khứ</span>
        <span>Tương lai ▶</span>
      </div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{spec.note}</p>
    </div>
  )
}

function ConjugationTable({ spec }: { spec: TableSpec }) {
  return (
    <div className="rounded-xl border-2 border-violet-100 bg-white p-4 dark:border-violet-900 dark:bg-slate-900">
      <p className="text-xs font-bold tracking-wide text-violet-600 uppercase dark:text-violet-400">
        📋 {spec.title}
      </p>
      {/* Bảng 3–4 cột luôn rộng hơn màn hình điện thoại nên phải cuộn ngang —
          nói rõ ra, nếu không học sinh tưởng bảng bị cắt mất. */}
      <p className="mt-1 text-[11px] text-slate-400 sm:hidden">
        (Vuốt ngang để xem hết bảng)
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr>
              {spec.headers.map((header) => (
                <th
                  key={header}
                  className="border-b-2 border-slate-200 px-3 py-2 text-left font-extrabold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spec.rows.map((row) => (
              <tr key={row[0]} className="odd:bg-slate-50 dark:odd:bg-slate-800/50">
                {row.map((cell, i) => (
                  <td
                    key={i}
                    className={`px-3 py-2 ${
                      i === 0
                        ? 'font-bold text-slate-700 dark:text-slate-200'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {spec.note && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{spec.note}</p>
      )}
    </div>
  )
}

function SentenceStructure({ spec }: { spec: StructureSpec }) {
  const roles = [...new Set(spec.parts.map((p) => p.role))]
  return (
    <div className="rounded-xl border-2 border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-slate-900">
      <p className="text-xs font-bold tracking-wide text-amber-600 uppercase dark:text-amber-400">
        🧩 {spec.title}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {spec.parts.map((part, i) => (
          <span
            key={i}
            className={`rounded-lg px-2.5 py-1.5 text-sm font-extrabold ${ROLE_CLASS[part.role]}`}
          >
            {part.text}
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-700 italic dark:text-slate-300">
        {spec.example}
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
        {roles.map((role) => (
          <li key={role} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${ROLE_CLASS[role].split(' ')[0]}`} />
            {ROLE_LABEL[role]}
          </li>
        ))}
      </ul>
      {spec.note && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{spec.note}</p>
      )}
    </div>
  )
}

export function hasGrammarVisual(topicId: string): boolean {
  return topicId in VISUALS
}

export function GrammarVisual({ topicId }: { topicId: string }) {
  const specs = VISUALS[topicId]
  if (!specs) return null
  return (
    <div className="flex flex-col gap-4">
      {specs.map((spec, i) => {
        if (spec.kind === 'timeline') return <Timeline key={i} spec={spec} />
        if (spec.kind === 'table') return <ConjugationTable key={i} spec={spec} />
        return <SentenceStructure key={i} spec={spec} />
      })}
    </div>
  )
}
