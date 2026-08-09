import { expect, test } from '@playwright/test'

test('lộ trình học: xem lịch buổi học, mở cấu trúc buổi, và chấm kết quả để cộng xu', async ({
  page,
}) => {
  await page.goto('/lo-trinh-hoc')
  await expect(page.getByText('🗓️ Lộ trình học')).toBeVisible()
  await expect(page.getByText(/Thứ Ba\/Năm\/Bảy hàng tuần, kiểm tra tuần vào Chủ nhật/)).toBeVisible()
  // HA-02 sau đó cũng thêm "(0/N buổi)" ở mỗi tóm tắt giai đoạn — dùng regex
  // neo đầu/cuối để chỉ khớp đúng dòng tổng số buổi Ở HEADER (không có
  // ngoặc đơn bao quanh), tránh strict-mode violation vì khớp nhiều phần tử.
  await expect(page.getByText(/^0\/\d+ buổi$/)).toBeVisible()
  await expect(page.getByText('🧱 Giai đoạn 1 · Nền tảng')).toBeVisible()

  // Buổi đầu tiên (khai giảng) phải hiển thị trong nhóm mở sẵn.
  await expect(
    page.getByText('Buổi làm quen & kiểm tra đầu vào', { exact: true }),
  ).toBeVisible()

  // Mở cấu trúc buổi học (buổi khai giảng) để xem các hoạt động.
  await page.getByText(/Xem cấu trúc buổi học/).first().click()
  await expect(page.getByText(/Làm bài kiểm tra đầu vào/)).toBeVisible()
  await expect(page.getByText(/Bài tập về nhà/).first()).toBeVisible()

  // Chấm kết quả "Xuất sắc" cho buổi đầu tiên — thanh tiến độ và số xu ở
  // header phải cập nhật ngay (buổi khai giảng: xuất sắc = +10 xu).
  await page.getByRole('button', { name: /🌟 Xuất sắc/ }).first().click()
  await expect(page.getByText(/^1\/\d+ buổi$/)).toBeVisible()
  await expect(page.getByLabel('10 xu')).toBeVisible()

  // Bấm lại đúng kết quả đã chọn để bỏ chấm — xu phải bị trừ lại về 0 và
  // tiến độ giảm về 0.
  await page.getByRole('button', { name: /🌟 Xuất sắc/ }).first().click()
  await expect(page.getByText(/^0\/\d+ buổi$/)).toBeVisible()
})

test('lộ trình học: có bài kiểm tra tuần/tháng vào Chủ nhật', async ({ page }) => {
  await page.goto('/lo-trinh-hoc')
  await expect(page.getByText('🗓️ Lộ trình học')).toBeVisible()
  // Mở toàn bộ accordion giai đoạn (mặc định chỉ mở nhóm đầu tiên và nhóm
  // chứa buổi tiếp theo) để chắc chắn tìm thấy bài kiểm tra dù nó rơi vào
  // giai đoạn nào.
  await page.locator('details').evaluateAll((nodes) => {
    for (const node of nodes) (node as HTMLDetailsElement).open = true
  })
  await expect(page.getByText('Kiểm tra tuần').first()).toBeVisible()
})
