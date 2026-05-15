export interface RepoInfo {
  owner: string
  name: string
  branch: string
  description: string | null
  topics: string[]
  stars: number
}

export interface Stack {
  framework: string | null
  language: "typescript" | "javascript"
  bundler: string | null
  database: string[]
  styling: string[]
  testing: string[]
  orm: string[]
  validation: string[]
  monitoring: string[]
  logging: string[]
  httpClient: string[]
}

export interface Finding {
  ruleId: string
  title: string
  description: string
  severity: "critical" | "recommended" | "nice-to-have"
  scoreImpact: number
  suggestion: string
  badge: string | null
}

export interface ScanContext {
  repoInfo: RepoInfo
  files: string[]
  fileContents: Map<string, string>
  packageJson: Record<string, unknown> | null
  stack: Stack
}

export interface ScanRule {
  id: string
  category: "critical" | "recommended" | "nice-to-have"
  check(ctx: ScanContext): Promise<Finding | null>
}

export interface ScanResult {
  score: number
  findings: Finding[]
  stack: Stack
  badges: string[]
}
