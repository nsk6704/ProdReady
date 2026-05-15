import type { RepoInfo } from "./types"

const GITHUB_API = "https://api.github.com"

function parseRepoUrl(url: string): { owner: string; name: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/\s#?]+)/)
  if (!match) return null
  return { owner: match[1], name: match[2].replace(/\.git$/, "") }
}

function headers(token?: string): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ProdReady/1.0",
  }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

export interface GitHubError {
  message: string
  code: "RATE_LIMITED" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_URL" | "UNKNOWN"
}

export type GitHubResult<T> =
  | { success: true; data: T }
  | { success: false; error: GitHubError }

async function apiFetch<T>(
  path: string,
  token?: string,
): Promise<{ data: T | null; error: GitHubError | null }> {
  try {
    const res = await fetch(`${GITHUB_API}${path}`, { headers: headers(token) })

    if (res.status === 403 || res.status === 429) {
      const remaining = res.headers.get("X-RateLimit-Remaining")
      if (remaining === "0") {
        return {
          data: null,
          error: {
            message: "GitHub API rate limit exceeded (60 req/hr without a token). Add a GitHub token for 5,000 req/hr.",
            code: "RATE_LIMITED",
          },
        }
      }
      return {
        data: null,
        error: {
          message: "Access forbidden. The repo might be private or the token is invalid.",
          code: "FORBIDDEN",
        },
      }
    }

    if (res.status === 404) {
      return {
        data: null,
        error: {
          message: "Repository not found. Check the URL or make sure it's public.",
          code: "NOT_FOUND",
        },
      }
    }

    if (!res.ok) {
      return {
        data: null,
        error: {
          message: `GitHub API returned status ${res.status}`,
          code: "UNKNOWN",
        },
      }
    }

    return { data: (await res.json()) as T, error: null }
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : "Failed to connect to GitHub API",
        code: "UNKNOWN",
      },
    }
  }
}

export async function fetchRepoInfo(
  url: string,
  token?: string,
): Promise<
  | { success: true; repoInfo: RepoInfo; files: string[]; fileContents: Map<string, string> }
  | { success: false; error: GitHubError }
> {
  const parsed = parseRepoUrl(url)
  if (!parsed) {
    return {
      success: false,
      error: {
        message: "Invalid GitHub URL. Use format: https://github.com/owner/repo",
        code: "INVALID_URL",
      },
    }
  }

  const { owner, name } = parsed

  const repoResult = await apiFetch<{
    default_branch: string
    description: string | null
    topics: string[]
    stargazers_count: number
  }>(`/repos/${owner}/${name}`, token)

  if (repoResult.error || !repoResult.data) {
    return { success: false, error: repoResult.error! }
  }

  const repo = repoResult.data
  const branch = repo.default_branch
  const fileContents = new Map<string, string>()

  const files = await fetchFileList(owner, name, branch, token)

  const priorityFiles = [
    "package.json",
    ".env.example",
    "Dockerfile",
    "docker-compose.yml",
    "README.md",
    "tsconfig.json",
    ".eslintrc.js",
    ".eslintrc.json",
    ".eslintrc",
    ".prettierrc",
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
    "vite.config.ts",
    "vite.config.js",
  ]

  const existingPriority = files.filter((f) => priorityFiles.includes(f))
  for (const file of existingPriority) {
    const content = await fetchFileContent(owner, name, file, branch, token)
    if (content) fileContents.set(file, content)
  }

  return {
    success: true,
    repoInfo: {
      owner,
      name,
      branch,
      description: repo.description,
      topics: repo.topics,
      stars: repo.stargazers_count,
    },
    files,
    fileContents,
  }
}

async function fetchFileList(
  owner: string,
  name: string,
  branch: string,
  token?: string,
): Promise<string[]> {
  const { data } = await apiFetch<{
    tree: { path: string; type: "blob" | "tree" }[]
    truncated: boolean
  }>(`/repos/${owner}/${name}/git/trees/${branch}?recursive=1`, token)

  if (!data) return []

  if (data.truncated) {
    return fetchFileListRecursive(owner, name, token)
  }

  const excluded = new Set([
    "node_modules", ".git", ".next", "dist",
    "build", ".cache", "coverage", ".vercel",
  ])

  return data.tree
    .filter((item) => {
      if (item.type !== "blob") return false
      const parts = item.path.split("/")
      return !parts.some((p) => excluded.has(p))
    })
    .map((item) => item.path)
}

async function fetchFileListRecursive(
  owner: string,
  name: string,
  token?: string,
  path = "",
): Promise<string[]> {
  const { data: items } = await apiFetch<
    { path: string; type: string }[]
  >(`/repos/${owner}/${name}/contents/${path}`, token)

  if (!items) return []

  const files: string[] = []

  const excluded = new Set([
    "node_modules", ".git", ".next", "dist",
    "build", ".cache", "coverage", ".vercel",
  ])

  for (const item of items) {
    if (item.type === "file") {
      files.push(item.path)
    } else if (item.type === "dir" && !excluded.has(item.path)) {
      const subFiles = await fetchFileListRecursive(owner, name, token, item.path)
      files.push(...subFiles)
    }
  }

  return files
}

async function fetchFileContent(
  owner: string,
  name: string,
  path: string,
  branch: string,
  token?: string,
): Promise<string | null> {
  const { data } = await apiFetch<{
    content: string
    encoding: string
  }>(`/repos/${owner}/${name}/contents/${path}?ref=${branch}`, token)

  if (!data || !data.content) return null

  if (data.encoding === "base64") {
    return Buffer.from(data.content, "base64").toString("utf-8")
  }

  return data.content
}

export { parseRepoUrl }
