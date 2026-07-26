import { expect, test } from '@playwright/test'

test('trang chủ hiển thị tiêu đề và điều hướng chính', async ({ page }) => {
  await page.goto('/')

  const mainNav = page.getByRole('navigation', { name: 'Điều hướng chính' })

  await expect(page).toHaveTitle('Ôn luyện Tiếng Anh vào lớp 6')
  await expect(
    page.getByRole('heading', { name: 'Ôn luyện Tiếng Anh vào lớp 6' }),
  ).toBeVisible()
  await expect(mainNav.getByRole('link', { name: 'Luyện tập' })).toBeVisible()

  await mainNav.getByRole('link', { name: 'Hồ sơ' }).click()
  await expect(page.getByText('🏆 Hồ sơ')).toBeVisible()
  await expect(page.getByText('Bản đồ năng lực')).toBeVisible()

  await mainNav.getByRole('link', { name: 'Học lý thuyết' }).click()
  await expect(page.getByText('Hiện tại đơn (Present Simple)')).toBeVisible()
})
