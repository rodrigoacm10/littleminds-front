import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router'
import { AppLayout } from '../components/AppLayout'
import { useAuth, AuthProvider } from '../hooks/useAuth'
import { AIPage } from '../pages/AIPage'
import { AuthPage } from '../pages/AuthPage'
import { ArticlePage } from '../pages/ArticlePage'
import { ForumPage } from '../pages/ForumPage'
import { ForumPostPage } from '../pages/ForumPostPage'
import { ResearchPage } from '../pages/ResearchPage'

function AuthLayout() {
  return <Outlet />
}

function ProtectedRoute() {
  const { user, booting } = useAuth()

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff9f3] text-[#7f5438]">
        Restaurando sessao...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <AppLayout />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        element: <AuthPage />,
      },
      {
        path: 'cadastro',
        element: <AuthPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'ia',
            element: <AIPage />,
          },
          {
            path: 'forum',
            element: <ForumPage />,
          },
          {
            path: 'forum/:id',
            element: <ForumPostPage />,
          },
          {
            path: 'pesquisas',
            element: <ResearchPage />,
          },
          {
            path: 'pesquisas/:id',
            element: <ArticlePage />,
          },
        ],
      },
    ],
  },
])

export function AppRoutes() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
