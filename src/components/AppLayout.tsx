import { Outlet, useNavigate } from 'react-router'
import { AppTopbar } from './AppTopbar'
import { useAuth } from '../hooks/useAuth'

export function AppLayout() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,225,196,0.82),transparent_30%),linear-gradient(180deg,#fff9f3_0%,#f6e5d3_100%)]">
      <AppTopbar
        user={user}
        onLogout={() => {
          signOut()
          navigate('/login')
        }}
      />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Outlet />
      </main>
    </div>
  )
}
