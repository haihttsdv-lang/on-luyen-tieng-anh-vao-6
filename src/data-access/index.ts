import { localContentStore } from './local/localContentStore'
import { localProgressStore } from './local/localProgressStore'

// Điểm truy cập duy nhất mà UI/modules được import. Hiện gắn implementation
// "local" (Phương án A). Nếu sau này chuyển sang Phương án B, chỉ cần đổi hai
// dòng dưới đây sang implementation "remote/" tương ứng (Mục 8.5).
export const contentStore = localContentStore
export const progressStore = localProgressStore
