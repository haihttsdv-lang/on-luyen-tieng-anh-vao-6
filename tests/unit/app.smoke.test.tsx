import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../src/app/App'

describe('App', () => {
  it('renders the home page with main navigation', () => {
    render(<App />)

    expect(
      screen.getAllByText('Ôn luyện Tiếng Anh vào lớp 6')[0],
    ).toBeInTheDocument()

    // Từ UX-01, mỗi mục điều hướng xuất hiện ở HAI thanh: thanh ngang trên
    // header (hiện từ sm: trở lên) và thanh tab dưới cùng (chỉ trên điện
    // thoại) — nên phải khoanh vùng theo từng thanh khi tìm liên kết.
    const desktopNav = screen.getByRole('navigation', { name: 'Điều hướng chính' })
    expect(
      within(desktopNav).getByRole('link', { name: 'Học lý thuyết' }),
    ).toBeInTheDocument()
    expect(
      within(desktopNav).getByRole('link', { name: 'Luyện tập' }),
    ).toBeInTheDocument()

    const mobileNav = screen.getByRole('navigation', {
      name: 'Điều hướng chính (điện thoại)',
    })
    expect(
      within(mobileNav).getByRole('link', { name: 'Lý thuyết' }),
    ).toBeInTheDocument()
  })
})
