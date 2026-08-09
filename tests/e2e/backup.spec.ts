import { expect, test } from '@playwright/test'

test('sao lưu: tải file JSON tiến độ từ trang Hồ sơ', async ({ page }) => {
  await page.goto('/ho-so')
  await page.getByRole('button', { name: 'Bỏ qua' }).click()
  await expect(page.getByText('💾 Sao lưu & khôi phục')).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Tải file sao lưu' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/on-luyen-tieng-anh-tien-do-.*\.json/)
})

test('đồng bộ nhiều thiết bị: hiện hướng dẫn khi chưa cấu hình Firebase', async ({ page }) => {
  await page.goto('/ho-so')
  await page.getByRole('button', { name: 'Bỏ qua' }).click()
  await expect(page.getByText('☁️ Đồng bộ nhiều thiết bị')).toBeVisible()
  // Môi trường e2e không set biến VITE_FIREBASE_*, nên phải thấy hướng dẫn
  // cấu hình thay vì các nút Tạo mã/Liên kết.
  await expect(page.getByText(/Chưa cấu hình/)).toBeVisible()
  await expect(page.getByRole('button', { name: /Tạo mã mới/ })).toHaveCount(0)
})
