import type { Archetype, Finding, ScanContext, ScanResult, ScanRule } from "./types"
import { detectStack } from "./stack-detector"
import { rule as hasEnvExample } from "./rules/has-env-example"
import { rule as hasDockerfile } from "./rules/has-dockerfile"
import { rule as hasCicd } from "./rules/has-cicd"
import { rule as hasReadme } from "./rules/has-readme"
import { rule as hasValidation } from "./rules/has-validation"
import { rule as hasRetryHandling } from "./rules/has-retry-handling"
import { rule as hasRateLimiting } from "./rules/has-rate-limiting"
import { rule as hasErrorBoundaries } from "./rules/has-error-boundaries"
import { rule as hasLogging } from "./rules/has-logging"
import { rule as hasTests } from "./rules/has-tests"
import { rule as hasErrorHandling } from "./rules/has-error-handling"
import { rule as hasMonitoring } from "./rules/has-monitoring"
import { rule as hasStrictTs } from "./rules/has-strict-ts"
import { rule as hasCors } from "./rules/has-cors"
import { rule as hasGitignore } from "./rules/has-gitignore"
import { rule as hasSecretsLeak } from "./rules/has-secrets-leak"

const rules: ScanRule[] = [
  hasEnvExample,
  hasDockerfile,
  hasCicd,
  hasReadme,
  hasValidation,
  hasRetryHandling,
  hasRateLimiting,
  hasErrorBoundaries,
  hasLogging,
  hasTests,
  hasErrorHandling,
  hasMonitoring,
  hasStrictTs,
  hasCors,
  hasGitignore,
  hasSecretsLeak,
]

function isRuleApplicable(rule: ScanRule, archetype: Archetype): boolean {
  if (!rule.archetypes || rule.archetypes.length === 0) return true
  return rule.archetypes.includes(archetype)
}

export async function runScanner(ctx: ScanContext): Promise<ScanResult> {
  ctx.stack = detectStack(ctx)
  const archetype = ctx.stack.archetype

  const applicableRules = rules.filter((r) => isRuleApplicable(r, archetype))
  const results = await Promise.all(applicableRules.map((rule) => rule.check(ctx)))
  const findings: Finding[] = results.filter((f): f is Finding => f !== null)

  let score = 100
  for (const finding of findings) {
    score += finding.scoreImpact
  }
  score = Math.max(0, score)

  const positiveBadges: string[] = []
  const findingIds = new Set(findings.map((f) => f.ruleId))

  const checkBadge = (ruleId: string, presentLabel: string) => {
    const rule = rules.find((r) => r.id === ruleId)
    if (!rule || !isRuleApplicable(rule, archetype)) return
    if (!findingIds.has(ruleId)) positiveBadges.push(presentLabel)
  }

  checkBadge("has-dockerfile", "Docker Ready")
  checkBadge("has-cicd", "CI/CD Active")
  checkBadge("has-readme", "Has README")
  checkBadge("has-tests", "Tests Found")
  checkBadge("has-validation", "Validation Found")
  checkBadge("has-monitoring", "Monitoring Set Up")
  checkBadge("has-error-boundaries", "Error Boundaries Set")
  checkBadge("has-env-example", "Has .env.example")
  checkBadge("has-gitignore", "Has .gitignore")
  checkBadge("has-secrets-leak", "No Secrets Leaked")

  const negativeBadges = findings
    .map((f) => f.badge)
    .filter((b): b is string => b !== null)

  return {
    score,
    findings,
    stack: ctx.stack,
    badges: [...positiveBadges, ...negativeBadges],
  }
}
