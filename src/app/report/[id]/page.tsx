import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import type { Finding, Stack } from "@/scanner/types"
import ReportView from "./report-view"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const scan = await prisma.scan.findUnique({ where: { id } })
  if (!scan) return { title: "Report Not Found - ProdReady" }

  return {
    title: `${scan.owner}/${scan.name} - ProdReady Score: ${scan.score}/100`,

    description: `Production readiness report for ${scan.owner}/${scan.name}. Score: ${scan.score}/100.`,
    openGraph: {
      title: `${scan.owner}/${scan.name} - ProdReady Score: ${scan.score}/100`,
      description: `Production readiness report. Score: ${scan.score}/100. ${(scan.findings as unknown as Finding[]).length} issues found.`,
    },
  }
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ cached?: string }>
}) {
  const { id } = await params
  const { cached } = await searchParams
  const scan = await prisma.scan.findUnique({ where: { id } })
  if (!scan) notFound()

  const findings = scan.findings as unknown as Finding[]
  const stack = scan.stack as unknown as Stack

  return (
    <ReportView
      id={scan.id}
      repoUrl={scan.repoUrl}
      owner={scan.owner}
      name={scan.name}
      score={scan.score}
      stack={stack}
      findings={findings}
      badges={scan.badges}
      createdAt={scan.createdAt.toISOString()}
      cached={cached === "1"}
    />
  )
}
