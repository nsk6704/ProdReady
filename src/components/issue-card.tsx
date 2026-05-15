import type { Finding } from "@/scanner/types"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

export default function IssueCard({ finding }: { finding: Finding }) {
  const config = severityConfig[finding.severity]
  const Icon = config.icon

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
      <CardContent>
        <div className="bg-background/50 flex items-start gap-2 rounded-md p-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm leading-relaxed">{finding.suggestion}</p>
        </div>
      </CardContent>
    </Card>
  )
}
