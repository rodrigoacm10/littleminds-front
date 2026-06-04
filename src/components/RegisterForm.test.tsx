import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterForm } from './RegisterForm'
import { registerSchema, type RegisterFormValues } from '../schemas/authSchemas'

function Wrapper({
  onSubmit,
  isPending = false,
}: {
  onSubmit: (v: RegisterFormValues) => void
  isPending?: boolean
}) {
  const form = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })
  return <RegisterForm form={form} isPending={isPending} onSubmit={onSubmit} />
}

describe('RegisterForm', () => {
  it('renderiza todos os campos do formulário', () => {
    render(<Wrapper onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText('Como devemos te chamar?')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('voce@exemplo.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Crie uma senha forte')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Repita a senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Criar conta/i })).toBeInTheDocument()
  })

  it('chama onSubmit com os valores corretos', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Wrapper onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText('Como devemos te chamar?'), 'Ana Silva')
    await user.type(screen.getByPlaceholderText('voce@exemplo.com'), 'ana@teste.com')
    await user.type(screen.getByPlaceholderText('Crie uma senha forte'), 'Senha123')
    await user.type(screen.getByPlaceholderText('Repita a senha'), 'Senha123')
    await user.click(screen.getByRole('button', { name: /Criar conta/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Ana Silva',
        email: 'ana@teste.com',
        password: 'Senha123',
        confirmPassword: 'Senha123',
      }),
      expect.anything(),
    )
  })

  it('exibe erro quando as senhas não coincidem', async () => {
    const user = userEvent.setup()
    render(<Wrapper onSubmit={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Como devemos te chamar?'), 'Ana Silva')
    await user.type(screen.getByPlaceholderText('voce@exemplo.com'), 'ana@teste.com')
    await user.type(screen.getByPlaceholderText('Crie uma senha forte'), 'Senha123')
    await user.type(screen.getByPlaceholderText('Repita a senha'), 'SenhaDiferente')
    await user.click(screen.getByRole('button', { name: /Criar conta/i }))

    expect(await screen.findByText(/senhas/i)).toBeInTheDocument()
  })

  it('exibe a descrição do perfil ao selecionar uma opção', async () => {
    const user = userEvent.setup()
    render(<Wrapper onSubmit={vi.fn()} />)

    await user.selectOptions(screen.getByRole('combobox'), 'SPECIALIST')

    expect(
      screen.getByText(/profissionais que apoiam familias/i),
    ).toBeInTheDocument()
  })

  it('desabilita o botão quando isPending é true', () => {
    render(<Wrapper onSubmit={vi.fn()} isPending={true} />)
    expect(screen.getByRole('button', { name: /Criando conta/i })).toBeDisabled()
  })
})