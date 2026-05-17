"use client"

import type { Finding, Stack } from "@/scanner/types"
import Link from "next/link"
import ScoreGauge from "@/components/score-gauge"
import StackDisplay from "@/components/stack-display"
import BadgeList from "@/components/badge-list"
import IssueCard from "@/components/issue-card"
import ShareButton from "@/components/share-button"
import StaggerIn from "@/components/stagger-in"
import ScoreCelebration from "@/components/score-celebration"
import { Separator } from "@/components/ui/separator"
import { buttonVariants } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, GitBranch, Calendar, Check, X, ArrowUp, RefreshCw, Loader2, HelpCircle } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import type { Archetype } from "@/scanner/types"

interface CheckItem {
  id: string
  label: string
  howItWorks: string
  archetypes?: Archetype[]
  languages?: string[]
}

const CHECKS: CheckItem[] = [
  { id: "has-env-example", label: ".env.example file", howItWorks: "Environment variables like API keys and secrets should never be committed. A .env.example tells contributors what they need to set up locally." },
  { id: "has-readme", label: "README documentation", howItWorks: "A README is the first thing people see. It should explain what your project does, how to run it, and how to contribute." },
  { id: "has-cicd", label: "CI/CD pipeline", howItWorks: "Automated builds and tests catch issues before they reach production. CI/CD runs your checks on every push or PR." },
  { id: "has-tests", label: "Test setup", howItWorks: "Without tests, you can't be confident changes won't break things. A test framework verifies your code works as expected." },
  { id: "has-validation", label: "Input validation", howItWorks: "User input should never be trusted blindly. Validation ensures data is safe and correctly formatted." },
  { id: "has-strict-ts", label: "Strict TypeScript", languages: ["typescript"], howItWorks: "TypeScript's strict mode catches null checks, implicit any, and other common pitfalls at compile time rather than runtime." },
  { id: "has-retry-handling", label: "HTTP retry & timeout handling", howItWorks: "Network requests can fail. Retry logic and timeouts prevent transient failures from crashing your application." },
  { id: "has-dockerfile", label: "Dockerfile", howItWorks: "A Dockerfile makes your app portable so anyone can run it without manually setting up the environment." },
  { id: "has-secrets-leak", label: "Potential secrets leak", howItWorks: "Accidentally committing API keys or credentials is a security risk. This scans for common secret patterns in your codebase." },
  { id: "has-gitignore", label: ".gitignore", howItWorks: "Prevents build artifacts, dependencies, and sensitive files from being accidentally tracked in version control." },
  { id: "has-error-handling", archetypes: ["api-server", "fullstack"], label: "Global error handler", howItWorks: "Unhandled errors can crash your server or leak internal details to users. Every backend framework supports global error handling." },
  { id: "has-error-boundaries", archetypes: ["web-app", "fullstack"], label: "Error boundaries", howItWorks: "A UI crash shouldn't take down the entire page. Most frontend frameworks support error boundaries to handle rendering failures gracefully." },
  { id: "has-rate-limiting", archetypes: ["api-server", "fullstack"], label: "Rate limiting", howItWorks: "Without rate limiting, your API is vulnerable to abuse. It protects against excessive requests from a single client." },
  { id: "has-logging", archetypes: ["api-server", "fullstack"], label: "Structured logging", howItWorks: "Structured logs make it possible to search, filter, and analyze application behavior in production." },
  { id: "has-cors", archetypes: ["api-server", "fullstack"], label: "CORS configuration", howItWorks: "Controls which domains can access your API. Required when your frontend and backend are on different origins." },
  { id: "has-monitoring", archetypes: ["web-app", "api-server", "fullstack"], label: "Monitoring & observability", howItWorks: "You can't fix what you can't see. Monitoring alerts you to errors, slow requests, and other production issues." },
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
  cached?: boolean
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
  cached,
}: ReportViewProps) {
  const router = useRouter()
  const [rescanning, setRescanning] = useState(false)
  const [scoreRecovery, setScoreRecovery] = useState(0)
  const [dismissedRules, setDismissedRules] = useState<Set<string>>(new Set())
  const [celebration, setCelebration] = useState<number | null>(null)
  const displayScore = Math.min(100, score + scoreRecovery)

  const findingMap = new Set(findings.map((f) => f.ruleId))
  const filteredBadges = badges.filter((b) => {
    return !findings.some(
      (f) => f.badge === b && dismissedRules.has(f.ruleId),
    )
  })
  const hasRecovered = scoreRecovery > 0

  const critical = findings.filter((f) => f.severity === "critical")
  const recommended = findings.filter((f) => f.severity === "recommended")
  const niceToHave = findings.filter((f) => f.severity === "nice-to-have")

  const handleRescan = async () => {
    setRescanning(true)
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, force: true }),
      })
      const data = await res.json()
      router.push(`/report/${data.id}`)
    } catch {
      setRescanning(false)
    }
  }

  const handleDismiss = useCallback(
    (_optionId: string, recovery: number, ruleId: string) => {
      setScoreRecovery((prev) => prev + recovery)
      setDismissedRules((prev) => new Set(prev).add(ruleId))
      setCelebration(recovery)
    },
    [],
  )

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
          <ThemeToggle />
        </div>
      </header>

      <div className="mb-8 flex flex-col items-center gap-4">
        <ScoreGauge score={displayScore} />

        {cached && (
          <div className="flex items-center gap-2">
            <div className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 rounded-full px-3 py-1 text-xs">
              Cached result. We scanned this repo less than an hour ago.
            </div>
            <button
              onClick={handleRescan}
              disabled={rescanning}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 inline-flex items-center gap-1 text-xs font-medium transition-colors"
            >
              {rescanning ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Rescan
            </button>
          </div>
        )}

        {hasRecovered ? (
          <div className="animate-pop-in flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400">
            <ArrowUp className="h-3 w-3" />
            Score improved by {scoreRecovery} points
          </div>
        ) : (
          <p className="animate-fade-in-up text-muted-foreground text-xs">
            {displayScore >= 90
              ? "Looking solid. Ship it."
              : displayScore >= 50
                ? "Getting there. Address the issues below."
                : "A bit rough. Start with the critical issues."}
          </p>
        )}

        {celebration !== null && (
          <ScoreCelebration
            amount={celebration}
            onComplete={() => setCelebration(null)}
          />
        )}

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

        <BadgeList badges={filteredBadges} />

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

      <StaggerIn index={3}>
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">What We Checked</h2>
          {CHECKS.filter(
              (check) =>
                (!check.archetypes ||
                  check.archetypes.includes(stack.archetype)) &&
                (!check.languages ||
                  check.languages.includes(stack.language)),
            ).length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No common checks match your project type.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {CHECKS.filter(
                  (check) =>
                    (!check.archetypes ||
                      check.archetypes.includes(stack.archetype)) &&
                    (!check.languages ||
                      check.languages.includes(stack.language)),
                ).map((check, idx) => {
                  const isFinding = findingMap.has(check.id)
                  const isDismissed = dismissedRules.has(check.id)
                  const Icon = isDismissed || !isFinding ? Check : X
                  const statusClass =
                    isDismissed || !isFinding
                      ? "text-green-500"
                      : "text-red-500"

                  return (
                    <div
                      key={check.id}
                      className="animate-fade-in-up flex items-center gap-2 text-sm"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <Icon className={`h-4 w-4 ${statusClass}`} />
                      <span>{check.label}</span>
                      <Popover>
                        <PopoverTrigger
                          aria-label="Learn more"
                          openOnHover
                          className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                        </PopoverTrigger>
                        <PopoverContent side="top" align="center">
                          <p>{check.howItWorks}</p>
                        </PopoverContent>
                      </Popover>
                      {isDismissed && (
                        <span className="ml-auto text-xs text-green-600">
                          Dismissed
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
        </section>
      </StaggerIn>

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
                    <IssueCard finding={f} onDismiss={handleDismiss} />
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
                    <IssueCard finding={f} onDismiss={handleDismiss} />
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
                    <IssueCard finding={f} onDismiss={handleDismiss} />
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
