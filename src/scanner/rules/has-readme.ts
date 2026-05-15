import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-readme",
  category: "recommended",
  check: async (ctx) => {
    const readme = ctx.files.find((f) => /^readme\.md$/i.test(f))
    if (!readme) {
      return {
        ruleId: "has-readme",
        title: "No README found",
        description:
          "A project without a README is just a ZIP file screaming for attention. Help your future self (and others) understand what this is.",
        severity: "recommended",
        scoreImpact: -8,
        suggestion:
          "Write a `README.md` with at least: what the project does, how to run it, and what env vars it needs.",
        badge: "Missing README",
      }
    }

    const content = ctx.fileContents.get(readme)
    if (content && content.length < 50) {
      return {
        ruleId: "has-readme",
        title: "README is too minimal",
        description:
          "Your README exists but says almost nothing. That's like having a front door with no sign.",
        severity: "nice-to-have",
        scoreImpact: -3,
        suggestion:
          "Expand your README with setup instructions, architecture notes, and deployment steps.",
        badge: "Thin README",
      }
    }

    return null
  },
}
