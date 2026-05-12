import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import {
  ApiError,
  deleteArticle,
  getArticle,
  publishArticle,
  unpublishArticle,
  updateArticle,
  type AgeGroup,
  type Article,
} from '../lib/api'

const ageGroupLabels: Record<AgeGroup, string> = {
  PRENATAL: 'Pre-natal',
  BABY: 'Bebe',
  TODDLER: 'Primeira infancia',
  CHILD: 'Infancia',
  TEENAGER: 'Adolescencia',
}

export function ArticlePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('')

  const canManage = Boolean(
    user && article && user.id === article.authorId && (user.role === 'SPECIALIST' || user.role === 'ADMIN'),
  )

  const ageOptions = useMemo(
    () => Object.entries(ageGroupLabels) as Array<[AgeGroup, string]>,
    [],
  )

  useEffect(() => {
    if (!id) {
      return
    }

    loadArticle(id)
  }, [id])

  async function loadArticle(articleId: string) {
    setLoading(true)
    setError(null)

    try {
      const response = await getArticle(articleId)
      setArticle(response)
      setTitle(response.title)
      setSummary(response.summary ?? '')
      setContent(response.content)
      setCoverImage(response.coverImage ?? '')
      setAgeGroup((response.ageGroup as AgeGroup | null) ?? '')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Nao foi possivel carregar o artigo.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handlePublishToggle() {
    if (!token || !article) {
      return
    }

    setBusyAction(article.isPublished ? 'unpublish' : 'publish')
    setError(null)

    try {
      if (article.isPublished) {
        await unpublishArticle(article.id, token)
      } else {
        await publishArticle(article.id, token)
      }

      const refreshed = await getArticle(article.id)
      setArticle(refreshed)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Nao foi possivel atualizar a publicacao.',
      )
    } finally {
      setBusyAction(null)
    }
  }

  async function handleDelete() {
    if (!token || !article) {
      return
    }

    setBusyAction('delete')
    setError(null)

    try {
      await deleteArticle(article.id, token)
      navigate('/pesquisas', { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Nao foi possivel remover o artigo.',
      )
      setBusyAction(null)
    }
  }

  async function handleUpdateArticle() {
    if (!token || !article || !title.trim() || !content.trim()) {
      return
    }

    setBusyAction('update')
    setError(null)

    try {
      const updated = await updateArticle(
        article.id,
        {
          title: title.trim(),
          summary: summary.trim() || null,
          content: content.trim(),
          coverImage: coverImage.trim() || null,
          ageGroup: ageGroup || null,
        },
        token,
      )

      setArticle(updated)
      setIsEditDialogOpen(false)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Nao foi possivel atualizar o artigo.',
      )
    } finally {
      setBusyAction(null)
    }
  }

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-[#d7b59a]/45 bg-white/75 p-8 text-[#7f5438] shadow-[0_20px_45px_rgba(105,59,28,0.08)]">
        Carregando artigo...
      </section>
    )
  }

  if (!article) {
    return (
      <section className="rounded-[2rem] border border-[#d7b59a]/45 bg-white/75 p-8 shadow-[0_20px_45px_rgba(105,59,28,0.08)]">
        <p className="text-sm text-[#7f5438]">Artigo nao encontrado.</p>
      </section>
    )
  }

  return (
    <>
      <div className="space-y-5">
        <Link
          to="/pesquisas"
          className="inline-flex rounded-full border border-[#d7b59a]/70 bg-white/80 px-4 py-2 text-sm font-semibold text-[#7f5438] transition hover:-translate-y-px"
        >
          Voltar para artigos
        </Link>

        {error ? (
          <div className="rounded-[1.5rem] border border-[rgba(192,68,44,0.18)] bg-[#fff1ef] px-5 py-4 text-sm leading-6 text-[#9f2f1e]">
            {error}
          </div>
        ) : null}

        <article className="overflow-hidden rounded-[2rem] border border-[#d7b59a]/45 bg-white/78 shadow-[0_20px_45px_rgba(105,59,28,0.08)]">
          {article.coverImage ? (
            <div
              className="h-64 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${article.coverImage})` }}
            />
          ) : (
            <div className="h-64 w-full bg-[linear-gradient(135deg,#f7dfcf,#fef1dc,#fff8ef)]" />
          )}

          <div className="p-8">
            <div className="flex flex-wrap items-center gap-2">
              {article.ageGroup ? (
                <span className="rounded-full bg-[#f6e4d2] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9a643f]">
                  {ageGroupLabels[article.ageGroup]}
                </span>
              ) : null}
              <span className="text-xs uppercase tracking-[0.14em] text-[#ad7b55]">
                {article.isPublished ? 'Publicado' : 'Rascunho'}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#3f210f]">
              {article.title}
            </h1>

            {article.summary ? (
              <p className="mt-4 text-lg leading-8 text-[#6f452a]">{article.summary}</p>
            ) : null}

            <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-[#52311b]">
              {article.content}
            </div>

            {canManage ? (
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="cursor-pointer rounded-full border border-[#d7b59a]/70 bg-white px-4 py-2 text-sm font-semibold text-[#7f5438] transition hover:-translate-y-px"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={handlePublishToggle}
                  disabled={busyAction === 'publish' || busyAction === 'unpublish'}
                  className="cursor-pointer rounded-full bg-[#4d2813] px-4 py-2 text-sm font-semibold text-[#fff7ef] transition hover:-translate-y-px disabled:opacity-60"
                >
                  {busyAction === 'publish'
                    ? 'Publicando...'
                    : busyAction === 'unpublish'
                      ? 'Despublicando...'
                      : article.isPublished
                        ? 'Despublicar'
                        : 'Publicar'}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busyAction === 'delete'}
                  className="cursor-pointer rounded-full border border-[rgba(192,68,44,0.24)] bg-[#fff1ef] px-4 py-2 text-sm font-semibold text-[#9f2f1e] transition hover:-translate-y-px disabled:opacity-60"
                >
                  {busyAction === 'delete' ? 'Removendo...' : 'Excluir'}
                </button>
              </div>
            ) : null}
          </div>
        </article>
      </div>

      {isEditDialogOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#2d180d]/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[2rem] border border-[#d7b59a]/45 bg-white p-6 shadow-[0_30px_80px_rgba(61,31,15,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b06f45]">
                  Editar artigo
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#3f210f]">
                  Ajuste seu conteudo
                </h1>
              </div>

              <button
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
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
                  className="rounded-2xl border border-[#d8b79f]/70 bg-[#fffdfa] px-4 py-3 text-sm text-[#3f210f] outline-none transition focus:border-[#c26c42] focus:shadow-[0_0_0_4px_rgba(194,108,66,0.12)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#5f341a]">Resumo</span>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  className="resize-none rounded-2xl border border-[#d8b79f]/70 bg-[#fffdfa] px-4 py-3 text-sm text-[#3f210f] outline-none transition focus:border-[#c26c42] focus:shadow-[0_0_0_4px_rgba(194,108,66,0.12)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#5f341a]">Imagem de capa</span>
                <input
                  value={coverImage}
                  onChange={(event) => setCoverImage(event.target.value)}
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
                  rows={8}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="resize-none rounded-2xl border border-[#d8b79f]/70 bg-[#fffdfa] px-4 py-3 text-sm text-[#3f210f] outline-none transition focus:border-[#c26c42] focus:shadow-[0_0_0_4px_rgba(194,108,66,0.12)]"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="cursor-pointer rounded-2xl border border-[#d7b59a]/70 px-5 py-3 text-sm font-semibold text-[#7f5438] transition hover:bg-[#fff5ec]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdateArticle}
                  disabled={busyAction === 'update' || !title.trim() || !content.trim()}
                  className="cursor-pointer rounded-2xl bg-gradient-to-br from-[#ca7c4e] to-[#a85131] px-5 py-3 text-sm font-bold text-[#fff9f5] shadow-[0_16px_30px_rgba(168,81,49,0.18)] transition hover:-translate-y-px disabled:cursor-progress disabled:opacity-60"
                >
                  {busyAction === 'update' ? 'Salvando...' : 'Salvar alteracoes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
