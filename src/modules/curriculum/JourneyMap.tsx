import { useEffect, useRef } from 'react'
import type { ScheduledSession, SessionOutcomeRecord } from '../../types/domain'
import { toISODate } from './schedule'

/**
 * HA-01 · Bản đồ hành trình trực quan — 67 buổi trước đây chỉ hiển thị dưới
 * dạng danh sách `<details>` gập/mở, học sinh không bao giờ nhìn thấy TOÀN
 * CẢNH mình đang ở đâu trên lộ trình. Dải chấm ngang này cho thấy ngay:
 * đã học bao nhiêu, đang ở buổi nào, có buổi nào bị bỏ lỡ.
 *
 * Làm bằng CSS/SVG thuần (không file ảnh) nên không tăng dung lượng bundle,
 * và tự nhiên hoạt động trong bản đóng gói 1 file HTML.
 */

export type DotStatus = 'done' | 'today' | 'overdue' | 'upcoming'

function statusOf(
  session: ScheduledSession,
  outcomes: Record<string, SessionOutcomeRecord>,
  todayIso: string,
): DotStatus {
  if (outcomes[session.id]) return 'done'
  if (session.date < todayIso) return 'overdue'
  if (session.date === todayIso) return 'today'
  return 'upcoming'
}

const STATUS_DOT: Record<DotStatus, string> = {
  done: 'bg-emerald-500',
  today: 'bg-sky-500 animate-pulse ring-2 ring-sky-300 dark:ring-sky-700',
  overdue: 'bg-rose-500',
  upcoming: 'bg-slate-200 dark:bg-slate-700',
}

const STATUS_LABEL: Record<DotStatus, string> = {
  done: 'Đã học',
  today: 'Hôm nay',
  overdue: 'Trễ hạn',
  upcoming: 'Chưa học',
}

// Lấy icon đứng đầu mỗi phaseLabel (ví dụ "🧱 Giai đoạn 1 · Nền tảng" → "🧱")
// để đánh dấu mốc giai đoạn to hơn giữa dải chấm buổi học.
function phaseIcon(phaseLabel: string): string {
  return phaseLabel.split(' ')[0] ?? '🚩'
}

interface JourneyMapProps {
  schedule: ScheduledSession[]
  outcomes: Record<string, SessionOutcomeRecord>
  onSelect: (sessionId: string) => void
}

export function JourneyMap({ schedule, outcomes, onSelect }: JourneyMapProps) {
  const todayIso = toISODate(new Date())
  const currentRef = useRef<HTMLButtonElement>(null)
  const currentId =
    schedule.find((s) => !outcomes[s.id] && s.date >= todayIso)?.id ??
    schedule.find((s) => !outcomes[s.id])?.id

  useEffect(() => {
    currentRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [currentId])

  let lastPhase: string | undefined

  return (
    <div className="rounded-2xl border-2 border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div
        role="list"
        aria-label="Bản đồ hành trình học"
        className="flex items-center gap-0.5 overflow-x-auto pb-1"
      >
        {schedule.map((session) => {
          const showPhaseMarker = session.phaseLabel !== lastPhase
          lastPhase = session.phaseLabel
          const status = statusOf(session, outcomes, todayIso)
          const isCurrent = session.id === currentId
          return (
            <div key={session.id} role="listitem" className="flex shrink-0 items-center gap-0.5">
              {showPhaseMarker && (
                <span
                  className="mx-0.5 text-base leading-none"
                  aria-hidden="true"
                  title={session.phaseLabel}
                >
                  {phaseIcon(session.phaseLabel)}
                </span>
              )}
              <button
                ref={isCurrent ? currentRef : undefined}
                type="button"
                onClick={() => onSelect(session.id)}
                title={`${session.title} · ${STATUS_LABEL[status]}`}
                aria-label={`${session.title} — ${STATUS_LABEL[status]}${isCurrent ? ' — buổi hiện tại' : ''}`}
                className={`h-2.5 w-2.5 shrink-0 rounded-full transition-transform hover:scale-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${STATUS_DOT[status]} ${
                  isCurrent ? 'scale-150 ring-2 ring-emerald-500 ring-offset-1' : ''
                }`}
              />
            </div>
          )
        })}
        <span className="mx-0.5 text-base leading-none" aria-hidden="true" title="Hoàn thành">
          🎓
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
        {(Object.keys(STATUS_LABEL) as DotStatus[]).map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status].split(' ')[0]}`} />
            {STATUS_LABEL[status]}
          </span>
        ))}
      </div>
    </div>
  )
}
