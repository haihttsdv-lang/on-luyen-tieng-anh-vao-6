import { expect, test } from '@playwright/test'

test('hồ sơ: bỏ qua bài kiểm tra đầu vào, xem bản đồ năng lực và trang phụ huynh', async ({
  page,
}) => {
  await page.goto('/ho-so')
  await expect(page.getByText('Bạn chưa làm bài kiểm tra đầu vào')).toBeVisible()

  await page.getByRole('button', { name: 'Bỏ qua' }).click()
  await expect(page.getByText('Bạn chưa làm bài kiểm tra đầu vào')).not.toBeVisible()

  await expect(page.getByText('Bản đồ năng lực')).toBeVisible()
  await expect(page.getByText('Ngữ pháp')).toBeVisible()
  await expect(page.getByText('Từ vựng')).toBeVisible()
  await expect(page.getByText('Kỹ năng')).toBeVisible()

  await page.getByRole('link', { name: /Xem dành cho phụ huynh/ }).click()
  await expect(page.getByText('Tổng quan cho phụ huynh')).toBeVisible()
  await expect(page.getByText('Số buổi học tuần này')).toBeVisible()
})

test('gợi ý: sau khi luyện tập, trang chủ và Hồ sơ hiển thị gợi ý', async ({
  page,
}) => {
  await page.goto('/luyen-tap/dang-bai')
  await page.getByRole('button', { name: /Tìm và sửa lỗi sai/ }).click()

  // Trả lời 5 câu để có đủ dữ liệu (ngưỡng tối thiểu 3 lượt/chủ điểm).
  for (let i = 0; i < 5; i++) {
    await page.getByTestId('answer-options').locator('button').first().click()
    const next = page.getByRole('button', { name: 'Câu tiếp theo →' })
    if (await next.isVisible().catch(() => false)) {
      await next.click()
    } else {
      break
    }
  }

  await page.goto('/')
  await expect(page.getByText('🎯 Gợi ý hôm nay')).toBeVisible()

  await page.goto('/ho-so')
  await expect(page.getByText('🎯 Gợi ý cho bạn')).toBeVisible()
})
