import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { contentStore, progressStore } from '../../data-access'
import { QuestionRunner } from '../practice/QuestionRunner'
import { selectDiagnosticQuestions } from './selectDiagnosticQuestions'
import type { Question } from '../../types/domain'

export function DiagnosticTestPage() {
  const navigate = useNavigate()
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [started, setStarted] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    contentStore.getQuestions().then(setAllQuestions)
  }, [])

  function handleStart() {
    setQuestions(selectDiagnosticQuestions(allQuestions))
    setStarted(true)
  }

  async function handleSkip() {
    await progressStore.setDiagnosticStatus('skipped')
    navigate('/ho-so')
  }

  async function handleFinish() {
    await progressStore.setDiagnosticStatus('completed')
    navigate('/ho-so')
  }

  if (started) {
    return (
      <QuestionRunner
        questions={questions}
        variant="standard"
        title="🧭 Bài kiểm tra đầu vào"
        onExit={handleFinish}
      />
    )
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center">
      <span className="text-5xl" aria-hidden="true">
        🧭
      </span>
      <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        Bài kiểm tra đầu vào
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Khoảng {Math.min(26, allQuestions.length)} câu, phủ đều nhiều chủ
        điểm, để hệ thống biết trình độ hiện tại của em và gợi ý lộ trình phù
        hợp. Không tính giờ, có giải thích ngay sau mỗi câu.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-full border-2 border-slate-200 px-5 py-2.5 font-bold text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-700 dark:text-slate-300"
        >
          Bỏ qua
        </button>
        <button
          type="button"
          disabled={allQuestions.length === 0}
          onClick={handleStart}
          className="rounded-full bg-linear-to-r from-emerald-500 to-lime-500 px-6 py-3 font-bold text-white shadow-md shadow-emerald-500/30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          Bắt đầu!
        </button>
      </div>
    </section>
  )
}
