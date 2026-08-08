import { expect, test } from '@playwright/test'

test('tự tạo đề: chọn chủ điểm thủ công, đề vẫn đủ 40 câu đúng format Cầu Giấy', async ({
  page,
}) => {
  await page.goto('/thi-thu')
  await page.getByRole('link', { name: /Tự tạo đề/ }).click()
  await expect(page.getByText('🎯 Tự tạo đề')).toBeVisible()

  await page.getByText('NP-13').click()
  await page.getByText('TV-07').click()

  await page.getByRole('button', { name: /Tạo đề \(2 chủ điểm/ }).click()
  await expect(page.getByText('Câu 1/40')).toBeVisible()
})

test('tự tạo đề: chọn ngẫu nhiên chủ điểm rồi tạo đề', async ({ page }) => {
  await page.goto('/thi-thu/tu-tao-de')
  await page.getByRole('button', { name: '🎲 Chọn ngẫu nhiên chủ điểm' }).click()

  // Nút "Tạo đề" hiện số chủ điểm > 0 sau khi chọn ngẫu nhiên.
  const generateButton = page.getByRole('button', { name: /Tạo đề \(\d+ chủ điểm/ })
  await expect(generateButton).toBeEnabled()
  await generateButton.click()
  await expect(page.getByText('Câu 1/40')).toBeVisible()
})
