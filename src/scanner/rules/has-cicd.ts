import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-cicd",
  category: "recommended",
  check: async (ctx) => {
    const hasCI = ctx.files.some(
      (f) =>
        f.startsWith(".github/workflows/") ||
        f.startsWith(".circleci/") ||
        f === ".gitlab-ci.yml" ||
        f === "Jenkinsfile",
    )
    if (hasCI) return null

    return {
      ruleId: "has-cicd",
      title: "No CI/CD pipeline configured",
      description:
        "Still deploying from your laptop? That's cute. Without CI/CD, your deployment process lives and dies by your WiFi connection.",
      severity: "recommended",
      scoreImpact: -8,
      suggestion:
        "Set up GitHub Actions with a `.github/workflows/` config. Start simple: lint, test, and deploy on push.",
      badge: "CI/CD Missing",
    }
  },
}
