import { describe, expect, it } from 'vitest'
import { loginSchema, passwordRule, registerSchema } from './authSchemas'

describe('authSchemas', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'responsavel@littleminds.com',
      password: 'secret',
    })

    expect(result.success).toBe(true)
  })

  it('rejects login with invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'email-invalido',
      password: 'secret',
    })

    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.email).toContain('Digite um email valido.')
  })

  it('accepts valid register data', () => {
    const result = registerSchema.safeParse({
      name: 'Maria da Silva',
      email: 'maria@littleminds.com',
      password: 'Senha123',
      confirmPassword: 'Senha123',
      role: 'PARENT',
    })

    expect(result.success).toBe(true)
  })

  it('rejects weak passwords', () => {
    const result = registerSchema.safeParse({
      name: 'Maria da Silva',
      email: 'maria@littleminds.com',
      password: 'senhafraca',
      confirmPassword: 'senhafraca',
      role: 'PARENT',
    })

    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.password).toContain(passwordRule)
  })

  it('rejects different passwords', () => {
    const result = registerSchema.safeParse({
      name: 'Maria da Silva',
      email: 'maria@littleminds.com',
      password: 'Senha123',
      confirmPassword: 'Senha999',
      role: 'PARENT',
    })

    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.confirmPassword).toContain(
      'As senhas nao coincidem.',
    )
  })
})

