import { expect, test, type Page, type Route } from '@playwright/test'

type Role = 'PARENT' | 'SPECIALIST'

type AuthUser = {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

type ConversationMessage = {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  isDeleted: boolean
  createdAt: string
}

type Conversation = {
  id: string
  userId: string
  title: string
  isArchived: boolean
  createdAt: string
}

type ConversationDetail = Conversation & {
  messages: ConversationMessage[]
}

type ForumPost = {
  id: string
  title: string
  content: string
  authorId: string
  ageGroup: 'BABY' | 'CHILD' | 'TODDLER' | null
  createdAt: string
  updatedAt: string
}

type Comment = {
  id: string
  content: string
  postId: string
  authorId: string
  createdAt: string
  updatedAt: string
}

type Article = {
  id: string
  title: string
  summary: string | null
  content: string
  coverImage: string | null
  isPublished: boolean
  ageGroup: 'CHILD' | 'TODDLER' | null
  authorId: string
  createdAt: string
  updatedAt: string
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

async function mockApp(page: Page, role: Role = 'PARENT') {
  const user: AuthUser = {
    id: role === 'SPECIALIST' ? 'specialist-1' : 'parent-1',
    name: role === 'SPECIALIST' ? 'Dra. Ana' : 'Ana Silva',
    email: role === 'SPECIALIST' ? 'ana@littleminds.com' : 'ana@familia.com',
    role,
    createdAt: '2026-01-01T00:00:00.000Z',
  }

  const token = `${role.toLowerCase()}-token`

  const conversations: ConversationDetail[] = [
    {
      id: 'conv-1',
      userId: user.id,
      title: 'Sono infantil',
      isArchived: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      messages: [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          role: 'assistant',
          content: 'Como posso ajudar hoje?',
          isDeleted: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    },
  ]

  const posts: ForumPost[] = [
    {
      id: 'post-1',
      title: 'Rotina escolar',
      content: 'Como organizar o estudo em casa?',
      authorId: user.id,
      ageGroup: 'CHILD',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]

  const commentsByPost = new Map<string, Comment[]>([
    [
      'post-1',
      [
        {
          id: 'comment-1',
          content: 'Aqui em casa funcionou criar uma rotina visual.',
          postId: 'post-1',
          authorId: 'reader-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    ],
  ])

  const supportState = new Map<string, { total: number; supported: boolean }>([
    ['post-1', { total: 1, supported: false }],
  ])

  const articles: Article[] = [
    {
      id: 'article-1',
      title: 'Brincadeiras sensoriais',
      summary: 'Ideias para o dia a dia.',
      content: 'Conteudo inicial do artigo.',
      coverImage: null,
      isPublished: false,
      ageGroup: 'TODDLER',
      authorId: user.id,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]

  await page.route('https://littleminds.onrender.com/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const method = request.method()
    const body = request.postDataJSON?.()

    if (path === '/auth/login' && method === 'POST') {
      return json(route, {
        success: true,
        data: {
          accessToken: token,
          user,
        },
      })
    }

    if (path === '/auth/register' && method === 'POST') {
      return json(route, {
        success: true,
        data: {
          ...user,
          email: typeof body?.email === 'string' ? body.email : user.email,
          name: typeof body?.name === 'string' ? body.name : user.name,
        },
      })
    }

    if (path === '/auth/me' && method === 'GET') {
      return json(route, { success: true, data: user })
    }

    if (path === '/conversations' && method === 'GET') {
      const items = conversations.map(({ messages: _messages, ...conversation }) => conversation)
      return json(route, { success: true, conversations: items })
    }

    if (path === '/conversations' && method === 'POST') {
      const conversation: ConversationDetail = {
        id: `conv-${conversations.length + 1}`,
        userId: user.id,
        title: typeof body?.title === 'string' ? body.title : 'Nova conversa',
        isArchived: false,
        createdAt: '2026-01-02T00:00:00.000Z',
        messages: [],
      }
      conversations.unshift(conversation)
      const { messages: _messages, ...summary } = conversation
      return json(route, { success: true, conversation: summary })
    }

    const conversationMatch = path.match(/^\/conversations\/([^/]+)$/)
    if (conversationMatch && method === 'GET') {
      const conversation = conversations.find((item) => item.id === conversationMatch[1])
      return json(route, { success: true, conversation })
    }

    const conversationChatMatch = path.match(/^\/conversations\/([^/]+)\/chat$/)
    if (conversationChatMatch && method === 'POST') {
      const conversation = conversations.find((item) => item.id === conversationChatMatch[1])
      if (!conversation) {
        return json(route, { success: false, error: 'NOT_FOUND' }, 404)
      }

      const userMessage: ConversationMessage = {
        id: `msg-${conversation.messages.length + 1}`,
        conversationId: conversation.id,
        role: 'user',
        content: typeof body?.content === 'string' ? body.content : '',
        isDeleted: false,
        createdAt: '2026-01-02T00:00:00.000Z',
      }
      const assistantMessage: ConversationMessage = {
        id: `msg-${conversation.messages.length + 2}`,
        conversationId: conversation.id,
        role: 'assistant',
        content: 'Vamos montar um plano simples para isso.',
        isDeleted: false,
        createdAt: '2026-01-02T00:00:01.000Z',
      }
      conversation.messages.push(userMessage, assistantMessage)
      return json(route, { success: true, userMessage, assistantMessage })
    }

    if (path === '/forum-posts' && method === 'GET') {
      return json(route, { success: true, posts })
    }

    if (path === '/forum-posts' && method === 'POST') {
      const post: ForumPost = {
        id: `post-${posts.length + 1}`,
        title: typeof body?.title === 'string' ? body.title : 'Novo post',
        content: typeof body?.content === 'string' ? body.content : '',
        authorId: user.id,
        ageGroup: (body?.ageGroup as ForumPost['ageGroup']) ?? null,
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      }
      posts.unshift(post)
      commentsByPost.set(post.id, [])
      supportState.set(post.id, { total: 0, supported: false })
      return json(route, { success: true, post })
    }

    const forumPostMatch = path.match(/^\/forum-posts\/([^/]+)$/)
    if (forumPostMatch && method === 'GET') {
      const post = posts.find((item) => item.id === forumPostMatch[1])
      return json(route, { success: true, post })
    }

    if (path === '/comments' && method === 'GET') {
      const postId = url.searchParams.get('postId') ?? ''
      return json(route, { success: true, comments: commentsByPost.get(postId) ?? [] })
    }

    if (path === '/comments' && method === 'POST') {
      const postId = typeof body?.postId === 'string' ? body.postId : ''
      const comment: Comment = {
        id: `comment-${(commentsByPost.get(postId)?.length ?? 0) + 1}`,
        content: typeof body?.content === 'string' ? body.content : '',
        postId,
        authorId: user.id,
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      }
      commentsByPost.set(postId, [...(commentsByPost.get(postId) ?? []), comment])
      return json(route, { success: true, comment })
    }

    if (path === '/post-supports' && method === 'GET') {
      const postId = url.searchParams.get('postId') ?? ''
      const current = supportState.get(postId) ?? { total: 0, supported: false }
      return json(route, {
        success: true,
        supports: Array.from({ length: current.total }, (_, index) => ({
          id: `support-${index + 1}`,
          userId: `user-${index + 1}`,
          postId,
          createdAt: '2026-01-01T00:00:00.000Z',
        })),
        total: current.total,
      })
    }

    if (path === '/post-supports/check' && method === 'GET') {
      const postId = url.searchParams.get('postId') ?? ''
      const current = supportState.get(postId) ?? { total: 0, supported: false }
      return json(route, {
        success: true,
        hasSupported: current.supported,
        totalSupports: current.total,
      })
    }

    if (path === '/post-supports' && method === 'POST') {
      const postId = typeof body?.postId === 'string' ? body.postId : ''
      const current = supportState.get(postId) ?? { total: 0, supported: false }
      const next = { total: current.total + 1, supported: true }
      supportState.set(postId, next)
      return json(route, {
        success: true,
        support: {
          id: `support-${next.total}`,
          userId: user.id,
          postId,
          createdAt: '2026-01-02T00:00:00.000Z',
        },
      })
    }

    if (path === '/post-supports' && method === 'DELETE') {
      const postId = url.searchParams.get('postId') ?? ''
      const current = supportState.get(postId) ?? { total: 0, supported: false }
      supportState.set(postId, {
        total: Math.max(0, current.total - 1),
        supported: false,
      })
      return json(route, { success: true })
    }

    if (path === '/articles' && method === 'GET') {
      return json(route, { success: true, articles })
    }

    if (path === '/articles' && method === 'POST') {
      const article: Article = {
        id: `article-${articles.length + 1}`,
        title: typeof body?.title === 'string' ? body.title : 'Novo artigo',
        summary: typeof body?.summary === 'string' ? body.summary : null,
        content: typeof body?.content === 'string' ? body.content : '',
        coverImage: typeof body?.coverImage === 'string' ? body.coverImage : null,
        isPublished: false,
        ageGroup: (body?.ageGroup as Article['ageGroup']) ?? null,
        authorId: user.id,
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      }
      articles.unshift(article)
      return json(route, { success: true, article })
    }

    const articleMatch = path.match(/^\/articles\/([^/]+)$/)
    if (articleMatch && method === 'GET') {
      const article = articles.find((item) => item.id === articleMatch[1])
      return json(route, { success: true, article })
    }

    if (articleMatch && method === 'PUT') {
      const article = articles.find((item) => item.id === articleMatch[1])
      if (!article) {
        return json(route, { success: false, error: 'NOT_FOUND' }, 404)
      }
      Object.assign(article, {
        title: typeof body?.title === 'string' ? body.title : article.title,
        summary:
          typeof body?.summary === 'string' || body?.summary === null
            ? body.summary
            : article.summary,
        content: typeof body?.content === 'string' ? body.content : article.content,
        coverImage:
          typeof body?.coverImage === 'string' || body?.coverImage === null
            ? body.coverImage
            : article.coverImage,
        ageGroup: body?.ageGroup ?? article.ageGroup,
        updatedAt: '2026-01-03T00:00:00.000Z',
      })
      return json(route, { success: true, article })
    }

    const articlePublishMatch = path.match(/^\/articles\/([^/]+)\/publish$/)
    if (articlePublishMatch && method === 'POST') {
      const article = articles.find((item) => item.id === articlePublishMatch[1])
      if (article) {
        article.isPublished = true
      }
      return json(route, {
        success: true,
        article: {
          id: article?.id,
          title: article?.title,
          isPublished: true,
          publishedAt: '2026-01-03T00:00:00.000Z',
        },
      })
    }

    const articleUnpublishMatch = path.match(/^\/articles\/([^/]+)\/unpublish$/)
    if (articleUnpublishMatch && method === 'POST') {
      const article = articles.find((item) => item.id === articleUnpublishMatch[1])
      if (article) {
        article.isPublished = false
      }
      return json(route, { success: true })
    }

    if (articleMatch && method === 'DELETE') {
      const index = articles.findIndex((item) => item.id === articleMatch[1])
      if (index >= 0) {
        articles.splice(index, 1)
      }
      return json(route, { success: true })
    }

    return json(route, { success: false, error: 'NOT_IMPLEMENTED' }, 501)
  })
}

async function login(page: Page, email: string) {
  await page.goto('/login')
  await page.getByPlaceholder('voce@exemplo.com').fill(email)
  await page.getByPlaceholder('Digite sua senha').fill('Senha123')
  await page.getByRole('button', { name: 'Entrar agora' }).click()
}

test('parent can login, create a conversation and send a message', async ({ page }) => {
  await mockApp(page, 'PARENT')

  await login(page, 'ana@familia.com')

  await expect(page.getByRole('heading', { name: 'Sono infantil' })).toBeVisible()
  await expect(page.getByText('Como posso ajudar hoje?')).toBeVisible()

  await page.getByPlaceholder('Ex: Sono e rotina do meu filho').fill('Rotina do sono')
  await page.getByRole('button', { name: 'Criar conversa' }).click()

  await expect(page.getByRole('heading', { name: 'Rotina do sono' })).toBeVisible()

  await page.getByPlaceholder('Escreva sua pergunta para a IA...').fill('Como organizar o sono?')
  await page.getByRole('button', { name: 'Enviar mensagem' }).click()

  await expect(page.getByText('Como organizar o sono?')).toBeVisible()
  await expect(page.getByText('Vamos montar um plano simples para isso.')).toBeVisible()
})

test('parent can create a forum post, comment and support it', async ({ page }) => {
  await mockApp(page, 'PARENT')

  await login(page, 'ana@familia.com')
  await page.getByRole('link', { name: 'Forum' }).click()

  await expect(page.getByRole('heading', { name: 'Posts recentes do forum' })).toBeVisible()
  await page.getByRole('button', { name: 'Criar novo post' }).click()
  await page.getByPlaceholder('Ex: Dificuldades com rotina de estudo').fill('Sono na madrugada')
  await page.getByRole('combobox').selectOption('BABY')
  await page.getByPlaceholder('Descreva o contexto da sua duvida...').fill(
    'Meu filho acorda duas vezes por noite.',
  )
  await page.getByRole('button', { name: 'Publicar post' }).click()

  await expect(page.getByText('Meu filho acorda duas vezes por noite.')).toBeVisible()

  await page.getByRole('link', { name: 'Abrir post' }).first().click()

  await expect(page.getByRole('heading', { name: 'Sono na madrugada' })).toBeVisible()
  await page.getByRole('button', { name: 'Apoiar post (0)' }).click()
  await expect(page.getByRole('button', { name: 'Apoiando (1)' })).toBeVisible()

  await page.getByPlaceholder('Escreva um comentario para esse post...').fill(
    'Vamos testar uma rotina mais previsivel antes de dormir.',
  )
  await page.getByRole('button', { name: 'Enviar comentario' }).click()

  await expect(
    page.getByText('Vamos testar uma rotina mais previsivel antes de dormir.'),
  ).toBeVisible()
})

test('specialist can create, edit and publish an article', async ({ page }) => {
  await mockApp(page, 'SPECIALIST')

  await login(page, 'ana@littleminds.com')
  await page.getByRole('link', { name: 'Pesquisas' }).click()

  await expect(page.getByRole('heading', { name: 'Biblioteca de artigos' })).toBeVisible()
  await page.getByRole('button', { name: 'Criar artigo' }).click()
  await page.getByLabel('Titulo').fill('Linguagem no dia a dia')
  await page.getByLabel('Resumo').fill('Ideias para estimular a comunicacao.')
  await page.getByRole('combobox').selectOption('CHILD')
  await page.getByLabel('Conteudo').fill('Use brincadeiras guiadas e repeticao com afeto.')
  await page.getByRole('button', { name: 'Criar artigo' }).nth(1).click()

  await expect(page.getByText('Linguagem no dia a dia')).toBeVisible()
  await page.getByRole('link', { name: 'Ler artigo' }).first().click()

  await expect(page.getByRole('heading', { name: 'Linguagem no dia a dia' })).toBeVisible()
  await page.getByRole('button', { name: 'Editar' }).click()
  await page.getByLabel('Resumo').fill('Ideias praticas para estimular a comunicacao em casa.')
  await page.getByRole('button', { name: 'Salvar alteracoes' }).click()

  await expect(
    page.getByText('Ideias praticas para estimular a comunicacao em casa.'),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page.getByText('Publicado')).toBeVisible()
})
