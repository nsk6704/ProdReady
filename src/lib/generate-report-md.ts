import type { Finding, Stack } from "@/scanner/types"
import { generateFixPrompt } from "./generate-fix-prompt"

const SEVERITY_EMOJIS: Record<string, string> = {
  critical: "🔴",
  recommended: "🟡",
  "nice-to-have": "🔵",
}

function formatList(items: string[]): string {
  return items.length > 0 ? items.join(", ") : "None detected"
}

export function generateReportMd(params: {
  owner: string
  name: string
  repoUrl: string
  score: number
  stack: Stack
  findings: Finding[]
  badges: string[]
  createdAt: string
}): string {
  const { owner, name, repoUrl, score, stack, findings, badges, createdAt } = params

  const lines: string[] = [
    `# ProdReady Report: ${owner}/${name}`,
    "",
    `**Score:** ${score}/100`,
    `**Repo:** ${repoUrl}`,
    `**Date:** ${new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    "",
    "---",
    "",
    "## Stack",
    "",
    `- **Archetype:** ${stack.archetype}`,
    `- **Framework:** ${stack.framework || "Unknown"}`,
    `- **Language:** ${stack.language}`,
    `- **Bundler:** ${stack.bundler || "Unknown"}`,
    `- **Database:** ${formatList(stack.database)}`,
    `- **Styling:** ${formatList(stack.styling)}`,
    `- **Testing:** ${formatList(stack.testing)}`,
    `- **ORM:** ${formatList(stack.orm)}`,
    `- **Validation:** ${formatList(stack.validation)}`,
    `- **Monitoring:** ${formatList(stack.monitoring)}`,
    `- **Logging:** ${formatList(stack.logging)}`,
    "",
  ]

  if (badges.length > 0) {
    lines.push(`**Badges:** ${badges.join(", ")}`)
    lines.push("")
  }

  lines.push("---")
  lines.push("")
  lines.push("## Findings")
  lines.push("")

  if (findings.length === 0) {
    lines.push("No issues found. Your project looks production-ready!")
    lines.push("")
  } else {
    const severityOrder = ["critical", "recommended", "nice-to-have"]
    for (const severity of severityOrder) {
      const group = findings.filter((f) => f.severity === severity)
      if (group.length === 0) continue

      const label =
        severity === "critical"
          ? "Critical Issues"
          : severity === "recommended"
            ? "Recommended Improvements"
            : "Nice-to-Have Enhancements"

      lines.push(`### ${SEVERITY_EMOJIS[severity]} ${label} (${group.length})`)
      lines.push("")

      for (const f of group) {
        lines.push(`#### ${f.title}`)
        lines.push("")
        lines.push(f.description)
        lines.push("")
        lines.push(`> **Suggestion:** ${f.suggestion}`)
        lines.push("")
        if (f.badge) {
          lines.push(`> *Badge: ${f.badge}*`)
          lines.push("")
        }
        if (f.dismissOptions && f.dismissOptions.length > 0) {
          lines.push("Dismiss options:")
          for (const opt of f.dismissOptions) {
            const sign = opt.scoreImpact >= 0 ? "+" : ""
            lines.push(`- ${opt.label} (${sign}${opt.scoreImpact} pts)`)
          }
          lines.push("")
        }
      }
    }
  }

  lines.push("---")
  lines.push("")
  lines.push(generateFixPrompt(owner, name, findings))

  return lines.join("\n")
}
