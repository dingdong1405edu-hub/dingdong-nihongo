'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { TranslateExercise } from '@/types'

interface ExerciseTranslateProps {
  exercise: TranslateExercise
  onCorrect: () => void
  onWrong: () => void
  answerState: 'idle' | 'correct' | 'wrong'
}

export function ExerciseTranslate({
  exercise,
  onCorrect,
  onWrong,
  answerState,
}: ExerciseTranslateProps) {
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
        <p className="text-sm font-medium text-zinc-500">Chọn nghĩa đúng</p>
        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-6 text-center space-y-2">
          <p className="text-3xl font-japanese font-bold text-zinc-900 leading-relaxed">
            {exercise.sentenceJa}
          </p>
          {exercise.sentence && (
            <p className="text-sm text-zinc-500">{exercise.sentence}</p>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {exercise.options.map((option) => {
          const isSelected = selected === option
          const isCorrect = option === exercise.correct
          const showCorrect = answerState !== 'idle' && isCorrect
          const showWrong = answerState === 'wrong' && isSelected && !isCorrect

          return (
            <motion.button
              key={option}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(option)}
              disabled={answerState !== 'idle'}
              className={cn(
                'min-h-[60px] w-full rounded-xl border-2 px-5 py-4 text-left text-sm font-medium transition-all',
                showCorrect &&
                  'border-green-500 bg-green-50 text-green-800 font-semibold',
                showWrong &&
                  'border-red-500 bg-red-50 text-red-800',
                isSelected && !showCorrect && !showWrong &&
                  'border-indigo-500 bg-indigo-50 text-indigo-800',
                !isSelected && answerState === 'idle' &&
                  'border-zinc-200 bg-white text-zinc-800 hover:border-indigo-300 hover:bg-indigo-50 active:scale-95 cursor-pointer',
                !isSelected && answerState !== 'idle' &&
                  'border-zinc-100 bg-white text-zinc-400 cursor-default'
              )}
            >
              {option}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
