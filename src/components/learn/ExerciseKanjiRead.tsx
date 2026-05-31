'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { KanjiReadExercise } from '@/types'

interface ExerciseKanjiReadProps {
  exercise: KanjiReadExercise
  onCorrect: () => void
  onWrong: () => void
  answerState: 'idle' | 'correct' | 'wrong'
}

const READING_LABELS: Record<'on' | 'kun', string> = {
  on: '音読み (On-yomi)',
  kun: '訓読み (Kun-yomi)',
}

export function ExerciseKanjiRead({
  exercise,
  onCorrect,
  onWrong,
  answerState,
}: ExerciseKanjiReadProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (option: string) => {
    if (answerState !== 'idle' || selected !== null) return
    setSelected(option)
    if (option === exercise.correct) {
      onCorrect()
    } else {
      onWrong()
    }
  }

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-500">
          Chọn cách đọc đúng —{' '}
          <span className="text-indigo-600 font-semibold">
            {READING_LABELS[exercise.readingType]}
          </span>
        </p>

        {/* Large Kanji display */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-10 flex items-center justify-center">
          <span className="text-8xl font-japanese font-bold text-zinc-900 select-none">
            {exercise.kanji}
          </span>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {exercise.options.map((option) => {
          const isSelected = selected === option
          const isCorrect = option === exercise.correct
          const showCorrect = answerState !== 'idle' && isCorrect
          const showWrong = answerState === 'wrong' && isSelected && !isCorrect

          return (
            <motion.button
              key={option}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(option)}
              disabled={answerState !== 'idle'}
              className={cn(
                'min-h-[60px] w-full rounded-xl border-2 px-4 py-4 text-center font-japanese text-xl font-semibold transition-all',
                showCorrect &&
                  'border-green-500 bg-green-50 text-green-800',
                showWrong &&
                  'border-red-500 bg-red-50 text-red-800',
                isSelected && !showCorrect && !showWrong &&
                  'border-indigo-500 bg-indigo-50 text-indigo-800',
                !isSelected && answerState === 'idle' &&
                  'border-zinc-200 bg-white text-zinc-900 hover:border-indigo-300 hover:bg-indigo-50 active:scale-95 cursor-pointer',
                !isSelected && answerState !== 'idle' &&
                  'border-zinc-100 bg-white text-zinc-400 cursor-default'
              )}
            >
              {option}
            </motion.button>
          )
        })}
      </div>

      {/* Reveal correct on wrong */}
      {answerState === 'wrong' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800"
        >
          Đáp án đúng:{' '}
          <span className="font-japanese font-bold text-lg">
            {exercise.correct}
          </span>
        </motion.div>
      )}
    </div>
  )
}
