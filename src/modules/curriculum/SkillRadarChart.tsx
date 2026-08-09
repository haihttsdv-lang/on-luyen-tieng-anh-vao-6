import { SKILL_LABELS } from '../../content/skill-labels'
import type { SkillId } from '../../types/domain'
import type { MasteryResult } from '../mastery/masteryCalc'

/**
 * HA-02 · Biểu đồ radar 9 trục (KN-01…KN-09) — cho thấy ngay "em mạnh ngữ
 * pháp nhưng yếu đọc hiểu" trong một lần nhìn, đúng thông tin cần để chọn
 * đúng buổi luyện chuyên sâu (`skill-drill`) nên vào dạng bài nào trước.
 *
 * Vẽ bằng SVG thuần (không dùng thư viện biểu đồ) — nhất quán với
 * `GrammarVisual.tsx`, giữ bản đóng gói 1 file HTML không phình dung lượng.
 * Chỉ 1 chuỗi dữ liệu (không so sánh nhiều lớp phủ lên nhau) nên không có
 * rủi ro "chỉ phân biệt được bằng màu" cho người mù màu — thang đo vẫn đọc
 * được qua hình dạng đa giác + nhãn %, không phụ thuộc riêng vào màu sắc.
 */

const SKILL_IDS = Object.keys(SKILL_LABELS) as SkillId[]
const SIZE = 260
const CENTER = SIZE / 2
const MAX_RADIUS = 92
const RING_STEPS = [0.33, 0.66, 1]

function pointAt(index: number, radiusRatio: number): [number, number] {
  const angle = (Math.PI * 2 * index) / SKILL_IDS.length - Math.PI / 2
  const r = MAX_RADIUS * radiusRatio
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)]
}

function polygonPoints(radiusRatio: number): string {
  return SKILL_IDS.map((_, i) => pointAt(i, radiusRatio).join(',')).join(' ')
}

export function SkillRadarChart({
  skillMastery,
}: {
  skillMastery: Partial<Record<SkillId, MasteryResult>>
}) {
  const dataPoints = SKILL_IDS.map((id, i) => pointAt(i, skillMastery[id]?.score ?? 0))
  const hasAnyData = SKILL_IDS.some((id) => skillMastery[id]?.score !== null && skillMastery[id] !== undefined)

  return (
    <div className="flex flex-col items-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Biểu đồ radar mức độ thành thạo 9 dạng bài"
      >
        {/* Lưới nền tham chiếu 33%/66%/100% */}
        {RING_STEPS.map((ratio) => (
          <polygon
            key={ratio}
            points={polygonPoints(ratio)}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth={1}
          />
        ))}
        {/* Trục từ tâm ra từng đỉnh */}
        {SKILL_IDS.map((id, i) => {
          const [x, y] = pointAt(i, 1)
          return (
            <line
              key={id}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth={1}
            />
          )
        })}
        {/* Dữ liệu thật */}
        {hasAnyData && (
          <polygon
            points={dataPoints.map((p) => p.join(',')).join(' ')}
            className="fill-emerald-500/25 stroke-emerald-600 dark:fill-emerald-400/20 dark:stroke-emerald-400"
            strokeWidth={2}
          />
        )}
        {/* Nhãn từng trục — đặt hơi ra ngoài đỉnh (radiusRatio 1.18) */}
        {SKILL_IDS.map((id, i) => {
          const [x, y] = pointAt(i, 1.18)
          return (
            <text
              key={id}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-500 text-[9px] font-bold dark:fill-slate-400"
            >
              <title>{SKILL_LABELS[id]}</title>
              {id.replace('KN-', '')}
            </text>
          )
        })}
      </svg>
      {!hasAnyData && (
        <p className="mt-1 text-xs text-slate-400">
          Chưa đủ dữ liệu luyện tập để vẽ biểu đồ — luyện thêm vài buổi nữa nhé.
        </p>
      )}
    </div>
  )
}
