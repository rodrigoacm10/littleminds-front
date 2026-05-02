import type { ConversationDetail } from '../lib/api'

interface ChatWindowProps {
  conversation: ConversationDetail | null
  loadingConversation: boolean
  messageDraft: string
  sendingMessage: boolean
  onDraftChange: (value: string) => void
  onSendMessage: () => void | Promise<void>
}

export function ChatWindow({
  conversation,
  loadingConversation,
  messageDraft,
  sendingMessage,
  onDraftChange,
  onSendMessage,
}: ChatWindowProps) {
  if (loadingConversation) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center rounded-[2rem] border border-[#d7b59a]/45 bg-white/70 p-8 text-[#7f5438] shadow-[0_20px_45px_rgba(105,59,28,0.08)]">
        Carregando conversa...
      </section>
    )
  }

  if (!conversation) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center rounded-[2rem] border border-[#d7b59a]/45 bg-white/70 p-8 text-center shadow-[0_20px_45px_rgba(105,59,28,0.08)]">
        <div className="max-w-xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b06f45]">
            Assistente IA
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#3f210f]">
            Abra uma conversa com contexto desde o primeiro passo
          </h1>
          <p className="leading-7 text-[#7f5438]">
            Diga um titulo na lateral para criar uma trilha. Depois disso, envie suas
            perguntas e acompanhe todo o historico no mesmo lugar.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex min-h-[70vh] flex-col rounded-[2rem] border border-[#d7b59a]/45 bg-white/72 shadow-[0_20px_45px_rgba(105,59,28,0.08)]">
      <div className="border-b border-[#e4c8b2]/60 px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b06f45]">
          Conversa ativa
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#3f210f]">
          {conversation.title}
        </h1>
      </div>

      <div className="flex-1 space-y-4 overflow-auto px-6 py-6">
        {conversation.messages.length === 0 ? (
          <div className="rounded-[1.4rem] border border-dashed border-[#d8b79f]/70 bg-[#fff8f1] p-5 text-sm leading-6 text-[#83563a]">
            Essa conversa foi criada agora. Envie sua primeira mensagem para comecar a
            interacao com a IA.
          </div>
        ) : (
          conversation.messages.map((message) => {
            const assistant = message.role === 'assistant'

            return (
              <article
                key={message.id}
                className={[
                  'max-w-[85%] rounded-[1.5rem] px-4 py-3 leading-7 shadow-sm',
                  assistant
                    ? 'mr-auto bg-[#f8ecdf] text-[#4d2813]'
                    : 'ml-auto bg-[#4d2813] text-[#fff6ee]',
                ].join(' ')}
              >
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] opacity-70">
                  {assistant ? 'IA' : 'Voce'}
                </p>
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </article>
            )
          })
        )}
      </div>

      <div className="border-t border-[#e4c8b2]/60 px-6 py-5">
        <div className="grid gap-3">
          <textarea
            value={messageDraft}
            onChange={(event) => onDraftChange(event.target.value)}
            rows={4}
            placeholder="Escreva sua pergunta para a IA..."
            className="w-full resize-none rounded-[1.5rem] border border-[#d8b79f]/70 bg-[#fffdfa] px-4 py-4 text-sm text-[#3f210f] outline-none transition focus:border-[#c26c42] focus:shadow-[0_0_0_4px_rgba(194,108,66,0.12)]"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onSendMessage}
              disabled={sendingMessage || !messageDraft.trim()}
              className="cursor-pointer rounded-2xl bg-gradient-to-br from-[#ca7c4e] to-[#a85131] px-5 py-3 text-sm font-bold text-[#fff9f5] shadow-[0_16px_30px_rgba(168,81,49,0.18)] transition hover:-translate-y-px disabled:cursor-progress disabled:opacity-60"
            >
              {sendingMessage ? 'Enviando...' : 'Enviar mensagem'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
