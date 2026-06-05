import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ForumPostPage } from './ForumPostPage'
import { renderWithRouter } from '../test/renderWithRouter'

// 1. Criação das funções mockadas (hoisted para poderem ser usadas no vi.mock)
const {
  getForumPostMock,
  listCommentsMock,
  listPostSupportsMock,
  checkPostSupportMock,
  createCommentMock,
  createPostSupportMock,
  deletePostSupportMock,
} = vi.hoisted(() => ({
  getForumPostMock: vi.fn(),
  listCommentsMock: vi.fn(),
  listPostSupportsMock: vi.fn(),
  checkPostSupportMock: vi.fn(),
  createCommentMock: vi.fn(),
  createPostSupportMock: vi.fn(),
  deletePostSupportMock: vi.fn(),
}))

// 2. Mock do hook de autenticação
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    token: 'token-123',
    user: {
      id: 'user-1',
      name: 'Ana Silva',
      email: 'ana@teste.com',
      role: 'USER',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  }),
}))

// 3. Mock das funções da API
vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api')
  return {
    ...actual,
    getForumPost: getForumPostMock,
    listComments: listCommentsMock,
    listPostSupports: listPostSupportsMock,
    checkPostSupport: checkPostSupportMock,
    createComment: createCommentMock,
    createPostSupport: createPostSupportMock,
    deletePostSupport: deletePostSupportMock,
  }
})

// 4. Massa de dados base para os testes
const basePost = {
  id: 'post-1',
  title: 'Dúvida sobre introdução alimentar',
  content: 'Alguém tem dicas de como começar a introdução alimentar?',
  authorId: 'user-2',
  createdAt: '2026-06-04T10:00:00.000Z',
  updatedAt: '2026-06-04T10:00:00.000Z',
}

const baseComments = [
  {
    id: 'comment-1',
    content: 'Comece com frutas amassadas!',
    postId: 'post-1',
    authorId: 'user-3',
    createdAt: '2026-06-04T11:00:00.000Z',
    updatedAt: '2026-06-04T11:00:00.000Z',
  },
]

const baseSupports = [
  { id: 'support-1', postId: 'post-1', authorId: 'user-4' },
  { id: 'support-2', postId: 'post-1', authorId: 'user-5' },
]

