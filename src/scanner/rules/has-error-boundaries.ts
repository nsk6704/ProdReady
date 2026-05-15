import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-error-boundaries",
  category: "critical",
  check: async (ctx) => {
    const hasReact =
      ctx.stack.framework === "Next.js" ||
      ctx.stack.framework === "React (CRA)" ||
      ctx.stack.framework === "Vite" ||
      ctx.stack.framework === "Remix"

    if (!hasReact) return null

    const sourceFiles = ctx.files.filter(
      (f) =>
        /\.(tsx|jsx)$/.test(f) &&
        !f.includes("node_modules") &&
        !f.includes(".test."),
    )

    let hasErrorBoundary = false
    for (const file of sourceFiles.slice(0, 15)) {
      const content = ctx.fileContents.get(file)
      if (!content) continue

      if (
        /ErrorBoundary|errorBoundary|ErrorBoundary|Sentry\.(captureException|showReportDialog)/.test(
          content,
        ) ||
        content.includes("componentDidCatch") ||
        content.includes("error.tsx")
      ) {
        hasErrorBoundary = true
        break
      }
    }

    const hasErrorFile = ctx.files.some(
      (f) =>
        f === "src/app/error.tsx" ||
        f === "app/error.tsx" ||
        f === "src/app/global-error.tsx" ||
        f === "app/global-error.tsx",
    )

    if (hasErrorFile) return null

    if (!hasErrorBoundary) {
      return {
        ruleId: "has-error-boundaries",
        title: "No error boundaries found",
        description:
          "One uncaught error and your whole React tree goes poof. Users staring at white screens = bad for business.",
        severity: "critical",
        scoreImpact: -15,
        suggestion:
          "Add at least one Error Boundary wrapping your app (or use Next.js `error.tsx`). Show a friendly fallback instead of a blank page.",
        badge: "No Error Boundaries",
      }
    }

    return null
  },
}
