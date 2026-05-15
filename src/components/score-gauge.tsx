interface ScoreGaugeProps {
  score: number
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const color =
    score >= 80 ? "text-green-600" : score >= 50 ? "text-amber-500" : "text-red-500"
  const label =
    score >= 80
      ? "Looking solid!"
      : score >= 50
        ? "Room for improvement"
        : "Needs work"

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="oklch(0.922 0 0)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 326.73} 326.73`}
            className={color}
          />
        </svg>
        <span className={`absolute text-4xl font-bold ${color}`}>{score}</span>
      </div>
      <p className={`text-sm font-medium ${color}`}>{label}</p>
    </div>
  )
}
