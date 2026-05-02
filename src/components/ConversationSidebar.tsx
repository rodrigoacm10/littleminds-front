import type { Conversation } from '../lib/api'

interface ConversationSidebarProps {
  conversations: Conversation[]
  selectedConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  creatingConversation: boolean
  newConversationTitle: string
  onTitleChange: (value: string) => void
  onCreateConversation: () => void | Promise<void>
}

export function ConversationSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  creatingConversation,
  newConversationTitle,
  onTitleChange,
  onCreateConversation,
}: ConversationSidebarProps) {
  return (
    <aside className="flex h-full flex-col gap-5 rounded-[2rem] border border-[#d7b59a]/45 bg-[linear-gradient(180deg,rgba(255,251,246,0.95),rgba(250,237,223,0.92))] p-5 shadow-[0_20px_45px_rgba(105,59,28,0.08)]">
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b06f45]">
          Conversas
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#3f210f]">
          Suas trilhas com a IA
        </h2>
      </div>

      <div className="space-y-3 rounded-[1.6rem] border border-[#d8b79f]/55 bg-white/75 p-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-[#5f341a]">Novo titulo</span>
          <input
            value={newConversationTitle}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Ex: Sono e rotina do meu filho"
            className="w-full rounded-2xl border border-[#d8b79f]/70 bg-[#fffdfa] px-4 py-3 text-sm text-[#3f210f] outline-none transition focus:border-[#c26c42] focus:shadow-[0_0_0_4px_rgba(194,108,66,0.12)]"
          />
        </label>

        <button
          type="button"
          onClick={onCreateConversation}
          disabled={creatingConversation || !newConversationTitle.trim()}
          className="w-full cursor-pointer rounded-2xl bg-gradient-to-br from-[#ca7c4e] to-[#a85131] px-4 py-3 text-sm font-bold text-[#fff9f5] shadow-[0_16px_30px_rgba(168,81,49,0.18)] transition hover:-translate-y-px disabled:cursor-progress disabled:opacity-60"
        >
          {creatingConversation ? 'Criando conversa...' : 'Criar conversa'}
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-auto pr-1">
        {conversations.length === 0 ? (
          <div className="rounded-[1.4rem] border border-dashed border-[#d8b79f]/70 bg-white/55 p-4 text-sm leading-6 text-[#83563a]">
            Nenhuma conversa criada ainda. Escolha um titulo e comece sua primeira troca
            com a IA.
          </div>
        ) : (
          conversations.map((conversation) => {
            const active = selectedConversationId === conversation.id

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                className={[
                  'flex w-full cursor-pointer flex-col gap-1 rounded-[1.35rem] border px-4 py-3 text-left transition',
                  active
                    ? 'border-[#7c4a2c]/30 bg-[#4d2813] text-[#fff6ee] shadow-[0_16px_28px_rgba(77,40,19,0.2)]'
                    : 'border-[#d8b79f]/55 bg-white/78 text-[#4a2712] hover:-translate-y-px hover:bg-white',
                ].join(' ')}
              >
                <span className="line-clamp-2 text-sm font-semibold">{conversation.title}</span>
                <span
                  className={[
                    'text-[11px] uppercase tracking-[0.12em]',
                    active ? 'text-[#f2c8aa]' : 'text-[#a36f49]',
                  ].join(' ')}
                >
                  {conversation.isArchived ? 'Arquivada' : 'Ativa'}
                </span>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}
