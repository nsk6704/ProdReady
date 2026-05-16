import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-strict-ts",
  category: "recommended",
  check: async (ctx) => {
    const tsconfigPath = ctx.files.find((f) => f.endsWith("tsconfig.json"))
    if (!tsconfigPath) return null
    const tsconfig = ctx.fileContents.get(tsconfigPath)
    if (!tsconfig) return null

    const hasStrict = /"strict"\s*:\s*true/.test(tsconfig)
    const hasNoExplicitAny = /"noImplicitAny"\s*:\s*true/.test(tsconfig)
    const hasStrictNullChecks = /"strictNullChecks"\s*:\s*true/.test(tsconfig)

    if (hasStrict) return null

    if (!hasNoExplicitAny || !hasStrictNullChecks) {
      return {
        ruleId: "has-strict-ts",
        title: "TypeScript strict mode is not enabled",
        description:
          "You're using TypeScript but without strict mode, you might as well be using `// @ts-ignore` everywhere. `any` is not a type.",
        severity: "recommended",
        scoreImpact: -8,
        suggestion:
          "Enable `strict: true` in `tsconfig.json`. It enables all strict checks and catches bugs at compile time instead of runtime.",
        badge: "TypeScript Not Strict",
      }
    }

    return null
  },
}
