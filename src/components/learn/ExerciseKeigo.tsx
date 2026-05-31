'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { KeigoExercise } from '@/types'

interface ExerciseKeigoProps {
  exercise: KeigoExercise
  onCorrect: () => void
  onWrong: () => void
  answerState: 'idle' | 'correct' | 'wrong'
}

const KEIGO_LABELS: Record<KeigoExercise['keigoType'], { ja: string; vi: string }> = {
  teineigo: { ja: '丁寧語', vi: 'Thể lịch sự (～です/～ます)' },
  sonkeigo: { ja: '尊敬語', vi: 'Kính ngữ tôn kính' },
  kenjogo: { ja: '謙譲語', vi: 'Kính ngữ khiêm tốn' },
}

export function ExerciseKeigo({
  exercise,
  onCorrect,
  onWrong,
  answerState,
}: ExerciseKeigoProps) {
  const [value, setValue] = useState('')
  const [composing, setComposing] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const keigoLabel = KEIGO_LABELS[exercise.keigoType]

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
          Chuyển sang{' '}
          <span className="font-japanese text-indigo-600 font-bold">
            {keigoLabel.ja}
          </span>{' '}
          ({keigoLabel.vi})
        </p>

        {/* Plain form display */}
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-6 text-center space-y-2">
          <p className="text-xs text-zinc-400 uppercase tracking-wide">
            Thể thông thường (普通体)
          </p>
          <p className="text-3xl font-japanese font-bold text-zinc-900">
            {exercise.plain}
          </p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center py-1">
          <span className="text-2xl text-indigo-400">↓</span>
        </div>

        {/* Target keigo type */}
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-2 text-center">
          <p className="text-sm font-semibold text-indigo-700">
            {keigoLabel.ja} — {keigoLabel.vi}
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-3">
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
          placeholder="Nhập thể kính ngữ..."
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          lang="ja"
          inputMode="text"
          className={cn(
            'h-14 text-2xl font-japanese text-center border-2 rounded-xl focus-visible:ring-indigo-500 transition-colors',
            answerState === 'correct' &&
              'border-green-500 bg-green-50 text-green-800',
            answerState === 'wrong' &&
              submitted &&
              'border-red-500 bg-red-50 text-red-800',
            answerState === 'idle' && 'border-indigo-200'
          )}
        />

        {/* Show correct on wrong */}
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
          Nhấn Enter hoặc bấm nút · Hỗ trợ IME tiếng Nhật
        </p>
      </div>
    </div>
  )
}
