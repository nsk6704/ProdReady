import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { parseRepoUrl, fetchRepoInfo } from "../github"

function mockResponse(status: number, body?: unknown, headers?: Record<string, string>) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    headers: {
      get: (key: string) => headers?.[key] ?? null,
    },
  } as unknown as Response
}

describe("parseRepoUrl", () => {
  it.each([
    ["https://github.com/owner/repo", "owner", "repo"],
    ["https://github.com/owner/repo.git", "owner", "repo"],
    ["https://github.com/owner/repo/", "owner", "repo"],
    ["https://github.com/owner/repo?tab=readme", "owner", "repo"],
    ["https://github.com/owner-name/repo-name", "owner-name", "repo-name"],
  ])("parses %s", (url, owner, name) => {
    expect(parseRepoUrl(url)).toEqual({ owner, name })
  })

  it.each([
    ["not a url"],
    ["https://gitlab.com/owner/repo"],
    [""],
    ["https://github.com/"],
  ])("returns null for %s", (url) => {
    expect(parseRepoUrl(url)).toBeNull()
  })
})

describe("fetchRepoInfo", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns INVALID_URL error for invalid URL", async () => {
    const result = await fetchRepoInfo("not a url")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_URL")
    }
  })

  it("returns RATE_LIMITED error on 403 with X-RateLimit-Remaining: 0", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(403, undefined, { "X-RateLimit-Remaining": "0" })
    )
    const result = await fetchRepoInfo("https://github.com/owner/repo")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("RATE_LIMITED")
      expect(result.error.message).toContain("60 req/hr")
    }
  })

  it("returns FORBIDDEN error on 403 with remaining > 0", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(403, undefined, { "X-RateLimit-Remaining": "42" })
    )
    const result = await fetchRepoInfo("https://github.com/owner/repo")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("FORBIDDEN")
      expect(result.error.message).toContain("private")
    }
  })

  it("returns FORBIDDEN error on 429", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(429, undefined, { "X-RateLimit-Remaining": "42" })
    )
    const result = await fetchRepoInfo("https://github.com/owner/repo")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("FORBIDDEN")
    }
  })

  it("returns NOT_FOUND error on 404", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(404))
    const result = await fetchRepoInfo("https://github.com/owner/repo")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("NOT_FOUND")
    }
  })

  it("returns UNKNOWN error on 500", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(500))
    const result = await fetchRepoInfo("https://github.com/owner/repo")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("UNKNOWN")
    }
  })

  it("fetches repo info, tree, and priority files on success", async () => {
    const repoBody = {
      default_branch: "main",
      description: "A test repo",
      topics: ["typescript", "react"],
      stargazers_count: 42,
    }

    const treeBody = {
      tree: [
        { path: "package.json", type: "blob" },
        { path: "README.md", type: "blob" },
        { path: "src/index.ts", type: "blob" },
        { path: "node_modules/lodash/index.js", type: "blob" },
        { path: ".github/workflows/ci.yml", type: "blob" },
      ],
      truncated: false,
    }

    const packageJsonContent = Buffer.from(
      JSON.stringify({ name: "test" })
    ).toString("base64")

    const readmeContent = Buffer.from("# Test Repo").toString("base64")

    vi.mocked(fetch)
      .mockResolvedValueOnce(mockResponse(200, repoBody))
      .mockResolvedValueOnce(mockResponse(200, treeBody))
      .mockResolvedValueOnce(mockResponse(200, { content: packageJsonContent, encoding: "base64" }))
      .mockResolvedValueOnce(mockResponse(200, { content: readmeContent, encoding: "base64" }))

    const result = await fetchRepoInfo("https://github.com/owner/repo")
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.repoInfo).toEqual({
      owner: "owner",
      name: "repo",
      branch: "main",
      description: "A test repo",
      topics: ["typescript", "react"],
      stars: 42,
    })

    expect(result.files).toEqual([
      "package.json",
      "README.md",
      "src/index.ts",
      ".github/workflows/ci.yml",
    ])
    expect(result.files).not.toContain("node_modules/lodash/index.js")

    expect(result.fileContents.get("package.json")).toBe(JSON.stringify({ name: "test" }))
    expect(result.fileContents.get("README.md")).toBe("# Test Repo")
  })

  it("passes token in Authorization header", async () => {
    const repoBody = { default_branch: "main", description: null, topics: [], stargazers_count: 0 }
    const treeBody = { tree: [], truncated: false }

    vi.mocked(fetch)
      .mockResolvedValueOnce(mockResponse(200, repoBody))
      .mockResolvedValueOnce(mockResponse(200, treeBody))

    await fetchRepoInfo("https://github.com/owner/repo", "ghp_test123")

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/repos/owner/repo"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer ghp_test123",
        }),
      }),
    )
  })

  it("does not send Authorization header without token", async () => {
    const repoBody = { default_branch: "main", description: null, topics: [], stargazers_count: 0 }
    const treeBody = { tree: [], truncated: false }

    vi.mocked(fetch)
      .mockResolvedValueOnce(mockResponse(200, repoBody))
      .mockResolvedValueOnce(mockResponse(200, treeBody))

    await fetchRepoInfo("https://github.com/owner/repo")

    const calls = vi.mocked(fetch).mock.calls
    for (const [url, opts] of calls) {
      if (typeof url === "string" && opts) {
        expect(opts.headers).not.toHaveProperty("Authorization")
      }
    }
  })

  it("handles truncated tree by falling back to recursive file listing", async () => {
    const repoBody = { default_branch: "main", description: null, topics: [], stargazers_count: 0 }
    const truncatedTree = {
      tree: [{ path: "package.json", type: "blob" }],
      truncated: true,
    }

    const contentsBody = [
      { path: "package.json", type: "file" },
      { path: "src", type: "dir" },
    ]

    const srcContentsBody = [
      { path: "src/index.ts", type: "file" },
    ]

    const pkgContent = Buffer.from(JSON.stringify({ name: "test" })).toString("base64")

    vi.mocked(fetch)
      .mockResolvedValueOnce(mockResponse(200, repoBody))
      .mockResolvedValueOnce(mockResponse(200, truncatedTree))
      .mockResolvedValueOnce(mockResponse(200, contentsBody))
      .mockResolvedValueOnce(mockResponse(200, srcContentsBody))
      .mockResolvedValueOnce(mockResponse(200, { content: pkgContent, encoding: "base64" }))

    const result = await fetchRepoInfo("https://github.com/owner/repo")
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.files).toContain("package.json")
    expect(result.files).toContain("src/index.ts")
  })

  it("returns empty files and fileContents when API calls return nothing", async () => {
    const repoBody = { default_branch: "main", description: null, topics: [], stargazers_count: 0 }

    vi.mocked(fetch)
      .mockResolvedValueOnce(mockResponse(200, repoBody))
      .mockResolvedValueOnce(mockResponse(200, { tree: [], truncated: false }))

    const result = await fetchRepoInfo("https://github.com/owner/repo")
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.files).toEqual([])
    expect(result.fileContents.size).toBe(0)
  })

  it("handles network error", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network failure"))
    const result = await fetchRepoInfo("https://github.com/owner/repo")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("UNKNOWN")
      expect(result.error.message).toBe("Network failure")
    }
  })
})
