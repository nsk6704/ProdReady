import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-monitoring",
  category: "nice-to-have",
  check: async (ctx) => {
    if (ctx.stack.monitoring.length > 0) return null

    return {
      ruleId: "has-monitoring",
      title: "No monitoring or observability detected",
      description:
        "Your app is flying blind. When it breaks at 3 AM, you'll know about it from your users, not your monitoring dashboard.",
      severity: "nice-to-have",
      scoreImpact: -3,
      suggestion:
        "Add Sentry (free tier) for error tracking. For more visibility, consider OpenTelemetry or Datadog as you scale.",
      badge: "No Monitoring Detected",
    }
  },
}
