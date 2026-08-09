import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SKILL_LABELS } from '../../content/skill-labels'
import { getTopicLabel } from '../../content/topic-labels'
import { contentStore, progressStore } from '../../data-access'
import type {
  Attempt,
  BoxLevel,
  DiagnosticStatus,
  MockTestResult,
  Question,
  SkillId,
  Topic,
  VocabCard,
} from '../../types/domain'
import { BadgeShelf } from '../curriculum/BadgeShelf'
import { computeEarnedBadges } from '../curriculum/badges'
import { useCurriculumSchedule } from '../curriculum/useCurriculumSchedule'
import { BackupSection } from './BackupSection'
import { CloudSyncSection } from './CloudSyncSection'
import { SoundSettingsSection } from './SoundSettingsSection'
import { getSuggestions, type Suggestion } from './getSuggestions'
import {
  computeAllSkillMastery,
  computeAllTopicMastery,
  computeVocabMasteryFromBoxes,
  type MasteryResult,
} from './masteryCalc'

const LEVEL_STYLE: Record<MasteryResult['level'], string> = {
  'no-data': 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
  weak: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  improving: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  mastered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
}

const LEVEL_LABEL: Record<MasteryResult['level'], string> = {
  'no-data': 'Chưa có dữ liệu',
  weak: 'Cần ôn lại',
  improving: 'Đang tiến bộ',
  mastered: 'Thành thạo',
}

function MasteryTile({ id, label, result }: { id: string; label: string; result: MasteryResult }) {
  return (
    <div
      className={`rounded-xl px-3 py-2 text-sm ${LEVEL_STYLE[result.level]}`}
      title={LEVEL_LABEL[result.level]}
    >
      <p className="font-bold">{id}</p>
      <p className="truncate">{label}</p>
    </div>
  )
}

