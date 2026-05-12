import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import {
  ApiError,
  checkPostSupport,
  createComment,
  createPostSupport,
  deletePostSupport,
  getForumPost,
  listComments,
  listPostSupports,
  type Comment,
  type ForumPost,
} from '../lib/api'

export function ForumPostPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [post, setPost] = useState<ForumPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [supportsCount, setSupportsCount] = useState(0)
  const [supported, setSupported] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sendingComment, setSendingComment] = useState(false)
  const [togglingSupport, setTogglingSupport] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }

    loadPostData(id)
  }, [id, token])

  async function loadPostData(postId: string) {
    setLoading(true)
    setError(null)

    try {
      const [postResponse, commentsResponse, supportsResponse] = await Promise.all([
        getForumPost(postId),
        listComments(postId),
        listPostSupports(postId),
      ])

      setPost(postResponse)
      setComments(commentsResponse)
      setSupportsCount(supportsResponse.length)

      if (token) {
        const supportState = await checkPostSupport(postId, token)
        setSupported(supportState.hasSupported)
        setSupportsCount(supportState.totalSupports)
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Nao foi possivel carregar este post.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateComment() {
    if (!token || !id || !commentDraft.trim()) {
      return
    }

    setSendingComment(true)
    setError(null)

    try {
      const createdComment = await createComment(
        {
          content: commentDraft.trim(),
          postId: id,
        },
        token,
      )

      setComments((current) => [...current, createdComment])
      setCommentDraft('')
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Nao foi possivel enviar o comentario agora.',
      )
    } finally {
      setSendingComment(false)
    }
  }

  async function handleToggleSupport() {
    if (!token || !id) {
      return
    }

    setTogglingSupport(true)
    setError(null)

    try {
      if (supported) {
        await deletePostSupport(id, token)
        setSupported(false)
        setSupportsCount((current) => Math.max(0, current - 1))
      } else {
        await createPostSupport(id, token)
        setSupported(true)
        setSupportsCount((current) => current + 1)
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Nao foi possivel atualizar o apoio.',
      )
    } finally {
      setTogglingSupport(false)
    }
  }

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-[#d7b59a]/45 bg-white/78 p-8 text-[#7f5438] shadow-[0_20px_45px_rgba(105,59,28,0.08)]">
        Carregando post...
      </section>
    )
  }

  if (!post) {
    return (
      <section className="rounded-[2rem] border border-[#d7b59a]/45 bg-white/78 p-8 shadow-[0_20px_45px_rgba(105,59,28,0.08)]">
        <p className="text-sm text-[#7f5438]">Post nao encontrado.</p>
      </section>
    )
  }

  return (
    <div className="space-y-5">
      <Link
        to="/forum"
        className="inline-flex rounded-full border border-[#d7b59a]/70 bg-white/80 px-4 py-2 text-sm font-semibold text-[#7f5438] transition hover:-translate-y-px"
      >
        Voltar para o forum
      </Link>

      {error ? (
        <div className="rounded-[1.5rem] border border-[rgba(192,68,44,0.18)] bg-[#fff1ef] px-5 py-4 text-sm leading-6 text-[#9f2f1e]">
          {error}
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-[#d7b59a]/45 bg-white/78 p-8 shadow-[0_20px_45px_rgba(105,59,28,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b06f45]">
          Discussao
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#3f210f]">
          {post.title}
        </h1>
        <p className="mt-5 whitespace-pre-wrap leading-8 text-[#6f452a]">{post.content}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleToggleSupport}
            disabled={togglingSupport}
            className={[
              'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition',
              supported
                ? 'bg-[#4d2813] text-[#fff7ef]'
                : 'border border-[#d7b59a]/70 bg-white text-[#7f5438]',
            ].join(' ')}
          >
            {togglingSupport
              ? 'Atualizando apoio...'
              : supported
                ? `Apoiando (${supportsCount})`
                : `Apoiar post (${supportsCount})`}
          </button>

          <span className="text-xs uppercase tracking-[0.14em] text-[#ad7b55]">
            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#d7b59a]/45 bg-white/78 p-8 shadow-[0_20px_45px_rgba(105,59,28,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b06f45]">
          Comentarios
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#3f210f]">
          Participe da conversa
        </h2>

        <div className="mt-6 grid gap-3">
          <textarea
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
            rows={4}
            placeholder="Escreva um comentario para esse post..."
            className="resize-none rounded-2xl border border-[#d8b79f]/70 bg-[#fffdfa] px-4 py-3 text-sm text-[#3f210f] outline-none transition focus:border-[#c26c42] focus:shadow-[0_0_0_4px_rgba(194,108,66,0.12)]"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCreateComment}
              disabled={sendingComment || !commentDraft.trim()}
              className="cursor-pointer rounded-2xl bg-gradient-to-br from-[#ca7c4e] to-[#a85131] px-5 py-3 text-sm font-bold text-[#fff9f5] shadow-[0_16px_30px_rgba(168,81,49,0.18)] transition hover:-translate-y-px disabled:cursor-progress disabled:opacity-60"
            >
              {sendingComment ? 'Comentando...' : 'Enviar comentario'}
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {comments.length === 0 ? (
            <div className="rounded-[1.4rem] border border-dashed border-[#d7b59a]/60 bg-[#fff8f1] p-5 text-sm leading-6 text-[#7f5438]">
              Ainda nao existem comentarios. Seja a primeira pessoa a participar.
            </div>
          ) : (
            comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-[1.6rem] border border-[#e4c8b2]/60 bg-[#fffaf6] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#4d2813]">
                    Usuario {comment.authorId.slice(0, 8)}
                  </p>
                  <span className="text-xs uppercase tracking-[0.14em] text-[#ad7b55]">
                    {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#6f452a]">
                  {comment.content}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
