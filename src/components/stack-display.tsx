import type { Stack } from "@/scanner/types"
import { Badge } from "@/components/ui/badge"

interface StackDisplayProps {
  stack: Stack
}

const sections: { key: keyof Stack; label: string; icon: string }[] = [
  { key: "framework", label: "Framework", icon: "⚡" },
  { key: "database", label: "Database", icon: "🗄️" },
  { key: "styling", label: "Styling", icon: "🎨" },
  { key: "testing", label: "Testing", icon: "🧪" },
  { key: "orm", label: "ORM", icon: "🔗" },
  { key: "monitoring", label: "Monitoring", icon: "📊" },
  { key: "logging", label: "Logging", icon: "📝" },
  { key: "httpClient", label: "HTTP Client", icon: "🌐" },
]

export default function StackDisplay({ stack }: StackDisplayProps) {
  const relevant = sections.filter((s) => {
    const val = stack[s.key]
    return val && (typeof val === "string" ? val : val.length > 0)
  })

  if (relevant.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-sm font-medium">Stack:</span>
      {relevant.map((s) => {
        const val = stack[s.key]
        const label = typeof val === "string" ? val : (val as string[]).join(", ")
        return (
          <Badge key={s.key} variant="secondary" className="text-xs">
            {s.icon} {label}
          </Badge>
        )
      })}
    </div>
  )
}
