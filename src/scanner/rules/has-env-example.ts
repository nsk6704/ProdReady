import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-env-example",
  category: "nice-to-have",
  check: async (ctx) => {
    const hasEnvExample = ctx.files.some(
      (f) => f === ".env.example" || f === ".env.sample",
    )
    if (hasEnvExample) return null

    return {
      ruleId: "has-env-example",
      title: "No .env.example found",
      description:
        "Your repo is keeping env vars a secret from your teammates. Without a sample env file, anyone cloning your project has to guess what variables to set.",
      severity: "nice-to-have",
      scoreImpact: -3,
      suggestion:
        "Create a `.env.example` file listing all required environment variables with placeholder values.",
      badge: "Missing .env.example",
      dismissOptions: [
        { id: "secret-manager", label: "Using a secret manager (Doppler/1Password)", scoreImpact: -1, description: "External secret managers replace the need for a local file." },
        { id: "no-vars", label: "No env vars needed yet", scoreImpact: -1, description: "Add one when you introduce env-specific config." },
        { id: "readme", label: "Documented in README", scoreImpact: -2, description: "Still handy to have a standalone file, but this works." },
        { id: "should-add", label: "I should add one", scoreImpact: -3, description: "It only takes a minute. Create a `.env.example` with placeholder values." },
      ],
    }
  },
}
