import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RenderBold } from '../../components/RenderBold'
import { getTopicLabel } from '../../content/topic-labels'
import { contentStore, progressStore } from '../../data-access'
import { computeAllSkillMastery } from '../mastery/masteryCalc'
import { BadgeShelf } from './BadgeShelf'
import { computeEarnedBadges } from './badges'
import { getBlockAction } from './blockActions'
import { JourneyMap } from './JourneyMap'
import { PhaseProgressRing } from './PhaseProgressRing'
import { withSessionReturn } from './returnTo'
import { SkillRadarChart } from './SkillRadarChart'
import type {
  Attempt,
  MockTestResult,
  Question,
  ScheduledSession,
  SessionFocus,
  SessionOutcome,
} from '../../types/domain'
import { OUTCOME_OPTIONS, applySessionOutcome, coinsForOutcome } from './rewards'
import { CURRICULUM_DEADLINE, parseISODate, toISODate } from './schedule'
import { useCurriculumSchedule } from './useCurriculumSchedule'

const FOCUS_LABEL: Record<SessionFocus, string> = {
  orientation: 'Khai giảng',
  grammar: 'Bài mới',
  'skill-lesson': 'Học kỹ năng',
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
  'skill-lesson': 'bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'mock-test': 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  'skill-drill': 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  'final-exam': 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  'weekly-test': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
  'monthly-test': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
}

