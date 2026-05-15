import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-tests",
  category: "recommended",
  check: async (ctx) => {
    if (ctx.stack.testing.length > 0) return null

    const hasTestFiles = ctx.files.some(
      (f) =>
        f.endsWith(".test.ts") ||
        f.endsWith(".test.tsx") ||
        f.endsWith(".spec.ts") ||
        f.endsWith(".spec.tsx") ||
        f.endsWith(".test.js") ||
        f.endsWith(".test.jsx") ||
        f.includes("__tests__") ||
        f.includes("__test__"),
    )

    if (hasTestFiles) return null

    return {
      ruleId: "has-tests",
      title: "No test infrastructure detected",
      description:
        "Shipping without tests is like skydiving without checking your parachute. It works until it doesn't.",
      severity: "recommended",
      scoreImpact: -8,
      suggestion:
        "Set up `vitest` (fast, Vite-native) or `jest` and write at least a few smoke tests for critical paths.",
      badge: "No Tests",
    }
  },
}
