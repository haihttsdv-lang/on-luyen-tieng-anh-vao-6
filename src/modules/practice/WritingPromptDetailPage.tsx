import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { SpeakButton } from '../../components/SpeakButton'
import { contentStore } from '../../data-access'
import type { WritingPrompt } from '../../types/domain'

// Tiêu chí áp dụng cho MỌI đề; mỗi đề còn có `checklist` riêng theo yêu cầu
// ngữ pháp/nội dung của đề đó (xem src/content/writing-prompts) — ND-06.
const COMMON_CHECKLIST = [
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
  // Bài mẫu chỉ mở sau khi học sinh tự nhận là đã viết xong — tránh chép.
  const [showSample, setShowSample] = useState(false)

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
  const checklist = [...(prompt.checklist ?? []), ...COMMON_CHECKLIST]

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
        <p className="text-sm font-bold text-slate-500">
          ✅ Tự kiểm tra ({checked.size}/{checklist.length})
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {checklist.map((item, i) => (
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

      {/* ND-06: bài mẫu — bước chữa bài quan trọng nhất của kỹ năng viết.
          Khóa lại tới khi học sinh tự viết xong để không thành chép mẫu. */}
      {prompt.sampleAnswer && (
        <div className="mt-3 rounded-xl border-2 border-amber-100 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-500/5">
          {!showSample ? (
            <>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                📄 Bài mẫu tham khảo
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Hãy tự viết đoạn văn của em trước đã. Xem bài mẫu trước khi viết
                thì em sẽ chỉ chép lại, không học được gì.
              </p>
              <button
                type="button"
                onClick={() => setShowSample(true)}
                disabled={wordCount < 20}
                className="mt-3 rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                Tôi đã viết xong — xem bài mẫu
              </button>
              {wordCount < 20 && (
                <p className="mt-1.5 text-xs text-slate-400">
                  (Viết được ít nhất 20 từ thì nút này mới mở)
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  📄 Bài mẫu tham khảo ({countWords(prompt.sampleAnswer)} từ)
                </p>
                <SpeakButton
                  text={prompt.sampleAnswer}
                  label="Nghe bài mẫu"
                  size="sm"
                />
              </div>
              <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-300">
                {prompt.sampleAnswer}
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                So sánh với bài của em: bài mẫu đã dùng những từ vựng gợi ý nào?
                Có ý nào hay mà em chưa nghĩ ra không?
              </p>
            </>
          )}
        </div>
      )}
    </section>
  )
}
