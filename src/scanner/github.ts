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
  }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

async function apiFetch<T>(
  path: string,
  token?: string,
): Promise<T | null> {
  try {
    const res = await fetch(`${GITHUB_API}${path}`, { headers: headers(token) })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function fetchRepoInfo(
  url: string,
  token?: string,
): Promise<{ repoInfo: RepoInfo; files: string[]; fileContents: Map<string, string> } | null> {
  const parsed = parseRepoUrl(url)
  if (!parsed) return null

  const { owner, name } = parsed

  const repo = await apiFetch<{
    default_branch: string
    description: string | null
    topics: string[]
    stargazers_count: number
  }>(`/repos/${owner}/${name}`, token)

  if (!repo) return null

  const branch = repo.default_branch
  const fileContents = new Map<string, string>()

  const files = await fetchFileList(owner, name, "", token)

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
  path: string,
  token?: string,
): Promise<string[]> {
  const items = await apiFetch<
    { path: string; type: string }[]
  >(`/repos/${owner}/${name}/contents/${path}`, token)

  if (!items) return []

  const files: string[] = []

  for (const item of items) {
    if (item.type === "file") {
      files.push(item.path)
    } else if (item.type === "dir" && shouldIncludeDir(item.path)) {
      const subFiles = await fetchFileList(owner, name, item.path, token)
      files.push(...subFiles)
    }
  }

  return files
}

function shouldIncludeDir(path: string): boolean {
  const excluded = new Set([
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    ".cache",
    "coverage",
    ".vercel",
  ])
  return !excluded.has(path)
}

async function fetchFileContent(
  owner: string,
  name: string,
  path: string,
  branch: string,
  token?: string,
): Promise<string | null> {
  const data = await apiFetch<{
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
