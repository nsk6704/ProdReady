import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
    })
  } catch (error) {
    console.error("Report fetch failed:", error)
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 },
    )
  }
}
