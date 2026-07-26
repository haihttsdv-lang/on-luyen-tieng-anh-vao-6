import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { contentStore } from '../../data-access'
import type { Question } from '../../types/domain'
import { QuestionRunner } from './QuestionRunner'
import { shuffle } from './shuffle'

const TIME_LIMIT_SECONDS = 60
const POOL_SIZE = 30

export function SpeedChallengePage() {
  const navigate = useNavigate()
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [started, setStarted] = useState(false)
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([])

  useEffect(() => {
    contentStore.getQuestions().then(setAllQuestions)
  }, [])

  function handleStart() {
    setSessionQuestions(shuffle(allQuestions).slice(0, POOL_SIZE))
    setStarted(true)
  }

  if (started) {
    return (
      <QuestionRunner
        questions={sessionQuestions}
        variant="speed"
        timeLimitSeconds={TIME_LIMIT_SECONDS}
        title="⚡ Đua tốc độ"
        onExit={() => navigate('/luyen-tap')}
      />
    )
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center">
      <span className="text-5xl" aria-hidden="true">
        ⚡
      </span>
      <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        Đua tốc độ
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Trả lời càng nhiều câu càng tốt trong {TIME_LIMIT_SECONDS} giây. Chuỗi
        đúng liên tiếp càng dài, xu thưởng mỗi câu càng cao!
      </p>
      <button
        type="button"
        disabled={allQuestions.length === 0}
        onClick={handleStart}
        className="mt-6 rounded-full bg-linear-to-r from-orange-400 to-amber-500 px-8 py-3 font-bold text-white shadow-md shadow-orange-500/30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
      >
        Bắt đầu!
      </button>
    </section>
  )
}
