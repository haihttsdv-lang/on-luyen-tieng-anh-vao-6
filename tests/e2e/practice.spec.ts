import { expect, test } from '@playwright/test'

test('luyện theo dạng bài: chọn dạng bài, trả lời, xem kết quả', async ({
  page,
}) => {
  await page.goto('/luyen-tap')
  await expect(page.getByRole('heading', { name: '🎯 Luyện tập' })).toBeVisible()

  await page.getByRole('link', { name: 'Luyện theo dạng bài' }).click()
  await page.getByRole('button', { name: /Tìm và sửa lỗi sai/ }).click()

  await expect(page.getByText('Câu 1/')).toBeVisible()
  const firstOption = page.locator('button', { hasText: /^./ }).nth(0)
  await firstOption.click()
  await expect(page.getByText('Câu tiếp theo')).toBeVisible()
})

test('luyện theo chủ điểm: chọn chủ điểm và bắt đầu', async ({ page }) => {
  await page.goto('/luyen-tap/chu-diem')
  await page.getByText('NP-13').click()
  await page.getByRole('button', { name: /Bắt đầu luyện/ }).click()
  await expect(page.getByText('Câu 1/')).toBeVisible()
})

test('viết đoạn văn: chọn đề, gõ bài, đếm từ cập nhật', async ({ page }) => {
  await page.goto('/luyen-tap/viet')
  await page.getByRole('link', { name: 'My Favorite Sport' }).click()
  await expect(page.getByText('Gợi ý dàn ý')).toBeVisible()

  await page.getByPlaceholder('Viết đoạn văn của em vào đây...').fill(
    'I like football very much because it is fun and exciting to play with my friends after school every day.',
  )
  await expect(page.getByText(/\d+ từ \(mục tiêu 50–70 từ\)/)).toBeVisible()
})

test('trò chơi đua tốc độ: bắt đầu và trả lời được câu hỏi', async ({
  page,
}) => {
  await page.goto('/luyen-tap/tro-choi/toc-do')
  await page.getByRole('button', { name: 'Bắt đầu!' }).click()

  await expect(page.getByText(/⏱️ \d+s/)).toBeVisible()
  const firstOption = page.locator('button', { hasText: /^./ }).nth(0)
  await firstOption.click()
  await expect(page.getByText('Câu tiếp theo')).toBeVisible()
})

test('trò chơi săn kho báu: bắt đầu và thấy số mạng', async ({ page }) => {
  await page.goto('/luyen-tap/tro-choi/kho-bau')
  await page.getByRole('button', { name: 'Bắt đầu!' }).click()

  await expect(page.getByText('Câu 1/')).toBeVisible()
  await expect(page.getByText('❤️❤️❤️')).toBeVisible()
})
