"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useAnimate } from "framer-motion"

interface ScoreGaugeProps {
  score: number
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const [displayed, setDisplayed] = useState(0)
  const [ready, setReady] = useState(false)
  const [pulse, setPulse] = useState(false)
  const prevScore = useRef(0)
  const [scope, animate] = useAnimate()

  useEffect(() => {
    const from = prevScore.current
    prevScore.current = score
    const diff = score - from

    if (diff > 0) {
      setPulse(true)
      setTimeout(() => setPulse(false), 600)
      animate(
        scope.current,
        { scale: [1, 1.08, 0.95, 1.02, 1] },
        { duration: 0.6, ease: "easeOut" },
      )
    }

    const duration = 500
    const steps = 20
    const increment = diff / steps
    let current = from
    const interval = setInterval(() => {
      current += increment
      if ((diff > 0 && current >= score) || (diff < 0 && current <= score)) {
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
  }, [score, animate, scope])

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
      <div ref={scope} className="relative flex items-center justify-center">
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
              transition: "stroke-dashoffset 0.6s ease-out",
            }}
          />
        </svg>
        <span
          className={`absolute text-4xl font-bold tabular-nums ${textColor} ${pulse ? "scale-125" : ""}`}
          style={{
            transition: "transform 0.3s ease-out",
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
