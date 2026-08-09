import { beforeEach, describe, expect, it } from 'vitest'
import {
  PROGRESS_CHANGED_EVENT,
  REMOTE_SYNC_APPLIED_EVENT,
  clearSyncCode,
  generateSyncCode,
  getDeviceId,
  getLastSyncedAt,
  getSyncCode,
  isCloudSyncAvailable,
  setLastSyncedAt,
  setSyncCode,
} from '../../src/data-access/cloud/syncMeta'

describe('Đồng bộ nhiều thiết bị — phần logic thuần (syncMeta.ts)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('isCloudSyncAvailable() trả về false khi chưa cấu hình biến môi trường Firebase', () => {
    // Môi trường test không set VITE_FIREBASE_*, đúng tình huống mặc định
    // của người dùng chưa làm theo hướng dẫn README.
    expect(isCloudSyncAvailable()).toBe(false)
  })

  it('generateSyncCode() sinh mã 8 ký tự, chỉ gồm chữ/số dễ đọc (không lẫn 0/O/1/I/L)', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateSyncCode()
      expect(code).toHaveLength(8)
      expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/)
    }
  })

  it('generateSyncCode() gần như không trùng nhau giữa các lần gọi', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateSyncCode()))
    // Không gian mã đủ lớn (32^8) nên 100 lần sinh gần như chắc chắn không trùng.
    expect(codes.size).toBe(100)
  })

  it('setSyncCode/getSyncCode/clearSyncCode hoạt động đúng qua localStorage', () => {
    expect(getSyncCode()).toBeUndefined()
    setSyncCode('ABCD1234')
    expect(getSyncCode()).toBe('ABCD1234')
    clearSyncCode()
    expect(getSyncCode()).toBeUndefined()
  })

  it('getLastSyncedAt/setLastSyncedAt lưu và đọc đúng mốc thời gian', () => {
    expect(getLastSyncedAt()).toBeUndefined()
    setLastSyncedAt(1_700_000_000_000)
    expect(getLastSyncedAt()).toBe(1_700_000_000_000)
  })

  it('clearSyncCode() cũng xóa luôn lastSyncedAt (tránh dùng mốc cũ khi liên kết mã mới)', () => {
    setSyncCode('ABCD1234')
    setLastSyncedAt(1_700_000_000_000)
    clearSyncCode()
    expect(getSyncCode()).toBeUndefined()
    expect(getLastSyncedAt()).toBeUndefined()
  })

  it('getDeviceId() trả về cùng 1 id ổn định qua nhiều lần gọi (không sinh mới mỗi lần)', () => {
    const first = getDeviceId()
    const second = getDeviceId()
    expect(first).toBe(second)
    expect(first.length).toBeGreaterThan(0)
  })

  it('tên sự kiện đồng bộ là hằng số cố định (Layout.tsx và firebaseSync.ts phải khớp nhau)', () => {
    expect(PROGRESS_CHANGED_EVENT).toBe('ol6:progress-changed')
    expect(REMOTE_SYNC_APPLIED_EVENT).toBe('ol6:remote-sync-applied')
  })
})
