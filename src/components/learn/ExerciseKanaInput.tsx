'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { KanaInputExercise } from '@/types'

interface ExerciseKanaInputProps {
  exercise: KanaInputExercise
  onCorrect: () => void
  onWrong: () => void
  answerState: 'idle' | 'correct' | 'wrong'
}

export function ExerciseKanaInput({
  exercise,
  onCorrect,
  onWrong,
  answerState,
}: ExerciseKanaInputProps) {
  const [value, setValue] = useState('')
  const [composing, setComposing] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (composing || answerState !== 'idle' || submitted) return
    const trimmed = value.trim()
    if (!trimmed) return

    setSubmitted(true)
    if (trimmed === exercise.correct) {
      onCorrect()
    } else {
      onWrong()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !composing) {
      handleSubmit()
    }
  }

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-500">
          Gõ từ bằng Hiragana/Katakana
        </p>
        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-8 text-center space-y-2">
          <p className="text-2xl font-semibold text-zinc-500">
            {exercise.meaning}
          </p>
          <p className="text-4xl font-japanese font-bold text-zinc-900">
            {exercise.word}
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div className="relative">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              if (!composing) setValue(e.target.value)
            }}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={(e) => {
              setComposing(false)
              setValue((e.target as HTMLInputElement).value)
            }}
            onKeyDown={handleKeyDown}
            disabled={answerState !== 'idle' || submitted}
            placeholder="Nhập kana ở đây..."
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            lang="ja"
            inputMode="text"
            className={cn(
              'h-14 text-2xl font-japanese text-center border-2 rounded-xl pr-4 focus-visible:ring-indigo-500 transition-colors',
              answerState === 'correct' &&
                'border-green-500 bg-green-50 text-green-800',
              answerState === 'wrong' &&
                submitted &&
                'border-red-500 bg-red-50 text-red-800',
              answerState === 'idle' && 'border-indigo-200'
            )}
          />
        </div>

        {/* Hint: show correct on wrong */}
        {answerState === 'wrong' && submitted && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 text-center"
          >
            Đáp án đúng:{' '}
            <span className="font-japanese font-bold text-xl">
              {exercise.correct}
            </span>
          </motion.div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={
            !value.trim() ||
            composing ||
            answerState !== 'idle' ||
            submitted
          }
          size="lg"
          className="w-full h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
        >
          確認する — Kiểm tra
        </Button>

        <p className="text-center text-xs text-zinc-400">
          Nhấn Enter hoặc bấm nút để kiểm tra · Hỗ trợ IME tiếng Nhật
        </p>
      </div>
    </div>
  )
}
