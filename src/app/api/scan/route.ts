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

    const repoData = await fetchRepoInfo(repoUrl, githubToken)
    if (!repoData) {
      return NextResponse.json(
        { error: "Could not fetch repository. Check the URL or provide a GitHub token." },
        { status: 400 },
      )
    }

    const packageJson = repoData.fileContents.get("package.json")
    const parsedPackage = packageJson ? JSON.parse(packageJson) : null

    const scanContext = {
      repoInfo: repoData.repoInfo,
      files: repoData.files,
      fileContents: repoData.fileContents,
      packageJson: parsedPackage,
      stack: null as never,
    }

    const result = await runScanner(scanContext)

    const scan = await prisma.scan.create({
      data: {
        repoUrl,
        owner: repoData.repoInfo.owner,
        name: repoData.repoInfo.name,
        branch: repoData.repoInfo.branch,
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
