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

export type RegisterPayload = {
  name: string
  email: string
  password: string
  role?: UserRole
}

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  user: AuthUser
}

export type ConversationMessage = {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  isDeleted: boolean
  createdAt: string
}

export type Conversation = {
  id: string
  userId: string
  title: string
  isArchived: boolean
  createdAt: string
  updatedAt?: string
}

export type ConversationDetail = Conversation & {
  messages: ConversationMessage[]
}

export type AgeGroup =
  | 'PRENATAL'
  | 'BABY'
  | 'TODDLER'
  | 'CHILD'
  | 'TEENAGER'

export type ForumPost = {
  id: string
  title: string
  content: string
  authorId: string
  ageGroup?: AgeGroup | null
  createdAt: string
  updatedAt: string
}

export type Comment = {
  id: string
  content: string
  postId: string
  authorId: string
  createdAt: string
  updatedAt: string
}

export type PostSupport = {
  id: string
  userId: string
  postId: string
  createdAt: string
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

async function rawRequest<T extends Record<string, unknown>>(
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

  const payload = (await response.json().catch(() => null)) as
    | (T & { success?: boolean; error?: string })
    | null

  if (!response.ok || payload?.success === false) {
    const code = payload?.error
    throw new ApiError(getErrorMessage(code), code)
  }

  if (!payload) {
    throw new ApiError('Resposta inesperada da API.')
  }

  return payload
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

export async function listConversations(token: string, archived?: boolean) {
  const query = typeof archived === 'boolean' ? `?archived=${archived}` : ''
  const payload = await rawRequest<{
    success: true
    conversations: Conversation[]
  }>(`/conversations${query}`, { method: 'GET' }, token)

  return payload.conversations
}

export async function createConversation(title: string, token: string) {
  const payload = await rawRequest<{
    success: true
    conversation: Conversation
  }>(
    '/conversations',
    {
      method: 'POST',
      body: JSON.stringify({ title }),
    },
    token,
  )

  return payload.conversation
}

export async function getConversation(id: string, token: string) {
  const payload = await rawRequest<{
    success: true
    conversation: ConversationDetail
  }>(`/conversations/${id}`, { method: 'GET' }, token)

  return payload.conversation
}

export async function sendConversationMessage(
  conversationId: string,
  content: string,
  token: string,
) {
  return rawRequest<{
    success: true
    userMessage: ConversationMessage
    assistantMessage: ConversationMessage
  }>(
    `/conversations/${conversationId}/chat`,
    {
      method: 'POST',
      body: JSON.stringify({ content }),
    },
    token,
  )
}

export async function listForumPosts(params?: {
  ageGroup?: AgeGroup
  authorId?: string
}) {
  const query = new URLSearchParams()

  if (params?.ageGroup) {
    query.set('ageGroup', params.ageGroup)
  }

  if (params?.authorId) {
    query.set('authorId', params.authorId)
  }

  const suffix = query.toString() ? `?${query.toString()}` : ''
  const payload = await rawRequest<{
    success: true
    posts: ForumPost[]
  }>(`/forum-posts${suffix}`, { method: 'GET' })

  return payload.posts
}

export async function getForumPost(id: string) {
  const payload = await rawRequest<{
    success: true
    post: ForumPost
  }>(`/forum-posts/${id}`, { method: 'GET' })

  return payload.post
}

export async function createForumPost(
  payload: {
    title: string
    content: string
    ageGroup?: AgeGroup
  },
  token: string,
) {
  const payloadResponse = await rawRequest<{
    success: true
    post: ForumPost
  }>(
    '/forum-posts',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  )

  return payloadResponse.post
}

export async function listComments(postId: string) {
  const payload = await rawRequest<{
    success: true
    comments: Comment[]
  }>(`/comments?postId=${postId}`, { method: 'GET' })

  return payload.comments
}

export async function createComment(
  payload: {
    content: string
    postId: string
  },
  token: string,
) {
  const payloadResponse = await rawRequest<{
    success: true
    comment: Comment
  }>(
    '/comments',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  )

  return payloadResponse.comment
}

export async function listPostSupports(postId: string) {
  const payload = await rawRequest<{
    success: true
    supports: PostSupport[]
    total: number
  }>(`/post-supports?postId=${postId}`, { method: 'GET' })

  return payload.supports
}

export async function checkPostSupport(postId: string, token: string) {
  return rawRequest<{
    success: true
    hasSupported: boolean
    totalSupports: number
  }>(
    `/post-supports/check?postId=${postId}`,
    { method: 'GET' },
    token,
  )
}

export async function createPostSupport(postId: string, token: string) {
  const payload = await rawRequest<{
    success: true
    support: PostSupport
  }>(
    '/post-supports',
    {
      method: 'POST',
      body: JSON.stringify({ postId }),
    },
    token,
  )

  return payload.support
}

export async function deletePostSupport(postId: string, token: string) {
  return rawRequest<{ success: boolean }>(
    `/post-supports?postId=${postId}`,
    { method: 'DELETE' },
    token,
  )
}

export { API_BASE_URL, ApiError }
