import { beforeEach, describe, expect, it, vi } from 'vitest'
import { localProgressStore } from '../../src/data-access/local/localProgressStore'
import { PROGRESS_CHANGED_EVENT } from '../../src/data-access/cloud/syncMeta'

// Sự kiện "ol6:progress-changed" là điểm móc nối duy nhất cho cả việc cập
// nhật số xu ở Layout.tsx lẫn việc kích hoạt đẩy dữ liệu lên cloud ở
// firebaseSync.ts (xem docs/adr/0005) — nếu một hàm ghi dữ liệu quên phát
// sự kiện này, tính năng đồng bộ sẽ âm thầm không hoạt động cho loại dữ
// liệu đó. Test này canh giữ hành vi đó.
describe('localProgressStore phát sự kiện progress-changed khi ghi dữ liệu', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('phát sự kiện khi ghi qua writeJson (ví dụ addCoins)', async () => {
    const handler = vi.fn()
    window.addEventListener(PROGRESS_CHANGED_EVENT, handler)
    await localProgressStore.addCoins(5)
    window.removeEventListener(PROGRESS_CHANGED_EVENT, handler)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('phát sự kiện khi setTopicStatus, setSessionOutcome, setDiagnosticStatus', async () => {
    for (const write of [
      () => localProgressStore.setTopicStatus('NP-01', 'mastered'),
      () => localProgressStore.setSessionOutcome('B01', 'great'),
      () => localProgressStore.setDiagnosticStatus('completed'),
    ]) {
      const handler = vi.fn()
      window.addEventListener(PROGRESS_CHANGED_EVENT, handler)
      await write()
      window.removeEventListener(PROGRESS_CHANGED_EVENT, handler)
      expect(handler).toHaveBeenCalledTimes(1)
    }
  })

  it('phát sự kiện khi importAll (khôi phục từ file hoặc từ cloud)', async () => {
    const backup = await localProgressStore.exportAll()
    const handler = vi.fn()
    window.addEventListener(PROGRESS_CHANGED_EVENT, handler)
    await localProgressStore.importAll(backup)
    window.removeEventListener(PROGRESS_CHANGED_EVENT, handler)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('addCoins không bao giờ để số xu âm', async () => {
    await localProgressStore.addCoins(3)
    await localProgressStore.addCoins(-100)
    expect(await localProgressStore.getCoins()).toBe(0)
  })

  it('setSessionOutcome ghi kèm completedAt (dùng để tự động đẩy lịch buổi sau)', async () => {
    const before = Date.now()
    await localProgressStore.setSessionOutcome('B01', 'great')
    const after = Date.now()
    const outcomes = await localProgressStore.getSessionOutcomes()
    expect(outcomes['B01'].outcome).toBe('great')
    const completedAtMs = new Date(outcomes['B01'].completedAt).getTime()
    expect(completedAtMs).toBeGreaterThanOrEqual(before)
    expect(completedAtMs).toBeLessThanOrEqual(after)
  })

  it('setSessionOutcome(id, undefined) xóa hẳn bản ghi khỏi getSessionOutcomes', async () => {
    await localProgressStore.setSessionOutcome('B01', 'ok')
    await localProgressStore.setSessionOutcome('B01', undefined)
    const outcomes = await localProgressStore.getSessionOutcomes()
    expect(outcomes['B01']).toBeUndefined()
  })
})
