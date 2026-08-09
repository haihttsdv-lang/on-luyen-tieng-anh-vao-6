import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { progressStore } from '../../data-access'
import type { ScheduledSession, SessionOutcomeRecord } from '../../types/domain'
import { parseISODate, toISODate } from './schedule'
import { useCurriculumSchedule } from './useCurriculumSchedule'

/**
 * UX-05 — Trang chủ phải trả lời được câu hỏi "Hôm nay học gì?".
 *
 * Ứng dụng đã có Lộ trình học tính ra buổi học cụ thể của từng ngày, nhưng
 * trang chủ trước đây chỉ có một hero tĩnh, học sinh mở app vào phải tự nghĩ
 * xem nên làm gì. Thẻ này lấy đúng lịch của trang Lộ trình học (cùng
 * `buildFullSchedule`, nên không bao giờ lệch nhau) và nêu bật buổi cần học.
 */

export interface TodaySession {
  session: ScheduledSession
  /** Buổi của đúng hôm nay, hay là buổi kế tiếp sắp tới/đang trễ. */
  status: 'today' | 'upcoming' | 'overdue'
  completedCount: number
  totalCount: number
}

export function pickTodaySession(
  schedule: ScheduledSession[],
  outcomes: Record<string, SessionOutcomeRecord>,
  today: Date = new Date(),
): TodaySession | null {
  const todayISO = toISODate(today)
  const pending = schedule.filter((s) => !outcomes[s.id])
  const completedCount = schedule.length - pending.length
  if (pending.length === 0) return null

  const exact = pending.find((s) => s.date === todayISO)
  const next = exact ?? pending[0]
  const status: TodaySession['status'] =
    next.date === todayISO ? 'today' : next.date < todayISO ? 'overdue' : 'upcoming'
  return { session: next, status, completedCount, totalCount: schedule.length }
}

const STATUS_TEXT: Record<TodaySession['status'], string> = {
  today: 'Buổi học hôm nay',
  overdue: 'Buổi học đang trễ lịch',
  upcoming: 'Buổi học tiếp theo',
}

/**
 * PP-05: buổi đã hoàn thành GẦN NHẤT theo thời điểm chấm thực tế
 * (`completedAt`) — dùng để hỏi xem bài tập về nhà của buổi đó đã làm chưa.
 * Không dùng `order`/`date` vì lịch tự đẩy (buildAdaptiveSchedule) khiến
 * ngày hiển thị có thể không đúng thứ tự học thực tế.
 */
export function findMostRecentCompletedSession(
  schedule: ScheduledSession[],
  outcomes: Record<string, SessionOutcomeRecord>,
): ScheduledSession | null {
  let latest: ScheduledSession | null = null
  let latestAt = ''
  for (const s of schedule) {
    const completedAt = outcomes[s.id]?.completedAt
    if (completedAt && completedAt > latestAt) {
      latest = s
      latestAt = completedAt
    }
  }
  return latest
}

export function TodaySessionCard() {
  const { schedule, outcomes } = useCurriculumSchedule()
  const data = schedule && outcomes ? pickTodaySession(schedule, outcomes) : undefined
  const previousSession = useMemo(
    () => (schedule && outcomes ? findMostRecentCompletedSession(schedule, outcomes) : null),
    [schedule, outcomes],
  )
  const [previousHomeworkDone, setPreviousHomeworkDone] = useState<boolean | null>(null)

  useEffect(() => {
    if (!previousSession || !previousSession.homework) {
      setPreviousHomeworkDone(null)
      return
    }
    let cancelled = false
    progressStore.getHomeworkDone(previousSession.id).then((done) => {
      if (!cancelled) setPreviousHomeworkDone(done)
    })
    return () => {
      cancelled = true
    }
  }, [previousSession])

  if (data === undefined) return null

  if (data === null) {
    return (
      <div className="rounded-3xl bg-linear-to-br from-emerald-500 via-lime-500 to-amber-400 px-6 py-8 text-white shadow-lg shadow-emerald-500/20 sm:px-10">
        <p className="text-sm font-bold tracking-wide uppercase opacity-90">
          🎉 Chúc mừng
        </p>
        <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          Em đã hoàn thành toàn bộ lộ trình học!
        </h1>
        <p className="mt-3 text-white/90">
          Hãy giữ phong độ bằng cách luyện đề và ôn lại các chủ điểm còn yếu.
        </p>
        <Link
          to="/thi-thu"
          className="mt-5 inline-block rounded-full bg-white px-5 py-2.5 font-bold text-emerald-700 shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          ⏱️ Vào thi thử
        </Link>
      </div>
    )
  }

  const { session, status, completedCount, totalCount } = data
  const percent = Math.round((completedCount / totalCount) * 100)
  const dateLabel = parseISODate(session.date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  })
  const minutes = session.blocks.reduce((sum, b) => sum + b.minutes, 0)

  return (
    <div className="rounded-3xl bg-linear-to-br from-emerald-500 via-lime-500 to-amber-400 px-6 py-8 text-white shadow-lg shadow-emerald-500/20 sm:px-10">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-bold tracking-wide uppercase opacity-90">
          {status === 'overdue' ? '⚠️ ' : '📅 '}
          {STATUS_TEXT[status]}
        </p>
        <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-bold">
          {dateLabel}
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">{session.title}</h1>
      <p className="mt-2 text-sm font-bold text-white/90">
        {session.phaseLabel} · Buổi {session.order}/{totalCount} · {minutes} phút
      </p>

      <div className="mt-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/30">
        <div className="h-full rounded-full bg-white" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1.5 text-xs font-bold text-white/90">
        Đã hoàn thành {completedCount}/{totalCount} buổi ({percent}%)
      </p>

      {/* PP-05: nhắc bài tập buổi trước còn dang dở NGAY tại nơi học sinh mở
          app đầu tiên — trước đây "homework" chỉ hiện ở buổi đó rồi biến
          mất, không có gì nhắc lại nếu chưa làm. */}
      {previousHomeworkDone === false && previousSession && (
        <p className="mt-2 rounded-xl bg-white/20 px-3 py-2 text-xs font-bold text-white">
          📌 Còn bài tập của buổi trước ("{previousSession.title}") chưa làm — xem lại ở buổi đó trong Lộ trình học.
        </p>
      )}

      <Link
        to={
          // PP-01: đi thẳng vào phiên học có đồng hồ + theo dõi từng khối;
          // bài kiểm tra định kỳ (weekly/monthly-test) không có Session
          // Runner riêng (vào thẳng đề luôn), nên vẫn dẫn về trang Lộ trình.
          session.focus === 'weekly-test' || session.focus === 'monthly-test'
            ? '/lo-trinh-hoc'
            : `/lo-trinh-hoc/${session.id}/hoc`
        }
        className="mt-5 inline-block rounded-full bg-white px-5 py-2.5 font-bold text-emerald-700 shadow-md transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        ▶️ Bắt đầu buổi học
      </Link>
    </div>
  )
}
