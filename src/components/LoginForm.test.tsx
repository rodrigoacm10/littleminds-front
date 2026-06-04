import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginForm } from './LoginForm'
import { loginSchema, type LoginFormValues } from '../schemas/authSchemas'

function Wrapper({ onSubmit }: { onSubmit: (v: LoginFormValues) => void }) {
  const form = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })
  return <LoginForm form={form} onSubmit={onSubmit} />
}

describe('LoginForm', () => {
  it('renderiza os campos de email e senha', () => {
    render(<Wrapper onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText('voce@exemplo.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Digite sua senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar agora/i })).toBeInTheDocument()
  })

  it('chama onSubmit com os valores corretos', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Wrapper onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText('voce@exemplo.com'), 'ana@teste.com')
    await user.type(screen.getByPlaceholderText('Digite sua senha'), 'Senha123')
    await user.click(screen.getByRole('button', { name: /Entrar agora/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      { email: 'ana@teste.com', password: 'Senha123' },
      expect.anything(),
    )
  })

  it('exibe erro de validação se o email for inválido', async () => {
    const user = userEvent.setup()
    render(<Wrapper onSubmit={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('voce@exemplo.com'), 'nao-e-email')
    await user.click(screen.getByRole('button', { name: /Entrar agora/i }))

    expect(await screen.findByText(/email/i)).toBeInTheDocument()
  })

  it('desabilita o botão enquanto está submetendo', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => new Promise(() => {})) // nunca resolve
    render(<Wrapper onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText('voce@exemplo.com'), 'ana@teste.com')
    await user.type(screen.getByPlaceholderText('Digite sua senha'), 'Senha123')
    await user.click(screen.getByRole('button', { name: /Entrar agora/i }))

    expect(await screen.findByRole('button', { name: /Entrando/i })).toBeDisabled()
  })
})