import type { Stack } from "@/scanner/types"
import { Badge } from "@/components/ui/badge"
import { Zap, Database, Palette, FlaskConical, Link, BarChart3, FileText, Globe } from "lucide-react"
import type { ComponentType } from "react"

interface StackDisplayProps {
  stack: Stack
}

const sections: { key: keyof Stack; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { key: "framework", label: "Framework", Icon: Zap },
  { key: "database", label: "Database", Icon: Database },
  { key: "styling", label: "Styling", Icon: Palette },
  { key: "testing", label: "Testing", Icon: FlaskConical },
  { key: "orm", label: "ORM", Icon: Link },
  { key: "monitoring", label: "Monitoring", Icon: BarChart3 },
  { key: "logging", label: "Logging", Icon: FileText },
  { key: "httpClient", label: "HTTP Client", Icon: Globe },
]

export default function StackDisplay({ stack }: StackDisplayProps) {
  const relevant = sections.filter((s) => {
    const val = stack[s.key]
    return val && (typeof val === "string" ? val : val.length > 0)
  })

  if (relevant.length === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="text-muted-foreground text-sm font-medium">Stack:</span>
      {relevant.map((s) => {
        const val = stack[s.key]
        const label = typeof val === "string" ? val : (val as string[]).join(", ")
        const Icon = s.Icon
        return (
          <Badge key={s.key} variant="secondary" className="flex items-center gap-1 text-xs">
            <Icon className="h-3 w-3" />
            {label}
          </Badge>
        )
      })}
    </div>
  )
}
