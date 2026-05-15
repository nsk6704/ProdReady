import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-dockerfile",
  category: "recommended",
  archetypes: ["api-server"],
  check: async (ctx) => {
    const hasDockerfile = ctx.files.some(
      (f) => f === "Dockerfile" || f === "docker-compose.yml" || f === "docker-compose.yaml",
    )
    if (hasDockerfile) return null

    return {
      ruleId: "has-dockerfile",
      title: "No Dockerfile detected",
      description:
        "Your API server has no containerization. No Docker means manual deploys and environment drift.",
      severity: "recommended",
      scoreImpact: -8,
      suggestion:
        "Add a `Dockerfile` and `docker-compose.yml`. Even a simple Node.js Dockerfile makes deploys reproducible.",
      badge: "Missing Dockerfile",
    }
  },
}