describe('ForumPostPage integration', () => {
  beforeEach(() => {
    getForumPostMock.mockReset()
    listCommentsMock.mockReset()
    listPostSupportsMock.mockReset()
    checkPostSupportMock.mockReset()
    createCommentMock.mockReset()
    createPostSupportMock.mockReset()
    deletePostSupportMock.mockReset()
  })

  it('shows loading state then renders the post, comments and support info', async () => {
    getForumPostMock.mockResolvedValue(basePost)
    listCommentsMock.mockResolvedValue(baseComments)
    listPostSupportsMock.mockResolvedValue(baseSupports) // 2 apoios
    checkPostSupportMock.mockResolvedValue({ hasSupported: false, totalSupports: 2 })

    renderWithRouter(
      [{ path: '/forum/:id', element: <ForumPostPage /> }],
      ['/forum/post-1'],
    )

    // Verifica estado de loading
    expect(screen.getByText(/Carregando post/i)).toBeInTheDocument()

    // Aguarda resolução da tela
    await waitFor(() => {
      expect(screen.getByText('Dúvida sobre introdução alimentar')).toBeInTheDocument()
    })

    // Verifica conteúdo do post
    expect(screen.getByText('Alguém tem dicas de como começar a introdução alimentar?')).toBeInTheDocument()
    
    // Verifica comentário
    expect(screen.getByText('Comece com frutas amassadas!')).toBeInTheDocument()
    
    // Verifica botão de apoio
    expect(screen.getByRole('button', { name: 'Apoiar post (2)' })).toBeInTheDocument()
  })

  it('shows error message when post fails to load', async () => {
    getForumPostMock.mockRejectedValue(new Error('Erro interno do servidor'))
    listCommentsMock.mockResolvedValue([])
    listPostSupportsMock.mockResolvedValue([])

    renderWithRouter(
      [{ path: '/forum/:id', element: <ForumPostPage /> }],
      ['/forum/post-1'],
    )

    await waitFor(() => {
      // O componente exibe a mensagem de post não encontrado devido ao early return "if (!post)"
      expect(screen.getByText('Post nao encontrado.')).toBeInTheDocument()
    })
  })

  it('shows empty state message when there are no comments', async () => {
    getForumPostMock.mockResolvedValue(basePost)
    listCommentsMock.mockResolvedValue([]) // Sem comentários
    listPostSupportsMock.mockResolvedValue([])
    checkPostSupportMock.mockResolvedValue({ hasSupported: false, totalSupports: 0 })

    renderWithRouter(
      [{ path: '/forum/:id', element: <ForumPostPage /> }],
      ['/forum/post-1'],
    )

    await waitFor(() => {
      expect(
        screen.getByText('Ainda nao existem comentarios. Seja a primeira pessoa a participar.')
      ).toBeInTheDocument()
    })
  })

  it('supports the post when clicking Apoiar', async () => {
    const user = userEvent.setup()

    getForumPostMock.mockResolvedValue(basePost)
    listCommentsMock.mockResolvedValue([])
    listPostSupportsMock.mockResolvedValue(baseSupports)
    checkPostSupportMock.mockResolvedValue({ hasSupported: false, totalSupports: 2 })
    createPostSupportMock.mockResolvedValue(undefined)

    renderWithRouter(
      [{ path: '/forum/:id', element: <ForumPostPage /> }],
      ['/forum/post-1'],
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Apoiar post (2)' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Apoiar post (2)' }))

    // O texto deve mudar para 'Apoiando' e o contador subir
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Apoiando (3)' })).toBeInTheDocument()
    })

    expect(createPostSupportMock).toHaveBeenCalledWith('post-1', 'token-123')
  })

  it('removes support from the post when clicking Apoiando', async () => {
    const user = userEvent.setup()

    getForumPostMock.mockResolvedValue(basePost)
    listCommentsMock.mockResolvedValue([])
    listPostSupportsMock.mockResolvedValue(baseSupports)
    // Simula que o usuário atual JÁ apoia o post
    checkPostSupportMock.mockResolvedValue({ hasSupported: true, totalSupports: 2 })
    deletePostSupportMock.mockResolvedValue(undefined)

    renderWithRouter(
      [{ path: '/forum/:id', element: <ForumPostPage /> }],
      ['/forum/post-1'],
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Apoiando (2)' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Apoiando (2)' }))

    // O texto deve voltar para 'Apoiar post' e o contador descer
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Apoiar post (1)' })).toBeInTheDocument()
    })

    expect(deletePostSupportMock).toHaveBeenCalledWith('post-1', 'token-123')
  })

  it('submits a new comment and adds it to the list', async () => {
    const user = userEvent.setup()

    const newComment = {
      id: 'comment-2',
      content: 'Meu novo comentário',
      postId: 'post-1',
      authorId: 'user-1', // O usuário mockado
      createdAt: '2026-06-04T12:00:00.000Z',
      updatedAt: '2026-06-04T12:00:00.000Z',
    }

    getForumPostMock.mockResolvedValue(basePost)
    listCommentsMock.mockResolvedValue(baseComments)
    listPostSupportsMock.mockResolvedValue([])
    checkPostSupportMock.mockResolvedValue({ hasSupported: false, totalSupports: 0 })
    createCommentMock.mockResolvedValue(newComment)

    renderWithRouter(
      [{ path: '/forum/:id', element: <ForumPostPage /> }],
      ['/forum/post-1'],
    )

    // Aguarda carregar
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Escreva um comentario para esse post...')).toBeInTheDocument()
    })

    const textarea = screen.getByPlaceholderText('Escreva um comentario para esse post...')
    const submitButton = screen.getByRole('button', { name: 'Enviar comentario' })

    // Digita o comentário
    await user.type(textarea, 'Meu novo comentário')
    expect(textarea).toHaveValue('Meu novo comentário')

    // Envia o formulário
    await user.click(submitButton)

    await waitFor(() => {
      // O textarea deve ter sido limpo
      expect(textarea).toHaveValue('')
      // O novo comentário deve aparecer na tela
      expect(screen.getByText('Meu novo comentário')).toBeInTheDocument()
    })

    expect(createCommentMock).toHaveBeenCalledWith(
      { content: 'Meu novo comentário', postId: 'post-1' },
      'token-123'
    )
  })

  it('shows an error message when submitting a comment fails', async () => {
    const user = userEvent.setup()

    getForumPostMock.mockResolvedValue(basePost)
    listCommentsMock.mockResolvedValue([])
    listPostSupportsMock.mockResolvedValue([])
    checkPostSupportMock.mockResolvedValue({ hasSupported: false, totalSupports: 0 })
    createCommentMock.mockRejectedValue(new Error('Erro na API'))

    renderWithRouter(
      [{ path: '/forum/:id', element: <ForumPostPage /> }],
      ['/forum/post-1'],
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Escreva um comentario para esse post...')).toBeInTheDocument()
    })

    const textarea = screen.getByPlaceholderText('Escreva um comentario para esse post...')
    await user.type(textarea, 'Comentário que vai falhar')
    
    await user.click(screen.getByRole('button', { name: 'Enviar comentario' }))

    await waitFor(() => {
      expect(screen.getByText('Nao foi possivel enviar o comentario agora.')).toBeInTheDocument()
    })
  })
})