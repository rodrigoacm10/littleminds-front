import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ResearchPage } from './ResearchPage'
import { renderWithRouter } from '../test/renderWithRouter'

const { listArticlesMock, createArticleMock } = vi.hoisted(() => ({
  listArticlesMock: vi.fn(),
  createArticleMock: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    token: 'token-123',
    user: {
      id: 'specialist-1',
      name: 'Dra. Ana',
      email: 'ana@littleminds.com',
      role: 'SPECIALIST',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  }),
}))

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api')

  return {
    ...actual,
    listArticles: listArticlesMock,
    createArticle: createArticleMock,
  }
})

describe('ResearchPage integration', () => {
  beforeEach(() => {
    listArticlesMock.mockReset()
    createArticleMock.mockReset()
  })

  it('renders loaded articles', async () => {
    listArticlesMock.mockResolvedValue([
      {
        id: 'article-1',
        title: 'Brincadeiras sensoriais',
        summary: 'Ideias para o dia a dia.',
        content: 'Conteudo completo',
        coverImage: null,
        isPublished: true,
        ageGroup: 'TODDLER',
        authorId: 'specialist-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ])

    renderWithRouter([{ path: '/pesquisas', element: <ResearchPage /> }], ['/pesquisas'])

    await waitFor(() => {
      expect(screen.getByText('Brincadeiras sensoriais')).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /Ler artigo/i })).toHaveAttribute(
      'href',
      '/pesquisas/article-1',
    )
  })

  it('creates articles for specialist users', async () => {
    const user = userEvent.setup()

    listArticlesMock.mockResolvedValue([])
    createArticleMock.mockResolvedValue({
      id: 'article-2',
      title: 'Linguagem',
      summary: 'Apoio ao desenvolvimento',
      content: 'Conteudo detalhado',
      coverImage: null,
      isPublished: false,
      ageGroup: 'CHILD',
      authorId: 'specialist-1',
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    })

    renderWithRouter([{ path: '/pesquisas', element: <ResearchPage /> }], ['/pesquisas'])

    await waitFor(() => {
      expect(screen.getByText(/Nenhum artigo encontrado ainda/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Criar artigo/i }))
    await user.type(screen.getByLabelText(/Titulo/i), 'Linguagem')
    await user.type(screen.getByLabelText(/Resumo/i), 'Apoio ao desenvolvimento')
    await user.selectOptions(screen.getByRole('combobox'), 'CHILD')
    await user.type(screen.getByLabelText(/Conteudo/i), 'Conteudo detalhado')
    await user.click(screen.getAllByRole('button', { name: /^Criar artigo$/i })[1])

    await waitFor(() => {
      expect(screen.getByText('Linguagem')).toBeInTheDocument()
    })

    expect(createArticleMock).toHaveBeenCalledWith(
      {
        title: 'Linguagem',
        summary: 'Apoio ao desenvolvimento',
        content: 'Conteudo detalhado',
        coverImage: undefined,
        ageGroup: 'CHILD',
      },
      'token-123',
    )
  })
})
