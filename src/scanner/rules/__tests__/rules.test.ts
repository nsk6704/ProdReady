import { describe, it, expect } from "vitest"
import type { ScanContext } from "../../types"

function ctx(overrides?: Partial<ScanContext>): ScanContext {
  return {
    repoInfo: { owner: "t", name: "t", branch: "main", description: null, topics: [], stars: 0 },
    files: [],
    fileContents: new Map(),
    packageJson: null,
    stack: {
      archetype: "web-app",
      framework: null,
      language: "typescript",
      bundler: null,
      database: [],
      styling: [],
      testing: [],
      orm: [],
      validation: [],
      monitoring: [],
      logging: [],
      httpClient: [],
    },
    ...overrides,
  }
}

// ─── has-env-example ────────────────────────────────────────────
describe("has-env-example", () => {
  it("passes when .env.example exists", async () => {
    const { rule } = await import("../has-env-example")
    expect(await rule.check(ctx({ files: [".env.example"] }))).toBeNull()
  })

  it("passes when .env.sample exists", async () => {
    const { rule } = await import("../has-env-example")
    expect(await rule.check(ctx({ files: [".env.sample"] }))).toBeNull()
  })

  it("fails when no env example file", async () => {
    const { rule } = await import("../has-env-example")
    const r = await rule.check(ctx())
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-env-example")
    expect(r!.severity).toBe("nice-to-have")
    expect(r!.scoreImpact).toBe(-3)
  })
})

// ─── has-dockerfile ──────────────────────────────────────────────
describe("has-dockerfile", () => {
  it("passes when Dockerfile exists", async () => {
    const { rule } = await import("../has-dockerfile")
    expect(await rule.check(ctx({ files: ["Dockerfile"] }))).toBeNull()
  })

  it("passes when docker-compose.yml exists", async () => {
    const { rule } = await import("../has-dockerfile")
    expect(await rule.check(ctx({ files: ["docker-compose.yml"] }))).toBeNull()
  })

  it("fails when Dockerfile is missing", async () => {
    const { rule } = await import("../has-dockerfile")
    const r = await rule.check(ctx())
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-dockerfile")
    expect(r!.severity).toBe("recommended")
    expect(r!.scoreImpact).toBe(-8)
    expect(r!.dismissOptions).toHaveLength(4)
  })
})

// ─── has-cicd ────────────────────────────────────────────────────
describe("has-cicd", () => {
  it("passes with GitHub Actions workflow", async () => {
    const { rule } = await import("../has-cicd")
    expect(await rule.check(ctx({ files: [".github/workflows/ci.yml"] }))).toBeNull()
  })

  it("passes with CircleCI config", async () => {
    const { rule } = await import("../has-cicd")
    expect(await rule.check(ctx({ files: [".circleci/config.yml"] }))).toBeNull()
  })

  it("passes with GitLab CI", async () => {
    const { rule } = await import("../has-cicd")
    expect(await rule.check(ctx({ files: [".gitlab-ci.yml"] }))).toBeNull()
  })

  it("passes with Jenkinsfile", async () => {
    const { rule } = await import("../has-cicd")
    expect(await rule.check(ctx({ files: ["Jenkinsfile"] }))).toBeNull()
  })

  it("fails without CI config", async () => {
    const { rule } = await import("../has-cicd")
    const r = await rule.check(ctx())
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-cicd")
    expect(r!.scoreImpact).toBe(-8)
  })
})

// ─── has-readme ──────────────────────────────────────────────────
describe("has-readme", () => {
  it("passes with README.md >= 50 chars", async () => {
    const { rule } = await import("../has-readme")
    const c = ctx({ files: ["README.md"], fileContents: new Map([["README.md", "A".repeat(50)]]) })
    expect(await rule.check(c)).toBeNull()
  })

  it("flags thin README under 50 chars", async () => {
    const { rule } = await import("../has-readme")
    const c = ctx({ files: ["README.md"], fileContents: new Map([["README.md", "Short"]]) })
    const r = await rule.check(c)
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-readme")
    expect(r!.scoreImpact).toBe(-3)
    expect(r!.badge).toBe("Thin README")
  })

  it("fails without README", async () => {
    const { rule } = await import("../has-readme")
    const r = await rule.check(ctx())
    expect(r).not.toBeNull()
    expect(r!.scoreImpact).toBe(-8)
    expect(r!.badge).toBe("Missing README")
  })

  it("is case-insensitive for readme.md", async () => {
    const { rule } = await import("../has-readme")
    const c = ctx({
      files: ["ReadMe.MD"],
      fileContents: new Map([["ReadMe.MD", "A".repeat(50)]]),
    })
    expect(await rule.check(c)).toBeNull()
  })
})

