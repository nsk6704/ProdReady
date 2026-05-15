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
  if (!scan) return { title: "ProdReady: Report Not Found" }

  return {
    title: `${scan.owner}/${scan.name} scores ${scan.score}/100 on ProdReady`,

    description: `Production readiness report for ${scan.owner}/${scan.name}. Score: ${scan.score}/100.`,
    openGraph: {
      title: `${scan.owner}/${scan.name} scores ${scan.score}/100 on ProdReady`,
      description: `Production readiness report. Score: ${scan.score}/100. ${(scan.findings as unknown as Finding[]).length} issues found.`,
      images: [{ url: `/report/${id}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [{ url: `/report/${id}/opengraph-image`, width: 1200, height: 630 }],
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
