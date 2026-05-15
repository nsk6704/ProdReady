import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-dockerfile",
  category: "recommended",
  archetypes: ["web-app", "api-server", "fullstack"],
  check: async (ctx) => {
    const hasDockerfile = ctx.files.some(
      (f) => f === "Dockerfile" || f === "docker-compose.yml" || f === "docker-compose.yaml",
    )
    if (hasDockerfile) return null

    const isApiServer = ctx.stack.archetype === "api-server"
    const platformLikesDocker = ["Express", "Fastify", "Hono", "NestJS"].includes(
      ctx.stack.framework ?? "",
    )

    if (!isApiServer && !platformLikesDocker) return null

    return {
      ruleId: "has-dockerfile",
      title: "No Dockerfile detected",
      description: isApiServer
        ? "Your API server has no containerization. That means manual deploys, environment drift, and praying the server doesn't go down."
        : "Without Docker, your deployment is tied to your machine. Containerize for consistency.",
      severity: "recommended",
      scoreImpact: isApiServer ? -8 : -5,
      suggestion: isApiServer
        ? "Add a `Dockerfile` and `docker-compose.yml`. Even a simple Node.js Dockerfile makes deploys reproducible."
        : "Add a `Dockerfile` for consistent deployments across environments.",
      badge: "Missing Dockerfile",
    }
  },
}
