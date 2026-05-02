import { z } from 'zod'

export const passwordRule =
  'A senha precisa ter ao menos 8 caracteres, incluindo letra maiuscula, minuscula e numero.'

const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter no minimo 8 caracteres.')
  .regex(/[A-Z]/, passwordRule)
  .regex(/[a-z]/, passwordRule)
  .regex(/[0-9]/, passwordRule)

export const loginSchema = z.object({
  email: z.email('Digite um email valido.'),
  password: z.string().min(1, 'Digite sua senha.'),
})

export const registerSchema = z
  .object({
    name: z.string().min(3, 'Informe seu nome completo.'),
    email: z.email('Digite um email valido.'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
    role: z.enum(['PARENT', 'SPECIALIST', 'ADMIN']),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas nao coincidem.',
    path: ['confirmPassword'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type AuthMode = 'login' | 'register'
