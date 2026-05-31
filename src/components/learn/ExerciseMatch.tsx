'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { MatchExercise } from '@/types'

interface ExerciseMatchProps {
  exercise: MatchExercise
  onCorrect: () => void
  onWrong: () => void
  answerState: 'idle' | 'correct' | 'wrong'
}

interface MatchPair {
  japanese: string
  vietnamese: string
  reading?: string
}

export function ExerciseMatch({
  exercise,
  onCorrect,
  onWrong,
  answerState,
}: ExerciseMatchProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null)

  const pairs = exercise.pairs
  // Shuffle right column once on mount using a stable approach
  const [shuffledRight] = useState<MatchPair[]>(() =>
    [...pairs].sort(() => Math.random() - 0.5)
  )

  const isAllMatched = matched.size === pairs.length

  const handleLeftClick = useCallback(
    (japanese: string) => {
      if (matched.has(japanese) || answerState !== 'idle') return
      setSelectedLeft(japanese)

      if (selectedRight !== null) {
        // Check match
        const correctPair = pairs.find((p) => p.japanese === japanese)
        if (correctPair && correctPair.vietnamese === selectedRight) {
          const newMatched = new Set(matched)
          newMatched.add(japanese)
          setMatched(newMatched)
          setSelectedLeft(null)
          setSelectedRight(null)
          if (newMatched.size === pairs.length) {
            onCorrect()
          }
        } else {
          setWrongPair({ left: japanese, right: selectedRight })
          setTimeout(() => {
            setWrongPair(null)
            setSelectedLeft(null)
            setSelectedRight(null)
          }, 600)
          onWrong()
        }
      }
    },
    [matched, answerState, selectedRight, pairs, onCorrect, onWrong]
  )

  const handleRightClick = useCallback(
    (vietnamese: string) => {
      if (
        matched.has(
          pairs.find((p) => p.vietnamese === vietnamese)?.japanese ?? ''
        ) ||
        answerState !== 'idle'
      )
        return
      setSelectedRight(vietnamese)

      if (selectedLeft !== null) {
        const correctPair = pairs.find((p) => p.japanese === selectedLeft)
        if (correctPair && correctPair.vietnamese === vietnamese) {
          const newMatched = new Set(matched)
          newMatched.add(selectedLeft)
          setMatched(newMatched)
          setSelectedLeft(null)
          setSelectedRight(null)
          if (newMatched.size === pairs.length) {
            onCorrect()
          }
        } else {
          setWrongPair({ left: selectedLeft, right: vietnamese })
          setTimeout(() => {
            setWrongPair(null)
            setSelectedLeft(null)
            setSelectedRight(null)
          }, 600)
          onWrong()
        }
      }
    },
    [matched, answerState, selectedLeft, pairs, onCorrect, onWrong]
  )

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-500">Nối từ tương ứng</p>
        <h2 className="text-xl font-bold text-zinc-900">
          Nối tiếng Nhật với nghĩa tiếng Việt
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Left column — Japanese */}
        <div className="space-y-2.5">
          {pairs.map((pair) => {
            const isMatched = matched.has(pair.japanese)
            const isSelected = selectedLeft === pair.japanese
            const isWrong = wrongPair?.left === pair.japanese

            return (
              <motion.button
                key={pair.japanese}
                onClick={() => handleLeftClick(pair.japanese)}
                animate={
                  isWrong
                    ? { x: [-6, 6, -4, 4, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.4 }}
                disabled={isMatched || answerState !== 'idle'}
                className={cn(
                  'w-full min-h-[52px] rounded-xl border-2 px-4 py-3 text-center font-japanese font-semibold text-base transition-all',
                  isMatched &&
                    'border-green-400 bg-green-50 text-green-700 cursor-default',
                  isSelected && !isMatched &&
                    'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm',
                  isWrong && 'border-red-400 bg-red-50 text-red-700',
                  !isMatched && !isSelected && !isWrong &&
                    'border-zinc-200 bg-white text-zinc-900 hover:border-indigo-300 hover:bg-indigo-50 active:scale-95'
                )}
              >
                {pair.japanese}
                {pair.reading && !isMatched && (
                  <span className="block text-xs text-zinc-400 font-normal font-sans mt-0.5">
                    {pair.reading}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Right column — Vietnamese */}
        <div className="space-y-2.5">
          {shuffledRight.map((pair) => {
            const isMatched = matched.has(pair.japanese)
            const isSelected = selectedRight === pair.vietnamese
            const isWrong = wrongPair?.right === pair.vietnamese

            return (
              <motion.button
                key={pair.vietnamese}
                onClick={() => handleRightClick(pair.vietnamese)}
                animate={
                  isWrong
                    ? { x: [-6, 6, -4, 4, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.4 }}
                disabled={isMatched || answerState !== 'idle'}
                className={cn(
                  'w-full min-h-[52px] rounded-xl border-2 px-4 py-3 text-center text-sm font-medium transition-all',
                  isMatched &&
                    'border-green-400 bg-green-50 text-green-700 cursor-default',
                  isSelected && !isMatched &&
                    'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm',
                  isWrong && 'border-red-400 bg-red-50 text-red-700',
                  !isMatched && !isSelected && !isWrong &&
                    'border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50 active:scale-95'
                )}
              >
                {pair.vietnamese}
              </motion.button>
            )
          })}
        </div>
      </div>

      {isAllMatched && (
        <AnimatePresence>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-green-600 font-semibold text-sm"
          >
            すべてマッチしました！ Tất cả đã khớp!
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  )
}
