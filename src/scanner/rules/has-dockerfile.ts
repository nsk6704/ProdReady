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
      description: "Not every project needs Docker. Tell us why you skipped it and we'll adjust the score.",
      severity: "recommended",
      scoreImpact: -8,
      suggestion:
        "A Dockerfile makes your app portable and deployable anywhere. But if you're using a PaaS or your project is tiny, it might not matter.",
      badge: "Missing Dockerfile",
      dismissOptions: [
        { id: "paas", label: "Using a PaaS (Vercel / Railway / Fly)", scoreImpact: -1, description: "Fair enough — the platform handles deployment." },
        { id: "too-small", label: "Project too small to need it", scoreImpact: -2, description: "Valid for tiny side projects. Revisit when it grows." },
        { id: "manual", label: "Prefer manual setup", scoreImpact: -4, description: "Your call, but Docker saves time in the long run." },
        { id: "no-reason", label: "I should add it", scoreImpact: -8, description: "Honest. Add a Dockerfile when you get a chance." },
      ],
    }
  },
}
