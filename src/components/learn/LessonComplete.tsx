'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { scoreColor } from '@/lib/utils'
import { Trophy, Star, Zap, RotateCcw } from 'lucide-react'

interface LessonCompleteProps {
  score: number
  correctCount: number
  totalCount: number
  xpGained: number
  returnPath: string
}

export function LessonComplete({
  score,
  correctCount,
  totalCount,
  xpGained,
  returnPath,
}: LessonCompleteProps) {
  const isPerfect = score === 100
  const isGood = score >= 80

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      {/* Celebration burst */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 18,
          delay: 0.1,
        }}
        className="mb-6"
      >
        {isPerfect ? (
          <div className="relative">
            <div className="text-8xl" role="img" aria-label="trophy">
              🏆
            </div>
            {/* Sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 10)],
                  y: [0, -(20 + i * 8)],
                }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                className="absolute top-1/2 left-1/2 text-yellow-400 text-xl pointer-events-none"
              >
                ✦
              </motion.span>
            ))}
          </div>
        ) : isGood ? (
          <div className="text-8xl" role="img" aria-label="star">
            ⭐
          </div>
        ) : (
          <div className="text-8xl" role="img" aria-label="book">
            📚
          </div>
        )}
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-2 mb-8"
      >
        <h1 className="text-3xl font-bold text-zinc-900">
          {isPerfect
            ? '完璧！ Hoàn hảo!'
            : isGood
              ? 'よくできました！ Làm tốt lắm!'
              : 'がんばりました！ Cố lên nha!'}
        </h1>
        <p className="text-zinc-500 text-sm">
          {isPerfect
            ? 'Bạn đã trả lời đúng tất cả!'
            : `Bạn trả lời đúng ${correctCount}/${totalCount} câu.`}
        </p>
      </motion.div>

      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm space-y-4 mb-8"
      >
        {/* Score circle */}
        <div className="flex justify-center">
          <div
            className={`h-28 w-28 rounded-full border-4 flex flex-col items-center justify-center ${
              isPerfect
                ? 'border-yellow-400 bg-yellow-50'
                : isGood
                  ? 'border-green-400 bg-green-50'
                  : 'border-zinc-300 bg-zinc-50'
            }`}
          >
            <span className={`text-3xl font-bold ${scoreColor(score)}`}>
              {score}%
            </span>
            <span className="text-xs text-zinc-500">điểm</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-center">
            <Trophy className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-700">{correctCount}</p>
            <p className="text-xs text-green-600">Đúng</p>
          </div>
          <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-center">
            <Star className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-indigo-700">
              {totalCount - correctCount}
            </p>
            <p className="text-xs text-indigo-600">Sai</p>
          </div>
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-center">
            <Zap className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-yellow-700">+{xpGained}</p>
            <p className="text-xs text-yellow-600">XP</p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm space-y-3"
      >
        <Button
          asChild
          size="lg"
          className="w-full h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700"
        >
          <Link href={returnPath}>次へ — Tiếp tục</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full h-14 text-base text-zinc-700"
        >
          <Link href="/dashboard">
            <RotateCcw className="h-4 w-4 mr-2" />
            Về Dashboard
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
