import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ArticlePage } from './ArticlePage'
import { renderWithRouter } from '../test/renderWithRouter'

const {
  getArticleMock,
  publishArticleMock,
  unpublishArticleMock,
  deleteArticleMock,
  updateArticleMock,
} = vi.hoisted(() => ({
  getArticleMock: vi.fn(),
  publishArticleMock: vi.fn(),
  unpublishArticleMock: vi.fn(),
  deleteArticleMock: vi.fn(),
  updateArticleMock: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    token: 'token-123',
    user: {
      id: 'user-1',
      name: 'Ana Silva',
      email: 'ana@teste.com',
      role: 'SPECIALIST',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  }),
}))

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api')
  return {
    ...actual,
    getArticle: getArticleMock,
    publishArticle: publishArticleMock,
    unpublishArticle: unpublishArticleMock,
    deleteArticle: deleteArticleMock,
    updateArticle: updateArticleMock,
  }
})

const baseArticle = {
  id: 'article-1',
  title: 'Desenvolvimento infantil',
  summary: 'Um resumo sobre o tema.',
  content: 'Conteudo completo do artigo.',
  coverImage: null,
  ageGroup: 'CHILD' as const,
  isPublished: false,
  authorId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('ArticlePage integration', () => {
  beforeEach(() => {
    getArticleMock.mockReset()
    publishArticleMock.mockReset()
    unpublishArticleMock.mockReset()
    deleteArticleMock.mockReset()
    updateArticleMock.mockReset()
  })

  it('shows loading state then renders the article', async () => {
    getArticleMock.mockResolvedValue(baseArticle)

    renderWithRouter(
      [{ path: '/pesquisas/:id', element: <ArticlePage /> }],
      ['/pesquisas/article-1'],
    )

    expect(screen.getByText(/Carregando artigo/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Desenvolvimento infantil')).toBeInTheDocument()
    })

    expect(screen.getByText('Um resumo sobre o tema.')).toBeInTheDocument()
    expect(screen.getByText('Conteudo completo do artigo.')).toBeInTheDocument()
    expect(screen.getByText('Infancia')).toBeInTheDocument()
    expect(screen.getByText('Rascunho')).toBeInTheDocument()
  })

  it('shows error message when article fails to load', async () => {
    getArticleMock.mockRejectedValue(new Error('Falha na rede'))

    renderWithRouter(
      [{ path: '/pesquisas/:id', element: <ArticlePage /> }],
      ['/pesquisas/article-1'],
    )

    await waitFor(() => {
      expect(screen.getByText('Artigo nao encontrado.')).toBeInTheDocument()
    })
  })

  it('shows manage buttons when user is the author and has the right role', async () => {
    getArticleMock.mockResolvedValue(baseArticle)

    renderWithRouter(
      [{ path: '/pesquisas/:id', element: <ArticlePage /> }],
      ['/pesquisas/article-1'],
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Editar/i })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Publicar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Excluir/i })).toBeInTheDocument()
  })

  it('publishes the article when clicking Publicar', async () => {
    const user = userEvent.setup()

    getArticleMock
      .mockResolvedValueOnce(baseArticle)
      .mockResolvedValueOnce({ ...baseArticle, isPublished: true })

    publishArticleMock.mockResolvedValue(undefined)

    renderWithRouter(
      [{ path: '/pesquisas/:id', element: <ArticlePage /> }],
      ['/pesquisas/article-1'],
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Publicar/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Publicar/i }))

    await waitFor(() => {
      expect(screen.getByText('Publicado')).toBeInTheDocument()
    })

    expect(publishArticleMock).toHaveBeenCalledWith('article-1', 'token-123')
  })

  it('unpublishes the article when clicking Despublicar', async () => {
    const user = userEvent.setup()
    const publishedArticle = { ...baseArticle, isPublished: true }

    getArticleMock
      .mockResolvedValueOnce(publishedArticle)
      .mockResolvedValueOnce({ ...publishedArticle, isPublished: false })

    unpublishArticleMock.mockResolvedValue(undefined)

    renderWithRouter(
      [{ path: '/pesquisas/:id', element: <ArticlePage /> }],
      ['/pesquisas/article-1'],
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Despublicar/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Despublicar/i }))

    await waitFor(() => {
      expect(screen.getByText('Rascunho')).toBeInTheDocument()
    })

    expect(unpublishArticleMock).toHaveBeenCalledWith('article-1', 'token-123')
  })

  it('deletes the article and navigates to /pesquisas', async () => {
    const user = userEvent.setup()

    getArticleMock.mockResolvedValue(baseArticle)
    deleteArticleMock.mockResolvedValue(undefined)

    renderWithRouter(
      [
        { path: '/pesquisas/:id', element: <ArticlePage /> },
        { path: '/pesquisas', element: <div>Lista de artigos</div> },
      ],
      ['/pesquisas/article-1'],
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Excluir/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Excluir/i }))

    await waitFor(() => {
      expect(screen.getByText('Lista de artigos')).toBeInTheDocument()
    })

    expect(deleteArticleMock).toHaveBeenCalledWith('article-1', 'token-123')
  })

  it('opens the edit dialog and updates the article', async () => {
    const user = userEvent.setup()

    const updatedArticle = {
      ...baseArticle,
      title: 'Titulo atualizado',
      content: 'Conteudo completo do artigo.',
    }

    getArticleMock.mockResolvedValue(baseArticle)
    updateArticleMock.mockResolvedValue(updatedArticle)

    renderWithRouter(
      [{ path: '/pesquisas/:id', element: <ArticlePage /> }],
      ['/pesquisas/article-1'],
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Editar/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Editar/i }))

    expect(screen.getByText('Ajuste seu conteudo')).toBeInTheDocument()

    const titleInput = screen.getByDisplayValue('Desenvolvimento infantil')
    await user.clear(titleInput)
    await user.type(titleInput, 'Titulo atualizado')

    await user.click(screen.getByRole('button', { name: /Salvar alteracoes/i }))

    await waitFor(() => {
      expect(screen.queryByText('Ajuste seu conteudo')).not.toBeInTheDocument()
    })

    expect(updateArticleMock).toHaveBeenCalledWith(
      'article-1',
      expect.objectContaining({ title: 'Titulo atualizado' }),
      'token-123',
    )

    expect(screen.getByText('Titulo atualizado')).toBeInTheDocument()
  })

  it('closes the edit dialog when clicking Fechar', async () => {
    const user = userEvent.setup()

    getArticleMock.mockResolvedValue(baseArticle)

    renderWithRouter(
      [{ path: '/pesquisas/:id', element: <ArticlePage /> }],
      ['/pesquisas/article-1'],
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Editar/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Editar/i }))
    expect(screen.getByText('Ajuste seu conteudo')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Fechar/i }))
    expect(screen.queryByText('Ajuste seu conteudo')).not.toBeInTheDocument()
  })

  it('shows an error when publish fails', async () => {
    const user = userEvent.setup()

    getArticleMock.mockResolvedValue(baseArticle)
    publishArticleMock.mockRejectedValue(new Error('Erro ao publicar'))

    renderWithRouter(
      [{ path: '/pesquisas/:id', element: <ArticlePage /> }],
      ['/pesquisas/article-1'],
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Publicar/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Publicar/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Nao foi possivel atualizar a publicacao.'),
      ).toBeInTheDocument()
    })
  })

  it('shows an error when delete fails', async () => {
    const user = userEvent.setup()

    getArticleMock.mockResolvedValue(baseArticle)
    deleteArticleMock.mockRejectedValue(new Error('Erro ao deletar'))

    renderWithRouter(
      [{ path: '/pesquisas/:id', element: <ArticlePage /> }],
      ['/pesquisas/article-1'],
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Excluir/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Excluir/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Nao foi possivel remover o artigo.'),
      ).toBeInTheDocument()
    })
  })
})