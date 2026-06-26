import type { Finding, Stack } from "@/scanner/types"

interface ReportData {
  owner: string
  name: string
  repoUrl: string
  score: number
  stack: Stack
  findings: Finding[]
  badges: string[]
  createdAt: Date
}

const severityLabel: Record<string, string> = {
  critical: "Critical",
  recommended: "Recommended",
  "nice-to-have": "Nice-to-Have",
}

export function generateReportHtml(data: ReportData): string {
  const { owner, name, repoUrl, score, stack, findings, badges, createdAt } = data

  const critical = findings.filter((f) => f.severity === "critical")
  const recommended = findings.filter((f) => f.severity === "recommended")
  const niceToHave = findings.filter((f) => f.severity === "nice-to-have")

  const dateStr = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const stackParts = [
    stack.archetype,
    stack.framework,
    stack.language,
    stack.bundler,
  ].filter(Boolean)
  if (stack.database.length) stackParts.push(`DB: ${stack.database.join(", ")}`)
  if (stack.testing.length) stackParts.push(`Tests: ${stack.testing.join(", ")}`)
  if (stack.styling.length) stackParts.push(stack.styling.join(", "))

  function findingsHtml(items: Finding[], severity: string) {
    return items
      .map(
        (f) => `
        <div class="finding">
          <div class="finding-title">${esc(f.title)}</div>
          <div class="finding-severity">${severityLabel[severity] ?? severity}</div>
          <p>${esc(f.description)}</p>
          <p class="suggestion">${esc(f.suggestion)}</p>
        </div>`,
      )
      .join("")
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 10px;
    line-height: 1.6;
    color: #000;
    padding: 0;
  }
  h1 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 2px;
    letter-spacing: -0.3px;
  }
  .meta {
    font-size: 9px;
    color: #555;
    margin-bottom: 2px;
  }
  .score {
    font-size: 14px;
    margin-top: 18px;
    margin-bottom: 24px;
    font-weight: 400;
  }
  .score-num {
    font-size: 30px;
    font-weight: 700;
  }
  h2 {
    font-size: 11px;
    font-weight: 700;
    margin-top: 20px;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #ccc;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .finding {
    margin-bottom: 14px;
    page-break-inside: avoid;
  }
  .finding-title {
    font-size: 11px;
    font-weight: 700;
    margin-bottom: 1px;
  }
  .finding-severity {
    font-size: 8px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 4px;
  }
  p {
    font-size: 10px;
    margin-bottom: 4px;
  }
  .suggestion {
    color: #555;
    font-style: italic;
    font-size: 9px;
  }
  .badge {
    display: inline-block;
    font-size: 8px;
    padding: 1px 8px;
    margin-right: 4px;
    margin-bottom: 4px;
    border: 1px solid #ccc;
    border-radius: 3px;
  }
  .badges {
    margin-bottom: 4px;
  }
  .stack-line {
    font-size: 10px;
    color: #000;
    margin-bottom: 4px;
  }
  .empty {
    font-style: italic;
    color: #666;
    margin-top: 8px;
  }
</style>
</head>
<body>
  <h1>${esc(owner)}/${esc(name)}</h1>
  <div class="meta">${esc(repoUrl)}</div>
  <div class="meta">${esc(dateStr)}</div>

  <div class="score">Score: <span class="score-num">${score}</span> / 100</div>

  <h2>Stack</h2>
  <div class="stack-line">${esc(stackParts.join(" · "))}</div>

  ${badges.length > 0 ? `<h2>Badges</h2><div class="badges">${badges.map((b) => `<span class="badge">${esc(b)}</span>`).join("")}</div>` : ""}

  ${findings.length === 0 ? `<h2>Findings</h2><p class="empty">No issues found. Looks production-ready!</p>` : ""}

  ${critical.length > 0 ? `<h2>Critical Issues</h2>${findingsHtml(critical, "critical")}` : ""}
  ${recommended.length > 0 ? `<h2>Recommended Improvements</h2>${findingsHtml(recommended, "recommended")}` : ""}
  ${niceToHave.length > 0 ? `<h2>Nice-to-Have Enhancements</h2>${findingsHtml(niceToHave, "nice-to-have")}` : ""}
</body>
</html>`
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
