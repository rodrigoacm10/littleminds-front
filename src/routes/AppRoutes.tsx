import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router'
import { AuthPage } from '../pages/AuthPage'

function AuthLayout() {
  return <Outlet />
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
    ],
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}
