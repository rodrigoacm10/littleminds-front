import { API_BASE_URL, type AuthUser } from '../lib/api'
import { Link } from 'react-router'
import type {
  AuthMode,
  LoginFormValues,
  RegisterFormValues,
} from '../schemas/authSchemas'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import type { UseFormReturn } from 'react-hook-form'

interface AuthPanelProps {
  mode: AuthMode
  booting: boolean
  user: AuthUser | null
  authError: string | null
  registerSuccess: string | null
  isPending: boolean
  loginForm: UseFormReturn<LoginFormValues>
  registerForm: UseFormReturn<RegisterFormValues>
  onLogin: (values: LoginFormValues) => void | Promise<void>
  onRegister: (values: RegisterFormValues) => void | Promise<void>
  onLogout: () => void
}

export function AuthPanel({
  booting,
  user,
  authError,
  registerSuccess,
  isPending,
  loginForm,
  registerForm,
  mode,
  onLogin,
  onRegister,
  onLogout,
}: AuthPanelProps) {
  return (
    <section className="flex flex-col justify-center gap-5 border-t border-[#7b4e2f]/10 bg-white/82 px-5 py-6 backdrop-blur-md md:px-8 lg:border-t-0 lg:border-l">
      <div className="grid gap-4">
        <div>
          <p className="mb-1 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-[#b06f45]">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </p>
          <h2 className="text-[clamp(1.9rem,3vw,2.5rem)] leading-[1.08] font-semibold text-[#341708]">
            {mode === 'login'
              ? 'Bem-vindo de volta'
              : 'Comece seu acesso ao ecossistema Little Minds'}
          </h2>
        </div>

        <div
          className="grid grid-cols-2 gap-2 rounded-full bg-[#f8ead8] p-1.5"
          role="tablist"
          aria-label="Alternar autenticacao"
        >
          <Link
            to="/login"
            className={[
              'rounded-full px-4 py-3 text-center text-sm transition',
              mode === 'login'
                ? 'bg-gradient-to-br from-[#ca7c4e] to-[#a85131] text-[#fff7f0] shadow-[0_12px_28px_rgba(168,81,49,0.2)]'
                : 'text-[#8f5e3d] hover:-translate-y-px',
            ].join(' ')}
          >
            Login
          </Link>
          <Link
            to="/cadastro"
            className={[
              'rounded-full px-4 py-3 text-center text-sm transition',
              mode === 'register'
                ? 'bg-gradient-to-br from-[#ca7c4e] to-[#a85131] text-[#fff7f0] shadow-[0_12px_28px_rgba(168,81,49,0.2)]'
                : 'text-[#8f5e3d] hover:-translate-y-px',
            ].join(' ')}
          >
            Cadastro
          </Link>
        </div>
      </div>

      <div className="grid gap-1 rounded-2xl border border-[#7b4e2f]/10 bg-[#fff7ef] p-4">
        <span className="text-[0.74rem] font-bold uppercase tracking-[0.12em] text-[#b06f45]">

        </span>

      </div>

      {booting ? (
        <div className="grid gap-2 rounded-2xl border border-[#b06f45]/14 bg-[#fff7ef] p-4">
          <strong>Restaurando sessao...</strong>
          <p>Validando token salvo antes de liberar o formulario.</p>
        </div>
      ) : user ? (
        <div className="grid gap-2 rounded-2xl border border-[rgba(59,130,96,0.2)] bg-[#eefaf4] p-4 text-[#185a39]">
          <strong>Sessao ativa</strong>
          <p>
            {user.name} entrou como <b>{user.role}</b> com o email {user.email}.
          </p>
          <button
            type="button"
            className="cursor-pointer rounded-2xl bg-gradient-to-br from-[#ca7c4e] to-[#a85131] px-5 py-4 font-bold text-[#fff9f5] shadow-[0_16px_34px_rgba(168,81,49,0.22)] transition hover:-translate-y-px hover:shadow-[0_20px_38px_rgba(168,81,49,0.28)]"
            onClick={onLogout}
          >
            Sair
          </button>
        </div>
      ) : (
        <>
          {authError ? (
            <div
              className="rounded-2xl border border-[rgba(192,68,44,0.18)] bg-[#fff1ef] p-4 text-[#9f2f1e]"
              role="alert"
            >
              {authError}
            </div>
          ) : null}

          {registerSuccess ? (
            <div
              className="rounded-2xl border border-[rgba(59,130,96,0.2)] bg-[#eefaf4] p-4 text-[#185a39]"
              role="status"
            >
              {registerSuccess}
            </div>
          ) : null}

          {mode === 'login' ? (
            <LoginForm form={loginForm} onSubmit={onLogin} />
          ) : (
            <RegisterForm
              form={registerForm}
              isPending={isPending}
              onSubmit={onRegister}
            />
          )}
        </>
      )}
    </section>
  )
}
