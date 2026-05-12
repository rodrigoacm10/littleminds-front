import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import {
  ApiError,
  createForumPost,
  listForumPosts,
  type AgeGroup,
  type ForumPost,
} from '../lib/api'

const ageGroupLabels: Record<AgeGroup, string> = {
  PRENATAL: 'Pre-natal',
  BABY: 'Bebe',
  TODDLER: 'Primeira infancia',
  CHILD: 'Infancia',
  TEENAGER: 'Adolescencia',
}

export function ForumPage() {
  const { token } = useAuth()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ageOptions = useMemo(
    () => Object.entries(ageGroupLabels) as Array<[AgeGroup, string]>,
    [],
  )

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    setError(null)

    try {
      const response = await listForumPosts()
      setPosts(response)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Nao foi possivel carregar os posts do forum.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePost() {
    if (!token || !title.trim() || !content.trim()) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const createdPost = await createForumPost(
        {
          title: title.trim(),
          content: content.trim(),
          ageGroup: ageGroup || undefined,
        },
        token,
      )

      setPosts((current) => [createdPost, ...current])
      setTitle('')
      setContent('')
      setAgeGroup('')
      setIsCreateDialogOpen(false)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Nao foi possivel criar o post agora.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-[#d7b59a]/45 bg-white/78 p-6 shadow-[0_20px_45px_rgba(105,59,28,0.08)] md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b06f45]">
              Comunidade
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#3f210f]">
              Posts recentes do forum
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#7f5438]">
              Veja as trocas mais recentes e abra um novo topico quando precisar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateDialogOpen(true)}
            className="cursor-pointer rounded-2xl bg-gradient-to-br from-[#ca7c4e] to-[#a85131] px-5 py-3 text-sm font-bold text-[#fff9f5] shadow-[0_16px_30px_rgba(168,81,49,0.18)] transition hover:-translate-y-px"
          >
            Criar novo post
          </button>
        </div>

        {error ? (
          <div className="rounded-[1.5rem] border border-[rgba(192,68,44,0.18)] bg-[#fff1ef] px-5 py-4 text-sm leading-6 text-[#9f2f1e]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[2rem] border border-[#d7b59a]/45 bg-white/78 p-6 text-[#7f5438] shadow-[0_20px_45px_rgba(105,59,28,0.08)]">
            Carregando posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[#d7b59a]/60 bg-white/70 p-6 text-sm leading-6 text-[#7f5438]">
            Nenhum post publicado ainda. Crie o primeiro da comunidade.
          </div>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="rounded-[2rem] border border-[#d7b59a]/45 bg-white/78 p-6 shadow-[0_20px_45px_rgba(105,59,28,0.08)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                {post.ageGroup ? (
                  <span className="rounded-full bg-[#f6e4d2] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9a643f]">
                    {ageGroupLabels[post.ageGroup]}
                  </span>
                ) : null}
                <span className="text-xs uppercase tracking-[0.14em] text-[#ad7b55]">
                  {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#3f210f]">
                {post.title}
              </h3>
              <p className="mt-3 line-clamp-4 text-sm leading-7 text-[#6f452a]">
                {post.content}
              </p>

              <div className="mt-5">
                <Link
                  to={`/forum/${post.id}`}
                  className="inline-flex rounded-full bg-[#4d2813] px-4 py-2 text-sm font-semibold text-[#fff7ef] transition hover:-translate-y-px"
                >
                  Abrir post
                </Link>
              </div>
            </article>
          ))
        )}
      </div>

      {isCreateDialogOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#2d180d]/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-[#d7b59a]/45 bg-white p-6 shadow-[0_30px_80px_rgba(61,31,15,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b06f45]">
                  Novo post
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#3f210f]">
                  Compartilhe uma pergunta com a comunidade
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#7f5438]">
                  Abra uma discussao para receber trocas de outras familias e especialistas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateDialogOpen(false)}
                className="cursor-pointer rounded-full border border-[#d7b59a]/70 px-3 py-2 text-sm font-semibold text-[#7f5438] transition hover:bg-[#fff5ec]"
              >
                Fechar
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#5f341a]">Titulo</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex: Dificuldades com rotina de estudo"
                  className="rounded-2xl border border-[#d8b79f]/70 bg-[#fffdfa] px-4 py-3 text-sm text-[#3f210f] outline-none transition focus:border-[#c26c42] focus:shadow-[0_0_0_4px_rgba(194,108,66,0.12)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#5f341a]">Faixa etaria</span>
                <select
                  value={ageGroup}
                  onChange={(event) => setAgeGroup(event.target.value as AgeGroup | '')}
                  className="rounded-2xl border border-[#d8b79f]/70 bg-[#fffdfa] px-4 py-3 text-sm text-[#3f210f] outline-none transition focus:border-[#c26c42] focus:shadow-[0_0_0_4px_rgba(194,108,66,0.12)]"
                >
                  <option value="">Sem filtro especifico</option>
                  {ageOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#5f341a]">Conteudo</span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={6}
                  placeholder="Descreva o contexto da sua duvida..."
                  className="resize-none rounded-2xl border border-[#d8b79f]/70 bg-[#fffdfa] px-4 py-3 text-sm text-[#3f210f] outline-none transition focus:border-[#c26c42] focus:shadow-[0_0_0_4px_rgba(194,108,66,0.12)]"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="cursor-pointer rounded-2xl border border-[#d7b59a]/70 px-5 py-3 text-sm font-semibold text-[#7f5438] transition hover:bg-[#fff5ec]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreatePost}
                  disabled={submitting || !title.trim() || !content.trim()}
                  className="cursor-pointer rounded-2xl bg-gradient-to-br from-[#ca7c4e] to-[#a85131] px-5 py-3 text-sm font-bold text-[#fff9f5] shadow-[0_16px_30px_rgba(168,81,49,0.18)] transition hover:-translate-y-px disabled:cursor-progress disabled:opacity-60"
                >
                  {submitting ? 'Publicando...' : 'Publicar post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
