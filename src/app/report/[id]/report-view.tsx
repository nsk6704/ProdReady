"use client"

import type { Finding, Stack } from "@/scanner/types"
import Link from "next/link"
import ScoreGauge from "@/components/score-gauge"
import StackDisplay from "@/components/stack-display"
import BadgeList from "@/components/badge-list"
import IssueCard from "@/components/issue-card"
import ShareButton from "@/components/share-button"
import StaggerIn from "@/components/stagger-in"
import { Separator } from "@/components/ui/separator"
import { buttonVariants } from "@/components/ui/button"
import { ArrowLeft, GitBranch, Calendar, Check, X, Minus } from "lucide-react"
import type { Archetype } from "@/scanner/types"

const CHECKS: { id: string; label: string; archetypes?: Archetype[] }[] = [
  { id: "has-env-example", label: ".env.example file" },
  { id: "has-readme", label: "README with documentation" },
  { id: "has-cicd", label: "CI/CD pipeline" },
  { id: "has-tests", label: "Test setup" },
  { id: "has-validation", label: "Input validation" },
  { id: "has-strict-ts", label: "TypeScript strict mode" },
  { id: "has-retry-handling", label: "HTTP retry & timeout handling" },
  { id: "has-dockerfile", archetypes: ["api-server"], label: "Dockerfile" },
  { id: "has-error-handling", archetypes: ["api-server", "fullstack"], label: "Global error handler" },
  { id: "has-error-boundaries", archetypes: ["web-app", "fullstack"], label: "React error boundaries" },
  { id: "has-rate-limiting", archetypes: ["api-server", "fullstack"], label: "Rate limiting" },
  { id: "has-logging", archetypes: ["api-server", "fullstack"], label: "Structured logging" },
  { id: "has-cors", archetypes: ["api-server", "fullstack"], label: "CORS configuration" },
  { id: "has-monitoring", archetypes: ["web-app", "api-server", "fullstack"], label: "Monitoring & observability" },
]

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
  const findingMap = new Set(findings.map((f) => f.ruleId))

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

        <p className="text-muted-foreground text-xs">
          {score >= 90
            ? "Looking solid. Ship it."
            : score >= 50
              ? "Getting there. Address the issues below."
              : "A bit rough. Start with the critical issues."}
        </p>

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

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">What We Checked</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHECKS.map((check) => {
            const isApplicable =
              !check.archetypes ||
              check.archetypes.includes(stack.archetype)
            const isFinding = findingMap.has(check.id)
            let Icon: typeof Check
            let statusClass: string
            if (!isApplicable) {
              Icon = Minus
              statusClass = "text-muted-foreground"
            } else if (isFinding) {
              Icon = X
              statusClass = "text-red-500"
            } else {
              Icon = Check
              statusClass = "text-green-500"
            }
            return (
              <div key={check.id} className="flex items-center gap-2 text-sm">
                <Icon className={`h-4 w-4 ${statusClass}`} />
                <span className={!isApplicable ? "text-muted-foreground" : ""}>
                  {check.label}
                </span>
                {!isApplicable && (
                  <span className="text-muted-foreground ml-auto text-xs">
                    N/A
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <Separator className="mb-8" />

      <div className="flex flex-col gap-8">
        {critical.length > 0 && (
          <StaggerIn index={0}>
            <section>
              <h2 className="mb-4 text-lg font-semibold text-red-600 dark:text-red-400">
                Critical Issues ({critical.length})
              </h2>
              <div className="flex flex-col gap-3">
                {critical.map((f, i) => (
                  <StaggerIn key={f.ruleId} index={i + 1}>
                    <IssueCard finding={f} />
                  </StaggerIn>
                ))}
              </div>
            </section>
          </StaggerIn>
        )}

        {recommended.length > 0 && (
          <StaggerIn index={1}>
            <section>
              <h2 className="mb-4 text-lg font-semibold text-amber-600 dark:text-amber-400">
                Recommended Improvements ({recommended.length})
              </h2>
              <div className="flex flex-col gap-3">
                {recommended.map((f, i) => (
                  <StaggerIn key={f.ruleId} index={i + 1}>
                    <IssueCard finding={f} />
                  </StaggerIn>
                ))}
              </div>
            </section>
          </StaggerIn>
        )}

        {niceToHave.length > 0 && (
          <StaggerIn index={2}>
            <section>
              <h2 className="mb-4 text-lg font-semibold text-blue-600 dark:text-blue-400">
                Nice-to-Have Enhancements ({niceToHave.length})
              </h2>
              <div className="flex flex-col gap-3">
                {niceToHave.map((f, i) => (
                  <StaggerIn key={f.ruleId} index={i + 1}>
                    <IssueCard finding={f} />
                  </StaggerIn>
                ))}
              </div>
            </section>
          </StaggerIn>
        )}

        {findings.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-2xl font-bold text-green-600">Looking good!</p>
            <p className="text-muted-foreground mt-2">
              Your side project is ready to ship.
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
