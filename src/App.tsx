import { useEffect, useState, useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import './App.css'
import {
  API_BASE_URL,
  ApiError,
  getMe,
  login,
  register,
  type AuthUser,
  type UserRole,
} from './lib/api'

const storageKey = 'littleminds.accessToken'

const passwordRule =
  'A senha precisa ter ao menos 8 caracteres, incluindo letra maiuscula, minuscula e numero.'

const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter no minimo 8 caracteres.')
  .regex(/[A-Z]/, passwordRule)
  .regex(/[a-z]/, passwordRule)
  .regex(/[0-9]/, passwordRule)

const loginSchema = z.object({
  email: z.email('Digite um email valido.'),
  password: z.string().min(1, 'Digite sua senha.'),
})

const registerSchema = z
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

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>
type AuthMode = 'login' | 'register'

const roleOptions: Array<{ value: UserRole; label: string; description: string }> = [
  {
    value: 'PARENT',
    label: 'Responsavel',
    description: 'Para pais, maes e cuidadores acompanharem o desenvolvimento infantil.',
  },
  {
    value: 'SPECIALIST',
    label: 'Especialista',
    description: 'Para profissionais que apoiam familias com orientacoes especializadas.',
  },
  {
    value: 'ADMIN',
    label: 'Administrador',
    description: 'Perfil administrativo com acesso ampliado dentro da plataforma.',
  },
]

function App() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [token, setToken] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : window.localStorage.getItem(storageKey),
  )
  const [user, setUser] = useState<AuthUser | null>(null)
  const [booting, setBooting] = useState(() => Boolean(token))
  const [authError, setAuthError] = useState<string | null>(null)
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'PARENT',
    },
  })

  useEffect(() => {
    if (!token) {
      return
    }

    getMe(token)
      .then((profile) => {
        setUser(profile)
      })
      .catch(() => {
        window.localStorage.removeItem(storageKey)
        setToken(null)
      })
      .finally(() => {
        setBooting(false)
      })
  }, [token])

  const currentRole = useWatch({
    control: registerForm.control,
    name: 'role',
  })

  const roleHint = roleOptions.find((option) => option.value === currentRole)?.description

  async function handleLogin(values: LoginFormValues) {
    setAuthError(null)
    setRegisterSuccess(null)

    try {
      const response = await login(values)
      window.localStorage.setItem(storageKey, response.accessToken)
      setToken(response.accessToken)
      setUser(response.user)
      loginForm.reset()
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Nao foi possivel entrar agora.'
      setAuthError(message)
    }
  }

  async function handleRegister(values: RegisterFormValues) {
    setAuthError(null)
    setRegisterSuccess(null)

    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      }
      await register(payload)
      registerForm.reset({
        name: '',
        email: values.email,
        password: '',
        confirmPassword: '',
        role: values.role,
      })
      setRegisterSuccess('Conta criada com sucesso. Agora faca login para continuar.')
      startTransition(() => {
        setMode('login')
        loginForm.setValue('email', values.email)
      })
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Nao foi possivel criar a conta agora.'
      setAuthError(message)
    }
  }

  function handleLogout() {
    window.localStorage.removeItem(storageKey)
    setToken(null)
    setUser(null)
    setAuthError(null)
    setRegisterSuccess(null)
    setMode('login')
  }

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div className="hero-badge">Little Minds</div>
        <h1>Um ponto de entrada acolhedor para familias e especialistas.</h1>
        <p className="hero-copy">
          Acesse sua conta para conversar com a IA, acompanhar discussoes e manter o
          cuidado infantil em um fluxo simples e seguro.
        </p>

        <div className="hero-grid">
          <article>
            <span>JWT + sessao</span>
            <strong>Token persistido e restauracao com `/auth/me`.</strong>
          </article>
          <article>
            <span>Validacao clara</span>
            <strong>Formularios com Zod e mensagens objetivas.</strong>
          </article>
          <article>
            <span>API pronta</span>
            <strong>Base configurada para `littleminds.onrender.com`.</strong>
          </article>
        </div>
      </section>

      <section className="auth-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{mode === 'login' ? 'Entrar' : 'Criar conta'}</p>
            <h2>
              {mode === 'login'
                ? 'Bem-vindo de volta'
                : 'Comece seu acesso ao ecossistema Little Minds'}
            </h2>
          </div>

          <div className="mode-switch" role="tablist" aria-label="Alternar autenticacao">
            <button
              type="button"
              className={mode === 'login' ? 'is-active' : ''}
              onClick={() => {
                setMode('login')
                setAuthError(null)
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'is-active' : ''}
              onClick={() => {
                setMode('register')
                setAuthError(null)
              }}
            >
              Cadastro
            </button>
          </div>
        </div>

        <div className="api-meta">
          <span>API base</span>
          <code>{API_BASE_URL}</code>
        </div>

        {booting ? (
          <div className="status-card">
            <strong>Restaurando sessao...</strong>
            <p>Validando token salvo antes de liberar o formulario.</p>
          </div>
        ) : user && token ? (
          <div className="status-card is-success">
            <strong>Sessao ativa</strong>
            <p>
              {user.name} entrou como <b>{user.role}</b> com o email {user.email}.
            </p>
            <button type="button" className="primary-button" onClick={handleLogout}>
              Sair
            </button>
          </div>
        ) : (
          <>
            {authError ? (
              <div className="feedback is-error" role="alert">
                {authError}
              </div>
            ) : null}

            {registerSuccess ? (
              <div className="feedback is-success" role="status">
                {registerSuccess}
              </div>
            ) : null}

            {mode === 'login' ? (
              <form className="auth-form" onSubmit={loginForm.handleSubmit(handleLogin)}>
                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="voce@exemplo.com"
                    {...loginForm.register('email')}
                  />
                  <small>{loginForm.formState.errors.email?.message ?? ' '}</small>
                </label>

                <label className="field">
                  <span>Senha</span>
                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    {...loginForm.register('password')}
                  />
                  <small>{loginForm.formState.errors.password?.message ?? ' '}</small>
                </label>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting ? 'Entrando...' : 'Entrar agora'}
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={registerForm.handleSubmit(handleRegister)}>
                <label className="field">
                  <span>Nome completo</span>
                  <input
                    type="text"
                    placeholder="Como devemos te chamar?"
                    {...registerForm.register('name')}
                  />
                  <small>{registerForm.formState.errors.name?.message ?? ' '}</small>
                </label>

                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="voce@exemplo.com"
                    {...registerForm.register('email')}
                  />
                  <small>{registerForm.formState.errors.email?.message ?? ' '}</small>
                </label>

                <label className="field">
                  <span>Perfil</span>
                  <select {...registerForm.register('role')}>
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <small>{registerForm.formState.errors.role?.message ?? roleHint ?? ' '}</small>
                </label>

                <div className="field-row">
                  <label className="field">
                    <span>Senha</span>
                    <input
                      type="password"
                      placeholder="Crie uma senha forte"
                      {...registerForm.register('password')}
                    />
                    <small>{registerForm.formState.errors.password?.message ?? passwordRule}</small>
                  </label>

                  <label className="field">
                    <span>Confirmar senha</span>
                    <input
                      type="password"
                      placeholder="Repita a senha"
                      {...registerForm.register('confirmPassword')}
                    />
                    <small>
                      {registerForm.formState.errors.confirmPassword?.message ?? ' '}
                    </small>
                  </label>
                </div>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={registerForm.formState.isSubmitting || isPending}
                >
                  {registerForm.formState.isSubmitting || isPending
                    ? 'Criando conta...'
                    : 'Criar conta'}
                </button>
              </form>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default App
