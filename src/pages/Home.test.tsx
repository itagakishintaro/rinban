import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'

test('アプリ名が表示される', () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { name: 'Rinban' })).toBeInTheDocument()
})
