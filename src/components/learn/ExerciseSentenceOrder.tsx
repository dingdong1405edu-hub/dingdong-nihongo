'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SentenceOrderExercise } from '@/types'

interface ExerciseSentenceOrderProps {
  exercise: SentenceOrderExercise
  onCorrect: () => void
  onWrong: () => void
  answerState: 'idle' | 'correct' | 'wrong'
}

export function ExerciseSentenceOrder({
  exercise,
  onCorrect,
  onWrong,
  answerState,
}: ExerciseSentenceOrderProps) {
  // Shuffle the word chips once
  const [availableChips, setAvailableChips] = useState<string[]>(() =>
    [...exercise.words].sort(() => Math.random() - 0.5)
  )
  const [arranged, setArranged] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const handleAddChip = useCallback(
    (word: string, fromIndex: number) => {
      if (answerState !== 'idle' || submitted) return
      setAvailableChips((prev) => prev.filter((_, i) => i !== fromIndex))
      setArranged((prev) => [...prev, word])
    },
    [answerState, submitted]
  )

  const handleRemoveChip = useCallback(
    (word: string, fromIndex: number) => {
      if (answerState !== 'idle' || submitted) return
      setArranged((prev) => prev.filter((_, i) => i !== fromIndex))
      setAvailableChips((prev) => [...prev, word])
    },
    [answerState, submitted]
  )

  const handleSubmit = () => {
    if (answerState !== 'idle' || submitted || arranged.length === 0) return
    setSubmitted(true)
    const isCorrect =
      arranged.length === exercise.correct.length &&
      arranged.every((w, i) => w === exercise.correct[i])

    if (isCorrect) {
      onCorrect()
    } else {
      onWrong()
    }
  }

  const correctSentence = exercise.correct.join('')

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-500">Sắp xếp thành câu đúng</p>
        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 px-6 py-4 text-center">
          <p className="text-base text-zinc-600">{exercise.translation}</p>
        </div>
      </div>

      {/* Answer area */}
      <div className="space-y-2">
        <p className="text-xs text-zinc-400 font-medium">Câu của bạn:</p>
        <div
          className={cn(
            'min-h-[64px] rounded-xl border-2 border-dashed px-4 py-3 flex flex-wrap gap-2 items-center transition-colors',
            arranged.length === 0 && 'border-zinc-200',
            arranged.length > 0 &&
              answerState === 'idle' &&
              'border-indigo-300 bg-indigo-50/50',
            answerState === 'correct' && 'border-green-400 bg-green-50',
            answerState === 'wrong' && submitted && 'border-red-400 bg-red-50'
          )}
        >
          <AnimatePresence>
            {arranged.length === 0 && (
              <p className="text-zinc-400 text-sm select-none">
                Nhấn các từ bên dưới để thêm vào đây...
              </p>
            )}
            {arranged.map((word, idx) => (
              <motion.button
                key={`${word}-${idx}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={() => handleRemoveChip(word, idx)}
                disabled={answerState !== 'idle' || submitted}
                className={cn(
                  'rounded-lg border-2 px-3 py-2 text-base font-japanese font-semibold transition-all min-h-[44px]',
                  answerState === 'idle' &&
                    !submitted &&
                    'border-indigo-400 bg-white text-indigo-800 hover:bg-red-50 hover:border-red-400 hover:text-red-700 active:scale-95',
                  answerState === 'correct' &&
                    'border-green-400 bg-green-50 text-green-800 cursor-default',
                  answerState === 'wrong' &&
                    submitted &&
                    'border-red-400 bg-red-50 text-red-700 cursor-default'
                )}
              >
                {word}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Available chips */}
      <div className="space-y-2">
        <p className="text-xs text-zinc-400 font-medium">Từ có sẵn:</p>
        <div className="flex flex-wrap gap-2 min-h-[52px]">
          <AnimatePresence>
            {availableChips.map((word, idx) => (
              <motion.button
                key={`available-${word}-${idx}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={() => handleAddChip(word, idx)}
                disabled={answerState !== 'idle' || submitted}
                className={cn(
                  'rounded-xl border-2 border-zinc-300 bg-white px-3 py-2 text-base font-japanese font-semibold text-zinc-800 min-h-[44px]',
                  'hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-800 active:scale-95 transition-all',
                  (answerState !== 'idle' || submitted) &&
                    'opacity-50 cursor-default'
                )}
              >
                {word}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Show correct answer on wrong */}
      {answerState === 'wrong' && submitted && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800"
        >
          Đáp án đúng:{' '}
          <span className="font-japanese font-bold text-lg">
            {correctSentence}
          </span>
        </motion.div>
      )}

      {/* Submit button */}
      {answerState === 'idle' && !submitted && (
        <Button
          onClick={handleSubmit}
          disabled={arranged.length === 0}
          size="lg"
          className="w-full h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
        >
          確認する — Kiểm tra
        </Button>
      )}
    </div>
  )
}
