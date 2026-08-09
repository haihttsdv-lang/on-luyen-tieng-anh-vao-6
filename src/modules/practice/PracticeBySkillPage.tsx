import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { contentStore } from '../../data-access'
import type { Question, SkillId } from '../../types/domain'
import { QuestionRunner } from './QuestionRunner'
import { shuffle } from './shuffle'

const SKILLS: { id: SkillId; icon: string; title: string }[] = [
  { id: 'KN-01', icon: '📩', title: 'Đọc hiểu thông báo/tin nhắn ngắn' },
  { id: 'KN-02', icon: '📖', title: 'Đọc hiểu văn bản dài' },
  { id: 'KN-03', icon: '✏️', title: 'Đọc và điền từ' },
  { id: 'KN-04', icon: '💬', title: 'Hoàn thành hội thoại' },
  { id: 'KN-05', icon: '🔄', title: 'Viết lại câu' },
  { id: 'KN-06', icon: '🔍', title: 'Tìm và sửa lỗi sai' },
  { id: 'KN-08', icon: '🔊', title: 'Ngữ âm: trọng âm & phát âm' },
  { id: 'KN-09', icon: '↔️', title: 'Từ đồng nghĩa / trái nghĩa' },
]

const SESSION_LENGTH = 15

function isSkillId(value: string | null): value is SkillId {
  return !!value && SKILLS.some((s) => s.id === value)
}

export function PracticeBySkillPage() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [params] = useSearchParams()
  // LT-02/PP-02: Lộ trình học có thể trỏ thẳng vào một dạng bài qua
  // `?skill=KN-08` — dùng cho khối "Luyện dạng bài xen kẽ" trong mỗi buổi.
  const skillFromQuery = isSkillId(params.get('skill')) ? params.get('skill') : null
  const [selectedSkill, setSelectedSkill] = useState<SkillId | null>(
    skillFromQuery as SkillId | null,
  )
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([])
  const [autoStarted, setAutoStarted] = useState(false)

  useEffect(() => {
    contentStore.getQuestions().then(setAllQuestions)
  }, [])

  const countsBySkill = useMemo(() => {
    const counts: Partial<Record<SkillId, number>> = {}
    for (const q of allQuestions) {
      counts[q.skillId] = (counts[q.skillId] ?? 0) + 1
    }
    return counts
  }, [allQuestions])

  function startSession(skillId: SkillId) {
    const pool = allQuestions.filter((q) => q.skillId === skillId)
    setSelectedSkill(skillId)
    setSessionQuestions(shuffle(pool).slice(0, SESSION_LENGTH))
  }

  useEffect(() => {
    if (autoStarted || !skillFromQuery || allQuestions.length === 0) return
    setAutoStarted(true)
    const pool = allQuestions.filter((q) => q.skillId === skillFromQuery)
    setSelectedSkill(skillFromQuery as SkillId)
    setSessionQuestions(shuffle(pool).slice(0, SESSION_LENGTH))
  }, [autoStarted, skillFromQuery, allQuestions])

  if (selectedSkill) {
    const skill = SKILLS.find((s) => s.id === selectedSkill)
    return (
      <QuestionRunner
        questions={sessionQuestions}
        variant="standard"
        title={`${skill?.icon} ${skill?.title}`}
        onExit={() => setSelectedSkill(null)}
      />
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <Link
        to="/luyen-tap"
        className="text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
      >
        ← Quay lại Luyện tập
      </Link>

      <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        📝 Luyện theo dạng bài
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Chọn một dạng bài để luyện đúng cấu trúc như đề thi thật.
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {SKILLS.map((skill) => {
          const count = countsBySkill[skill.id] ?? 0
          return (
            <li key={skill.id}>
              <button
                type="button"
                disabled={count === 0}
                onClick={() => startSession(skill.id)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden="true">
                    {skill.icon}
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-slate-400">
                      {skill.id}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {skill.title}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800">
                  {count} câu
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
