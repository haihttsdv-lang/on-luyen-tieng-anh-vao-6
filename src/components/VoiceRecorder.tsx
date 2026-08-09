import { useEffect, useRef, useState } from 'react'

/**
 * MM-07 · Ghi âm giọng nói để tự luyện phát âm.
 *
 * Học sinh nghe mẫu (nút 🔊 dùng Web Speech API), tự đọc lại, rồi nghe lại
 * chính mình để so sánh — vòng lặp "nghe mẫu → tự đọc → nghe lại" là cách
 * luyện phát âm hiệu quả nhất khi không có giáo viên ngồi cạnh sửa.
 *
 * Nguyên tắc riêng tư (quan trọng vì đây là dữ liệu giọng nói của trẻ em):
 * bản ghi **chỉ nằm trong bộ nhớ tab đang mở** dưới dạng blob URL, KHÔNG lưu
 * vào localStorage, KHÔNG đưa vào bản sao lưu, KHÔNG đồng bộ lên cloud. Rời
 * trang hoặc đổi thẻ là bản ghi biến mất. Micro cũng được tắt ngay sau khi
 * dừng ghi (dừng từng track) để đèn báo micro của thiết bị tắt hẳn.
 */

interface VoiceRecorderProps {
  /** Nhãn cho trình đọc màn hình, ví dụ "Ghi âm phát âm từ apple". */
  label: string
  /** Đổi giá trị này (ví dụ id thẻ) sẽ xóa bản ghi cũ. */
  resetKey?: string
}

type State = 'idle' | 'recording' | 'recorded' | 'denied' | 'unsupported'

function isSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia
  )
}

export function VoiceRecorder({ label, resetKey }: VoiceRecorderProps) {
  const [state, setState] = useState<State>('idle')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  // Thu hồi blob URL cũ để không rò rỉ bộ nhớ khi ghi lại nhiều lần.
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  // Đổi thẻ/đổi từ thì bỏ bản ghi cũ — nghe lại giọng của từ khác là vô nghĩa.
  useEffect(() => {
    setAudioUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
    setState((s) => (s === 'recorded' ? 'idle' : s))
  }, [resetKey])

  // Rời trang giữa lúc đang ghi thì phải tắt micro.
  useEffect(() => {
    return () => {
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') recorder.stop()
      recorder?.stream.getTracks().forEach((track) => track.stop())
    }
  }, [])

  if (!isSupported()) return null

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        setAudioUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous)
          return URL.createObjectURL(blob)
        })
        setState('recorded')
        // Tắt micro ngay, đừng để đèn báo micro sáng suốt buổi học.
        stream.getTracks().forEach((track) => track.stop())
      }
      recorder.start()
      setState('recording')
    } catch {
      setState('denied')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
  }

  if (state === 'denied') {
    return (
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Không dùng được micro. Hãy cho phép quyền micro trong trình duyệt rồi
        thử lại.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        aria-label={label}
        onClick={state === 'recording' ? stopRecording : startRecording}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 ${
          state === 'recording'
            ? 'animate-pulse bg-rose-500 text-white'
            : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
        }`}
      >
        <span aria-hidden="true">{state === 'recording' ? '⏹' : '🎙️'}</span>
        {state === 'recording' ? 'Dừng ghi' : 'Tập đọc lại'}
      </button>

      {audioUrl && state !== 'recording' && (
        <audio
          controls
          src={audioUrl}
          className="h-8 max-w-[200px]"
          aria-label="Nghe lại bản ghi của em"
        />
      )}
    </div>
  )
}
