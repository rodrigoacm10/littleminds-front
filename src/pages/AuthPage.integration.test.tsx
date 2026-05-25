import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AuthPage } from './AuthPage'
import { renderWithRouter } from '../test/renderWithRouter'

const authState = {
  user: null,
  booting: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  token: null,
  ApiError: class ApiError extends Error {},
}

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => authState,
}))

describe('AuthPage integration', () => {
  beforeEach(() => {
    authState.user = null
    authState.booting = false
    authState.token = null
    authState.signIn.mockReset()
    authState.signOut.mockReset()
    authState.signUp.mockReset()
  })

  it('submits login data and navigates to the protected area', async () => {
    const user = userEvent.setup()
    authState.signIn.mockResolvedValue(undefined)

    renderWithRouter(
      [
        { path: '/login', element: <AuthPage /> },
        { path: '/ia', element: <div>Area protegida</div> },
      ],
      ['/login'],
    )

    await user.type(screen.getByPlaceholderText('voce@exemplo.com'), 'ana@teste.com')
    await user.type(screen.getByPlaceholderText('Digite sua senha'), 'Senha123')
    await user.click(screen.getByRole('button', { name: /Entrar agora/i }))

    await waitFor(() => {
      expect(screen.getByText('Area protegida')).toBeInTheDocument()
    })

    expect(authState.signIn).toHaveBeenCalledWith({
      email: 'ana@teste.com',
      password: 'Senha123',
    })
  })

  it('submits registration and returns to the login view with success feedback', async () => {
    const user = userEvent.setup()
    authState.signUp.mockResolvedValue(undefined)

    renderWithRouter(
      [{ path: '/cadastro', element: <AuthPage /> }],
      ['/cadastro'],
    )

    await user.type(screen.getByPlaceholderText('Como devemos te chamar?'), 'Ana Silva')
    await user.type(
      screen.getAllByPlaceholderText('voce@exemplo.com')[0],
      'ana@teste.com',
    )
    await user.type(screen.getByPlaceholderText('Crie uma senha forte'), 'Senha123')
    await user.type(screen.getByPlaceholderText('Repita a senha'), 'Senha123')
    await user.click(screen.getByRole('button', { name: /Criar conta/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/Conta criada com sucesso. Agora faca login para continuar./i),
      ).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Entrar agora/i })).toBeInTheDocument()
    expect(authState.signUp).toHaveBeenCalledWith({
      name: 'Ana Silva',
      email: 'ana@teste.com',
      password: 'Senha123',
      role: 'PARENT',
    })
  })
})

