import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../src/app/App'

describe('App', () => {
  it('renders the home page with main navigation', () => {
    render(<App />)

    expect(
      screen.getAllByText('Ôn luyện Tiếng Anh vào lớp 6')[0],
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Học lý thuyết' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Luyện tập' })).toBeInTheDocument()
  })
})
