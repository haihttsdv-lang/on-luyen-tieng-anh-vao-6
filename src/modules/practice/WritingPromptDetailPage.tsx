import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { contentStore } from '../../data-access'
import type { WritingPrompt } from '../../types/domain'

const CHECKLIST = [
  'Đã viết đủ 50–70 từ',
  'Đã dùng ít nhất 3 từ vựng gợi ý',
  'Câu đầu tiên giới thiệu rõ chủ đề',
  'Đã kiểm tra lỗi chính tả và dấu câu',
  'Đã đọc lại to đoạn văn một lượt',
]

function countWords(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length
}

export function WritingPromptDetailPage() {
  const { promptId } = useParams<{ promptId: string }>()
  const [prompt, setPrompt] = useState<WritingPrompt | null | undefined>(undefined)
  const [text, setText] = useState('')
  const [checked, setChecked] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!promptId) return
    contentStore.getWritingPrompts().then((prompts) => {
      setPrompt(prompts.find((p) => p.id === promptId) ?? null)
    })
  }, [promptId])

  if (prompt === undefined) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-500">
        Đang tải...
      </section>
    )
  }
  if (prompt === null) {
    return <Navigate to="/luyen-tap/viet" replace />
  }

  const wordCount = countWords(text)
  const inRange = wordCount >= 50 && wordCount <= 70

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <Link
        to="/luyen-tap/viet"
        className="text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
      >
        ← Quay lại danh sách đề viết
      </Link>

      <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        ✍️ {prompt.title}
      </h1>

      <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-bold text-slate-500">💡 Gợi ý dàn ý</p>
        <ul className="mt-2 list-disc pl-5 text-slate-700 dark:text-slate-300">
          {prompt.ideas.map((idea, i) => (
            <li key={i}>{idea}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-bold text-slate-500">📚 Từ vựng gợi ý</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {prompt.vocab.map((word) => (
            <span
              key={word}
              className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Viết đoạn văn của em vào đây..."
        rows={8}
        className="mt-4 w-full rounded-xl border-2 border-slate-200 p-4 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
      />
      <p
        className={`mt-1 text-sm font-bold ${inRange ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
      >
        {wordCount} từ (mục tiêu 50–70 từ)
      </p>

      <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-bold text-slate-500">✅ Tự kiểm tra</p>
        <ul className="mt-2 flex flex-col gap-2">
          {CHECKLIST.map((item, i) => (
            <li key={i}>
              <label className="flex cursor-pointer items-center gap-2 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="accent-emerald-600"
                  checked={checked.has(i)}
                  onChange={() =>
                    setChecked((prev) => {
                      const next = new Set(prev)
                      if (next.has(i)) next.delete(i)
                      else next.add(i)
                      return next
                    })
                  }
                />
                {item}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
