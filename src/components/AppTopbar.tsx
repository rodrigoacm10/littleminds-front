import { Link, useLocation } from 'react-router'
import type { AuthUser } from '../lib/api'

interface AppTopbarProps {
  user: AuthUser
  onLogout: () => void
}

const navItems = [
  { to: '/ia', label: 'IA' },
  { to: '/forum', label: 'Forum' },
  { to: '/pesquisas', label: 'Pesquisas' },
]

export function AppTopbar({ user, onLogout }: AppTopbarProps) {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-20 border-b border-[#cfae96]/40 bg-[#fff9f3]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full border border-[#7b4e2f]/15 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#9a643f]">
            Little Minds
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to)

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-[#4d2813] text-[#fff8ef]'
                      : 'text-[#7f5438] hover:bg-white/80 hover:text-[#4d2813]',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-[#4d2813]">{user.name}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-[#9a643f]">{user.role}</p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="cursor-pointer rounded-full border border-[#7b4e2f]/15 bg-white px-4 py-2 text-sm font-semibold text-[#7b4e2f] transition hover:-translate-y-px hover:bg-[#fff2e6]"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
