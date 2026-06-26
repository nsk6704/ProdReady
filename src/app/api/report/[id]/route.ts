import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateFixPrompt } from "@/lib/generate-fix-prompt"
import type { Finding } from "@/scanner/types"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const scan = await prisma.scan.findUnique({ where: { id } })
    if (!scan) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    const findings = scan.findings as unknown as Finding[]
    const fixPrompt = generateFixPrompt(scan.owner, scan.name, findings)

    return NextResponse.json({
      id: scan.id,
      repoUrl: scan.repoUrl,
      owner: scan.owner,
      name: scan.name,
      branch: scan.branch,
      score: scan.score,
      stack: scan.stack,
      findings: scan.findings,
      badges: scan.badges,
      createdAt: scan.createdAt,
      fixPrompt,
    })
  } catch (error) {
    console.error("Report fetch failed:", error)
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 },
    )
  }
}
