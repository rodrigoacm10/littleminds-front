import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ForumPage } from './ForumPage'
import { renderWithRouter } from '../test/renderWithRouter'

const { listForumPostsMock, createForumPostMock } = vi.hoisted(() => ({
  listForumPostsMock: vi.fn(),
  createForumPostMock: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    token: 'token-123',
  }),
}))

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api')

  return {
    ...actual,
    listForumPosts: listForumPostsMock,
    createForumPost: createForumPostMock,
  }
})

describe('ForumPage integration', () => {
  beforeEach(() => {
    listForumPostsMock.mockReset()
    createForumPostMock.mockReset()
  })

  it('loads and renders forum posts', async () => {
    listForumPostsMock.mockResolvedValue([
      {
        id: 'post-1',
        title: 'Rotina escolar',
        content: 'Como organizar os estudos em casa?',
        authorId: 'user-1',
        ageGroup: 'CHILD',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ])

    renderWithRouter([{ path: '/forum', element: <ForumPage /> }], ['/forum'])

    expect(screen.getByText(/Carregando posts/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Rotina escolar')).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /Abrir post/i })).toHaveAttribute(
      'href',
      '/forum/post-1',
    )
  })

  it('creates a new post and prepends it to the list', async () => {
    const user = userEvent.setup()

    listForumPostsMock.mockResolvedValue([])
    createForumPostMock.mockResolvedValue({
      id: 'post-2',
      title: 'Sono',
      content: 'Meu filho acorda de madrugada.',
      authorId: 'user-1',
      ageGroup: 'BABY',
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    })

    renderWithRouter([{ path: '/forum', element: <ForumPage /> }], ['/forum'])

    await waitFor(() => {
      expect(screen.getByText(/Nenhum post publicado ainda/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Criar novo post/i }))
    await user.type(
      screen.getByPlaceholderText('Ex: Dificuldades com rotina de estudo'),
      'Sono',
    )
    await user.selectOptions(screen.getByRole('combobox'), 'BABY')
    await user.type(
      screen.getByPlaceholderText('Descreva o contexto da sua duvida...'),
      'Meu filho acorda de madrugada.',
    )
    await user.click(screen.getByRole('button', { name: /Publicar post/i }))

    await waitFor(() => {
      expect(screen.getByText('Meu filho acorda de madrugada.')).toBeInTheDocument()
    })

    expect(createForumPostMock).toHaveBeenCalledWith(
      {
        title: 'Sono',
        content: 'Meu filho acorda de madrugada.',
        ageGroup: 'BABY',
      },
      'token-123',
    )
  })
})
