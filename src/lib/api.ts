const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ??
  'https://littleminds.onrender.com'

export type UserRole = 'PARENT' | 'SPECIALIST' | 'ADMIN'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt?: string
}

type ApiSuccess<T> = {
  success: true
  data?: T
  error?: never
}

type ApiFailure = {
  success: false
  error?: string
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure

type RegisterPayload = {
  name: string
  email: string
  password: string
  role?: UserRole
}

type LoginPayload = {
  email: string
  password: string
}

type LoginResponse = {
  accessToken: string
  user: AuthUser
}

class ApiError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

const errorMessages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email ou senha invalidos.',
  USER_ALREADY_EXISTS: 'Ja existe uma conta cadastrada com este email.',
  UNAUTHORIZED: 'Sua sessao expirou. Faca login novamente.',
  FORBIDDEN: 'Voce nao tem permissao para realizar esta acao.',
}

function getErrorMessage(code?: string) {
  return (code && errorMessages[code]) || 'Nao foi possivel concluir a solicitacao.'
}

async function request<T>(
  path: string,
  init?: RequestInit,
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (!response.ok || payload?.success === false) {
    const code = payload?.error
    throw new ApiError(getErrorMessage(code), code)
  }

  if (!payload?.success) {
    throw new ApiError('Resposta inesperada da API.')
  }

  if (!('data' in payload) || typeof payload.data === 'undefined') {
    throw new ApiError('Resposta sem dados retornados pela API.')
  }

  return payload.data
}

export async function register(payload: RegisterPayload) {
  return request<AuthUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function login(payload: LoginPayload) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getMe(token: string) {
  return request<AuthUser>('/auth/me', { method: 'GET' }, token)
}

export { API_BASE_URL, ApiError }
