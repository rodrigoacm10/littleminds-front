import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AppTopbar } from './AppTopbar'
import type { AuthUser } from '../lib/api'

const user: AuthUser = {
  id: 'u1',
  name: 'Ana Silva',
  email: 'ana@teste.com',
  role: 'PARENT',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function Wrapper({ onLogout = vi.fn(), path = '/ia' }) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<AppTopbar user={user} onLogout={onLogout} />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AppTopbar', () => {
  it('renderiza o nome e role do usuário', () => {
    render(<Wrapper />)
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('PARENT')).toBeInTheDocument()
  })

  it('renderiza os links de navegação', () => {
    render(<Wrapper />)
    expect(screen.getByRole('link', { name: 'IA' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Forum' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pesquisas' })).toBeInTheDocument()
  })

  it('destaca o link ativo conforme a rota atual', () => {
    render(<Wrapper path="/forum" />)
    const forumLink = screen.getByRole('link', { name: 'Forum' })
    expect(forumLink.className).toContain('bg-[#4d2813]')
  })

  it('chama onLogout ao clicar em Sair', async () => {
    const onLogout = vi.fn()
    render(<Wrapper onLogout={onLogout} />)
    await userEvent.click(screen.getByRole('button', { name: /Sair/i }))
    expect(onLogout).toHaveBeenCalledOnce()
  })
})