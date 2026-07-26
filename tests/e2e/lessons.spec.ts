import { expect, test } from '@playwright/test'

test('học lý thuyết: xem bài học, làm quiz, và trạng thái được lưu lại', async ({
  page,
}) => {
  await page.goto('/hoc-ly-thuyet')
  await expect(page.getByText('Chưa học').first()).toBeVisible()

  await page.getByRole('link', { name: /Hiện tại đơn/ }).click()
  await expect(page.getByText('Lỗi thường gặp')).toBeVisible()

  await page.getByRole('link', { name: 'Làm quiz nhanh' }).click()
  await expect(page.getByText('Quiz nhanh')).toBeVisible()

  const submitButton = page.getByRole('button', { name: 'Nộp bài' })
  await expect(submitButton).toBeDisabled()

  const radioGroups = await page.locator('input[type=radio]').all()
  const answered = new Set<string>()
  for (const radio of radioGroups) {
    const name = await radio.getAttribute('name')
    if (name && !answered.has(name)) {
      await radio.check()
      answered.add(name)
    }
  }
  await expect(submitButton).toBeEnabled()
  await submitButton.click()

  await expect(page.getByText(/Bạn trả lời đúng/)).toBeVisible()

  await page.goto('/hoc-ly-thuyet')
  await expect(page.getByText(/^(Đang học|Đã nắm)$/)).toBeVisible()
})

test('flashcard: lật thẻ và đánh giá Đã thuộc/Chưa thuộc', async ({ page }) => {
  await page.goto('/hoc-ly-thuyet/tu-vung/TV-07')
  await expect(page.getByText('football')).toBeVisible()

  await page.getByRole('button', { name: /Bấm để lật thẻ/ }).click()
  await expect(page.getByText('bóng đá')).toBeVisible()

  await page.getByRole('button', { name: 'Đã thuộc' }).click()
  await expect(page.getByText('Thẻ 2/14')).toBeVisible()
})
