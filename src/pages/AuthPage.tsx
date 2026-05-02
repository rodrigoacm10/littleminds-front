import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router'
import { AuthHero } from '../components/AuthHero'
import { AuthPanel } from '../components/AuthPanel'
import { useAuth } from '../hooks/useAuth'
import {
  loginSchema,
  registerSchema,
  type AuthMode,
  type LoginFormValues,
  type RegisterFormValues,
} from '../schemas/authSchemas'

export function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>(
    location.pathname === '/cadastro' ? 'register' : 'login',
  )
  const [authError, setAuthError] = useState<string | null>(null)
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { user, booting, signIn, signOut, signUp, ApiError } = useAuth()

  useEffect(() => {
    setMode(location.pathname === '/cadastro' ? 'register' : 'login')
    setAuthError(null)
  }, [location.pathname])

  useEffect(() => {
    if (!booting && user) {
      navigate('/ia', { replace: true })
    }
  }, [booting, navigate, user])

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

  async function handleLogin(values: LoginFormValues) {
    setAuthError(null)
    setRegisterSuccess(null)

    try {
      await signIn(values)
      loginForm.reset()
      navigate('/ia', { replace: true })
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
      await signUp({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      })

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
    signOut()
    setAuthError(null)
    setRegisterSuccess(null)
    setMode('login')
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_top_left,rgba(255,211,163,0.85),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(95,158,160,0.25),transparent_28%),linear-gradient(135deg,#fff8ef_0%,#fef1dc_45%,#f7dfcf_100%)] lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,520px)]">
      <AuthHero />
      <AuthPanel
        booting={booting}
        user={user}
        authError={authError}
        registerSuccess={registerSuccess}
        isPending={isPending}
        loginForm={loginForm}
        registerForm={registerForm}
        mode={mode}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
      />
    </main>
  )
}