// ─── has-validation ──────────────────────────────────────────────
describe("has-validation", () => {
  it("passes with zod in stack", async () => {
    const { rule } = await import("../has-validation")
    expect(await rule.check(ctx({
      stack: { ...ctx().stack, validation: ["Zod"] },
    }))).toBeNull()
  })

  it("fails without validation library", async () => {
    const { rule } = await import("../has-validation")
    const r = await rule.check(ctx())
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-validation")
    expect(r!.scoreImpact).toBe(-8)
  })
})

// ─── has-rate-limiting ───────────────────────────────────────────
describe("has-rate-limiting", () => {
  it("passes with express-rate-limit in deps", async () => {
    const { rule } = await import("../has-rate-limiting")
    expect(await rule.check(ctx({
      packageJson: { dependencies: { "express-rate-limit": "^7.0.0" } },
      stack: { ...ctx().stack, archetype: "api-server", framework: "Express" },
    }))).toBeNull()
  })

  it("fails for Express without rate limiting", async () => {
    const { rule } = await import("../has-rate-limiting")
    const r = await rule.check(ctx({
      packageJson: { dependencies: { express: "^4.0.0" } },
      stack: { ...ctx().stack, archetype: "api-server", framework: "Express" },
    }))
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-rate-limiting")
  })

  it("fails for Next.js without rate limiting", async () => {
    const { rule } = await import("../has-rate-limiting")
    const r = await rule.check(ctx({
      packageJson: { dependencies: { next: "^14.0.0" } },
      stack: { ...ctx().stack, archetype: "fullstack", framework: "Next.js" },
    }))
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-rate-limiting")
  })

  it("is no-op for unknown framework", async () => {
    const { rule } = await import("../has-rate-limiting")
    expect(await rule.check(ctx({
      packageJson: {},
      stack: { ...ctx().stack, archetype: "web-app", framework: "Astro" },
    }))).toBeNull()
  })

  it("is no-op without package.json", async () => {
    const { rule } = await import("../has-rate-limiting")
    expect(await rule.check(ctx({
      packageJson: null,
      stack: { ...ctx().stack, archetype: "api-server", framework: "Express" },
    }))).toBeNull()
  })
})

// ─── has-retry-handling ──────────────────────────────────────────
describe("has-retry-handling", () => {
  it("passes when no HTTP calls detected", async () => {
    const { rule } = await import("../has-retry-handling")
    expect(await rule.check(ctx())).toBeNull()
  })

  it("passes when HTTP calls have retry/timeout patterns", async () => {
    const { rule } = await import("../has-retry-handling")
    const c = ctx({
      files: ["api.ts"],
      fileContents: new Map([[
        "api.ts",
        "async function getData() { return fetch(url, { signal: AbortSignal.timeout(5000) }).catch(retry(3)) }",
      ]]),
    })
    expect(await rule.check(c)).toBeNull()
  })

  it("fails when HTTP calls lack retry/timeout", async () => {
    const { rule } = await import("../has-retry-handling")
    const c = ctx({
      files: ["api.ts"],
      fileContents: new Map([[
        "api.ts",
        "const data = await fetch('https://api.example.com/data')",
      ]]),
    })
    const r = await rule.check(c)
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-retry-handling")
    expect(r!.severity).toBe("critical")
    expect(r!.scoreImpact).toBe(-15)
  })
})

