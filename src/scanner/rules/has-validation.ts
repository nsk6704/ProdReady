import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-validation",
  category: "recommended",
  check: async (ctx) => {
    if (ctx.stack.validation.length > 0) return null

    return {
      ruleId: "has-validation",
      title: "No input validation library detected",
      description:
        "You're trusting user input like it's your grandma. Without a validation library, your API is one bad request away from disaster.",
      severity: "recommended",
      scoreImpact: -8,
      suggestion:
        "Add a validation library to validate input at the boundary. Schema validation catches bad data before it reaches your logic.",
      badge: "No Validation Library",
    }
  },
}
