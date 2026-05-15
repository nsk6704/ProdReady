import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"

interface BadgeListProps {
  badges: string[]
}

const negativePatterns = [
  "Missing",
  "No ",
  "Not ",
  "Thin",
]

function isPositive(badge: string) {
  return !negativePatterns.some((p) => badge.startsWith(p))
}

export default function BadgeList({ badges }: BadgeListProps) {
  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => {
        const positive = isPositive(badge)
        return (
          <Badge
            key={badge}
            variant={positive ? "default" : "outline"}
            className={`flex items-center gap-1 ${
              positive
                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                : "text-muted-foreground"
            }`}
          >
            {positive ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {badge}
          </Badge>
        )
      })}
    </div>
  )
}