// ─── has-error-handling ──────────────────────────────────────────
describe("has-error-handling", () => {
  it("passes for Next.js with app/error.tsx", async () => {
    const { rule } = await import("../has-error-handling")
    expect(await rule.check(ctx({
      files: ["app/error.tsx"],
      stack: { ...ctx().stack, archetype: "fullstack", framework: "Next.js" },
    }))).toBeNull()
  })

  it("fails for Next.js without error file", async () => {
    const { rule } = await import("../has-error-handling")
    const r = await rule.check(ctx({
      stack: { ...ctx().stack, archetype: "fullstack", framework: "Next.js" },
    }))
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-error-handling")
  })

  it("passes for Express with error middleware", async () => {
    const { rule } = await import("../has-error-handling")
    const c = ctx({
      files: ["server.ts"],
      fileContents: new Map([[
        "server.ts",
        "app.use((err, req, res, next) => { res.status(500).json({ error: err.message }) })",
      ]]),
      stack: { ...ctx().stack, archetype: "api-server", framework: "Express" },
    })
    expect(await rule.check(c)).toBeNull()
  })

  it("fails for Express without error middleware", async () => {
    const { rule } = await import("../has-error-handling")
    const r = await rule.check(ctx({
      stack: { ...ctx().stack, archetype: "api-server", framework: "Express" },
    }))
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-error-handling")
  })

  it("is no-op for non-Express, non-Next.js", async () => {
    const { rule } = await import("../has-error-handling")
    expect(await rule.check(ctx())).toBeNull()
  })
})

// ─── has-error-boundaries ────────────────────────────────────────
describe("has-error-boundaries", () => {
  it("passes with app/error.tsx", async () => {
    const { rule } = await import("../has-error-boundaries")
    expect(await rule.check(ctx({
      files: ["app/error.tsx"],
      stack: { ...ctx().stack, framework: "Next.js" },
    }))).toBeNull()
  })

  it("passes with ErrorBoundary in source", async () => {
    const { rule } = await import("../has-error-boundaries")
    const c = ctx({
      files: ["App.tsx"],
      fileContents: new Map([["App.tsx", "class ErrorBoundary extends React.Component {}"]]),
      stack: { ...ctx().stack, framework: "React (CRA)" },
    })
    expect(await rule.check(c)).toBeNull()
  })

  it("fails for React framework without error boundary", async () => {
    const { rule } = await import("../has-error-boundaries")
    const r = await rule.check(ctx({
      stack: { ...ctx().stack, framework: "Next.js" },
    }))
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-error-boundaries")
    expect(r!.severity).toBe("critical")
    expect(r!.scoreImpact).toBe(-15)
  })

  it("is no-op for non-React framework", async () => {
    const { rule } = await import("../has-error-boundaries")
    expect(await rule.check(ctx({
      stack: { ...ctx().stack, framework: "Express" },
    }))).toBeNull()
  })
})

// ─── has-logging ─────────────────────────────────────────────────
describe("has-logging", () => {
  it("passes with pino in stack", async () => {
    const { rule } = await import("../has-logging")
    expect(await rule.check(ctx({
      stack: { ...ctx().stack, archetype: "api-server", framework: "Express", logging: ["Pino"] },
    }))).toBeNull()
  })

  it("fails with console.log instead of logging library", async () => {
    const { rule } = await import("../has-logging")
    const c = ctx({
      files: ["server.ts"],
      fileContents: new Map([["server.ts", "console.log('server started')"]]),
      stack: { ...ctx().stack, archetype: "api-server", framework: "Express" },
    })
    const r = await rule.check(c)
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-logging")
    expect(r!.badge).toBe("No Structured Logging")
  })

  it("fails with no logging and no console.log", async () => {
    const { rule } = await import("../has-logging")
    const r = await rule.check(ctx({
      stack: { ...ctx().stack, archetype: "api-server", framework: "Express" },
    }))
    expect(r).not.toBeNull()
    expect(r!.badge).toBe("No Logging")
  })

  it("is gated to api-server and fullstack archetypes", async () => {
    const { rule } = await import("../has-logging")
    expect(rule.archetypes).toEqual(["api-server", "fullstack"])
  })
})