export function MasteryPage() {
  const [loading, setLoading] = useState(true)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [vocabCards, setVocabCards] = useState<VocabCard[]>([])
  const [vocabBoxLevels, setVocabBoxLevels] = useState<Record<string, number>>({})
  const [diagnosticStatus, setDiagnosticStatus] = useState<DiagnosticStatus | undefined>()
  const [mockTestResults, setMockTestResults] = useState<MockTestResult[]>([])

  // HA-05: huy hiệu mốc thành tích — tái dùng đúng logic đã có ở Lộ trình
  // học (`computeEarnedBadges`), không tính lại theo cách khác ở đây.
  const { schedule, outcomes } = useCurriculumSchedule()
  const [homeworkDoneBySession, setHomeworkDoneBySession] = useState<Record<string, boolean>>({})
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
  const earnedBadges = useMemo(
    () =>
      schedule && outcomes
        ? computeEarnedBadges(schedule, outcomes, homeworkDoneBySession, mockTestResults)
        : [],
    [schedule, outcomes, homeworkDoneBySession, mockTestResults],
  )

  useEffect(() => {
    async function load() {
      const [a, q, t, v, status, mockTests] = await Promise.all([
        progressStore.getAttempts(),
        contentStore.getQuestions(),
        contentStore.getTopics(),
        contentStore.getVocabCards(),
        progressStore.getDiagnosticStatus(),
        progressStore.getMockTestResults(),
      ])
      setMockTestResults(mockTests)
      const boxLevels: Record<string, number> = {}
      await Promise.all(
        v.map(async (card) => {
          const level = await progressStore.getVocabBoxLevel(card.id)
          if (level !== undefined) boxLevels[card.id] = level
        }),
      )
      setAttempts(a)
      setQuestions(q)
      setTopics(t)
      setVocabCards(v)
      setVocabBoxLevels(boxLevels)
      setDiagnosticStatus(status)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSkipDiagnostic() {
    await progressStore.setDiagnosticStatus('skipped')
    setDiagnosticStatus('skipped')
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-500">
        Đang tải...
      </section>
    )
  }

  const npIds = [...new Set(questions.flatMap((q) => q.topicIds))]
    .filter((id) => id.startsWith('NP-'))
    .sort()
  // ND-07: lấy chủ đề từ vựng từ BỘ THẺ chứ không từ câu hỏi — trước đây chủ
  // đề nào không có câu hỏi nào gắn topicId thì biến mất khỏi bản đồ.
  const tvIds = [...new Set(vocabCards.map((c) => c.topicId))].sort()
  const skillIds = [...new Set(questions.map((q) => q.skillId))].sort() as SkillId[]

  const topicMastery = computeAllTopicMastery(attempts, questions)
  const skillMastery = computeAllSkillMastery(attempts, questions)
  // ND-07: chủ đề từ vựng chấm theo hộp Leitner (bản chất là học flashcard),
  // chỉ lùi về cách tính theo câu trắc nghiệm khi chưa ôn đủ thẻ.
  const vocabMastery = computeVocabMasteryFromBoxes(
    vocabCards,
    vocabBoxLevels as Record<string, BoxLevel>,
  )
  const emptyResult: MasteryResult = {
    score: null,
    attemptsUsed: 0,
    totalAttempts: 0,
    level: 'no-data',
  }

  const suggestions: Suggestion[] = getSuggestions({
    attempts,
    questions,
    topics,
    vocabCards,
    vocabBoxLevels: vocabBoxLevels as Record<string, BoxLevel>,
  })

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          🏆 Hồ sơ
        </h1>
        <Link
          to="/ho-so/phu-huynh"
          className="text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
        >
          👨‍👩‍👧 Xem dành cho phụ huynh
        </Link>
      </div>

      {/* HA-05: dải huy hiệu — chi phí gần như bằng 0 (chỉ đọc lại dữ liệu
          đã có), tác động động lực cao với lứa tuổi 10–11. */}
      <BadgeShelf badges={earnedBadges} />

      {diagnosticStatus === undefined && (
        <div className="mt-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-500/10">
          <p className="font-bold text-emerald-800 dark:text-emerald-300">
            🧭 Bạn chưa làm bài kiểm tra đầu vào
          </p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
            Làm một bài ngắn để hệ thống biết trình độ hiện tại và gợi ý lộ
            trình phù hợp hơn.
          </p>
          <div className="mt-3 flex gap-3">
            <Link
              to="/ho-so/kiem-tra-dau-vao"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
            >
              Làm ngay
            </Link>
            <button
              type="button"
              onClick={handleSkipDiagnostic}
              className="rounded-full px-4 py-2 text-sm font-bold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      )}

      <h2 className="mt-8 text-lg font-extrabold text-slate-900 dark:text-slate-100">
        🎯 Gợi ý cho bạn
      </h2>
      <div className="mt-3 flex flex-col gap-3">
        {suggestions.length === 0 && (
          <p className="text-sm text-slate-500">
            Chưa có gợi ý — hãy luyện tập vài câu để hệ thống hiểu bạn hơn!
          </p>
        )}
        {suggestions.map((s, i) => (
          <Link
            key={i}
            to={s.href}
            className="flex items-center justify-between gap-3 rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <span>
              <span className="block font-bold text-slate-900 dark:text-slate-100">
                {s.label}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {s.reason}
              </span>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-extrabold text-slate-900 dark:text-slate-100">
        🗺️ Bản đồ năng lực
      </h2>
      <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold">
        {(Object.keys(LEVEL_LABEL) as MasteryResult['level'][]).map((level) => (
          <span key={level} className={`rounded-full px-3 py-1 ${LEVEL_STYLE[level]}`}>
            {LEVEL_LABEL[level]}
          </span>
        ))}
      </div>

      <h3 className="mt-6 text-sm font-bold tracking-wide text-slate-500 uppercase">
        Ngữ pháp
      </h3>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {npIds.map((id) => (
          <MasteryTile
            key={id}
            id={id}
            label={getTopicLabel(id)}
            result={topicMastery[id] ?? emptyResult}
          />
        ))}
      </div>

      <h3 className="mt-6 text-sm font-bold tracking-wide text-slate-500 uppercase">
        Từ vựng
      </h3>
      <p className="mt-1 text-xs text-slate-400">
        Tính theo hộp Leitner của bộ thẻ (ôn càng nhiều thẻ lên hộp cao, điểm
        càng cao).
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {tvIds.map((id) => {
          const fromBoxes = vocabMastery[id]
          const result =
            fromBoxes && fromBoxes.level !== 'no-data'
              ? fromBoxes
              : (topicMastery[id] ?? fromBoxes ?? emptyResult)
          return (
            <MasteryTile key={id} id={id} label={getTopicLabel(id)} result={result} />
          )
        })}
      </div>

      <h3 className="mt-6 text-sm font-bold tracking-wide text-slate-500 uppercase">
        Kỹ năng
      </h3>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {skillIds.map((id) => (
          <MasteryTile
            key={id}
            id={id}
            label={SKILL_LABELS[id]}
            result={skillMastery[id] ?? emptyResult}
          />
        ))}
      </div>

      <SoundSettingsSection />
      <CloudSyncSection />
      <BackupSection />
    </section>
  )
}
