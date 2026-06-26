import type { Finding } from "@/scanner/types"

export function generateFixPrompt(owner: string, name: string, findings: Finding[]): string {
  if (findings.length === 0) return ""

  const severityOrder = ["critical", "recommended", "nice-to-have"] as const
  const severityLabel: Record<string, string> = {
    critical: "Critical Issues",
    recommended: "Recommended Improvements",
    "nice-to-have": "Nice-to-Have Enhancements",
  }

  const parts: string[] = []

  parts.push(
    `I scanned ${owner}/${name} and found the following production readiness issues that need attention. ` +
    "Please fix them by following the suggestions below. Only implement the fixes listed - do not refactor or change anything beyond what is required to resolve these specific issues.",
  )

  for (const severity of severityOrder) {
    const group = findings.filter((f) => f.severity === severity)
    if (group.length === 0) continue

    parts.push(severityLabel[severity] + ":")

    for (const f of group) {
      parts.push(f.title + ". " + f.suggestion)
    }
  }

  parts.push(
    "For each issue above, implement the suggested fix with minimal focused edits. " +
    "Do not break existing functionality. " +
    "Follow the projects existing code style and conventions. " +
    "Run the project to verify changes work. " +
    "Start with critical issues, then recommended, then nice-to-have enhancements.",
  )

  return parts.join("\n\n")
}
