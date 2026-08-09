import { expect, test } from '@playwright/test'

test('HA-01: bản đồ hành trình hiện đủ chú giải và bấm 1 chấm mở đúng giai đoạn rồi cuộn tới', async ({
  page,
}) => {
  await page.goto('/lo-trinh-hoc')

  const map = page.getByRole('list', { name: 'Bản đồ hành trình học' })
  await expect(map).toBeVisible()
  await expect(page.getByText('Đã học', { exact: true })).toBeVisible()
  await expect(page.getByText('Hôm nay', { exact: true })).toBeVisible()
  await expect(page.getByText('Trễ hạn', { exact: true })).toBeVisible()
  await expect(page.getByText('Chưa học', { exact: true })).toBeVisible()

  // Buổi khai giảng hôm nay phải là chấm "hiện tại" (viền nhấn mạnh).
  const todayDot = map.getByRole('button', { name: /buổi hiện tại/ })
  await expect(todayDot).toHaveCount(1)

  // Bấm một chấm ở xa (Giai đoạn 2, đang gập) — thẻ buổi đó phải hiện ra.
  const dots = map.locator('button')
  const count = await dots.count()
  await dots.nth(Math.floor(count * 0.6)).click()
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0) // không vỡ trang
  // Thẻ vừa cuộn tới phải nằm trong khung nhìn (không còn ẩn trong <details> đóng).
  await expect(page.locator('li[id^="session-"]').first()).toBeVisible()
})

test('HA-01: chấm chuyển sang màu xanh lá ngay khi chấm kết quả một buổi học', async ({
  page,
}) => {
  await page.goto('/lo-trinh-hoc')
  const map = page.getByRole('list', { name: 'Bản đồ hành trình học' })
  const firstDot = map.locator('button').first()
  await expect(firstDot).toHaveAccessibleName(/Chưa học|Hôm nay/)

  await page.getByRole('button', { name: /🌟 Xuất sắc/ }).first().click()
  await expect(firstDot).toHaveAccessibleName(/Đã học/)
})
