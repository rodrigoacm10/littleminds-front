import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import {
  ApiError,
  getMe,
  login,
  register,
  type AuthUser,
  type LoginPayload,
  type LoginResponse,
  type RegisterPayload,
} from '../lib/api'

const storageKey = 'littleminds.accessToken'

type AuthContextValue = {
  token: string | null
  user: AuthUser | null
  booting: boolean
  signIn: (payload: LoginPayload) => Promise<LoginResponse>
  signUp: (payload: RegisterPayload) => Promise<AuthUser>
  signOut: () => void
  ApiError: typeof ApiError
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : window.localStorage.getItem(storageKey),
  )
  const [user, setUser] = useState<AuthUser | null>(null)
  const [booting, setBooting] = useState(() => Boolean(token))

  useEffect(() => {
    if (!token) {
      setBooting(false)
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

  async function signIn(payload: LoginPayload) {
    const response = await login(payload)
    window.localStorage.setItem(storageKey, response.accessToken)
    setToken(response.accessToken)
    setUser(response.user)
    return response
  }

  async function signUp(payload: RegisterPayload) {
    return register(payload)
  }

  function signOut() {
    window.localStorage.removeItem(storageKey)
    setToken(null)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      booting,
      signIn,
      signUp,
      signOut,
      ApiError,
    }),
    [token, user, booting],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
