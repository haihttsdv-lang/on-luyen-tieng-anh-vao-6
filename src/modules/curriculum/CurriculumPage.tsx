import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CURRICULUM_PLAN } from '../../content/curriculum'
import { progressStore } from '../../data-access'
import type { ScheduledSession, SessionFocus, SessionOutcome } from '../../types/domain'
import { buildFullSchedule } from './periodicTests'
import { OUTCOME_OPTIONS, coinsForOutcome } from './rewards'
import { CURRICULUM_DEADLINE, parseISODate, toISODate } from './schedule'

const FOCUS_LABEL: Record<SessionFocus, string> = {
  orientation: 'Khai giảng',
  grammar: 'Bài mới',
  review: 'Ôn tập',
  'mock-test': 'Luyện đề',
  'skill-drill': 'Luyện chuyên sâu',
  'final-exam': 'Ôn thi tổng lực',
  'weekly-test': 'Kiểm tra tuần',
  'monthly-test': 'Kiểm tra tháng',
}

const FOCUS_CLASS: Record<SessionFocus, string> = {
  orientation: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  grammar: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'mock-test': 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  'skill-drill': 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  'final-exam': 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  'weekly-test': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
  'monthly-test': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
}

const isTestFocus = (focus: SessionFocus) => focus === 'weekly-test' || focus === 'monthly-test'

function formatDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function quickLinksFor(session: ScheduledSession): { to: string; label: string }[] {
  const links: { to: string; label: string }[] = []
  if (session.topicIds.length === 1) {
    links.push({ to: `/hoc-ly-thuyet/${session.topicIds[0]}`, label: '📘 Bài học' })
    links.push({ to: `/hoc-ly-thuyet/${session.topicIds[0]}/quiz`, label: '🎯 Quiz nhanh' })
  }
  if (session.vocabTopicId) {
    links.push({ to: `/hoc-ly-thuyet/tu-vung/${session.vocabTopicId}`, label: '🗂️ Flashcard' })
  }
  if (session.focus === 'review') {
    links.push({ to: '/hoc-ly-thuyet/so-do-tu-duy', label: '🧠 Sơ đồ tư duy' })
    links.push({ to: '/luyen-tap/chu-diem', label: '🎯 Luyện theo chủ điểm' })
  }
  if (session.focus === 'mock-test' || session.focus === 'weekly-test') {
    links.push({ to: '/thi-thu', label: '⏱️ Thi thử' })
  }
  if (session.focus === 'skill-drill') {
    links.push({ to: '/luyen-tap/dang-bai', label: '🎯 Luyện theo dạng bài' })
    links.push({ to: '/ho-so', label: '🏆 Bản đồ năng lực' })
  }
  if (session.focus === 'final-exam' || session.focus === 'monthly-test') {
    links.push({ to: '/thi-thu', label: '⏱️ Giống đề Cầu Giấy' })
    links.push({ to: '/ho-so', label: '🏆 Bản đồ năng lực' })
  }
  if (session.focus === 'orientation') {
    links.push({ to: '/ho-so/kiem-tra-dau-vao', label: '📝 Kiểm tra đầu vào' })
  }
  return links
}

interface Section {
  label: string
  sessions: ScheduledSession[]
}

function groupIntoSections(sessions: ScheduledSession[]): Section[] {
  const sections: Section[] = []
  for (const session of sessions) {
    const label = session.phaseLabel
    const last = sections[sections.length - 1]
    if (last && last.label === label) {
      last.sessions.push(session)
    } else {
      sections.push({ label, sessions: [session] })
    }
  }
  return sections
}

