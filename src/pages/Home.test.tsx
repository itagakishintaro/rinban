import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'

test('キャッチコピーが表示される', () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { name: '輪番をかんたんに管理' })).toBeInTheDocument()
})
