import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-logging",
  category: "recommended",
  archetypes: ["api-server", "fullstack"],
  check: async (ctx) => {
    if (ctx.stack.logging.length > 0) return null

    const sourceFiles = ctx.files.filter(
      (f) =>
        /\.(ts|tsx|js|jsx)$/.test(f) &&
        !f.includes("node_modules") &&
        !f.includes(".test.") &&
        !f.includes(".spec."),
    )

    let hasConsoleLog = false
    for (const file of sourceFiles.slice(0, 10)) {
      const content = ctx.fileContents.get(file)
      if (!content) continue
      if (/console\.(log|error|warn|info)/.test(content)) {
        hasConsoleLog = true
        break
      }
    }

    if (hasConsoleLog) {
      return {
        ruleId: "has-logging",
        title: "No proper logging library detected",
        description:
          "`console.log` is not a logging strategy. When your app breaks in production, good luck finding the bug with plain console statements.",
        severity: "recommended",
        scoreImpact: -8,
        suggestion:
          "Replace `console.log` with `pino` or `winston`. They give you structured JSON logs, log levels, and transport options for production.",
        badge: "No Structured Logging",
      }
    }

    return {
      ruleId: "has-logging",
      title: "No logging infrastructure detected",
      description:
        "Your app runs silent in the shadows. When things go wrong, you'll have zero clues to work with.",
      severity: "recommended",
      scoreImpact: -8,
      suggestion:
        "Add a logging library like `pino` (fastest Node.js logger) and log important events with structured data.",
      badge: "No Logging",
    }
  },
}