// HA-03: dải màu dọc bên trái thẻ — nhận ra loại buổi bằng ngoại vi thị
// giác (không cần đọc chữ nhãn). Cùng gốc màu với FOCUS_CLASS ở trên để 2
// tín hiệu không mâu thuẫn nhau; tách riêng vì `border-l` cần độ đậm khác
// (500 thay vì 100/10%) mới đủ tương phản làm dải màu mảnh 4px.
const FOCUS_BORDER_CLASS: Record<SessionFocus, string> = {
  orientation: 'border-l-sky-500',
  grammar: 'border-l-emerald-500',
  'skill-lesson': 'border-l-teal-500',
  review: 'border-l-amber-500',
  'mock-test': 'border-l-orange-500',
  'skill-drill': 'border-l-purple-500',
  'final-exam': 'border-l-rose-500',
  'weekly-test': 'border-l-cyan-500',
  'monthly-test': 'border-l-indigo-500',
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

// LT-02: khi buổi có sẵn danh sách chủ điểm (topicIds), link luyện tập/thi
// thử trỏ THẲNG vào đề lọc đúng chủ điểm đó qua query param, thay vì luôn
// đưa học sinh tới trang chọn thủ công rồi phải tự tick lại từ đầu.
function topicsQuery(topicIds: string[]): string {
  return topicIds.length > 0 ? `?topics=${encodeURIComponent(topicIds.join(','))}` : ''
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
    links.push({
      to: `/luyen-tap/chu-diem${topicsQuery(session.topicIds)}`,
      label: '🎯 Luyện theo chủ điểm',
    })
  }
  if (session.focus === 'mock-test' || session.focus === 'weekly-test') {
    // Buổi luyện đề "tăng tốc" (giai đoạn 3) chưa gắn chủ điểm cụ thể — xem
    // LT-03; những buổi đó vẫn dẫn tới màn hình chọn đề như cũ.
    links.push(
      session.topicIds.length > 0
        ? {
            to: `/thi-thu/tu-tao-de${topicsQuery(session.topicIds)}`,
            label: '⏱️ Luyện đề đúng chủ điểm',
          }
        : { to: '/thi-thu', label: '⏱️ Thi thử' },
    )
  }
  if (session.focus === 'skill-drill') {
    // LT-03: nếu đã "bắt bệnh" được chủ điểm yếu, luyện thẳng vào đó; chưa
    // đủ dữ liệu (mới bắt đầu học) thì vẫn cho chọn dạng bài như cũ.
    links.push(
      session.topicIds.length > 0
        ? {
            to: `/luyen-tap/chu-diem${topicsQuery(session.topicIds)}`,
            label: '🎯 Luyện đúng chủ điểm đang yếu',
          }
        : { to: '/luyen-tap/dang-bai', label: '🎯 Luyện theo dạng bài' },
    )
    links.push({ to: '/ho-so', label: '🏆 Bản đồ năng lực' })
  }
  if (session.focus === 'final-exam' || session.focus === 'monthly-test') {
    links.push({ to: '/thi-thu', label: '⏱️ Giống đề Cầu Giấy' })
    links.push({ to: '/ho-so', label: '🏆 Bản đồ năng lực' })
  }
  if (session.focus === 'orientation') {
    links.push({ to: '/ho-so/kiem-tra-dau-vao', label: '📝 Kiểm tra đầu vào' })
  }
  // LT-01: buổi học kỹ năng luyện đúng dạng bài (KN-xx) vừa dạy phương
  // pháp — KN-07 (Viết đoạn) không nằm trong ngân hàng Question nên trỏ
  // sang trang Viết đoạn thay vì luyện dạng bài trắc nghiệm.
  if (session.focus === 'skill-lesson' && session.skillId) {
    links.push(
      session.skillId === 'KN-07'
        ? { to: '/luyen-tap/viet', label: '✍️ Viết đoạn văn' }
        : { to: `/luyen-tap/dang-bai?skill=${session.skillId}`, label: '🎯 Luyện dạng bài này' },
    )
  }
  // Mang theo "đang học buổi nào" để trang đích tự động quay lại đúng buổi
  // này sau khi hoàn thành — xem `returnTo.ts`.
  return links.map((link) => ({ ...link, to: withSessionReturn(link.to, session.id) }))
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
  const { schedule, outcomes, setOutcomes, tier, curriculumPlan } = useCurriculumSchedule()

  // PP-02: khối "Kiểm tra bài cũ" cần link tới quiz của chủ điểm BUỔI TRƯỚC
  // — tính 1 lần từ thứ tự tĩnh của curriculumPlan (không đổi theo lịch/
  // ngày), không phải từ `schedule` vốn chỉ khác nhau ở ngày hiển thị.
  const previousTopicById = useMemo(() => {
    const map = new Map<string, string>()
    let lastTopicId: string | undefined
    for (const template of curriculumPlan) {
      if (lastTopicId) map.set(template.id, lastTopicId)
      if (template.focus === 'grammar' && template.topicIds[0]) {
        lastTopicId = template.topicIds[0]
      }
    }
    return map
  }, [curriculumPlan])

  const todayIso = toISODate(new Date())

  const nextSession = useMemo(() => {
    if (!schedule || !outcomes) return undefined
    return (
      schedule.find((s) => outcomes[s.id] === undefined && s.date >= todayIso) ??
      schedule.find((s) => outcomes[s.id] === undefined)
    )
  }, [schedule, outcomes, todayIso])

  const sections = useMemo(
    () => (schedule ? groupIntoSections(schedule) : []),
    [schedule],
  )

  // HA-02: radar 9 dạng bài — tải 1 lần, không phụ thuộc giai đoạn/tier nên
  // tách riêng khỏi `blockProgress` (không cần re-fetch khi đổi schedule).
  const [skillMastery, setSkillMastery] = useState<
    ReturnType<typeof computeAllSkillMastery>
  >({})
  useEffect(() => {
    let cancelled = false
    Promise.all([progressStore.getAttempts(), contentStore.getQuestions()]).then(
      ([attempts, questions]: [Attempt[], Question[]]) => {
        if (!cancelled) setSkillMastery(computeAllSkillMastery(attempts, questions))
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  // HA-03: thanh 6 ô nhỏ trên mỗi thẻ cần biết khối nào đã "Xong" (nối với
  // PP-01/Session Runner) — tải 1 lần cho TOÀN BỘ buổi thay vì mỗi thẻ tự
  // gọi `progressStore` riêng (76 buổi × 1 lần đọc localStorage vẫn rẻ hơn
  // nhiều so với 76 lần re-render tự fetch độc lập).
  const [blockProgress, setBlockProgress] = useState<Record<string, number[]>>({})
  useEffect(() => {
    if (!schedule) return
    let cancelled = false
    Promise.all(schedule.map((s) => progressStore.getSessionBlockProgress(s.id))).then(
      (results) => {
        if (cancelled) return
        const map: Record<string, number[]> = {}
        schedule.forEach((s, i) => {
          map[s.id] = results[i]
        })
        setBlockProgress(map)
      },
    )
    return () => {
      cancelled = true
    }
  }, [schedule])

  // HA-05: dữ liệu cho huy hiệu mốc thành tích — bài tập về nhà (theo buổi,
  // tái dùng đúng cơ chế PP-05) + kết quả thi thử. Tải 1 lần cho toàn bộ
  // schedule, giống cách `blockProgress` đã làm ở trên.
  const [homeworkDoneBySession, setHomeworkDoneBySession] = useState<Record<string, boolean>>({})
  const [mockTestResults, setMockTestResults] = useState<MockTestResult[]>([])
  useEffect(() => {
    if (!schedule) return
    let cancelled = false
    Promise.all(schedule.map((s) => progressStore.getHomeworkDone(s.id))).then((results) => {
      if (cancelled) return
      const map: Record<string, boolean> = {}
      schedule.forEach((s, i) => {
        map[s.id] = results[i]
      })
      setHomeworkDoneBySession(map)
    })
    return () => {
      cancelled = true
    }
  }, [schedule])
  useEffect(() => {
    progressStore.getMockTestResults().then(setMockTestResults)
  }, [])

  const earnedBadges = useMemo(
    () =>
      schedule && outcomes
        ? computeEarnedBadges(schedule, outcomes, homeworkDoneBySession, mockTestResults)
        : [],
    [schedule, outcomes, homeworkDoneBySession, mockTestResults],
  )

  // HA-01: bấm 1 chấm trên bản đồ hành trình phải mở đúng giai đoạn chứa
  // buổi đó (giai đoạn có thể đang gập lại) rồi mới cuộn tới — nếu chỉ cuộn
  // suông, trình duyệt cuộn tới một <details> đang đóng (nội dung bị ẩn),
  // trông như không có gì xảy ra.
  const [scrollTarget, setScrollTarget] = useState<string | null>(null)
  const forceOpenPhaseLabel = schedule?.find((s) => s.id === scrollTarget)?.phaseLabel

  useEffect(() => {
    if (!scrollTarget) return
    const el = document.getElementById(`session-${scrollTarget}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-4', 'ring-emerald-400')
      const timer = setTimeout(() => el.classList.remove('ring-4', 'ring-emerald-400'), 2000)
      setScrollTarget(null)
      return () => clearTimeout(timer)
    }
  }, [scrollTarget])

  async function selectOutcome(session: ScheduledSession, outcome: SessionOutcome) {
    const previous = outcomes?.[session.id]
    const isDeselecting = previous?.outcome === outcome

    await applySessionOutcome(
      progressStore,
      session.id,
      session.focus,
      isDeselecting ? undefined : outcome,
      previous?.outcome,
    )
    setOutcomes((prev) => {
      const next = { ...(prev ?? {}) }
      if (isDeselecting) delete next[session.id]
      else next[session.id] = { outcome, completedAt: new Date().toISOString() }
      return next
    })
  }

  if (!schedule || !outcomes) {
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
    <section className="mx-auto max-w-2xl px-4 py-12 lg:max-w-4xl">
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
        chấm kết quả để cộng/trừ xu — xem 🪙 ở góc trên bên phải. Lịch các
        buổi <strong>chưa học</strong> tự động điều chỉnh theo tiến độ thực
        tế: học chậm hoặc bỏ buổi thì các buổi sau bị đẩy lùi, học nhanh hơn
        dự kiến thì các buổi sau cũng được xếp sớm hơn.
      </p>

      {/* LT-06: cá nhân hóa theo điểm kiểm tra đầu vào — không xóa/gộp buổi
          nào (tránh phá vỡ bất biến 1 chủ điểm/1 buổi), chỉ thêm buổi (yếu)
          hoặc gợi ý cách học nhanh hơn (giỏi). */}
      {tier === 'foundation-boost' && (
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          🌱 Dựa trên kết quả kiểm tra đầu vào, lộ trình đã thêm 4 buổi "Củng
          cố nền tảng" trước Giai đoạn 1 để bắt đầu nhẹ nhàng hơn.
        </p>
      )}
      {tier === 'accelerated' && (
        <p className="mt-3 rounded-xl bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-800 dark:bg-sky-500/10 dark:text-sky-300">
          🚀 Điểm kiểm tra đầu vào rất tốt! Ở Giai đoạn 1 (Nền tảng), em có
          thể chọn "Học phiên rút gọn" trong mỗi buổi (Vào học → góc trên bên
          phải) để học nhanh hơn mà vẫn đủ nội dung, dồn thời gian cho luyện
          đề.
        </p>
      )}

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

      {/* HA-01: bản đồ hành trình — nhìn thấy toàn cảnh 67 buổi thay vì chỉ
          đọc số liệu tóm tắt phía trên. Bấm 1 chấm sẽ mở đúng giai đoạn
          (có thể đang gập) rồi cuộn tới thẻ buổi đó. */}
      <div className="mt-4">
        <JourneyMap schedule={schedule} outcomes={outcomes} onSelect={setScrollTarget} />
        {/* HA-05: huy hiệu mốc thành tích — chi phí cài đặt gần như bằng 0
            (chỉ đọc lại dữ liệu đã có), tác động động lực cao với lứa tuổi
            này. Đặt ngay dưới bản đồ hành trình theo đúng đề xuất HA-05. */}
        <BadgeShelf badges={earnedBadges} />
      </div>

      {/* HA-02: radar 9 dạng bài — trả lời ngay "em mạnh/yếu dạng bài nào"
          bằng 1 hình thay vì phải mở từng Quiz để tự suy ra, đúng thông tin
          cần trước khi vào buổi luyện chuyên sâu (Giai đoạn 3). */}
      <details className="mt-4 rounded-2xl border-2 border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <summary className="cursor-pointer text-sm font-bold text-slate-700 select-none dark:text-slate-300">
          📡 Em đang mạnh/yếu dạng bài nào?
        </summary>
        <div className="mt-3">
          <SkillRadarChart skillMastery={skillMastery} />
        </div>
      </details>

      <div className="mt-8 flex flex-col gap-6">
        {sections.map((section, sectionIndex) => {
          const isCurrentSection = section.sessions.some(
            (s) => nextSession && s.id === nextSession.id,
          )
          const donePhaseCount = section.sessions.filter((s) => outcomes[s.id]).length
          const phasePercent = (donePhaseCount / section.sessions.length) * 100
          return (
            <details
              key={`${section.label}-${sectionIndex}`}
              open={isCurrentSection || sectionIndex === 0 || section.label === forceOpenPhaseLabel}
              className="rounded-2xl border-2 border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 select-none dark:text-slate-300">
                {/* HA-02: vòng tròn tiến độ riêng của giai đoạn này, phân
                    biệt với thanh tiến độ TOÀN BỘ lộ trình ở đầu trang. */}
                <PhaseProgressRing percent={phasePercent} />
                <span>
                  {section.label}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    ({donePhaseCount}/{section.sessions.length} buổi)
                  </span>
                </span>
              </summary>
              <ul className="flex flex-col gap-3 border-t border-slate-100 p-4 dark:border-slate-800">
                {section.sessions.map((session) => {
                  const outcome = outcomes[session.id]?.outcome
                  const isNext = nextSession?.id === session.id
                  const completedAt = outcomes[session.id]?.completedAt
                  const doneBlockIndexes = blockProgress[session.id] ?? []
                  return (
                    <li
                      key={session.id}
                      id={`session-${session.id}`}
                      // HA-03: dải màu dọc theo `focus` — nhận ra loại buổi
                      // bằng ngoại vi thị giác trước khi đọc chữ.
                      className={`relative scroll-mt-4 overflow-hidden rounded-xl border-2 border-l-4 p-4 transition-shadow ${FOCUS_BORDER_CLASS[session.focus]} ${
                        isNext
                          ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                          : 'border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      {/* HA-03: đóng dấu ✅ mờ phía sau thẻ cho buổi đã học —
                          tín hiệu ngoại vi, không cạnh tranh với nội dung. */}
                      {completedAt && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-3 -bottom-3 text-7xl text-emerald-900/5 select-none dark:text-emerald-100/5"
                        >
                          ✅
                        </span>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          {/* HA-03: vòng tròn số buổi thay cho dòng chữ "Buổi 12 ·". */}
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-extrabold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {session.order}
                          </span>
                          {isTestFocus(session.focus) ? 'Bài kiểm tra' : 'Buổi học'} ·{' '}
                          {formatDate(session.date)}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${FOCUS_CLASS[session.focus]}`}
                        >
                          {FOCUS_LABEL[session.focus]}
                        </span>
                      </div>
                      {/* HA-03: thanh 6 ô nhỏ thể hiện các khối trong buổi, tô
                          dần khi hoàn thành từng khối (nối dữ liệu với PP-01/
                          Session Runner) — cùng ngôn ngữ hình ảnh với thanh
                          chấm khối trong SessionRunnerPage. */}
                      <div className="mt-2 flex gap-0.5">
                        {session.blocks.map((b, i) => (
                          <span
                            key={i}
                            title={b.label}
                            className={`h-1 flex-1 rounded-full ${
                              doneBlockIndexes.includes(i)
                                ? 'bg-emerald-500'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      {completedAt && (
                        <p className="mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          ✅ Đã hoàn thành · {formatDate(toISODate(new Date(completedAt)))}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {session.title}
                        </p>
                        {/* PP-01: "Vào học" chạy tuần tự từng khối có đồng hồ
                            + ghi nhận hoàn thành, thay vì chỉ đọc mô tả suông.
                            Không hiện cho bài kiểm tra định kỳ — những buổi
                            đó vào thẳng đề qua quickLinksFor bên dưới. */}
                        {!isTestFocus(session.focus) && (
                          <Link
                            to={`/lo-trinh-hoc/${session.id}/hoc`}
                            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                              isNext
                                ? 'bg-linear-to-r from-emerald-500 to-lime-500 text-white shadow-md shadow-emerald-500/30'
                                : 'border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            ▶️ Vào học
                          </Link>
                        )}
                      </div>

                      {/* LT-03/LT-05: buổi "bắt bệnh" hiện rõ đã bắt được bệnh
                          gì — nếu không hiện, học sinh không biết vì sao đề
                          luyện lại lọc theo đúng những chủ điểm này. Buổi
                          "Chốt tủ" (LT-05) dùng chung cơ chế bắt bệnh nhưng
                          có `focus: 'review'` — phân biệt với 2 buổi "Ôn tập
                          tổng hợp" chốt giai đoạn (cũng `review`, nhưng
                          topicIds tĩnh là CẢ giai đoạn, không phải bắt bệnh)
                          qua tiền tố tiêu đề. */}
                      {(session.focus === 'skill-drill' ||
                        session.focus === 'final-exam' ||
                        session.title.startsWith('Chốt tủ:')) &&
                        session.topicIds.length > 0 && (
                          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                            📍 Chủ điểm đang yếu nhất:{' '}
                            {session.topicIds.map(getTopicLabel).join(' · ')}
                          </p>
                        )}

                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-bold text-emerald-600 select-none dark:text-emerald-400">
                          Xem cấu trúc buổi học ({session.blocks.reduce((sum, b) => sum + b.minutes, 0)} phút)
                        </summary>
                        <ol className="mt-2 flex flex-col gap-2">
                          {session.blocks.map((block, i) => {
                            // PP-02: nút hành động thật cho từng khối, thay
                            // mô tả "(Luyện tập → Theo chủ điểm)" bằng chữ mà
                            // học sinh phải tự đọc rồi tự đi tìm trang đó.
                            const action = getBlockAction(
                              session,
                              block,
                              previousTopicById.get(session.id),
                            )
                            return (
                            <li
                              key={i}
                              className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {block.label}
                                  </span>{' '}
                                  <span className="text-xs text-slate-400">
                                    ({block.minutes} phút)
                                  </span>
                                </span>
                                {action && (
                                  <Link
                                    to={action.to}
                                    className="shrink-0 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                                  >
                                    {action.label}
                                  </Link>
                                )}
                              </div>
                              <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                                <RenderBold text={block.description} />
                              </p>
                            </li>
                            )
                          })}
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
