import type { ScanRule } from "../types"

const SECRET_PATTERNS: { regex: RegExp; label: string }[] = [
  { regex: /(?:AWS|AZURE|GCP|ALICLOUD)_(?:(?:ACCESS_KEY|SECRET_KEY|SECRET_ACCESS_KEY|ACCESS_KEY_ID))\s*[:=]\s*['"][A-Za-z0-9\/+=]{16,}['"]/, label: "Cloud provider secret key" },
  { regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/, label: "Private key (RSA/EC)" },
  { regex: /-----BEGIN\s+OPENSSH\s+PRIVATE\s+KEY-----/, label: "Private key (OpenSSH)" },
  { regex: /gh[sp]_[A-Za-z0-9]{36,}/, label: "GitHub token" },
  { regex: /sk_live_[A-Za-z0-9]{24,}/, label: "Stripe live secret key" },
  { regex: /(?:STRIPE|TWILIO|SENDGRID|MAILGUN|DROPBOX)_(?:(?:API_KEY|SECRET|TOKEN|API_SECRET|AUTH_TOKEN))\s*[:=]\s*['"][A-Za-z0-9]{16,}['"]/, label: "SaaS API key" },
  { regex: /(?:MONGODB|POSTGRES|MYSQL|REDIS)_(?:URI|URL|CONNECTION_STRING|HOST|PASSWORD)\s*[:=]\s*['"][^'"]+['"]/, label: "Database connection string" },
  { regex: /(?:JWT_SECRET|SESSION_SECRET|COOKIE_SECRET|APP_SECRET|SECRET_KEY|SECRET)\s*[:=]\s*['"][A-Za-z0-9!@#$%^&*()_+=\-{}[\]|;:',.<>?/]{16,}['"]/, label: "Application secret key" },
  { regex: /(?:SENTRY|DATADOG|NEW_RELIC|HONEYCOMB|LOGZIO)_(?:DSN|API_KEY|LICENSE_KEY|AUTH_TOKEN|INGESTION_KEY)\s*[:=]\s*['"][A-Za-z0-9]{16,}['"]/, label: "Monitoring/APM key" },
  { regex: /password\s*[:=]\s*['"](?![A-Za-z]*['"])(?!['"]\s*$)(?!.*(?:placeholder|example|your|changeme|xxx))[^'"]{8,}['"]/i, label: "Hardcoded password" },
]

const SOURCE_EXTENSIONS = /\.(ts|tsx|js|jsx|py|go|rs|rb|php|java|kt|swift|env|yml|yaml|json|toml|cfg|ini|conf)$/

export const rule: ScanRule = {
  id: "has-secrets-leak",
  category: "critical",
  check: async (ctx) => {
    const candidates = ctx.files.filter(
      (f) =>
        SOURCE_EXTENSIONS.test(f) &&
        !f.includes("node_modules") &&
        !f.includes(".git/") &&
        !f.includes("__tests__") &&
        !f.includes(".test.") &&
        !f.includes(".spec.") &&
        !f.includes("fixture") &&
        !f.includes("mock") &&
        !f.includes("example") &&
        !f.endsWith(".example.ts") &&
        !f.endsWith(".example.js") &&
        !f.endsWith(".env.example") &&
        !f.endsWith(".env.sample") &&
        !f.endsWith("package-lock.json") &&
        !f.endsWith("yarn.lock") &&
        !f.endsWith("pnpm-lock.yaml"),
    )

    const findings: { file: string; labels: string[] }[] = []

    for (const file of candidates.slice(0, 30)) {
      const content = ctx.fileContents.get(file)
      if (!content) continue

      const matches = SECRET_PATTERNS
        .filter(({ regex }) => regex.test(content))
        .map(({ label }) => label)

      if (matches.length > 0) {
        findings.push({ file, labels: matches })
      }
    }

    if (findings.length === 0) return null

    const totalSecrets = findings.reduce((s, f) => s + f.labels.length, 0)
    const impactedFiles = findings.length
    const sampleFile = findings[0].file

    return {
      ruleId: "has-secrets-leak",
      title: `Potential secrets committed${impactedFiles > 1 ? ` (${totalSecrets} found in ${impactedFiles} files)` : ""}`,
      description:
        `Found ${totalSecrets} potential secret${totalSecrets > 1 ? "s" : ""} in ${impactedFiles} file${impactedFiles > 1 ? "s" : ""} like \`${sampleFile}\`. Hardcoded secrets in source code = instant breach if the repo goes public.`,
      severity: "critical",
      scoreImpact: -15,
      suggestion:
        "Remove secrets from source files immediately. Use environment variables or a secret manager (Doppler, 1Password, AWS Secrets Manager). Then rotate any exposed credentials.",
      badge: "Potential Secrets Leak",
    }
  },
}
