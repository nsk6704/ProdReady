import type { Finding } from "@/scanner/types"

export function generateFixPrompt(owner: string, name: string, findings: Finding[]): string {
  if (findings.length === 0) return ""

  const severityOrder = ["critical", "recommended", "nice-to-have"]
  const grouped = severityOrder
    .map((severity) => ({
      severity,
      findings: findings.filter((f) => f.severity === severity),
    }))
    .filter((g) => g.findings.length > 0)

  const lines: string[] = [
    "## 🛠 Fix Prompt — for Claude Code or GitHub Copilot",
    "",
    `I scanned **${owner}/${name}** and found the following issues that need attention.`,
    "Please help fix them by following the suggestions below.",
    "",
  ]

  const severityEmoji: Record<string, string> = {
    critical: "🔴",
    recommended: "🟡",
    "nice-to-have": "🔵",
  }

  for (const group of grouped) {
    const emoji = severityEmoji[group.severity] || "•"
    const label = group.severity.charAt(0).toUpperCase() + group.severity.slice(1)
    lines.push(`### ${emoji} ${label}`)
    lines.push("")
    for (const f of group.findings) {
      lines.push(`- **${f.title}**`)
      lines.push(`  - ${f.suggestion}`)
      lines.push("")
    }
  }

  lines.push("---")
  lines.push("")
  lines.push("### Instructions")
  lines.push("")
  lines.push("For each issue above:")
  lines.push("- Implement the suggested fix with minimal, focused edits")
  lines.push("- Don't break existing functionality")
  lines.push("- Follow the project's existing code style and conventions")
  lines.push("- Run the project to verify changes work")
  lines.push("")
  lines.push("Start with critical issues, then recommended, then nice-to-have enhancements.")

  return lines.join("\n")
}
