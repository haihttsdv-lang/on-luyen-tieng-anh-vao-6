import { expect, test } from '@playwright/test'

test('sơ đồ tư duy: xem đủ các nhóm chủ điểm và điều hướng tới bài học', async ({
  page,
}) => {
  await page.goto('/hoc-ly-thuyet')
  await page.getByRole('link', { name: /Sơ đồ tư duy/ }).click()
  await expect(page.getByText('🧠 Sơ đồ tư duy')).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Nhóm A' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Nhóm F' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Từ vựng', exact: true })).toBeVisible()

  // Bấm vào một chủ điểm mới bổ sung (NP-32) phải mở đúng bài học.
  await page.getByRole('link', { name: 'NP-32', exact: true }).click()
  await expect(page.getByText('Câu tồn tại: There is/There are')).toBeVisible()
})
