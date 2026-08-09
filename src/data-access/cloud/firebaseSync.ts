import { type FirebaseApp, initializeApp } from 'firebase/app'
import { type Auth, getAuth, signInAnonymously } from 'firebase/auth'
import {
  type Firestore,
  type Timestamp,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { progressStore } from '../index'
import {
  REMOTE_SYNC_APPLIED_EVENT,
  type SyncStatus,
  clearSyncCode,
  getDeviceId,
  getLastSyncedAt,
  getSyncCode,
  readFirebaseEnv,
  setLastSyncedAt,
  setSyncCode,
} from './syncMeta'

/**
 * Phần "nặng" (import SDK Firebase) của tính năng Đồng bộ nhiều thiết bị —
 * chỉ được tải khi thật sự cần (xem cách gọi `import()` động ở Layout.tsx
 * và CloudSyncSection.tsx), không nằm trong bundle chính. Xem tổng quan cơ
 * chế và lý do thiết kế ở docs/adr/0005 và phần đầu file syncMeta.ts.
 *
 * Chiến lược đồng bộ: **lúc mở ứng dụng và lúc rời ứng dụng** — KHÔNG lắng
 * nghe realtime liên tục và KHÔNG tự đẩy dữ liệu lên sau mỗi thay đổi nhỏ
 * (đã đổi từ thiết kế ban đầu theo yêu cầu người dùng, xem docs/adr/0005):
 *   - Mở ứng dụng: kéo dữ liệu cloud về nếu mới hơn dữ liệu đã đồng bộ gần
 *     nhất trên máy này; nếu không có gì mới hơn, đẩy dữ liệu hiện tại lên
 *     (bù cho các thay đổi từ phiên làm việc trước chưa kịp đẩy lên).
 *   - Rời ứng dụng (chuyển tab/đóng tab — bắt qua sự kiện `visibilitychange`
 *     và `pagehide`): đẩy dữ liệu hiện tại lên cloud một lần.
 *   - Có thể bấm "Đồng bộ ngay" bất cứ lúc nào để đồng bộ thủ công ngay lập
 *     tức, không cần đợi rời ứng dụng.
 */

const COLLECTION = 'progress_sync'

const firebaseConfig = {
  apiKey: readFirebaseEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readFirebaseEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readFirebaseEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readFirebaseEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readFirebaseEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readFirebaseEnv('VITE_FIREBASE_APP_ID'),
}

let firebaseApp: FirebaseApp | undefined
let firestore: Firestore | undefined
let firebaseAuth: Auth | undefined

function ensureFirebase(): { db: Firestore; auth: Auth } {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig)
    firestore = getFirestore(firebaseApp)
    firebaseAuth = getAuth(firebaseApp)
  }
  return { db: firestore!, auth: firebaseAuth! }
}

interface SyncDoc {
  data: string
  updatedAt?: Timestamp
  updatedBy: string
}

/** Kéo dữ liệu cloud về nếu mới hơn lần đồng bộ gần nhất. Trả về true nếu đã áp dụng. */
async function pullIfNewer(code: string): Promise<boolean> {
  const { db } = ensureFirebase()
  const snapshot = await getDoc(doc(db, COLLECTION, code))
  const remote = snapshot.data() as SyncDoc | undefined
  if (!remote) return false
  if (remote.updatedBy === getDeviceId()) return false

  const remoteMs = remote.updatedAt?.toMillis() ?? 0
  const lastSyncedMs = getLastSyncedAt() ?? 0
  if (remoteMs <= lastSyncedMs) return false

  await progressStore.importAll(remote.data)
  setLastSyncedAt(remoteMs)
  return true
}

async function pushNow(code: string): Promise<void> {
  const { db } = ensureFirebase()
  const json = await progressStore.exportAll()
  await setDoc(doc(db, COLLECTION, code), {
    data: json,
    updatedAt: serverTimestamp(),
    updatedBy: getDeviceId(),
  })
  setLastSyncedAt(Date.now())
}

let statusCallback: ((status: SyncStatus) => void) | undefined
let currentCode: string | undefined

function handleVisibilityChange(): void {
  if (document.visibilityState === 'hidden' && currentCode) {
    pushNow(currentCode).catch(() => {})
  }
}

function handlePageHide(): void {
  if (currentCode) pushNow(currentCode).catch(() => {})
}

/**
 * Bật đồng bộ với `code` — gọi 1 lần khi mở ứng dụng (mã mới tạo, mã vừa
 * liên kết, hoặc mã đã lưu từ trước). Đồng bộ ngay 1 lần (kéo về nếu có gì
 * mới hơn, ngược lại đẩy lên), rồi đăng ký lắng nghe lúc rời ứng dụng để
 * đẩy dữ liệu lên — không lắng nghe realtime liên tục trong lúc dùng.
 */
export async function initAutoSync(
  code: string,
  onStatus?: (status: SyncStatus) => void,
): Promise<void> {
  statusCallback = onStatus
  setSyncCode(code)
  currentCode = code

  const { auth } = ensureFirebase()
  statusCallback?.('connecting')
  await signInAnonymously(auth)

  statusCallback?.('syncing')
  try {
    const applied = await pullIfNewer(code)
    if (applied) {
      window.dispatchEvent(new CustomEvent(REMOTE_SYNC_APPLIED_EVENT))
    } else {
      await pushNow(code)
    }
    statusCallback?.('synced')
  } catch {
    statusCallback?.('error')
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('pagehide', handlePageHide)
}

/** Đồng bộ thủ công ngay lập tức (nút "Đồng bộ ngay"). */
export async function syncNow(onStatus?: (status: SyncStatus) => void): Promise<void> {
  const code = getSyncCode()
  if (!code) return
  if (onStatus) statusCallback = onStatus
  const { auth } = ensureFirebase()
  statusCallback?.('syncing')
  try {
    await signInAnonymously(auth)
    const applied = await pullIfNewer(code)
    if (applied) window.dispatchEvent(new CustomEvent(REMOTE_SYNC_APPLIED_EVENT))
    await pushNow(code)
    statusCallback?.('synced')
  } catch {
    statusCallback?.('error')
  }
}

export function disableSync(): void {
  clearSyncCode()
  currentCode = undefined
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('pagehide', handlePageHide)
}
