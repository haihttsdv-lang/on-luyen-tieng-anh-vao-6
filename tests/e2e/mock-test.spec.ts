import { expect, test } from '@playwright/test'

test('thi thử: chọn đề 20 câu, làm bài, nộp bài, xem kết quả', async ({
  page,
}) => {
  await page.goto('/thi-thu')
  await expect(page.getByText('⏱️ Thi thử')).toBeVisible()

  await page.getByRole('button', { name: '20 câu / 20 phút' }).click()
  await expect(page.getByText('Câu 1/20')).toBeVisible()

  // Trả lời tất cả 20 câu bằng cách luôn chọn phương án đầu tiên.
  for (let i = 1; i <= 20; i++) {
    await page
      .getByTestId('answer-options')
      .locator('button')
      .first()
      .click()
    const nextLabel = i < 20 ? 'Câu tiếp theo →' : 'Nộp bài'
    await page.getByRole('button', { name: nextLabel, exact: true }).click()
  }

  await expect(page.getByText(/Điểm: \d+\/20/)).toBeVisible()
  await expect(page.getByText('📊 Điểm theo dạng bài')).toBeVisible()
  await expect(page.getByText('🧩 Điểm theo chủ điểm')).toBeVisible()
  await expect(page.getByText('📝 Xem lại từng câu')).toBeVisible()
})

test('thi thử: chế độ Giống đề Cầu Giấy sinh đúng 40 câu', async ({
  page,
}) => {
  await page.goto('/thi-thu')
  await page
    .getByRole('button', { name: /Giống đề THCS Cầu Giấy/ })
    .click()
  await expect(page.getByText('Câu 1/40')).toBeVisible()
})
