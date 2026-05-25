import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChatWindow } from './ChatWindow'

describe('ChatWindow', () => {
  it('shows loading state', () => {
    render(
      <ChatWindow
        conversation={null}
        loadingConversation
        messageDraft=""
        sendingMessage={false}
        onDraftChange={vi.fn()}
        onSendMessage={vi.fn()}
      />,
    )

    expect(screen.getByText(/Carregando conversa/i)).toBeInTheDocument()
  })

  it('shows onboarding state when no conversation is selected', () => {
    render(
      <ChatWindow
        conversation={null}
        loadingConversation={false}
        messageDraft=""
        sendingMessage={false}
        onDraftChange={vi.fn()}
        onSendMessage={vi.fn()}
      />,
    )

    expect(
      screen.getByText(/Abra uma conversa com contexto desde o primeiro passo/i),
    ).toBeInTheDocument()
  })

  it('renders messages and triggers send callback', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const onSendMessage = vi.fn()

    render(
      <ChatWindow
        conversation={{
          id: 'c1',
          userId: 'u1',
          title: 'Sono infantil',
          isArchived: false,
          createdAt: '2026-01-01T00:00:00.000Z',
          messages: [
            {
              id: 'm1',
              conversationId: 'c1',
              role: 'user',
              content: 'Meu filho dorme tarde.',
              isDeleted: false,
              createdAt: '2026-01-01T00:00:00.000Z',
            },
            {
              id: 'm2',
              conversationId: 'c1',
              role: 'assistant',
              content: 'Vamos pensar em uma rotina.',
              isDeleted: false,
              createdAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        }}
        loadingConversation={false}
        messageDraft="Nova mensagem"
        sendingMessage={false}
        onDraftChange={onDraftChange}
        onSendMessage={onSendMessage}
      />,
    )

    await user.type(screen.getByPlaceholderText(/Escreva sua pergunta para a IA/i), '!')
    await user.click(screen.getByRole('button', { name: /Enviar mensagem/i }))

    expect(screen.getByText('Meu filho dorme tarde.')).toBeInTheDocument()
    expect(screen.getByText('Vamos pensar em uma rotina.')).toBeInTheDocument()
    expect(onDraftChange).toHaveBeenCalled()
    expect(onSendMessage).toHaveBeenCalledTimes(1)
  })
})
