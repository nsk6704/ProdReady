import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-retry-handling",
  category: "critical",
  check: async (ctx) => {
    const sourceFiles = ctx.files.filter(
      (f) =>
        !f.startsWith("node_modules/") &&
        /\.(ts|tsx|js|jsx)$/.test(f) &&
        !f.includes(".test.") &&
        !f.includes(".spec.") &&
        !f.includes("/__tests__/"),
    )

    let hasHttpCall = false
    let hasRetryOrTimeout = false

    for (const file of sourceFiles.slice(0, 20)) {
      const content = ctx.fileContents.get(file)
      if (!content) continue

      if (/fetch\s*\(|axios\.(get|post|put|delete|patch)|ky\(|got\(/.test(content)) {
        hasHttpCall = true
      }

      if (
        /retry|timeout|\.catch\(|try\s*\{[\s\S]*?await[\s\S]*?\}\s*catch/.test(content)
      ) {
        if (
          /retry|timeout|AbortSignal|\.catch\(/.test(content) &&
          !/\/\/.*retry|\/\/.*timeout/.test(content)
        ) {
          hasRetryOrTimeout = true
        }
      }
    }

    if (hasHttpCall && !hasRetryOrTimeout) {
      return {
        ruleId: "has-retry-handling",
        title: "HTTP calls lack retry and timeout handling",
        description:
          "Your API calls have zero backup dancers. When a request fails (and it will), your app just gives up and looks bad in front of users.",
        severity: "critical",
        scoreImpact: -15,
        suggestion:
          "Add retry logic (2-3 attempts with backoff) and timeouts to all external HTTP calls. Use libraries like `ky` (has retry built-in) or wrap fetch with AbortSignal.",
        badge: "No Retry/Timeout",
      }
    }

    return null
  },
}
