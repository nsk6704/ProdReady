"use client"

import { useEffect, useState, useId } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"

interface ScoreCelebrationProps {
  amount: number
  onComplete?: () => void
}

const COLORS = [
  "bg-amber-400",
  "bg-green-400",
  "bg-emerald-400",
  "bg-yellow-300",
  "bg-orange-400",
  "bg-lime-400",
]

export default function ScoreCelebration({ amount, onComplete }: ScoreCelebrationProps) {
  const [show, setShow] = useState(true)
  const uid = useId()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      onComplete?.()
    }, 2200)
    return () => clearTimeout(timer)
  }, [onComplete])

  const [particles] = useState(() =>
    Array.from({ length: 16 }, (_, i) => ({
      angle: (i / 16) * 360,
      color: COLORS[i % COLORS.length],
      distance: 60 + Math.random() * 80,
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.1,
    })),
  )

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          {particles.map((p, i) => (
            <motion.div
              key={`${uid}-${i}`}
              className={`absolute h-2 w-2 rounded-full ${p.color}`}
              style={{
                width: p.size,
                height: p.size,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                opacity: [1, 0.8, 0],
                scale: [0, 1.2, 0.8, 0],
              }}
              transition={{
                duration: 0.8,
                delay: p.delay,
                ease: "easeOut",
              }}
            />
          ))}

          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.3, 1],
              opacity: 1,
            }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              times: [0, 0.5, 1],
            }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-300 to-emerald-400 shadow-lg shadow-green-200/50">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <motion.p
              className="text-3xl font-bold text-green-600 dark:text-green-400"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              +{amount}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
