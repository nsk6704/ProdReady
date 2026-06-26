import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer"
import type { Finding, Stack } from "@/scanner/types"
import { generateFixPrompt } from "./generate-fix-prompt"

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKDuKmMI.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKDuKmMI.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKDuKmMI.woff2",
      fontWeight: 700,
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#1a1a2e",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 8,
    color: "#d97706",
  },
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  score: {
    fontSize: 14,
    fontWeight: 700,
    color: "#d97706",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
    marginTop: 16,
    color: "#1a1a2e",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 6,
    color: "#374151",
  },
  stackRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  stackLabel: {
    width: 100,
    fontWeight: 600,
    color: "#6b7280",
  },
  stackValue: {
    flex: 1,
    color: "#1a1a2e",
  },
  findingTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 4,
  },
  findingDesc: {
    marginBottom: 4,
    color: "#374151",
  },
  suggestion: {
    backgroundColor: "#fef3c7",
    padding: 6,
    borderRadius: 4,
    marginBottom: 8,
    fontSize: 9,
    color: "#92400e",
  },
  promptSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    paddingTop: 12,
  },
  promptText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.4,
  },
  badge: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 8,
  },
})

function formatList(items: string[]): string {
  return items.length > 0 ? items.join(", ") : "None detected"
}

function severityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "#dc2626"
    case "recommended":
      return "#d97706"
    case "nice-to-have":
      return "#2563eb"
    default:
      return "#374151"
  }
}

export function ReportPDF({
  owner,
  name,
  repoUrl,
  score,
  stack,
  findings,
  badges,
  createdAt,
}: {
  owner: string
  name: string
  repoUrl: string
  score: number
  stack: Stack
  findings: Finding[]
  badges: string[]
  createdAt: string
}) {
  const prompt = generateFixPrompt(owner, name, findings)

  const critical = findings.filter((f) => f.severity === "critical")
  const recommended = findings.filter((f) => f.severity === "recommended")
  const niceToHave = findings.filter((f) => f.severity === "nice-to-have")

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>ProdReady Report: {owner}/{name}</Text>
        <Text style={styles.subtitle}>{repoUrl}</Text>
        <Text style={styles.subtitle}>
          {new Date(createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
        <Text style={styles.score}>Score: {score}/100</Text>

        {badges.length > 0 && <Text style={styles.badge}>Badges: {badges.join(", ")}</Text>}

        <Text style={styles.sectionTitle}>Stack</Text>
        <View style={styles.stackRow}>
          <Text style={styles.stackLabel}>Archetype</Text>
          <Text style={styles.stackValue}>{stack.archetype}</Text>
        </View>
        <View style={styles.stackRow}>
          <Text style={styles.stackLabel}>Framework</Text>
          <Text style={styles.stackValue}>{stack.framework || "Unknown"}</Text>
        </View>
        <View style={styles.stackRow}>
          <Text style={styles.stackLabel}>Language</Text>
          <Text style={styles.stackValue}>{stack.language}</Text>
        </View>
        <View style={styles.stackRow}>
          <Text style={styles.stackLabel}>Bundler</Text>
          <Text style={styles.stackValue}>{stack.bundler || "Unknown"}</Text>
        </View>
        <View style={styles.stackRow}>
          <Text style={styles.stackLabel}>Database</Text>
          <Text style={styles.stackValue}>{formatList(stack.database)}</Text>
        </View>
        <View style={styles.stackRow}>
          <Text style={styles.stackLabel}>Styling</Text>
          <Text style={styles.stackValue}>{formatList(stack.styling)}</Text>
        </View>
        <View style={styles.stackRow}>
          <Text style={styles.stackLabel}>Testing</Text>
          <Text style={styles.stackValue}>{formatList(stack.testing)}</Text>
        </View>
        <View style={styles.stackRow}>
          <Text style={styles.stackLabel}>ORM</Text>
          <Text style={styles.stackValue}>{formatList(stack.orm)}</Text>
        </View>
        <View style={styles.stackRow}>
          <Text style={styles.stackLabel}>Validation</Text>
          <Text style={styles.stackValue}>{formatList(stack.validation)}</Text>
        </View>
        <View style={styles.stackRow}>
          <Text style={styles.stackLabel}>Monitoring</Text>
          <Text style={styles.stackValue}>{formatList(stack.monitoring)}</Text>
        </View>
        <View style={styles.stackRow}>
          <Text style={styles.stackLabel}>Logging</Text>
          <Text style={styles.stackValue}>{formatList(stack.logging)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Findings</Text>

        {findings.length === 0 ? (
          <Text>No issues found. Your project looks production-ready!</Text>
        ) : (
          <>
            {critical.length > 0 && (
              <>
                <Text style={[styles.subsectionTitle, { color: severityColor("critical") }]}>
                  Critical Issues ({critical.length})
                </Text>
                {critical.map((f) => (
                  <View key={f.ruleId}>
                    <Text style={[styles.findingTitle, { color: severityColor("critical") }]}>{f.title}</Text>
                    <Text style={styles.findingDesc}>{f.description}</Text>
                    <Text style={styles.suggestion}>Suggested fix: {f.suggestion}</Text>
                  </View>
                ))}
              </>
            )}

            {recommended.length > 0 && (
              <>
                <Text style={[styles.subsectionTitle, { color: severityColor("recommended") }]}>
                  Recommended Improvements ({recommended.length})
                </Text>
                {recommended.map((f) => (
                  <View key={f.ruleId}>
                    <Text style={[styles.findingTitle, { color: severityColor("recommended") }]}>{f.title}</Text>
                    <Text style={styles.findingDesc}>{f.description}</Text>
                    <Text style={styles.suggestion}>Suggested fix: {f.suggestion}</Text>
                  </View>
                ))}
              </>
            )}

            {niceToHave.length > 0 && (
              <>
                <Text style={[styles.subsectionTitle, { color: severityColor("nice-to-have") }]}>
                  Nice-to-Have Enhancements ({niceToHave.length})
                </Text>
                {niceToHave.map((f) => (
                  <View key={f.ruleId}>
                    <Text style={[styles.findingTitle, { color: severityColor("nice-to-have") }]}>{f.title}</Text>
                    <Text style={styles.findingDesc}>{f.description}</Text>
                    <Text style={styles.suggestion}>Suggested fix: {f.suggestion}</Text>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        <View style={styles.promptSection}>
          {prompt.split("\n").map((line, i) => (
            <Text key={i} style={styles.promptText}>
              {line || " "}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  )
}
