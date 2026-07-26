import type {
  Attempt,
  BoxLevel,
  DiagnosticStatus,
  LearnerProfile,
  MockTestResult,
  TopicStatus,
} from '../../types/domain'
import type { ProgressStore } from '../types'

// Implementation ProgressStore cho Phương án A: lưu trong localStorage của
// trình duyệt (Mục 8.2). Namespacing "ol6.*" để tránh đụng key của trang khác
// trên cùng origin, và để dễ nhận diện khi debug qua DevTools.
const KEYS = {
  profile: 'ol6.progress.profile',
  attempts: 'ol6.progress.attempts',
  vocabBoxLevels: 'ol6.progress.vocabBoxLevels',
  topicStatuses: 'ol6.progress.topicStatuses',
  diagnosticStatus: 'ol6.progress.diagnosticStatus',
  coins: 'ol6.progress.coins',
  mockTestResults: 'ol6.progress.mockTestResults',
} as const

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const localProgressStore: ProgressStore = {
  async getProfile() {
    return readJson<LearnerProfile | undefined>(KEYS.profile, undefined)
  },
  async saveProfile(profile) {
    writeJson(KEYS.profile, profile)
  },

  async addAttempt(attempt) {
    const attempts = readJson<Attempt[]>(KEYS.attempts, [])
    attempts.push(attempt)
    writeJson(KEYS.attempts, attempts)
  },
  async getAttempts() {
    return readJson<Attempt[]>(KEYS.attempts, [])
  },

  async getVocabBoxLevel(cardId) {
    const levels = readJson<Record<string, BoxLevel>>(KEYS.vocabBoxLevels, {})
    return levels[cardId]
  },
  async setVocabBoxLevel(cardId, boxLevel) {
    const levels = readJson<Record<string, BoxLevel>>(KEYS.vocabBoxLevels, {})
    levels[cardId] = boxLevel
    writeJson(KEYS.vocabBoxLevels, levels)
  },

  async getTopicStatuses() {
    return readJson<Record<string, TopicStatus>>(KEYS.topicStatuses, {})
  },
  async setTopicStatus(topicId, status) {
    const statuses = readJson<Record<string, TopicStatus>>(
      KEYS.topicStatuses,
      {},
    )
    statuses[topicId] = status
    writeJson(KEYS.topicStatuses, statuses)
  },

  async getDiagnosticStatus() {
    return readJson<DiagnosticStatus | undefined>(KEYS.diagnosticStatus, undefined)
  },
  async setDiagnosticStatus(status) {
    writeJson(KEYS.diagnosticStatus, status)
  },

  async getCoins() {
    return readJson<number>(KEYS.coins, 0)
  },
  async addCoins(amount) {
    const total = readJson<number>(KEYS.coins, 0)
    writeJson(KEYS.coins, total + amount)
  },

  async addMockTestResult(result) {
    const results = readJson<MockTestResult[]>(KEYS.mockTestResults, [])
    results.push(result)
    writeJson(KEYS.mockTestResults, results)
  },
  async getMockTestResults() {
    return readJson<MockTestResult[]>(KEYS.mockTestResults, [])
  },

  async exportAll() {
    const data: Record<string, unknown> = {}
    for (const key of Object.values(KEYS)) {
      const raw = localStorage.getItem(key)
      if (raw !== null) data[key] = JSON.parse(raw)
    }
    return JSON.stringify(
      { app: 'on-luyen-tieng-anh-vao-6', version: 1, exportedAt: new Date().toISOString(), data },
      null,
      2,
    )
  },
  async importAll(json) {
    let parsed: { data?: Record<string, unknown> }
    try {
      parsed = JSON.parse(json)
    } catch {
      throw new Error('File không đúng định dạng JSON.')
    }
    if (!parsed || typeof parsed.data !== 'object' || parsed.data === null) {
      throw new Error('File sao lưu không hợp lệ.')
    }
    const validKeys = new Set<string>(Object.values(KEYS))
    for (const [key, value] of Object.entries(parsed.data)) {
      if (validKeys.has(key)) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    }
  },
}
