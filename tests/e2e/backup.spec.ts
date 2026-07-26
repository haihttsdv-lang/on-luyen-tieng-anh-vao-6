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
