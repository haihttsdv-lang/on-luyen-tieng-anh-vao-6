import { expect, test } from '@playwright/test'

test('LT-01: buổi "Học kỹ năng" dạy chiến thuật rồi luyện đúng dạng bài đó', async ({
  page,
}) => {
  await page.goto('/lo-trinh-hoc')
  await page.getByText('🧱 Giai đoạn 1 · Nền tảng').click()

  const card = page.getByText(/Ngữ âm 1:/).locator('xpath=ancestor::li[1]')
  await expect(card.getByText('Học kỹ năng')).toBeVisible()

  await card.getByText(/Xem cấu trúc buổi học/).click()
  await expect(card.getByText('Học chiến thuật làm bài')).toBeVisible()
  // Nội dung chiến thuật có cú pháp **in đậm** phải được render thành
  // <strong>, không hiện dấu sao thô.
  await expect(card.locator('strong', { hasText: 'Đuôi -s/-es' })).toBeVisible()
  await expect(card.getByText(/\*\*/)).toHaveCount(0)

  // Khối luyện tập trỏ thẳng vào đúng dạng bài Ngữ âm (KN-08), không phải
  // trang chọn dạng bài chung chung.
  await card.getByRole('link', { name: /Luyện đúng dạng bài này/ }).first().click()
  await expect(page).toHaveURL(/skill=KN-08/)
  await expect(page.getByText('🔊 Ngữ âm: trọng âm & phát âm')).toBeVisible()
})

test('AT-01/AT-02: khối Khởi động trong Session Runner có từ nghe được ngay tại chỗ', async ({
  page,
}) => {
  // Buổi ngữ pháp: khởi động hiện thẻ từ vựng của chủ đề đang ôn.
  await page.goto('/lo-trinh-hoc')
  await page.getByText('🧱 Giai đoạn 1 · Nền tảng').click()
  const grammarCard = page
    .getByText('Danh từ số ít/số nhiều, đếm được/không đếm được', { exact: true })
    .locator('xpath=ancestor::li[1]')
  await grammarCard.getByRole('link', { name: '▶️ Vào học' }).click()
  await expect(page.getByText('🔊 Nghe thử ngay')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Nghe tất cả từ ở khối khởi động' })).toBeVisible()

  // Buổi Ngữ âm: khởi động hiện từ ví dụ thật lấy từ ngân hàng câu hỏi KN-08.
  await page.goto('/lo-trinh-hoc')
  await page.getByText('🧱 Giai đoạn 1 · Nền tảng').click()
  const phoneticsCard = page.getByText(/Ngữ âm 1:/).locator('xpath=ancestor::li[1]')
  await phoneticsCard.getByRole('link', { name: '▶️ Vào học' }).click()
  await expect(page.getByText('🔊 Nghe thử ngay')).toBeVisible()
  // Mỗi từ có nút nghe riêng gắn aria-label "Nghe từ <word>" — kiểm tra qua
  // đó thay vì getByText(exact) vì chữ "cat" nằm chung một <span> với nút
  // 🔊 lồng bên trong, không phải một phần tử lá riêng biệt.
  await expect(page.getByRole('button', { name: 'Nghe từ cat' })).toBeVisible()
})

test('LT-01: buổi Viết đoạn văn (KN-07) đưa thẳng tới trang Viết đoạn văn, không phải luyện dạng bài trắc nghiệm', async ({
  page,
}) => {
  await page.goto('/lo-trinh-hoc')
  await page.getByText('🎯 Giai đoạn 3 · Luyện đề tăng tốc').click()

  const card = page.getByText(/Viết đoạn văn: Dàn ý 3 phần/).locator('xpath=ancestor::li[1]')
  // Nút "chốt" nằm ngoài phần cấu trúc buổi học (quickLinksFor), nhãn không
  // có chữ "ngay" — khác 2 nút hành động của khối bên trong (label "...ngay").
  await card.getByRole('link', { name: '✍️ Viết đoạn văn', exact: true }).click()
  await expect(page).toHaveURL('/luyen-tap/viet')
  await expect(page.getByRole('heading', { name: '✍️ Viết đoạn văn' })).toBeVisible()
})
