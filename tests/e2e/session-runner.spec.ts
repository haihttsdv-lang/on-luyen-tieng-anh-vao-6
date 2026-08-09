import { expect, test } from '@playwright/test'

test('PP-01: "Vào học" chạy tuần tự từng khối, có đồng hồ, và ghi nhận hoàn thành', async ({
  page,
}) => {
  await page.goto('/lo-trinh-hoc')
  await page.getByRole('link', { name: '▶️ Vào học' }).first().click()

  await expect(page).toHaveURL(/\/lo-trinh-hoc\/.+\/hoc/)
  await expect(page.getByText('Khối 1/4')).toBeVisible()
  await expect(page.getByText(/^⏱ \d+:\d{2}$/)).toBeVisible()

  await page.getByRole('button', { name: '✓ Xong khối này' }).click()
  await expect(page.getByText('Khối 2/4')).toBeVisible()

  // Khối "Kiểm tra đầu vào" có action đưa thẳng tới trang làm bài.
  await expect(page.getByRole('link', { name: /Bắt đầu làm bài/ })).toBeVisible()
})

test('PP-01/PP-03: hoàn thành hết các khối không làm vỡ trang, và gợi ý chấm dựa trên dữ liệu thật', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))

  await page.goto('/lo-trinh-hoc')
  await page.getByRole('link', { name: '▶️ Vào học' }).first().click()

  // QUAN TRỌNG: `.click()` ở trên chỉ đợi sự kiện click được gửi đi, KHÔNG
  // đợi điều hướng sang SessionRunnerPage render xong (dữ liệu tiến độ khối
  // tải bất đồng bộ). Nếu vòng lặp bên dưới bắt đầu ngay, `doneButton.count()`
  // ở lượt đầu có thể đếm được 0 (trang chưa kịp render nút) và thoát vòng
  // lặp mà CHƯA BẤM GÌ CẢ — không phải lỗi ứng dụng, mà là chưa chờ điều
  // hướng xong trước khi thao tác (bug phát hiện khi làm bài test này, gây
  // flaky ~50%).
  await expect(page.getByText('Khối 1/4')).toBeVisible()

  // Bấm "Xong khối này" cho tới khi ra màn hình tổng kết — đây là đường đi
  // từng gây lỗi "Cannot read properties of undefined (reading 'label')" khi
  // currentIndex chạm blocks.length nhưng state `finished` (lưu riêng, lệch
  // nhịp 1 lượt render) chưa kịp cập nhật. Bấm cách nhau một khoảng nhỏ (mô
  // phỏng tốc độ thao tác thật — không ai bấm nhanh hơn cả một khung hình
  // render); bấm dồn dập tuyệt đối không nghỉ từng lộ ra một race riêng:
  // `onClick` đóng gói `currentIndex` tại thời điểm render, nên hai lần bấm
  // liên tiếp NHANH HƠN React kịp vẽ lại có thể cùng phân giải theo cùng một
  // closure cũ — đã sửa ở component bằng cách chuyển `markBlockDone` sang
  // state updater dạng hàm (đọc `prev` thay vì đóng gói sẵn), nhưng vẫn giữ
  // độ trễ nhỏ ở đây để bài test phản ánh đúng thao tác người dùng.
  for (let i = 0; i < 10; i++) {
    const doneButton = page.getByRole('button', { name: '✓ Xong khối này' })
    if (!(await doneButton.count())) break
    await doneButton.click()
    await page.waitForTimeout(200)
  }

  await expect(page.getByText('Hoàn thành buổi học!')).toBeVisible()
  expect(errors).toEqual([])

  // Chưa luyện tập câu nào trong buổi ⇒ không được tự chọn "Xuất sắc".
  await expect(page.getByRole('button', { name: /Xuất sắc/ })).toBeDisabled()
  await expect(page.getByText(/Gợi ý tự đánh giá/)).toBeVisible()

  await page.getByRole('button', { name: /Cần ôn lại/ }).click()
  await expect(page.getByRole('link', { name: /Xong — về Lộ trình học/ })).toBeVisible()

  // Tải lại đúng buổi đó — tiến độ khối phải được giữ (đã lưu qua
  // ProgressStore.setSessionBlockProgress), nên phải ra thẳng màn hình tổng
  // kết thay vì bắt học lại từ khối 1.
  await page.reload()
  await expect(page.getByText('Hoàn thành buổi học!')).toBeVisible()
})
