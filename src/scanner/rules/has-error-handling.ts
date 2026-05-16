import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-error-handling",
  category: "critical",
  archetypes: ["api-server", "fullstack"],
  check: async (ctx) => {
    const hasExpress = ctx.stack.framework === "Express"
    const hasNext = ctx.stack.framework === "Next.js"

    if (hasNext) {
      const hasGlobalError = ctx.files.some(
        (f) =>
          f.endsWith("/error.tsx") ||
          f.endsWith("/global-error.tsx"),
      )
      if (hasGlobalError) return null
    }

    if (hasExpress) {
      const sourceFiles = ctx.files.filter(
        (f) =>
          /\.(ts|js)$/.test(f) && !f.includes("node_modules"),
      )

      for (const file of sourceFiles.slice(0, 10)) {
        const content = ctx.fileContents.get(file)
        if (!content) continue

        if (
          /app\.use\s*\(.*err/.test(content) ||
          /app\.use\s*\(\s*\(/.test(content) &&
            content.includes("err") &&
            content.includes("res")
        ) {
          return null
        }
      }
    }

    if (!hasExpress && !hasNext) return null

    return {
      ruleId: "has-error-handling",
      title: "No global error handler detected",
      description:
        "Your app has no safety net. Unhandled errors will crash your process and leave users hanging with cryptic status codes.",
      severity: "critical",
      scoreImpact: -15,
      suggestion: hasExpress
        ? "Add an Express error handling middleware: `app.use((err, req, res, next) => { ... })` at the end of your middleware chain."
        : "Create `app/error.tsx` and `app/global-error.tsx` for Next.js 13+ to catch both client and server errors gracefully.",
      badge: "No Error Handler",
    }
  },
}