export function CurriculumPage() {
  const [schedule, setSchedule] = useState<ScheduledSession[] | null>(null)
  const [outcomes, setOutcomes] = useState<Record<string, SessionOutcome>>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      let startIso = await progressStore.getCurriculumStartDate()
      if (!startIso) {
        startIso = toISODate(new Date())
        await progressStore.setCurriculumStartDate(startIso)
      }
      const scheduled = buildFullSchedule(
        CURRICULUM_PLAN,
        parseISODate(startIso),
        CURRICULUM_DEADLINE,
      )
      const loadedOutcomes = await progressStore.getSessionOutcomes()
      if (!cancelled) {
        setSchedule(scheduled)
        setOutcomes(loadedOutcomes)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const todayIso = toISODate(new Date())

  const nextSession = useMemo(() => {
    if (!schedule) return undefined
    return (
      schedule.find((s) => outcomes[s.id] === undefined && s.date >= todayIso) ??
      schedule.find((s) => outcomes[s.id] === undefined)
    )
  }, [schedule, outcomes, todayIso])

  const sections = useMemo(
    () => (schedule ? groupIntoSections(schedule) : []),
    [schedule],
  )

  async function selectOutcome(session: ScheduledSession, outcome: SessionOutcome) {
    const previous = outcomes[session.id]
    const isDeselecting = previous === outcome
    const previousDelta = previous ? coinsForOutcome(session.focus, previous) : 0
    const newDelta = isDeselecting ? 0 : coinsForOutcome(session.focus, outcome)

    await progressStore.addCoins(newDelta - previousDelta)
    await progressStore.setSessionOutcome(session.id, isDeselecting ? undefined : outcome)
    setOutcomes((prev) => {
      const next = { ...prev }
      if (isDeselecting) delete next[session.id]
      else next[session.id] = outcome
      return next
    })
  }

  if (!schedule) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500">
        Đang tải...
      </section>
    )
  }

  const completedCount = Object.keys(outcomes).length
  const lastSession = schedule[schedule.length - 1]
  const onTrack = parseISODate(lastSession.date).getTime() <= CURRICULUM_DEADLINE.getTime()

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        🗓️ Lộ trình học
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        {schedule.length} buổi · Thứ Ba/Năm/Bảy hàng tuần, kiểm tra tuần vào
        Chủ nhật (kiểm tra tháng vào Chủ nhật cuối tháng) · hoàn thành trước{' '}
        {CURRICULUM_DEADLINE.toLocaleDateString('vi-VN')}.
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Thiết kế theo 4 giai đoạn giống các trung tâm luyện thi: Nền tảng →
        Nâng cao → Luyện đề tăng tốc → Nước rút cuối cùng — không học tuần tự
        theo mã chủ điểm mà ưu tiên kiến thức dễ ăn điểm trước. Mỗi buổi tự
        chấm kết quả để cộng/trừ xu — xem 🪙 ở góc trên bên phải.
      </p>

      <div className="mt-4 rounded-2xl border-2 border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-500 to-lime-500 transition-all"
              style={{ width: `${(completedCount / schedule.length) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400">
            {completedCount}/{schedule.length} buổi
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Buổi cuối dự kiến: <strong>{formatDate(lastSession.date)}</strong>{' '}
          {onTrack ? (
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              (đúng hạn ✅)
            </span>
          ) : (
            <span className="font-bold text-rose-600 dark:text-rose-400">
              (trễ hạn ⚠️)
            </span>
          )}
        </p>
        {nextSession && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Buổi tiếp theo: <strong>{formatDate(nextSession.date)}</strong> ·{' '}
            {nextSession.title}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {sections.map((section, sectionIndex) => {
          const isCurrentSection = section.sessions.some(
            (s) => nextSession && s.id === nextSession.id,
          )
          return (
            <details
              key={`${section.label}-${sectionIndex}`}
              open={isCurrentSection || sectionIndex === 0}
              className="rounded-2xl border-2 border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <summary className="cursor-pointer list-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 select-none dark:text-slate-300">
                {section.label}{' '}
                <span className="text-xs font-normal text-slate-400">
                  ({section.sessions.length} buổi)
                </span>
              </summary>
              <ul className="flex flex-col gap-3 border-t border-slate-100 p-4 dark:border-slate-800">
                {section.sessions.map((session) => {
                  const outcome = outcomes[session.id]
                  const isNext = nextSession?.id === session.id
                  return (
                    <li
                      key={session.id}
                      className={`rounded-xl border-2 p-4 ${
                        isNext
                          ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                          : 'border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-400">
                          {isTestFocus(session.focus)
                            ? `Bài kiểm tra · ${formatDate(session.date)}`
                            : `Buổi ${session.order} · ${formatDate(session.date)}`}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${FOCUS_CLASS[session.focus]}`}
                        >
                          {FOCUS_LABEL[session.focus]}
                        </span>
                      </div>
                      <p className="mt-1 font-bold text-slate-900 dark:text-slate-100">
                        {session.title}
                      </p>

                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-bold text-emerald-600 select-none dark:text-emerald-400">
                          Xem cấu trúc buổi học ({session.blocks.reduce((sum, b) => sum + b.minutes, 0)} phút)
                        </summary>
                        <ol className="mt-2 flex flex-col gap-2">
                          {session.blocks.map((block, i) => (
                            <li
                              key={i}
                              className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
                            >
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {block.label}
                              </span>{' '}
                              <span className="text-xs text-slate-400">
                                ({block.minutes} phút)
                              </span>
                              <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                                {block.description}
                              </p>
                            </li>
                          ))}
                        </ol>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-bold">📌 Bài tập về nhà:</span>{' '}
                          {session.homework}
                        </p>
                      </details>

                      {quickLinksFor(session).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {quickLinksFor(session).map((link) => (
                            <Link
                              key={link.to}
                              to={link.to}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}

                      <div className="mt-3">
                        <span className="text-xs font-bold text-slate-400">
                          Kết quả buổi học (chấm để cộng/trừ xu):
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {OUTCOME_OPTIONS.map((opt) => {
                            const coins = coinsForOutcome(session.focus, opt.value)
                            const isActive = outcome === opt.value
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => selectOutcome(session, opt.value)}
                                aria-pressed={isActive}
                                className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                                  isActive
                                    ? coins >= 0
                                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                      : 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                              >
                                {opt.emoji} {opt.label} ({coins >= 0 ? '+' : ''}
                                {coins} 🪙)
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </details>
          )
        })}
      </div>
    </section>
  )
}
