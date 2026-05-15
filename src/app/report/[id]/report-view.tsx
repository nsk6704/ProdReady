"use client"

import type { Finding, Stack } from "@/scanner/types"
import Link from "next/link"
import ScoreGauge from "@/components/score-gauge"
import StackDisplay from "@/components/stack-display"
import BadgeList from "@/components/badge-list"
import IssueCard from "@/components/issue-card"
import ShareButton from "@/components/share-button"
import { Separator } from "@/components/ui/separator"
import { Button, buttonVariants } from "@/components/ui/button"
import { ArrowLeft, GitBranch, Calendar } from "lucide-react"

interface ReportViewProps {
  id: string
  repoUrl: string
  owner: string
  name: string
  score: number
  stack: Stack
  findings: Finding[]
  badges: string[]
  createdAt: string
}

export default function ReportView({
  id,
  repoUrl,
  owner,
  name,
  score,
  stack,
  findings,
  badges,
  createdAt,
}: ReportViewProps) {
  const critical = findings.filter((f) => f.severity === "critical")
  const recommended = findings.filter((f) => f.severity === "recommended")
  const niceToHave = findings.filter((f) => f.severity === "nice-to-have")

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          New Scan
        </Link>

        <div className="flex items-center gap-2">
          <ShareButton reportId={id} />
        </div>
      </header>

      <div className="mb-8 flex flex-col items-center gap-4">
        <ScoreGauge score={score} />

        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <GitBranch className="h-5 w-5" />
            <h1 className="text-2xl font-bold">
              {owner}/{name}
            </h1>
          </div>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground mt-1 inline-block text-sm underline-offset-2 hover:underline"
          >
            {repoUrl}
          </a>
        </div>

        <StackDisplay stack={stack} />

        <BadgeList badges={badges} />

        <div className="text-muted-foreground flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3" />
          {new Date(createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      <Separator className="mb-8" />

      <div className="flex flex-col gap-8">
        {critical.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-red-600 dark:text-red-400">
              Critical Issues ({critical.length})
            </h2>
            <div className="flex flex-col gap-3">
              {critical.map((f) => (
                <IssueCard key={f.ruleId} finding={f} />
              ))}
            </div>
          </section>
        )}

        {recommended.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-amber-600 dark:text-amber-400">
              Recommended Improvements ({recommended.length})
            </h2>
            <div className="flex flex-col gap-3">
              {recommended.map((f) => (
                <IssueCard key={f.ruleId} finding={f} />
              ))}
            </div>
          </section>
        )}

        {niceToHave.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-blue-600 dark:text-blue-400">
              Nice-to-Have Enhancements ({niceToHave.length})
            </h2>
            <div className="flex flex-col gap-3">
              {niceToHave.map((f) => (
                <IssueCard key={f.ruleId} finding={f} />
              ))}
            </div>
          </section>
        )}

        {findings.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-2xl font-bold text-green-600">No issues found!</p>
            <p className="text-muted-foreground mt-2">
              This repo is surprisingly production-ready. Ship it!
            </p>
          </div>
        )}
      </div>

      <Separator className="my-8" />

      <div className="flex justify-center">
        <Link
          href="/"
          className={buttonVariants({ variant: "outline" })}
        >
          Scan Another Repo
        </Link>
      </div>
    </div>
  )
}
