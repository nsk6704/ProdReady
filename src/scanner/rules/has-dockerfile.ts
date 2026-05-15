import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-dockerfile",
  category: "recommended",
  check: async (ctx) => {
    const hasDockerfile = ctx.files.some(
      (f) => f === "Dockerfile" || f === "docker-compose.yml" || f === "docker-compose.yaml",
    )
    if (hasDockerfile) return null

    return {
      ruleId: "has-dockerfile",
      title: "No Dockerfile detected",
      description:
        "Your app is tied to your laptop like a leash. No containerization means your code works on your machine and your machine only.",
      severity: "recommended",
      scoreImpact: -8,
      suggestion:
        "Add a `Dockerfile` for consistent deployments. Even a simple multi-stage Node.js Dockerfile is better than none.",
      badge: "Missing Dockerfile",
    }
  },
}
