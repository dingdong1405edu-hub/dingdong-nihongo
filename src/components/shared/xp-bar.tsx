"use client"

import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Zap } from "lucide-react"

interface XpBarProps {
  xp: number
  level: string
}

const XP_PER_LEVEL = 1000

export function XpBar({ xp, level }: XpBarProps) {
  const currentLevelXp = xp % XP_PER_LEVEL
  const progress = Math.min((currentLevelXp / XP_PER_LEVEL) * 100, 100)

  return (
    <div className="space-y-1 w-full">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-1 font-medium">
          <Zap className="h-3 w-3 text-yellow-500" />
          {xp.toLocaleString()} XP
        </span>
        <span className="font-semibold text-indigo-600">{level}</span>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Progress
          value={progress}
          className="h-2 bg-zinc-100 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-indigo-600"
        />
      </motion.div>

      <p className="text-right text-xs text-zinc-400">
        {currentLevelXp} / {XP_PER_LEVEL}
      </p>
    </div>
  )
}
