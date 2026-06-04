import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createComment,
  createForumPost,
  getMe,
  listArticles,
  listConversations,
  login,
  publishArticle,
  register,
} from "./api";

const fetchMock = vi.fn();

describe("api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("sends login payload with json headers", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          accessToken: "token-123",
          user: {
            id: "u1",
            name: "Ana",
            email: "ana@littleminds.com",
            role: "PARENT",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        },
      }),
    });

    const response = await login({
      email: "ana@littleminds.com",
      password: "Senha123",
    });

    expect(response.accessToken).toBe("token-123");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://littleminds.onrender.com/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "ana@littleminds.com",
          password: "Senha123",
        }),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("adds authorization header when loading the current user", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: "u1",
          name: "Ana",
          email: "ana@littleminds.com",
          role: "PARENT",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      }),
    });

    await getMe("token-123");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://littleminds.onrender.com/auth/me",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
        }),
      }),
    );
  });

  it("builds article filter query params", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        articles: [],
      }),
    });

    await listArticles({
      ageGroup: "CHILD",
      authorId: "specialist-1",
      published: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://littleminds.onrender.com/articles?ageGroup=CHILD&authorId=specialist-1&published=true",
      expect.any(Object),
    );
  });

  it("throws mapped api errors for known codes", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: "INVALID_CREDENTIALS",
      }),
    });

    await expect(
      login({
        email: "ana@littleminds.com",
        password: "Senha123",
      }),
    ).rejects.toMatchObject({
      message: "Email ou senha invalidos.",
      code: "INVALID_CREDENTIALS",
    });
  });

  it("throws when the api response does not include data", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
      }),
    });

    await expect(
      login({
        email: "ana@littleminds.com",
        password: "Senha123",
      }),
    ).rejects.toMatchObject({
      message: "Resposta sem dados retornados pela API.",
    });
  });

  it("returns raw payload responses for publish endpoints", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        article: {
          id: "article-1",
          title: "Guia",
          isPublished: true,
          publishedAt: "2026-01-01T00:00:00.000Z",
        },
      }),
    });

    const response = await publishArticle("article-1", "token-123");

    expect(response.article.isPublished).toBe(true);
  });

  it("envia payload de registro com método POST", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: "u2",
          name: "Carlos",
          email: "carlos@teste.com",
          role: "PARENT",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      }),
    });

    const user = await register({
      name: "Carlos",
      email: "carlos@teste.com",
      password: "Senha123",
    });

    expect(user.name).toBe("Carlos");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://littleminds.onrender.com/auth/register",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Carlos",
          email: "carlos@teste.com",
          password: "Senha123",
        }),
      }),
    );
  });

  it("cria um post no fórum enviando token de autorização", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        post: {
          id: "p1",
          title: "Meu post",
          content: "Conteudo",
          authorId: "u1",
          ageGroup: "CHILD",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      }),
    });

    const post = await createForumPost(
      { title: "Meu post", content: "Conteudo", ageGroup: "CHILD" },
      "token-123",
    );

    expect(post.title).toBe("Meu post");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://littleminds.onrender.com/forum-posts",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer token-123" }),
      }),
    );
  });

  it("lista conversas passando token e retorna array", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        conversations: [
          {
            id: "c1",
            userId: "u1",
            title: "Conversa 1",
            isArchived: false,
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      }),
    });

    const conversations = await listConversations("token-123");

    expect(conversations).toHaveLength(1);
    expect(conversations[0].title).toBe("Conversa 1");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://littleminds.onrender.com/conversations",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token-123" }),
      }),
    );
  });

  it("cria um comentário e retorna o objeto criado", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        comment: {
          id: "cm1",
          content: "Otimo post!",
          postId: "p1",
          authorId: "u1",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      }),
    });

    const comment = await createComment(
      { content: "Otimo post!", postId: "p1" },
      "token-123",
    );

    expect(comment.content).toBe("Otimo post!");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://littleminds.onrender.com/comments",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