// ─── has-tests ───────────────────────────────────────────────────
describe("has-tests", () => {
  it("passes with vitest in stack", async () => {
    const { rule } = await import("../has-tests")
    expect(await rule.check(ctx({
      stack: { ...ctx().stack, testing: ["Vitest"] },
    }))).toBeNull()
  })

  it("passes with test files", async () => {
    const { rule } = await import("../has-tests")
    expect(await rule.check(ctx({ files: ["src/foo.test.ts"] }))).toBeNull()
  })

  it("passes with __tests__ directory", async () => {
    const { rule } = await import("../has-tests")
    expect(await rule.check(ctx({ files: ["__tests__/foo.ts"] }))).toBeNull()
  })

  it("passes with spec files", async () => {
    const { rule } = await import("../has-tests")
    expect(await rule.check(ctx({ files: ["src/foo.spec.ts"] }))).toBeNull()
  })

  it("fails without tests", async () => {
    const { rule } = await import("../has-tests")
    const r = await rule.check(ctx())
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-tests")
    expect(r!.badge).toBe("No Tests")
  })
})

// ─── has-strict-ts ──────────────────────────────────────────────
describe("has-strict-ts", () => {
  it("passes when tsconfig has strict: true", async () => {
    const { rule } = await import("../has-strict-ts")
    expect(await rule.check(ctx({
      fileContents: new Map([["tsconfig.json", JSON.stringify({ compilerOptions: { strict: true } })]]),
    }))).toBeNull()
  })

  it("passes when no tsconfig.json", async () => {
    const { rule } = await import("../has-strict-ts")
    expect(await rule.check(ctx())).toBeNull()
  })

  it("fails without strict and no noImplicitAny", async () => {
    const { rule } = await import("../has-strict-ts")
    const r = await rule.check(ctx({
      fileContents: new Map([["tsconfig.json", JSON.stringify({ compilerOptions: {} })]]),
    }))
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-strict-ts")
  })
})

// ─── has-cors ────────────────────────────────────────────────────
describe("has-cors", () => {
  it("passes with cors in deps", async () => {
    const { rule } = await import("../has-cors")
    expect(await rule.check(ctx({
      packageJson: { dependencies: { cors: "^2.8.5", express: "^4.0.0" } },
      stack: { ...ctx().stack, archetype: "api-server", framework: "Express" },
    }))).toBeNull()
  })

  it("passes with cors import in source", async () => {
    const { rule } = await import("../has-cors")
    const c = ctx({
      files: ["server.ts"],
      fileContents: new Map([["server.ts", "import cors from 'cors'"]]),
      packageJson: { dependencies: { express: "^4.0.0" } },
      stack: { ...ctx().stack, archetype: "api-server", framework: "Express" },
    })
    expect(await rule.check(c)).toBeNull()
  })

  it("fails for Express without cors", async () => {
    const { rule } = await import("../has-cors")
    const r = await rule.check(ctx({
      packageJson: { dependencies: { express: "^4.0.0" } },
      stack: { ...ctx().stack, archetype: "api-server", framework: "Express" },
    }))
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-cors")
  })

  it("is no-op for non-Express", async () => {
    const { rule } = await import("../has-cors")
    expect(await rule.check(ctx({
      stack: { ...ctx().stack, framework: "Next.js" },
    }))).toBeNull()
  })
})

// ─── has-monitoring ──────────────────────────────────────────────
describe("has-monitoring", () => {
  it("passes with sentry in stack", async () => {
    const { rule } = await import("../has-monitoring")
    expect(await rule.check(ctx({
      stack: { ...ctx().stack, monitoring: ["Sentry"] },
    }))).toBeNull()
  })

  it("fails without monitoring", async () => {
    const { rule } = await import("../has-monitoring")
    const r = await rule.check(ctx({
      stack: { ...ctx().stack, archetype: "api-server", framework: "Express" },
    }))
    expect(r).not.toBeNull()
    expect(r!.ruleId).toBe("has-monitoring")
    expect(r!.severity).toBe("nice-to-have")
    expect(r!.scoreImpact).toBe(-3)
  })

  it("is gated to web-app, api-server, and fullstack archetypes", async () => {
    const { rule } = await import("../has-monitoring")
    expect(rule.archetypes).toEqual(["web-app", "api-server", "fullstack"])
  })
})
