/**
 * HA-02 · Vòng tròn tiến độ cho từng khối giai đoạn (SVG `stroke-dasharray`)
 * — trước đây chỉ có 1 thanh tiến độ DUY NHẤT cho toàn bộ lộ trình, không
 * thấy riêng từng giai đoạn đã đi được bao xa.
 */

const SIZE = 36
const STROKE = 4
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function PhaseProgressRing({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent))
  const offset = CIRCUMFERENCE * (1 - clamped / 100)

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="shrink-0"
      role="img"
      aria-label={`Đã hoàn thành ${Math.round(clamped)}% giai đoạn này`}
    >
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE}
        className="stroke-slate-100 dark:stroke-slate-800"
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        className="stroke-emerald-500 transition-[stroke-dashoffset] dark:stroke-emerald-400"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-slate-600 text-[10px] font-extrabold dark:fill-slate-300"
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  )
}
