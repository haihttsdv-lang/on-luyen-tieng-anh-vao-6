import { expect, test } from '@playwright/test'

test('trang chủ hiển thị buổi học hôm nay và điều hướng chính', async ({ page }) => {
  await page.goto('/')

  // exact: true để không khớp nhầm sang thanh tab "Điều hướng chính (điện thoại)".
  const mainNav = page.getByRole('navigation', {
    name: 'Điều hướng chính',
    exact: true,
  })

  await expect(page).toHaveTitle('Ôn luyện Tiếng Anh vào lớp 6')
  // UX-05: hero tĩnh đã được thay bằng thẻ "Buổi học hôm nay" lấy từ Lộ trình học.
  await expect(page.getByText('Buổi học hôm nay')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Bắt đầu buổi học' }),
  ).toBeVisible()
  await expect(mainNav.getByRole('link', { name: 'Luyện tập' })).toBeVisible()

  await mainNav.getByRole('link', { name: 'Hồ sơ' }).click()
  await expect(page.getByText('🏆 Hồ sơ')).toBeVisible()
  await expect(page.getByText('Bản đồ năng lực')).toBeVisible()

  await mainNav.getByRole('link', { name: 'Học lý thuyết' }).click()
  await expect(page.getByText('Hiện tại đơn (Present Simple)')).toBeVisible()
})

test('thanh tab dưới cùng thay thanh ngang trên màn hình điện thoại (UX-01)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const desktopNav = page.getByRole('navigation', {
    name: 'Điều hướng chính',
    exact: true,
  })
  const mobileNav = page.getByRole('navigation', {
    name: 'Điều hướng chính (điện thoại)',
  })

  await expect(mobileNav).toBeVisible()
  await expect(desktopNav.getByRole('link', { name: 'Luyện tập' })).toBeHidden()

  await mobileNav.getByRole('link', { name: 'Lý thuyết' }).click()
  await expect(page.getByText('Hiện tại đơn (Present Simple)')).toBeVisible()
})
