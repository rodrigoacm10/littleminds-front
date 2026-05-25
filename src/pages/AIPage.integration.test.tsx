import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AIPage } from './AIPage'
import { renderWithRouter } from '../test/renderWithRouter'

const {
  listConversationsMock,
  getConversationMock,
  createConversationMock,
  sendConversationMessageMock,
} = vi.hoisted(() => ({
  listConversationsMock: vi.fn(),
  getConversationMock: vi.fn(),
  createConversationMock: vi.fn(),
  sendConversationMessageMock: vi.fn(),
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
    listConversations: listConversationsMock,
    getConversation: getConversationMock,
    createConversation: createConversationMock,
    sendConversationMessage: sendConversationMessageMock,
  }
})

describe('AIPage integration', () => {
  beforeEach(() => {
    listConversationsMock.mockReset()
    getConversationMock.mockReset()
    createConversationMock.mockReset()
    sendConversationMessageMock.mockReset()
  })

  it('loads conversations and opens the selected thread', async () => {
    listConversationsMock.mockResolvedValue([
      {
        id: 'c1',
        userId: 'u1',
        title: 'Sono infantil',
        isArchived: false,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ])
    getConversationMock.mockResolvedValue({
      id: 'c1',
      userId: 'u1',
      title: 'Sono infantil',
      isArchived: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      messages: [
        {
          id: 'm1',
          conversationId: 'c1',
          role: 'assistant',
          content: 'Como posso ajudar?',
          isDeleted: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    })

    renderWithRouter([{ path: '/ia', element: <AIPage /> }], ['/ia'])

    await waitFor(() => {
      expect(screen.getByText('Sono infantil')).toBeInTheDocument()
    })

    expect(await screen.findByText('Como posso ajudar?')).toBeInTheDocument()
  })

  it('creates a conversation and sends a message', async () => {
    const user = userEvent.setup()

    listConversationsMock.mockResolvedValue([])
    createConversationMock.mockResolvedValue({
      id: 'c2',
      userId: 'u1',
      title: 'Rotina',
      isArchived: false,
      createdAt: '2026-01-02T00:00:00.000Z',
    })
    getConversationMock.mockResolvedValue({
      id: 'c2',
      userId: 'u1',
      title: 'Rotina',
      isArchived: false,
      createdAt: '2026-01-02T00:00:00.000Z',
      messages: [
        {
          id: 'm1',
          conversationId: 'c2',
          role: 'user',
          content: 'Como organizar o sono?',
          isDeleted: false,
          createdAt: '2026-01-02T00:00:00.000Z',
        },
      ],
    })
    sendConversationMessageMock.mockResolvedValue({
      success: true,
      userMessage: {},
      assistantMessage: {},
    })

    renderWithRouter([{ path: '/ia', element: <AIPage /> }], ['/ia'])

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma conversa criada ainda/i)).toBeInTheDocument()
    })

    await user.type(
      screen.getByPlaceholderText('Ex: Sono e rotina do meu filho'),
      'Rotina',
    )
    await user.click(screen.getByRole('button', { name: /Criar conversa/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Rotina' })).toBeInTheDocument()
    })

    await user.type(
      screen.getByPlaceholderText('Escreva sua pergunta para a IA...'),
      'Como organizar o sono?',
    )
    await user.click(screen.getByRole('button', { name: /Enviar mensagem/i }))

    await waitFor(() => {
      expect(sendConversationMessageMock).toHaveBeenCalledWith(
        'c2',
        'Como organizar o sono?',
        'token-123',
      )
    })
  })
})
