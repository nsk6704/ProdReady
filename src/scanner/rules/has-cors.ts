import type { ScanRule } from "../types"

export const rule: ScanRule = {
  id: "has-cors",
  category: "recommended",
  archetypes: ["api-server", "fullstack"],
  check: async (ctx) => {
    if (ctx.stack.framework !== "Express") return null

    const deps = ctx.packageJson
    if (!deps) return null

    const allDeps = {
      ...((deps.dependencies as Record<string, string>) || {}),
      ...((deps.devDependencies as Record<string, string>) || {}),
    }

    if ("cors" in allDeps) return null

    const sourceFiles = ctx.files.filter(
      (f) =>
        /\.(ts|js)$/.test(f) && !f.includes("node_modules"),
    )

    for (const file of sourceFiles.slice(0, 10)) {
      const content = ctx.fileContents.get(file)
      if (!content) continue
      if (/require\s*\(\s*['"]cors['"]\s*\)|from\s+['"]cors['"]/.test(content)) {
        return null
      }
    }

    return {
      ruleId: "has-cors",
      title: "No CORS configuration detected",
      description:
        "Your Express API might be locked down tight or wide open, and guessing isn't a strategy. Without explicit CORS config, browser-based clients will hit errors.",
      severity: "recommended",
      scoreImpact: -8,
      suggestion:
        "Install and configure `cors` middleware. Start with whitelisting your frontend origin(s) explicitly.",
      badge: "CORS Not Configured",
    }
  },
}
