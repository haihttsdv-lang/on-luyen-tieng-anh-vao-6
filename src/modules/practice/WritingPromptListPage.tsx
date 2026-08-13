import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { contentStore } from '../../data-access'
import { useSessionReturn, withSessionReturn } from '../curriculum/returnTo'
import type { WritingPrompt } from '../../types/domain'

export function WritingPromptListPage() {
  const [prompts, setPrompts] = useState<WritingPrompt[]>([])
  const { sessionId, returnTo } = useSessionReturn()

  useEffect(() => {
    contentStore.getWritingPrompts().then(setPrompts)
  }, [])

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 lg:max-w-4xl">
      <Link
        to={returnTo ?? '/luyen-tap'}
        className="text-sm font-bold text-emerald-600 hover:underline dark:text-emerald-400"
      >
        {returnTo ? '← Quay lại buổi học' : '← Quay lại Luyện tập'}
      </Link>

      <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        ✍️ Viết đoạn văn
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Chọn một chủ đề. Bài viết chỉ để tự luyện tập — chưa có chấm điểm tự
        động ở phiên bản này.
      </p>

      {/* UX-02: tận dụng chiều ngang màn hình lớn thay vì bỏ trống ~50%. */}
      <ul className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {prompts.map((prompt) => (
          <li key={prompt.id}>
            <Link
              to={
                sessionId
                  ? withSessionReturn(`/luyen-tap/viet/${prompt.id}`, sessionId)
                  : `/luyen-tap/viet/${prompt.id}`
              }
              className="flex items-center justify-between gap-3 rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {prompt.title}
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
