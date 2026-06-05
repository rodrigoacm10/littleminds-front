import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AppLayout } from './AppLayout'

const mockAuth = { user: null as any, signOut: vi.fn() }

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}))

const authUser = {
  id: 'u1',
  name: 'Ana Silva',
  email: 'ana@teste.com',
  role: 'PARENT' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
}

function Wrapper({ children = <div>Conteudo protegido</div> }) {
  return (
    <MemoryRouter initialEntries={['/ia']}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/ia" element={children} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('AppLayout', () => {
  it('não renderiza nada se não há usuário', () => {
    mockAuth.user = null
    const { container } = render(<Wrapper />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza o topbar e o conteúdo quando há usuário', () => {
    mockAuth.user = authUser
    render(<Wrapper />)
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('Conteudo protegido')).toBeInTheDocument()
  })

  it('chama signOut ao clicar em Sair', async () => {
    mockAuth.user = authUser
    mockAuth.signOut = vi.fn()
    render(<Wrapper />)
    await userEvent.click(screen.getByRole('button', { name: /Sair/i }))
    expect(mockAuth.signOut).toHaveBeenCalledOnce()
  })
})