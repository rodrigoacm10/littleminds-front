import { useWatch, type UseFormReturn } from 'react-hook-form'
import type { UserRole } from '../lib/api'
import {
  passwordRule,
  type RegisterFormValues,
} from '../schemas/authSchemas'

const roleOptions: Array<{
  value: UserRole
  label: string
  description: string
}> = [
    {
      value: 'PARENT',
      label: 'Responsável',
      description: 'Para pais, mães e cuidadores acompanharem o desenvolvimento infantil.',
    },
    {
      value: 'SPECIALIST',
      label: 'Especialista',
      description: 'Para profissionais que apoiam famílias com orientações especializadas.',
    },
    {
      value: 'ADMIN',
      label: 'Administrador',
      description: 'Perfil administrativo com acesso ampliado dentro da plataforma.',
    },
  ]

interface RegisterFormProps {
  form: UseFormReturn<RegisterFormValues>
  isPending: boolean
  onSubmit: (values: RegisterFormValues) => void | Promise<void>
}

export function RegisterForm({
  form,
  isPending,
  onSubmit,
}: RegisterFormProps) {
  const currentRole = useWatch({
    control: form.control,
    name: 'role',
  })

  const roleHint = roleOptions.find((option) => option.value === currentRole)?.description

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="grid gap-2">
        <span className="font-bold text-[#4f2d14]">Nome completo</span>
        <input
          type="text"
          placeholder="Como devemos te chamar?"
          className="w-full rounded-2xl border border-[#7b4e2f]/18 bg-[#fffdf9] px-4 py-4 text-[#341708] outline-none transition focus:-translate-y-px focus:border-[#b9683f] focus:shadow-[0_0_0_4px_rgba(185,104,63,0.12)]"
          {...form.register('name')}
        />
        <small className="min-h-[1.1rem] leading-5 text-[#a15431]">
          {form.formState.errors.name?.message ?? ' '}
        </small>
      </label>

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
        <span className="font-bold text-[#4f2d14]">Perfil</span>
        <select
          className="w-full rounded-2xl border border-[#7b4e2f]/18 bg-[#fffdf9] px-4 py-4 text-[#341708] outline-none transition focus:-translate-y-px focus:border-[#b9683f] focus:shadow-[0_0_0_4px_rgba(185,104,63,0.12)]"
          {...form.register('role')}
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <small className="min-h-[1.1rem] leading-5 text-[#a15431]">
          {form.formState.errors.role?.message ?? roleHint ?? ' '}
        </small>
      </label>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-bold text-[#4f2d14]">Senha</span>
          <input
            type="password"
            placeholder="Crie uma senha forte"
            className="w-full rounded-2xl border border-[#7b4e2f]/18 bg-[#fffdf9] px-4 py-4 text-[#341708] outline-none transition focus:-translate-y-px focus:border-[#b9683f] focus:shadow-[0_0_0_4px_rgba(185,104,63,0.12)]"
            {...form.register('password')}
          />
          <small className="min-h-[1.1rem] leading-5 text-[#a15431]">
            {form.formState.errors.password?.message ?? passwordRule}
          </small>
        </label>

        <label className="grid gap-2">
          <span className="font-bold text-[#4f2d14]">Confirmar senha</span>
          <input
            type="password"
            placeholder="Repita a senha"
            className="w-full rounded-2xl border border-[#7b4e2f]/18 bg-[#fffdf9] px-4 py-4 text-[#341708] outline-none transition focus:-translate-y-px focus:border-[#b9683f] focus:shadow-[0_0_0_4px_rgba(185,104,63,0.12)]"
            {...form.register('confirmPassword')}
          />
          <small className="min-h-[1.1rem] leading-5 text-[#a15431]">
            {form.formState.errors.confirmPassword?.message ?? ' '}
          </small>
        </label>
      </div>

      <button
        type="submit"
        className="cursor-pointer rounded-2xl bg-gradient-to-br from-[#ca7c4e] to-[#a85131] px-5 py-4 font-bold text-[#fff9f5] shadow-[0_16px_34px_rgba(168,81,49,0.22)] transition hover:-translate-y-px hover:shadow-[0_20px_38px_rgba(168,81,49,0.28)] disabled:cursor-progress disabled:opacity-70 disabled:shadow-none"
        disabled={form.formState.isSubmitting || isPending}
      >
        {form.formState.isSubmitting || isPending ? 'Criando conta...' : 'Criar conta'}
      </button>
    </form>
  )
}
