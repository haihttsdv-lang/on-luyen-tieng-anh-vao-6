/**
 * Phần "nhẹ" của tính năng Đồng bộ nhiều thiết bị — không import SDK
 * Firebase, để mọi trang có thể kiểm tra trạng thái đồng bộ (đã cấu hình
 * chưa, đã bật chưa) mà không kéo theo ~500KB SDK vào bundle chính. SDK
 * Firebase thật sự (firebaseSync.ts) chỉ được `import()` động đúng lúc cần
 * (đã có mã đồng bộ lưu sẵn, hoặc người dùng bấm tạo/liên kết mã) — xem
 * docs/adr/0005. Áp dụng cho mọi chế độ build, kể cả bản đóng gói 1 file
 * HTML (chế độ "online") — nếu build đó không cấu hình biến
 * VITE_FIREBASE_*, `isCloudSyncAvailable()` trả về false và chunk Firebase
 * vẫn không được gọi tới trên thực tế (dù có mặt trong file).
 */

const SYNC_CODE_KEY = 'ol6.sync.code'
const DEVICE_ID_KEY = 'ol6.sync.deviceId'
const LAST_SYNCED_AT_KEY = 'ol6.sync.lastSyncedAt'
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // bỏ ký tự dễ nhầm 0/O, 1/I/L

export const PROGRESS_CHANGED_EVENT = 'ol6:progress-changed'
export const REMOTE_SYNC_APPLIED_EVENT = 'ol6:remote-sync-applied'

export type SyncStatus = 'idle' | 'connecting' | 'syncing' | 'synced' | 'error'

export function readFirebaseEnv(name: string): string | undefined {
  const env = import.meta.env as unknown as Record<string, string | undefined>
  return env[name] || undefined
}

export function isCloudSyncAvailable(): boolean {
  return Boolean(readFirebaseEnv('VITE_FIREBASE_API_KEY') && readFirebaseEnv('VITE_FIREBASE_PROJECT_ID'))
}

export function generateSyncCode(): string {
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return code
}

export function getSyncCode(): string | undefined {
  return localStorage.getItem(SYNC_CODE_KEY) ?? undefined
}

export function setSyncCode(code: string): void {
  localStorage.setItem(SYNC_CODE_KEY, code)
}

export function clearSyncCode(): void {
  localStorage.removeItem(SYNC_CODE_KEY)
  localStorage.removeItem(LAST_SYNCED_AT_KEY)
}

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

// Mốc thời gian (epoch ms) lần gần nhất thiết bị này đồng bộ thành công
// (đẩy lên hoặc nhận về) — dùng để so sánh với `updatedAt` trên cloud lúc mở
// ứng dụng, quyết định có cần kéo dữ liệu mới về hay không (xem
// firebaseSync.ts). Không dùng đồng hồ server chính xác tuyệt đối — chấp
// nhận sai lệch nhỏ do đồng hồ thiết bị, phù hợp quy mô 1–2 học sinh.
export function getLastSyncedAt(): number | undefined {
  const raw = localStorage.getItem(LAST_SYNCED_AT_KEY)
  return raw ? Number(raw) : undefined
}

export function setLastSyncedAt(epochMs: number): void {
  localStorage.setItem(LAST_SYNCED_AT_KEY, String(epochMs))
}
