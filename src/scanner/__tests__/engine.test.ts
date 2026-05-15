import { describe, it, expect } from "vitest"
import { runScanner } from "../engine"
import type { ScanContext } from "../types"

function makeCtx(overrides?: Partial<ScanContext>): ScanContext {
  return {
    repoInfo: { owner: "t", name: "t", branch: "main", description: null, topics: [], stars: 0 },
    files: [],
    fileContents: new Map(),
    packageJson: null,
    stack: null as never,
    ...overrides,
  }
}

describe("runScanner", () => {
  it("returns score 100 with no findings for a full-featured project", async () => {
    const ctx = makeCtx({
      files: [
        ".env.example", "README.md", "Dockerfile",
        ".github/workflows/ci.yml", "src/app/error.tsx",
        "app/error.tsx",
      ],
      fileContents: new Map([
        ["README.md", "# Project\n\nFull documentation with setup instructions here."],
        [".env.example", "PORT=3000"],
      ]),
      packageJson: {
        dependencies: {
          next: "^14.0.0", react: "^18.0.0", zod: "^3.22.0",
          vitest: "^1.0.0", cors: "^2.8.5", pino: "^9.0.0",
          "@sentry/nextjs": "^8.0.0",
          "express-rate-limit": "^7.0.0",
        },
        devDependencies: { typescript: "^5.0.0" },
      },
    })
    const result = await runScanner(ctx)
    expect(result.score).toBe(100)
    expect(result.findings).toHaveLength(0)
  })

  it("deducts score for findings on a bare project", async () => {
    const ctx = makeCtx({
      packageJson: { dependencies: { express: "^4.18.0" } },
    })
    const result = await runScanner(ctx)
    expect(result.score).toBeLessThan(100)
    expect(result.findings.length).toBeGreaterThan(0)
  })

  it("floors score at 0 with enough failures", async () => {
    const ctx = makeCtx({
      files: ["src/api.ts"],
      fileContents: new Map([
        ["src/api.ts", "const data = await fetch('https://api.example.com')"],
        ["tsconfig.json", JSON.stringify({ compilerOptions: {} })],
      ]),
      packageJson: {
        dependencies: { express: "^4.18.0" },
      },
    })
    const result = await runScanner(ctx)
    expect(result.score).toBe(0)
  })

  it("generates positive badges for passed rules", async () => {
    const ctx = makeCtx({
      files: [
        "Dockerfile", "README.md", ".github/workflows/ci.yml",
        ".env.example", "src/app/error.tsx",
      ],
      fileContents: new Map([
        ["README.md", "# Project\n\nFull documentation with setup instructions here."],
        [".env.example", "PORT=3000"],
      ]),
      packageJson: {
        dependencies: {
          next: "^14.0.0", react: "^18.0.0", zod: "^3.22.0",
          vitest: "^1.0.0", cors: "^2.8.5",
        },
        devDependencies: { typescript: "^5.0.0" },
      },
    })
    const result = await runScanner(ctx)
    expect(result.badges).toContain("Has README")
    expect(result.badges).toContain("CI/CD Active")
    expect(result.badges).toContain("Has .env.example")
    expect(result.badges).toContain("Tests Found")
    expect(result.badges).toContain("Validation Found")
  })

  it("includes negative badges from findings", async () => {
    const ctx = makeCtx({
      packageJson: { dependencies: { express: "^4.18.0" } },
    })
    const result = await runScanner(ctx)
    const positive = new Set([
      "Docker Ready", "CI/CD Active", "Has README", "Has .env.example",
      "Tests Found", "Validation Found", "Monitoring Set Up",
      "Error Boundaries Set",
    ])
    const negative = result.badges.filter((b) => !positive.has(b))
    expect(negative.length).toBeGreaterThan(0)
  })

  it("only runs applicable rules per archetype", async () => {
    const ctx = makeCtx({
      packageJson: { bin: "cli.js" },
    })
    const result = await runScanner(ctx)
    const ruleIds = new Set(result.findings.map((f) => f.ruleId))

    const archetypeGated = [
      "has-dockerfile", "has-rate-limiting", "has-error-boundaries",
      "has-error-handling", "has-logging", "has-cors", "has-monitoring",
    ]
    for (const id of archetypeGated) {
      expect(ruleIds).not.toContain(id)
    }
  })

  it("runs archetype-agnostic rules for any archetype", async () => {
    const ctx = makeCtx({
      files: ["src/api.ts"],
      fileContents: new Map([
        ["src/api.ts", "const data = await fetch('https://api.example.com')"],
        ["tsconfig.json", JSON.stringify({ compilerOptions: {} })],
      ]),
      packageJson: { main: "index.js" },
    })
    const result = await runScanner(ctx)
    const ruleIds = new Set(result.findings.map((f) => f.ruleId))

    expect(ruleIds).toContain("has-env-example")
    expect(ruleIds).toContain("has-cicd")
    expect(ruleIds).toContain("has-readme")
    expect(ruleIds).toContain("has-retry-handling")
    expect(ruleIds).toContain("has-strict-ts")
    expect(ruleIds).toContain("has-tests")
    expect(ruleIds).toContain("has-validation")
  })

  it("returns stack in result", async () => {
    const ctx = makeCtx({ packageJson: {} })
    const result = await runScanner(ctx)
    expect(result.stack).toBeDefined()
    expect(result.stack.archetype).toBe("web-app")
  })
})
