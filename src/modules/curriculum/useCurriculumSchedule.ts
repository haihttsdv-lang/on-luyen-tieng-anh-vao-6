import { useEffect, useMemo, useState } from 'react'
import { getCurriculumPlan, type CurriculumTier } from '../../content/curriculum'
import { contentStore, progressStore } from '../../data-access'
import type {
  CurriculumSessionTemplate,
  ScheduledSession,
  SessionOutcomeRecord,
} from '../../types/domain'
import { tierFromDiagnosticScore } from './personalize'
import { buildFullSchedule } from './periodicTests'
import { CURRICULUM_DEADLINE } from './schedule'
import { injectWeakTopics, weakTopicIds } from './weakTopics'

export interface UseCurriculumScheduleResult {
  /** `null` khi dữ liệu (outcomes) chưa tải xong. */
  schedule: ScheduledSession[] | null
  outcomes: Record<string, SessionOutcomeRecord> | null
  setOutcomes: React.Dispatch<React.SetStateAction<Record<string, SessionOutcomeRecord> | null>>
  /** LT-06: mức cá nhân hóa suy từ điểm kiểm tra đầu vào. */
  tier: CurriculumTier
  /** Danh sách buổi TĨNH (đúng tier, chưa gắn ngày) — dùng khi cần thứ tự
   * cố định không đổi theo lịch, ví dụ tra "chủ điểm buổi trước" (PP-02). */
  curriculumPlan: CurriculumSessionTemplate[]
}

/**
 * Hợp nhất logic tải lịch học — trước đây `CurriculumPage`, `SessionRunnerPage`
 * và `TodaySessionCard` mỗi nơi tự viết lại gần như y hệt (tải outcomes, tính
 * chủ điểm yếu, dựng schedule) — tách thành 1 hook dùng chung để 3 màn hình
 * này KHÔNG BAO GIỜ lệch nhau (ví dụ, thêm LT-06 cá nhân hóa theo tier chỉ
 * cần sửa 1 chỗ thay vì 3 chỗ, giảm nguy cơ quên đồng bộ 1 trong 3 nơi).
 */
export function useCurriculumSchedule(): UseCurriculumScheduleResult {
  const [outcomes, setOutcomes] = useState<Record<string, SessionOutcomeRecord> | null>(null)
  const [weakTopics, setWeakTopics] = useState<string[]>([])
  const [tier, setTier] = useState<CurriculumTier>('standard')

  useEffect(() => {
    let cancelled = false
    progressStore.getSessionOutcomes().then((loaded) => {
      if (!cancelled) setOutcomes(loaded)
    })
    Promise.all([progressStore.getAttempts(), contentStore.getQuestions()]).then(
      ([attempts, questions]) => {
        if (!cancelled) setWeakTopics(weakTopicIds(attempts, questions))
      },
    )
    progressStore.getDiagnosticScore().then((score) => {
      if (!cancelled) setTier(tierFromDiagnosticScore(score))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const curriculumPlan = useMemo(() => getCurriculumPlan(tier), [tier])

  const schedule = useMemo(() => {
    if (!outcomes) return null
    const built = buildFullSchedule(curriculumPlan, outcomes, CURRICULUM_DEADLINE)
    return injectWeakTopics(built, weakTopics)
  }, [curriculumPlan, outcomes, weakTopics])

  return { schedule, outcomes, setOutcomes, tier, curriculumPlan }
}
