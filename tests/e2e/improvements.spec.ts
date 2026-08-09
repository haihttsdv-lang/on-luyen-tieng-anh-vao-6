import { expect, test } from '@playwright/test'

test('bài học: có sơ đồ trực quan, nút nghe ví dụ và điều hướng bài trước/sau', async ({
  page,
}) => {
  await page.goto('/hoc-ly-thuyet/NP-11')

  // MM-04
  await expect(page.getByRole('heading', { name: '🖼️ Sơ đồ trực quan' })).toBeVisible()
  await expect(page.getByText('Trục thời gian')).toBeVisible()
  await expect(page.getByText('Bảng chia động từ — Hiện tại đơn')).toBeVisible()

  // MM-02
  await expect(page.getByRole('button', { name: 'Nghe toàn bộ câu ví dụ' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Nghe câu ví dụ 1' })).toBeVisible()

  // UX-06
  const lessonNav = page.getByRole('navigation', { name: 'Điều hướng bài học' })
  await expect(lessonNav.getByText('Bài trước')).toBeVisible()
  await lessonNav.getByText('Bài sau').click()
  await expect(page).toHaveURL(/\/hoc-ly-thuyet\/NP-/)
})

test('quiz cuối bài nói rõ cần đúng bao nhiêu câu (ND-01)', async ({ page }) => {
  await page.goto('/hoc-ly-thuyet/NP-11/quiz')
  await expect(page.getByText(/cần đúng ít nhất \d+ câu/i)).toBeVisible()
})

test('luyện tập: có thanh tiến trình và nút thoát có xác nhận (UX-03/04)', async ({
  page,
}) => {
  await page.goto('/luyen-tap/dang-bai')
  await page.getByRole('button', { name: /Đọc và điền từ/ }).click()

  await expect(page.getByRole('progressbar')).toBeVisible()

  await page.getByRole('button', { name: '✕ Thoát' }).click()
  await expect(page.getByText('Thoát khi đang làm dở?')).toBeVisible()
  await page.getByRole('button', { name: 'Học tiếp' }).click()
  await expect(page.getByText('Thoát khi đang làm dở?')).toBeHidden()
})

test('đề viết đoạn: bài mẫu chỉ mở sau khi học sinh viết đủ (ND-06)', async ({
  page,
}) => {
  await page.goto('/luyen-tap/viet/WP-01')

  const revealButton = page.getByRole('button', {
    name: 'Tôi đã viết xong — xem bài mẫu',
  })
  await expect(revealButton).toBeDisabled()

  await page
    .getByPlaceholder('Viết đoạn văn của em vào đây...')
    .fill(
      'My favorite sport is badminton and I play it with my brother every Saturday afternoon in the park near my house because it is fun.',
    )
  await expect(revealButton).toBeEnabled()
  await revealButton.click()
  await expect(page.getByText('Bài mẫu tham khảo (')).toBeVisible()
})

test('bài đọc: có nút nghe + đọc chậm và nhãn độ khó (MM-03, ND-05)', async ({
  page,
}) => {
  await page.goto('/luyen-tap/dang-bai')
  await page.getByRole('button', { name: /Đọc hiểu văn bản dài/ }).click()

  await expect(page.getByRole('button', { name: 'Nghe bài đọc' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Đọc chậm' })).toBeVisible()
  await expect(page.getByText(/^(Cơ bản|Nâng cao)$/)).toBeVisible()
})

test('desktop: đoạn văn đọc hiểu nằm bên TRÁI câu hỏi, không phải bên trên (UX-02)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/luyen-tap/dang-bai')
  await page.getByRole('button', { name: /Đọc hiểu văn bản dài/ }).click()

  const passageBox = await page
    .getByRole('button', { name: 'Nghe bài đọc' })
    .evaluate((el) => el.closest('div.rounded-xl')!.getBoundingClientRect().toJSON())
  const optionsBox = await page
    .getByTestId('answer-options')
    .evaluate((el) => el.getBoundingClientRect().toJSON())

  // Hai cột thật sự: mép phải đoạn văn phải nằm trước mép trái vùng đáp án.
  expect(passageBox.right).toBeLessThanOrEqual(optionsBox.left)
})

test('mobile: đoạn văn vẫn xếp trên câu hỏi (UX-02 không phá bố cục hẹp)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/luyen-tap/dang-bai')
  await page.getByRole('button', { name: /Đọc hiểu văn bản dài/ }).click()

  const passageBox = await page
    .getByRole('button', { name: 'Nghe bài đọc' })
    .evaluate((el) => el.closest('div.rounded-xl')!.getBoundingClientRect().toJSON())
  const optionsBox = await page
    .getByTestId('answer-options')
    .evaluate((el) => el.getBoundingClientRect().toJSON())

  expect(passageBox.bottom).toBeLessThanOrEqual(optionsBox.top)
})

test('flashcard có nút ghi âm để tự luyện phát âm (MM-07)', async ({ page }) => {
  await page.goto('/hoc-ly-thuyet/tu-vung/TV-05')
  await expect(page.getByRole('button', { name: /Ghi âm phát âm từ/ })).toBeVisible()
})

test('đề thi thử Cầu Giấy có câu đồng/trái nghĩa KN-09 (ND-03)', async ({ page }) => {
  await page.goto('/thi-thu')
  await page.getByRole('button', { name: /Giống đề THCS Cầu Giấy/ }).click()

  // 4/40 câu là dạng đồng/trái nghĩa — duyệt hết đề để chắc chắn có xuất hiện.
  let found = false
  for (let i = 0; i < 40; i++) {
    if (await page.getByText(/CLOSEST in meaning|OPPOSITE in meaning/).count()) {
      found = true
      break
    }
    await page.getByTestId('answer-options').getByRole('button').first().click()
    const next = page.getByRole('button', { name: 'Câu tiếp theo →' })
    if (!(await next.count())) break
    await next.click()
  }
  expect(found).toBe(true)
})
