import type { ScanRule } from "../types"

const ESSENTIAL_PATTERNS = [
  "node_modules",
  ".env",
  ".next",
  "dist",
  "build",
  "coverage",
  ".vercel",
  ".cache",
]

export const rule: ScanRule = {
  id: "has-gitignore",
  category: "nice-to-have",
  check: async (ctx) => {
    const gitignorePath = ctx.files.find((f) => f.endsWith(".gitignore"))
    if (!gitignorePath) {
      return {
        ruleId: "has-gitignore",
        title: "No .gitignore found",
        description:
          "No .gitignore means your node_modules, .env, and build artifacts are all getting version-controlled. Congrats on the bloated repo.",
        severity: "nice-to-have",
        scoreImpact: -3,
        suggestion:
          "Create a `.gitignore` and add at least: node_modules, .env, .next, dist, build, coverage, .vercel.",
        badge: "Missing .gitignore",
        dismissOptions: [
          { id: "not-needed", label: "Not needed for this project", scoreImpact: -1, description: "Rare, but valid for some template repos." },
          { id: "should-add", label: "I'll add one", scoreImpact: -3, description: "Do it before your next commit. Your teammates will thank you." },
        ],
      }
    }

    const content = ctx.fileContents.get(gitignorePath)
    if (!content) return null

    const missingPatterns = ESSENTIAL_PATTERNS.filter(
      (p) => !new RegExp(`^${escapeRegex(p)}`, "m").test(content),
    )

    if (missingPatterns.length >= 3) {
      return {
        ruleId: "has-gitignore",
        title: ".gitignore is missing important patterns",
        description:
          `Your .gitignore is missing: ${missingPatterns.join(", ")}. These should probably be excluded from version control.`,
        severity: "nice-to-have",
        scoreImpact: -3,
        suggestion:
          `Add these to your .gitignore: ${missingPatterns.join(", ")}`,
        badge: "Incomplete .gitignore",
        dismissOptions: [
          { id: "intentional", label: "Intentionally excluded", scoreImpact: -1, description: "If you're sure these don't apply, no worries." },
          { id: "will-fix", label: "I'll update it", scoreImpact: -3, description: "Good call. Keep that repo clean." },
        ],
      }
    }

    return null
  },
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
