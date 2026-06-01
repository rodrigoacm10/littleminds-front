import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getMe, listArticles, login, publishArticle } from './api'

const fetchMock = vi.fn()

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('sends login payload with json headers', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          accessToken: 'token-123',
          user: {
            id: 'u1',
            name: 'Ana',
            email: 'ana@littleminds.com',
            role: 'PARENT',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        },
      }),
    })

    const response = await login({
      email: 'ana@littleminds.com',
      password: 'Senha123',
    })

    expect(response.accessToken).toBe('token-123')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://littleminds.onrender.com/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'ana@littleminds.com',
          password: 'Senha123',
        }),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    )
  })

  it('adds authorization header when loading the current user', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 'u1',
          name: 'Ana',
          email: 'ana@littleminds.com',
          role: 'PARENT',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      }),
    })

    await getMe('token-123')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://littleminds.onrender.com/auth/me',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
        }),
      }),
    )
  })

  it('builds article filter query params', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        articles: [],
      }),
    })

    await listArticles({
      ageGroup: 'CHILD',
      authorId: 'specialist-1',
      published: true,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://littleminds.onrender.com/articles?ageGroup=CHILD&authorId=specialist-1&published=true',
      expect.any(Object),
    )
  })

  it('throws mapped api errors for known codes', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: 'INVALID_CREDENTIALS',
      }),
    })

    await expect(
      login({
        email: 'ana@littleminds.com',
        password: 'Senha123',
      }),
    ).rejects.toMatchObject({
      message: 'Email ou senha invalidos.',
      code: 'INVALID_CREDENTIALS',
    })
  })

  it('throws when the api response does not include data', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
      }),
    })

    await expect(
      login({
        email: 'ana@littleminds.com',
        password: 'Senha123',
      }),
    ).rejects.toMatchObject({
      message: 'Resposta sem dados retornados pela API.',
    })
  })

  it('returns raw payload responses for publish endpoints', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        article: {
          id: 'article-1',
          title: 'Guia',
          isPublished: true,
          publishedAt: '2026-01-01T00:00:00.000Z',
        },
      }),
    })

    const response = await publishArticle('article-1', 'token-123')

    expect(response.article.isPublished).toBe(true)
  })
})
