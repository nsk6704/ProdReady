"use client"

import { useState, useEffect } from "react"

interface ScoreGaugeProps {
  score: number
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const [displayed, setDisplayed] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const duration = 800
    const steps = 30
    const increment = score / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayed(score)
        clearInterval(interval)
        return
      }
      setDisplayed(Math.round(current))
    }, duration / steps)

    const timer = setTimeout(() => setReady(true), 50)
    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [score])

  const color =
    score >= 80
      ? "stroke-green-500"
      : score >= 50
        ? "stroke-amber-500"
        : "stroke-red-500"

  const textColor =
    score >= 80
      ? "text-green-600"
      : score >= 50
        ? "text-amber-500"
        : "text-red-500"

  const label =
    score >= 80
      ? "Looking solid!"
      : score >= 50
        ? "Room for improvement"
        : "Needs work"

  const circumference = 2 * Math.PI * 52
  const offset = ready ? circumference - (displayed / 100) * circumference : circumference

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
            className={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.9s ease-out",
            }}
          />
        </svg>
        <span
          className={`absolute text-4xl font-bold tabular-nums ${textColor}`}
          style={{
            animation: ready ? "count-up 0.3s ease-out" : "none",
          }}
        >
          {displayed}
        </span>
      </div>
      <p
        className={`text-sm font-medium ${textColor}`}
        style={{
          opacity: ready ? 1 : 0,
          transition: "opacity 0.4s ease-out 0.7s",
        }}
      >
        {label}
      </p>
    </div>
  )
}
