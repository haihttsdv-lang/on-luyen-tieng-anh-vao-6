import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { RenderBold } from '../../components/RenderBold'
import { SpeakButton } from '../../components/SpeakButton'
import { getTopicLabel } from '../../content/topic-labels'
import { contentStore, progressStore } from '../../data-access'
import { playBlockTimeUp, playFinish } from '../audio/sfx'
import { GrammarVisual, hasGrammarVisual } from '../lessons/GrammarVisual'
import type { Attempt, BoxLevel, SessionOutcome, TopicStatus, VocabCard } from '../../types/domain'
import { getBlockAction } from './blockActions'
import { WarmupWidget } from './WarmupWidget'
import { OUTCOME_OPTIONS, applySessionOutcome, coinsForOutcome } from './rewards'
import {
  canPickOutcome,
  computeSessionCompletion,
  evaluateSuccessCriterion,
} from './sessionCompletion'
import { useCurriculumSchedule } from './useCurriculumSchedule'

/**
 * PP-01 · "Vào học" (Session Runner) — chạy TUẦN TỰ từng khối của một buổi
 * học, thay vì để cả buổi là một danh sách chữ mà học sinh phải tự đọc, tự
 * nhớ đã làm tới đâu, tự bấm giờ.
 *
 * Thiết kế cố ý ĐƠN GIẢN so với một "trình phát bài giảng" đầy đủ:
 *   - Đồng hồ đếm ngược theo đúng `block.minutes`, RESET khi đổi khối (không
 *     cố lưu số giây còn lại qua lần tải lại trang — chấp nhận mất độ chính
 *     xác nhỏ này để tránh phức tạp hóa việc đồng bộ đa tab/nhiều thiết bị).
 *   - Khối đã "Xong" được LƯU LẠI (`ProgressStore.setSessionBlockProgress`),
 *     nên đóng app giữa chừng rồi mở lại đúng buổi đó sẽ tiếp tục từ khối dở
 *     dang, không phải học lại từ đầu.
 *   - Nút hành động của từng khối tái dùng `getBlockAction` (PP-02) — cùng
 *     một nguồn suy luận action với danh sách buổi học, không định nghĩa lại.
 *   - Cuối buổi, màn hình tổng kết gợi ý mức tự đánh giá dựa trên dữ liệu
 *     luyện tập THẬT trong lúc học (PP-03), không chỉ 3 nút cảm tính.
 */

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function SessionRunnerPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { schedule } = useCurriculumSchedule()
  const [doneBlocks, setDoneBlocks] = useState<number[] | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [paused, setPaused] = useState(false)
  const [outcome, setOutcome] = useState<SessionOutcome | undefined>()
  const [saved, setSaved] = useState(false)
  const [homeworkDone, setHomeworkDoneState] = useState(false)
  // PP-06: "Học phiên rút gọn" — tự động bỏ qua các khối `optional` (phần mở
  // rộng) để buổi học nhanh hơn mà vẫn đủ 4 khối cốt lõi. Không lưu lại giữa
  // các lần vào học — mỗi buổi học sinh tự quyết định lại tùy hôm đó bận hay
  // rảnh, không phải cấu hình cố định.
  const [shortMode, setShortMode] = useState(false)
  const sessionStartAtRef = useRef(new Date().toISOString())

  // Dữ liệu thật để chấm cuối buổi (PP-03).
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [topicStatuses, setTopicStatuses] = useState<Record<string, TopicStatus>>({})
  const [vocabBoxLevels, setVocabBoxLevels] = useState<Record<string, BoxLevel>>({})
  const [vocabCards, setVocabCards] = useState<VocabCard[]>([])

  const session = schedule?.find((s) => s.id === sessionId)

  useEffect(() => {
    if (!sessionId) return
    progressStore.getSessionBlockProgress(sessionId).then(setDoneBlocks)
    // PP-05: tải sẵn trạng thái bài tập về nhà — khối lớp lại reset về false
    // khi chuyển buổi (sessionId đổi), không kế thừa nhầm trạng thái buổi cũ.
    progressStore.getHomeworkDone(sessionId).then(setHomeworkDoneState)
  }, [sessionId])

  async function toggleHomeworkDone() {
    const next = !homeworkDone
    setHomeworkDoneState(next)
    await progressStore.setHomeworkDone(sessionId!, next)
  }

  useEffect(() => {
    contentStore.getVocabCards().then(setVocabCards)
  }, [])

  const refreshCompletionData = () => {
    Promise.all([progressStore.getAttempts(), progressStore.getTopicStatuses()]).then(
      ([a, t]) => {
        setAttempts(a)
        setTopicStatuses(t)
      },
    )
    if (session?.vocabTopicId) {
      const cards = vocabCards.filter((c) => c.topicId === session.vocabTopicId)
      Promise.all(cards.map((c) => progressStore.getVocabBoxLevel(c.id))).then((levels) => {
        const map: Record<string, BoxLevel> = {}
        cards.forEach((c, i) => {
          if (levels[i] !== undefined) map[c.id] = levels[i]
        })
        setVocabBoxLevels(map)
      })
    }
  }

  const currentIndex = useMemo(() => {
    if (!session || !doneBlocks) return 0
    for (let i = 0; i < session.blocks.length; i++) {
      if (!doneBlocks.includes(i)) return i
    }
    return session.blocks.length
  }, [session, doneBlocks])

  // `finished` PHẢI được suy ra trực tiếp từ currentIndex trong cùng một lượt
  // render — nếu lưu bằng state riêng (setFinished trong effect) thì có một
  // lượt render "kẹt giữa": currentIndex đã bằng blocks.length (khối cuối
  // vừa đánh dấu xong) nhưng finished vẫn còn false vì effect chưa kịp chạy,
  // khiến `session.blocks[currentIndex]` đọc ra undefined và vỡ ứng dụng khi
  // suy action cho khối (bug phát hiện qua kiểm tra trực quan).
  const finished = !!session && currentIndex >= session.blocks.length

  useEffect(() => {
    if (!session || !finished) return
    refreshCompletionData()
    // AT-03: nhạc hiệu hoàn thành cả buổi — hàm đã có sẵn (`playFinish`)
    // nhưng Session Runner trước đây chưa từng gọi tới.
    playFinish()
    // Chỉ cần chạy lại khi buổi kết thúc — refreshCompletionData đọc session
    // tại thời điểm gọi, không cần liệt kê làm dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, session?.id])

  useEffect(() => {
    if (!session || finished) return
    setSecondsLeft(session.blocks[currentIndex].minutes * 60)
    setPaused(false)
  }, [currentIndex, session, finished])

  // AT-03: chuông nhẹ khi hết giờ 1 khối — đóng vai trò giáo viên nhắc
  // chuyển hoạt động thay vì bắt học sinh nhìn đồng hồ liên tục. Chỉ phát
  // khi `secondsLeft` THỰC SỰ vừa đếm từ >0 xuống 0 (không phải giá trị
  // khởi tạo ban đầu = 0 trước khi effect đặt thời lượng khối kịp chạy —
  // nếu chỉ so `secondsLeft === 0` sẽ kêu ngay lúc vừa mở buổi học).
  const prevSecondsLeftRef = useRef(secondsLeft)
  useEffect(() => {
    const prev = prevSecondsLeftRef.current
    prevSecondsLeftRef.current = secondsLeft
    if (!finished && prev > 0 && secondsLeft === 0) playBlockTimeUp()
  }, [finished, secondsLeft])

  // PP-06: ở chế độ rút gọn, khối `optional` hiện tại tự đánh dấu "xong"
  // ngay khi tới lượt — chuỗi các khối optional liên tiếp tự trôi qua hết
  // trong vài lượt render, không cần học sinh bấm gì.
  useEffect(() => {
    if (!session || !sessionId || finished || !shortMode) return
    if (!session.blocks[currentIndex]?.optional) return
    setDoneBlocks((prev) => {
      const list = prev ?? []
      if (list.includes(currentIndex)) return list
      const next = [...list, currentIndex]
      void progressStore.setSessionBlockProgress(sessionId, next)
      return next
    })
  }, [session, sessionId, finished, shortMode, currentIndex])

  useEffect(() => {
    if (finished || paused || secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [finished, paused, secondsLeft])

  if (!sessionId) return <Navigate to="/lo-trinh-hoc" replace />
  if (!schedule) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500">
        Đang tải...
      </section>
    )
  }
  if (!session || doneBlocks === null) {
    return <Navigate to="/lo-trinh-hoc" replace />
  }

  // Cập nhật qua state updater dạng hàm (đọc `prev` thay vì đóng gói sẵn
  // `currentIndex`/`doneBlocks` từ closure lúc render): nếu học sinh bấm
  // "Xong khối này" hai lần liên tiếp NHANH HƠN React kịp render lại (ví dụ
  // double-tap trên điện thoại), React vẫn áp dụng các lượt gọi updater
  // tuần tự trên state MỚI NHẤT — không bị cả hai lần cùng cộng vào đúng một
  // chỉ số cũ như khi dùng closure trực tiếp.
  function markBlockDone() {
    setDoneBlocks((prev) => {
      const list = prev ?? []
      let idx = 0
      while (list.includes(idx)) idx++
      if (idx >= session!.blocks.length) return list
      const next = [...list, idx]
      void progressStore.setSessionBlockProgress(sessionId!, next)
      return next
    })
  }

  const totalMinutes = session.blocks.reduce((sum, b) => sum + b.minutes, 0)
  const completion = finished
    ? computeSessionCompletion({
        session,
        attempts,
        sessionStartAt: sessionStartAtRef.current,
        topicStatuses,
        vocabBoxLevels,
        vocabCards,
        doneBlockCount: doneBlocks.length,
        totalBlockCount: session.blocks.length,
      })
    : null

  async function handlePickOutcome(value: SessionOutcome) {
    if (completion && !canPickOutcome(value, completion.score)) return
    setOutcome(value)
    await applySessionOutcome(progressStore, sessionId!, session!.focus, value, undefined)
    setSaved(true)
  }

  if (finished) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12">
        <span className="text-4xl" aria-hidden="true">
          🎉
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Hoàn thành buổi học!
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{session.title}</p>

        {/* PP-04: đối chiếu lại tiêu chí "coi như đã đạt" nêu ra đầu buổi,
            tick bằng dữ liệu thật (evaluateSuccessCriterion) chứ không phải
            tự học sinh tick tay. */}
        {completion && session.successCriteria.length > 0 && (
          <div className="mt-6 rounded-2xl border-2 border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-500">🎯 Đối chiếu mục tiêu buổi học</p>
              {/* AT-04: đọc to phần tổng kết — học sinh đọc chậm dễ tiếp thu
                  qua nghe hơn đọc, đặc biệt sau 1 buổi học đã hơi mệt. */}
              <SpeakButton
                text={`Hoàn thành buổi học ${session.title}. Đã hoàn thành ${doneBlocks.length} trên ${session.blocks.length} khối. Đạt ${
                  session.successCriteria.filter((c) => evaluateSuccessCriterion(c, completion)).length
                } trên ${session.successCriteria.length} tiêu chí đề ra.`}
                label="Đọc to phần tổng kết buổi học"
                lang="vi-VN"
                size="sm"
              />
            </div>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {session.successCriteria.map((c, i) => {
                const done = evaluateSuccessCriterion(c, completion)
                return (
                  <li
                    key={i}
                    className={
                      done
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }
                  >
                    {done ? '✅' : '⬜'} {c.label}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {completion && (
          <div className="mt-4 rounded-2xl border-2 border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-bold text-slate-500">
              📊 Dựa trên dữ liệu luyện tập thật trong buổi
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
              <li>✅ {doneBlocks.length}/{session.blocks.length} khối đã hoàn thành</li>
              <li>🎯 {completion.attemptsCount} câu luyện tập đã làm trong buổi</li>
              {completion.quizMastered !== null && (
                <li>
                  {completion.quizMastered ? '🏆' : '📘'} Quiz chủ điểm{' '}
                  {completion.quizMastered ? 'đã đạt "Đã nắm"' : 'chưa đạt "Đã nắm"'}
                </li>
              )}
              {completion.vocabAvgProgress !== null && (
                <li>
                  🗂️ Từ vựng đã ôn tới {Math.round(completion.vocabAvgProgress * 100)}% hộp
                  Leitner cao nhất
                </li>
              )}
            </ul>
            <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
              💡 Gợi ý tự đánh giá:{' '}
              {OUTCOME_OPTIONS.find((o) => o.value === completion.suggestedOutcome)?.emoji}{' '}
              {OUTCOME_OPTIONS.find((o) => o.value === completion.suggestedOutcome)?.label}
            </p>
          </div>
        )}

        <div className="mt-4">
          <span className="text-sm font-bold text-slate-500">
            Em tự đánh giá buổi học này thế nào?
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {OUTCOME_OPTIONS.map((opt) => {
              const disabled = completion ? !canPickOutcome(opt.value, completion.score) : false
              const coins = coinsForOutcome(session.focus, opt.value)
              const isActive = outcome === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={disabled}
                  title={
                    disabled
                      ? 'Cần luyện tập thêm trong buổi mới được tự chọn mức này'
                      : undefined
                  }
                  onClick={() => handlePickOutcome(opt.value)}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
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

        {/* PP-05: bài tập về nhà giờ tick được trạng thái (lưu qua
            ProgressStore.setHomeworkDone), để trang chủ nhắc được khi buổi
            trước còn bài chưa làm — trước đây chỉ là dòng chữ đọc suông. */}
        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <input
            type="checkbox"
            checked={homeworkDone}
            onChange={toggleHomeworkDone}
            className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
          />
          <span>
            <span className="font-bold">📌 Bài tập về nhà:</span> {session.homework}
            {homeworkDone && <span className="ml-1 font-bold text-emerald-600 dark:text-emerald-400">✓ Đã làm</span>}
          </span>
        </label>

        <div className="mt-6 flex gap-3">
          <Link
            to="/lo-trinh-hoc"
            className="rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-6 py-3 font-bold text-white shadow-md shadow-emerald-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            {saved ? 'Xong — về Lộ trình học' : 'Về Lộ trình học'}
          </Link>
        </div>
      </section>
    )
  }

  const block = session.blocks[currentIndex]
  const action = getBlockAction(session, block)
  const isOverTime = secondsLeft <= 0

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <Link
        to="/lo-trinh-hoc"
        className="text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
      >
        ← Thoát (tiến độ đã lưu)
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
          {session.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* PP-06: chỉ hiện nút khi buổi THẬT SỰ có khối mở rộng để bỏ qua —
              buổi kiểm tra/thi thử không có khối `optional` nên không hiện
              nút này, tránh hứa hẹn một tính năng không áp dụng được. */}
          {session.blocks.some((b) => b.optional) && (
            <button
              type="button"
              onClick={() => setShortMode((v) => !v)}
              title="Tự động bỏ qua các khối mở rộng, giữ đủ 4 khối cốt lõi"
              className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                shortMode
                  ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
              }`}
            >
              🚀 Học phiên rút gọn
            </button>
          )}
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              isOverTime
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            ⏱ {formatSeconds(Math.max(secondsLeft, 0))}
          </span>
        </div>
      </div>

      {session.topicIds.length > 0 && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          📍 {session.topicIds.map(getTopicLabel).join(' · ')}
        </p>
      )}

      {/* Thanh chấm khối — cùng ngôn ngữ hình ảnh với thanh tiến trình câu
          hỏi trong QuestionRunner (UX-04), giữ nhất quán trong toàn ứng dụng. */}
      <div className="mt-4 flex gap-0.5">
        {session.blocks.map((b, i) => (
          <span
            key={i}
            title={b.label}
            className={`h-1.5 flex-1 rounded-full ${
              doneBlocks.includes(i)
                ? 'bg-emerald-500'
                : i === currentIndex
                  ? 'bg-emerald-300 dark:bg-emerald-700'
                  : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Khối {currentIndex + 1}/{session.blocks.length} · Tổng {totalMinutes} phút
      </p>

      {/* PP-04: mục tiêu buổi học — mở sẵn ở khối đầu tiên để buổi học có mở
          đầu rõ ràng, gấp lại ở các khối sau để không choán chỗ nội dung. */}
      {session.objectives.length > 0 && (
        <details
          className="mt-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4 dark:border-sky-800 dark:bg-sky-500/5"
          open={currentIndex === 0}
        >
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-sky-800 select-none dark:text-sky-300">
            🎯 Sau buổi này, em có thể…
            {/* AT-04: đọc to mục tiêu buổi học — SpeakButton tự
                preventDefault/stopPropagation nên không đóng/mở <details>
                khi bấm 🔊. */}
            <SpeakButton
              text={session.objectives.join('. ')}
              label="Đọc to mục tiêu buổi học"
              lang="vi-VN"
              size="sm"
            />
          </summary>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
            {session.objectives.map((o, i) => (
              <li key={i}>· {o}</li>
            ))}
          </ul>
        </details>
      )}

      {/* PP-08: gấp lại mặc định — dành cho phụ huynh xem khi cần, không
          choán chỗ màn hình học sinh đang dùng để tự học. */}
      {session.parentNote && (
        <details className="mt-3 rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-4 dark:border-amber-800 dark:bg-amber-500/5">
          <summary className="cursor-pointer text-sm font-bold text-amber-800 select-none dark:text-amber-300">
            👨‍👩‍👧 Dành cho phụ huynh
          </summary>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{session.parentNote}</p>
        </details>
      )}

      <div className="mt-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-800 dark:bg-emerald-500/5">
        <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
          {block.label}{' '}
          <span className="text-sm font-normal text-slate-400">({block.minutes} phút)</span>
        </p>
        {/* PP-06: nhắc phụ huynh biết lúc nào nên có mặt cùng con, không chặn
            học sinh tự học nếu không có người lớn ở nhà lúc đó. */}
        {block.needsAdult && (
          <p className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-400">
            👨‍👩‍👧 Khối này nên có người lớn cùng theo dõi
          </p>
        )}
        <p className="mt-2 text-slate-700 dark:text-slate-300">
          <RenderBold text={block.description} />
        </p>

        {/* AT-01/AT-02: khối Khởi động có từ để nghe NGAY tại chỗ thay vì
            chỉ mô tả bằng chữ một hoạt động không có gì để bấm. */}
        {block.label === 'Khởi động' && <WarmupWidget session={session} />}

        {/* HA-04: sơ đồ trực quan (trục thời gian/bảng chia động từ/cấu trúc
            câu) đã có sẵn ở trang Bài học nhưng lộ trình trước đây chưa từng
            dẫn tới — nhúng thẳng vào khối "Bài mới" để học sinh thấy ngay
            mà không phải rời màn hình Session Runner. Tự ẩn nếu chủ điểm
            chưa có sơ đồ (không phải mọi chủ điểm đều có). */}
        {block.label === 'Bài mới' &&
          session.topicIds[0] &&
          hasGrammarVisual(session.topicIds[0]) && (
            <div className="mt-3">
              <GrammarVisual topicId={session.topicIds[0]} />
            </div>
          )}

        {action && (
          <Link
            to={action.to}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 font-bold text-white shadow-md shadow-emerald-500/30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            {action.label} →
          </Link>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-700 dark:text-slate-300"
          >
            {paused ? '▶️ Tiếp tục' : '⏸ Tạm dừng'}
          </button>
          <button
            type="button"
            onClick={markBlockDone}
            className="rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-5 py-2.5 font-bold text-white shadow-md shadow-emerald-500/30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            ✓ Xong khối này
          </button>
          <button
            type="button"
            onClick={markBlockDone}
            className="rounded-full px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            ⏭ Bỏ qua
          </button>
        </div>
      </div>
    </section>
  )
}
