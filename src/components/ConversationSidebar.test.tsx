import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConversationSidebar } from './ConversationSidebar'

describe('ConversationSidebar', () => {
  it('shows empty state when there are no conversations', () => {
    render(
      <ConversationSidebar
        conversations={[]}
        selectedConversationId={null}
        onSelectConversation={vi.fn()}
        creatingConversation={false}
        newConversationTitle=""
        onTitleChange={vi.fn()}
        onCreateConversation={vi.fn()}
      />,
    )

    expect(screen.getByText(/Nenhuma conversa criada ainda/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Criar conversa/i })).toBeDisabled()
  })

  it('creates and selects conversations through callbacks', async () => {
    const user = userEvent.setup()
    const onSelectConversation = vi.fn()
    const onTitleChange = vi.fn()
    const onCreateConversation = vi.fn()

    render(
      <ConversationSidebar
        conversations={[
          {
            id: 'c1',
            userId: 'u1',
            title: 'Sono infantil',
            isArchived: false,
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ]}
        selectedConversationId="c1"
        onSelectConversation={onSelectConversation}
        creatingConversation={false}
        newConversationTitle="Nova conversa"
        onTitleChange={onTitleChange}
        onCreateConversation={onCreateConversation}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Criar conversa/i }))
    await user.click(screen.getByRole('button', { name: /Sono infantil/i }))
    await user.type(screen.getByLabelText(/Novo titulo/i), ' atualizada')

    expect(onCreateConversation).toHaveBeenCalledTimes(1)
    expect(onSelectConversation).toHaveBeenCalledWith('c1')
    expect(onTitleChange).toHaveBeenCalled()
  })
})

