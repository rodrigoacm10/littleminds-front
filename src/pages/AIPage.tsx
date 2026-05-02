import { useEffect, useState } from 'react'
import { ChatWindow } from '../components/ChatWindow'
import { ConversationSidebar } from '../components/ConversationSidebar'
import { useAuth } from '../hooks/useAuth'
import {
  ApiError,
  createConversation,
  getConversation,
  listConversations,
  sendConversationMessage,
  type Conversation,
  type ConversationDetail,
} from '../lib/api'

export function AIPage() {
  const { token } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationDetail | null>(null)
  const [newConversationTitle, setNewConversationTitle] = useState('')
  const [messageDraft, setMessageDraft] = useState('')
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [creatingConversation, setCreatingConversation] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      return
    }

    listConversations(token)
      .then((items) => {
        setConversations(items)
        if (items[0]) {
          setSelectedConversationId(items[0].id)
        }
      })
      .catch((error) => {
        setPageError(
          error instanceof ApiError
            ? error.message
            : 'Nao foi possivel carregar as conversas.',
        )
      })
  }, [token])

  useEffect(() => {
    if (!token || !selectedConversationId) {
      setSelectedConversation(null)
      return
    }

    setLoadingConversation(true)
    getConversation(selectedConversationId, token)
      .then((conversation) => {
        setSelectedConversation(conversation)
      })
      .catch((error) => {
        setPageError(
          error instanceof ApiError
            ? error.message
            : 'Nao foi possivel abrir a conversa selecionada.',
        )
      })
      .finally(() => {
        setLoadingConversation(false)
      })
  }, [selectedConversationId, token])

  async function handleCreateConversation() {
    if (!token || !newConversationTitle.trim()) {
      return
    }

    setCreatingConversation(true)
    setPageError(null)

    try {
      const conversation = await createConversation(newConversationTitle.trim(), token)
      setConversations((current) => [conversation, ...current])
      setSelectedConversationId(conversation.id)
      setNewConversationTitle('')
    } catch (error) {
      setPageError(
        error instanceof ApiError
          ? error.message
          : 'Nao foi possivel criar a nova conversa.',
      )
    } finally {
      setCreatingConversation(false)
    }
  }

  async function handleSendMessage() {
    if (!token || !selectedConversationId || !messageDraft.trim()) {
      return
    }

    setSendingMessage(true)
    setPageError(null)

    try {
      await sendConversationMessage(selectedConversationId, messageDraft.trim(), token)
      const refreshedConversation = await getConversation(selectedConversationId, token)
      setSelectedConversation(refreshedConversation)
      setMessageDraft('')
    } catch (error) {
      setPageError(
        error instanceof ApiError
          ? error.message
          : 'Nao foi possivel enviar a mensagem agora.',
      )
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <ConversationSidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        creatingConversation={creatingConversation}
        newConversationTitle={newConversationTitle}
        onTitleChange={setNewConversationTitle}
        onCreateConversation={handleCreateConversation}
      />

      <div className="space-y-4">
        {pageError ? (
          <div className="rounded-[1.5rem] border border-[rgba(192,68,44,0.18)] bg-[#fff1ef] px-5 py-4 text-sm leading-6 text-[#9f2f1e]">
            {pageError}
          </div>
        ) : null}

        <ChatWindow
          conversation={selectedConversation}
          loadingConversation={loadingConversation}
          messageDraft={messageDraft}
          sendingMessage={sendingMessage}
          onDraftChange={setMessageDraft}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
}
