import type { UseFormReturn } from 'react-hook-form'
import type { LoginFormValues } from '../schemas/authSchemas'

interface LoginFormProps {
  form: UseFormReturn<LoginFormValues>
  onSubmit: (values: LoginFormValues) => void | Promise<void>
}

export function LoginForm({ form, onSubmit }: LoginFormProps) {
  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="grid gap-2">
        <span className="font-bold text-[#4f2d14]">Email</span>
        <input
          type="email"
          placeholder="voce@exemplo.com"
          className="w-full rounded-2xl border border-[#7b4e2f]/18 bg-[#fffdf9] px-4 py-4 text-[#341708] outline-none transition focus:-translate-y-px focus:border-[#b9683f] focus:shadow-[0_0_0_4px_rgba(185,104,63,0.12)]"
          {...form.register('email')}
        />
        <small className="min-h-[1.1rem] leading-5 text-[#a15431]">
          {form.formState.errors.email?.message ?? ' '}
        </small>
      </label>

      <label className="grid gap-2">
        <span className="font-bold text-[#4f2d14]">Senha</span>
        <input
          type="password"
          placeholder="Digite sua senha"
          className="w-full rounded-2xl border border-[#7b4e2f]/18 bg-[#fffdf9] px-4 py-4 text-[#341708] outline-none transition focus:-translate-y-px focus:border-[#b9683f] focus:shadow-[0_0_0_4px_rgba(185,104,63,0.12)]"
          {...form.register('password')}
        />
        <small className="min-h-[1.1rem] leading-5 text-[#a15431]">
          {form.formState.errors.password?.message ?? ' '}
        </small>
      </label>

      <button
        type="submit"
        className="cursor-pointer rounded-2xl bg-gradient-to-br from-[#ca7c4e] to-[#a85131] px-5 py-4 font-bold text-[#fff9f5] shadow-[0_16px_34px_rgba(168,81,49,0.22)] transition hover:-translate-y-px hover:shadow-[0_20px_38px_rgba(168,81,49,0.28)] disabled:cursor-progress disabled:opacity-70 disabled:shadow-none"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? 'Entrando...' : 'Entrar agora'}
      </button>
    </form>
  )
}
