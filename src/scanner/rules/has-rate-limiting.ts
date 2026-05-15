import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-rate-limiting",
  category: "recommended",
  archetypes: ["api-server", "fullstack"],
  check: async (ctx) => {
    const deps = ctx.packageJson
    if (!deps) return null

    const allDeps = {
      ...((deps.dependencies as Record<string, string>) || {}),
      ...((deps.devDependencies as Record<string, string>) || {}),
    }

    const hasRateLimiting =
      "express-rate-limit" in allDeps ||
      "rate-limiter-flexible" in allDeps ||
      "bottleneck" in allDeps ||
      "lru-cache" in allDeps

    if (hasRateLimiting) return null

    if (ctx.stack.framework === "Express") {
      return {
        ruleId: "has-rate-limiting",
        title: "No rate limiting configured",
        description:
          "Your API is an all-you-can-eat buffet. Without rate limiting, one bad actor (or a runaway loop) can take down your entire app.",
        severity: "recommended",
        scoreImpact: -8,
        suggestion:
          "Add `express-rate-limit` middleware to cap requests per IP. Start with 100 req/min per user.",
        badge: "Rate Limiting Missing",
      }
    }

    if (ctx.stack.framework === "Next.js") {
      return {
        ruleId: "has-rate-limiting",
        title: "No rate limiting detected",
        description:
          "Your Next.js API routes are unprotected. Without rate limiting, serverless function costs can spike fast.",
        severity: "recommended",
        scoreImpact: -8,
        suggestion:
          "Use `lru-cache` for in-memory rate limiting in API routes, or `upstash-rate-limiter` for serverless-friendly rate limiting.",
        badge: "Rate Limiting Missing",
      }
    }

    return null
  },
}
