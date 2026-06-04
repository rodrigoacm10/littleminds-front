import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthPanel } from './AuthPanel'
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from '../schemas/authSchemas'

function Wrapper({
  mode = 'login' as 'login' | 'register',
  booting = false,
  user = null as any,
  authError = null as string | null,
  registerSuccess = null as string | null,
  isPending = false,
  onLogin = vi.fn(),
  onRegister = vi.fn(),
  onLogout = vi.fn(),
}) {
  const loginForm = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })
  return (
    <MemoryRouter initialEntries={['/login']}>
      <AuthPanel
        mode={mode}
        booting={booting}
        user={user}
        authError={authError}
        registerSuccess={registerSuccess}
        isPending={isPending}
        loginForm={loginForm}
        registerForm={registerForm}
        onLogin={onLogin}
        onRegister={onRegister}
        onLogout={onLogout}
      />
    </MemoryRouter>
  )
}

describe('AuthPanel', () => {
  it('renderiza o formulário de login no modo login', () => {
    render(<Wrapper />)
    expect(screen.getByPlaceholderText('voce@exemplo.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar agora/i })).toBeInTheDocument()
  })

  it('renderiza o formulário de cadastro no modo register', () => {
    render(<Wrapper mode="register" />)
    expect(screen.getByPlaceholderText('Como devemos te chamar?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Criar conta/i })).toBeInTheDocument()
  })

  it('exibe mensagem de carregamento quando booting é true', () => {
    render(<Wrapper booting={true} />)
    expect(screen.getByText(/Restaurando sessão/i)).toBeInTheDocument()
  })

  it('exibe sessão ativa quando há usuário logado', () => {
    const user = { id: 'u1', name: 'Ana Silva', email: 'ana@teste.com', role: 'PARENT' as const, createdAt: '' }
    render(<Wrapper user={user} />)
    expect(screen.getByText(/Sessao ativa/i)).toBeInTheDocument()
    expect(screen.getByText(/Ana Silva/i)).toBeInTheDocument()
  })

  it('chama onLogout ao clicar em Sair', async () => {
    const onLogout = vi.fn()
    const user = { id: 'u1', name: 'Ana Silva', email: 'ana@teste.com', role: 'PARENT' as const, createdAt: '' }
    render(<Wrapper user={user} onLogout={onLogout} />)
    await userEvent.click(screen.getByRole('button', { name: /Sair/i }))
    expect(onLogout).toHaveBeenCalledOnce()
  })

  it('exibe mensagem de erro de autenticação', () => {
    render(<Wrapper authError="Email ou senha invalidos." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Email ou senha invalidos.')
  })

  it('exibe mensagem de sucesso no cadastro', () => {
    render(<Wrapper registerSuccess="Conta criada com sucesso." />)
    expect(screen.getByRole('status')).toHaveTextContent('Conta criada com sucesso.')
  })
})