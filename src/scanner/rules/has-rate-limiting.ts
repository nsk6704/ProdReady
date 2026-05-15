import type { ScanRule } from "../types"

const NODE_PACKAGES = [
  "express-rate-limit",
  "rate-limiter-flexible",
  "bottleneck",
  "lru-cache",
  "upstash-rate-limiter",
  "hono-rate-limiter",
  "fastify-rate-limit",
  "redis-rate-limiter",
]

const RATE_LIMIT_FILES = [
  /ratelimiter/,
  /rate[-_]limit/,
  /throttl/,
  /flask[-_]limit/,
  /slowapi/,
  /rack[-_]attack/,
  /bucket4j/,
  /governor/,
]

export const rule: ScanRule = {
  id: "has-rate-limiting",
  category: "recommended",
  archetypes: ["api-server", "fullstack"],
  check: async (ctx) => {
    const deps = ctx.packageJson
    if (deps) {
      const allDeps = {
        ...((deps.dependencies as Record<string, string>) || {}),
        ...((deps.devDependencies as Record<string, string>) || {}),
      }
      const hasNodePackage = NODE_PACKAGES.some((pkg) => pkg in allDeps)
      if (hasNodePackage) return null
    }

    const hasRateLimitFile = ctx.files.some(
      (f) =>
        !f.includes("node_modules") &&
        !f.includes(".test.") &&
        !f.startsWith(".") &&
        RATE_LIMIT_FILES.some((pattern) => pattern.test(f)),
    )
    if (hasRateLimitFile) return null

    return {
      ruleId: "has-rate-limiting",
      title: "No rate limiting detected",
      description:
        "Your API is an all-you-can-eat buffet. Without rate limiting, one bad actor or a runaway loop can take down your entire app.",
      severity: "recommended",
      scoreImpact: -8,
      suggestion:
        "Add rate limiting to your API endpoints. Most frameworks have a middleware or library for this — it takes minutes to set up and saves you from costly outages.",
      badge: "Rate Limiting Missing",
    }
  },
}
