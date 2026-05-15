"use client"

import type { Finding } from "@/scanner/types"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
  ThumbsUp,
  X,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900",
    label: "Critical",
  },
  recommended: {
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900",
    label: "Recommended",
  },
  "nice-to-have": {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-900",
    label: "Nice-to-Have",
  },
}

interface IssueCardProps {
  finding: Finding
  onDismiss?: (optionId: string, recovery: number, ruleId: string) => void
}

export default function IssueCard({ finding, onDismiss }: IssueCardProps) {
  const [dismissed, setDismissed] = useState<string | null>(null)
  const config = severityConfig[finding.severity]
  const Icon = config.icon

  const handleDismiss = (optionId: string, scoreImpact: number) => {
    setDismissed(optionId)
    const recovery = Math.abs(finding.scoreImpact) - Math.abs(scoreImpact)
    onDismiss?.(optionId, recovery, finding.ruleId)
  }

  return (
    <Card className={`${config.bg} ${config.border} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <Icon className={`mt-0.5 h-5 w-5 ${config.color}`} />
            <div>
              <CardTitle className="text-base">{finding.title}</CardTitle>
              <CardDescription className="mt-1">{finding.description}</CardDescription>
            </div>
          </div>
          <Badge variant={finding.severity === "critical" ? "destructive" : "secondary"}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="bg-background/50 flex items-start gap-2 rounded-md p-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm leading-relaxed">{finding.suggestion}</p>
        </div>

        {finding.dismissOptions && finding.dismissOptions.length > 0 && !dismissed && (
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 p-3">
            <p className="mb-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
              Not relevant for your setup?
            </p>
            <div className="flex flex-wrap gap-2">
              {finding.dismissOptions.map((opt) => (
                <Button
                  key={opt.id}
                  variant="default"
                  size="sm"
                  className="bg-amber-500 text-xs text-white hover:bg-amber-600"
                  onClick={() => handleDismiss(opt.id, opt.scoreImpact)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {dismissed && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-xs text-green-700 dark:bg-green-950/20 dark:text-green-400">
            <ThumbsUp className="h-3 w-3 shrink-0" />
            <span>
              {finding.dismissOptions?.find((o) => o.id === dismissed)?.description}
            </span>
            <button
              onClick={() => setDismissed(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
