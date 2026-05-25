import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './useAuth'
import type { AuthUser, LoginResponse } from '../lib/api'

const { loginMock, registerMock, getMeMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  registerMock: vi.fn(),
  getMeMock: vi.fn(),
}))

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api')

  return {
    ...actual,
    login: loginMock,
    register: registerMock,
    getMe: getMeMock,
  }
})

const demoUser: AuthUser = {
  id: 'user-1',
  name: 'Ana',
  email: 'ana@littleminds.com',
  role: 'PARENT',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function AuthConsumer() {
  const { user, token, booting, signIn, signOut, signUp } = useAuth()

  const handleSignIn = async () => {
    await signIn({
      email: 'ana@littleminds.com',
      password: 'Senha123',
    })
  }

  const handleSignUp = async () => {
    await signUp({
      name: 'Ana',
      email: 'ana@littleminds.com',
      password: 'Senha123',
      role: 'PARENT',
    })
  }

  return (
    <div>
      <div data-testid="booting">{String(booting)}</div>
      <div data-testid="token">{token ?? 'sem-token'}</div>
      <div data-testid="user">{user?.email ?? 'sem-usuario'}</div>
      <button type="button" onClick={handleSignIn}>
        entrar
      </button>
      <button type="button" onClick={handleSignUp}>
        cadastrar
      </button>
      <button type="button" onClick={signOut}>
        sair
      </button>
    </div>
  )
}

describe('AuthProvider integration', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('restores a persisted session on boot', async () => {
    window.localStorage.setItem('littleminds.accessToken', 'saved-token')
    getMeMock.mockResolvedValue(demoUser)

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    expect(screen.getByTestId('booting')).toHaveTextContent('true')

    await waitFor(() => {
      expect(screen.getByTestId('booting')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('token')).toHaveTextContent('saved-token')
    expect(screen.getByTestId('user')).toHaveTextContent('ana@littleminds.com')
    expect(getMeMock).toHaveBeenCalledWith('saved-token')
  })

  it('signs in and signs out updating storage and context', async () => {
    const user = userEvent.setup()
    const loginResponse: LoginResponse = {
      accessToken: 'new-token',
      user: demoUser,
    }

    loginMock.mockResolvedValue(loginResponse)

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'entrar' }))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('ana@littleminds.com')
    })

    expect(window.localStorage.getItem('littleminds.accessToken')).toBe('new-token')
    expect(screen.getByTestId('token')).toHaveTextContent('new-token')

    await user.click(screen.getByRole('button', { name: 'sair' }))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('sem-usuario')
    })

    expect(window.localStorage.getItem('littleminds.accessToken')).toBeNull()
    expect(screen.getByTestId('token')).toHaveTextContent('sem-token')
  })

  it('clears the stored token when restore fails', async () => {
    window.localStorage.setItem('littleminds.accessToken', 'expired-token')
    getMeMock.mockRejectedValue(new Error('expired'))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('booting')).toHaveTextContent('false')
    })

    expect(window.localStorage.getItem('littleminds.accessToken')).toBeNull()
    expect(screen.getByTestId('token')).toHaveTextContent('sem-token')
    expect(screen.getByTestId('user')).toHaveTextContent('sem-usuario')
  })

  it('delegates registration through the auth api', async () => {
    const user = userEvent.setup()
    registerMock.mockResolvedValue(demoUser)

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'cadastrar' }))

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        name: 'Ana',
        email: 'ana@littleminds.com',
        password: 'Senha123',
        role: 'PARENT',
      })
    })
  })
})
