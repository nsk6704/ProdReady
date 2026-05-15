import { NextRequest, NextResponse } from "next/server"
import { fetchRepoInfo } from "@/scanner/github"
import { runScanner } from "@/scanner/engine"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, githubToken } = await request.json()

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json(
        { error: "repoUrl is required" },
        { status: 400 },
      )
    }

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
