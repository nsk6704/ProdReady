import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { fetchRepoInfo } from "@/scanner/github"
import { runScanner } from "@/scanner/engine"
import { prisma } from "@/lib/prisma"

const scanBody = z.object({
  repoUrl: z.string().url("Must be a valid URL").regex(
    /github\.com\/.+\/.+/,
    "Must be a GitHub repository URL",
  ),
  githubToken: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = scanBody.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      )
    }

    const { repoUrl, githubToken } = parsed.data

    const repoResult = await fetchRepoInfo(repoUrl, githubToken)
    if (!repoResult.success) {
      const status = repoResult.error.code === "RATE_LIMITED" ? 429
        : repoResult.error.code === "NOT_FOUND" ? 404
        : repoResult.error.code === "FORBIDDEN" ? 403
        : 400
      return NextResponse.json({ error: repoResult.error.message }, { status })
    }

    const packageJson = repoResult.fileContents.get("package.json")
    const parsedPackage = packageJson ? JSON.parse(packageJson) : null

    const scanContext = {
      repoInfo: repoResult.repoInfo,
      files: repoResult.files,
      fileContents: repoResult.fileContents,
      packageJson: parsedPackage,
      stack: null as never,
    }

    const result = await runScanner(scanContext)

    const scan = await prisma.scan.create({
      data: {
        repoUrl,
        owner: repoResult.repoInfo.owner,
        name: repoResult.repoInfo.name,
        branch: repoResult.repoInfo.branch,
        score: result.score,
        stack: JSON.parse(JSON.stringify(result.stack)),
        findings: JSON.parse(JSON.stringify(result.findings)),
        badges: result.badges,
      },
    })

    return NextResponse.json({ id: scan.id })
  } catch (error) {
    console.error("Scan failed:", error)
    return NextResponse.json(
      { error: "Scan failed unexpectedly" },
      { status: 500 },
    )
  }
}
