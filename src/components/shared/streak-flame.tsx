"use client"

import { motion } from "framer-motion"

interface StreakFlameProps {
  days: number
}

export function StreakFlame({ days }: StreakFlameProps) {
  const isActive = days > 0

  return (
    <div className="flex items-center gap-1.5">
      <motion.span
        animate={
          isActive
            ? {
                scale: [1, 1.15, 0.95, 1.1, 1],
                rotate: [0, -5, 5, -3, 0],
              }
            : { scale: 1 }
        }
        transition={
          isActive
            ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
            : {}
        }
        className="text-xl"
        role="img"
        aria-label="streak flame"
      >
        {isActive ? "🔥" : "💤"}
      </motion.span>

      <motion.span
        key={days}
        initial={{ scale: 1.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`font-bold tabular-nums ${isActive ? "text-orange-500" : "text-zinc-400"}`}
      >
        {days}
      </motion.span>

      <span className="text-xs text-zinc-500">ngày</span>
    </div>
  )
}
