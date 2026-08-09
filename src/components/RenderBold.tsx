import { Fragment } from 'react'

/**
 * Parse cú pháp đơn giản **in đậm** thành <strong>, không cần thư viện
 * markdown. Tách từ `LessonDetailPage` (nơi dùng đầu tiên, cho nội dung bài
 * học) thành tiện ích dùng chung vì `CurriculumPage`/`SessionRunnerPage`
 * cũng cần làm nổi bật quy tắc/công thức quan trọng trong mô tả từng khối
 * của buổi "Học kỹ năng" (LT-01) — trước đây dùng riêng lẻ mỗi nơi một bản
 * khiến cú pháp `**...**` trong nội dung khối hiện ra dấu sao thô ở những
 * chỗ chưa được nối vào renderBold.
 */
export function RenderBold({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-extrabold text-emerald-700 dark:text-emerald-400">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}
