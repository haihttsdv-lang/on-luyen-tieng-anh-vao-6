/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Chế độ "online": đóng gói toàn bộ ứng dụng vào 1 file HTML duy nhất
  // (dễ chia sẻ/mở trực tiếp) nhưng vẫn giữ đầy đủ tính năng cần mạng —
  // trước đây gọi là "offline" và cố tình loại bỏ SDK Firebase (Đồng bộ
  // nhiều thiết bị) ra khỏi bundle vì cho rằng file này chỉ dùng khi không
  // có Internet; đổi tên theo yêu cầu người dùng vì Đồng bộ nhiều thiết bị
  // cần mạng để hoạt động nên không còn lý do loại trừ — xem docs/adr/0005.
  const singleFile = mode === 'online'
  return {
    plugins: [react(), tailwindcss(), ...(singleFile ? [viteSingleFile()] : [])],
    build: singleFile
      ? {
          outDir: 'dist-online',
          assetsInlineLimit: Number.MAX_SAFE_INTEGER,
          cssCodeSplit: false,
        }
      : undefined,
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/unit/setup.ts'],
      include: ['tests/unit/**/*.test.{ts,tsx}'],
    },
  }
})
