"use client"

import { motion } from "framer-motion"

interface HeartsDisplayProps {
  count: number
  max?: number
}

export function HeartsDisplay({ count, max = 5 }: HeartsDisplayProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 1 }}
          animate={{
            scale: i < count ? 1 : 0.7,
            opacity: i < count ? 1 : 0.35,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={i < count ? "text-red-500 text-lg" : "text-zinc-300 text-lg"}
          aria-label={i < count ? "heart" : "empty heart"}
        >
          ♥
        </motion.span>
      ))}
    </div>
  )
}
