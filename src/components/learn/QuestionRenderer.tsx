'use client'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { CheckCircle2, XCircle } from 'lucide-react'

interface QuestionRendererProps {
  question: {
    id: string
    type: string
    prompt: string
    options: string[] | null
    correctAnswer: string | string[]
  }
  selectedAnswer: string | undefined
  onAnswer: (questionId: string, answer: string) => void
  showResult?: boolean
}

export function QuestionRenderer({
  question,
  selectedAnswer,
  onAnswer,
  showResult = false,
}: QuestionRendererProps) {
  const { id, type, options, correctAnswer, prompt } = question

  const isCorrectAnswer = (value: string): boolean => {
    if (Array.isArray(correctAnswer)) return correctAnswer.includes(value)
    return value.trim().toLowerCase() === String(correctAnswer).trim().toLowerCase()
  }

  const getOptionState = (value: string): 'correct' | 'wrong' | 'selected' | 'neutral' => {
    if (!showResult) return value === selectedAnswer ? 'selected' : 'neutral'
    if (isCorrectAnswer(value)) return 'correct'
    if (value === selectedAnswer && !isCorrectAnswer(value)) return 'wrong'
    return 'neutral'
  }

  // ── MCQ ──────────────────────────────────────────────────────
  if (type === 'MCQ' && options && options.length > 0) {
    return (
      <div className="space-y-1">
        <p className="text-sm text-zinc-800 font-japanese mb-3 leading-relaxed">{prompt}</p>
        <div className="grid gap-2">
          {options.map((opt, i) => {
            const state = getOptionState(opt)
            return (
              <button
                key={i}
                type="button"
                disabled={showResult}
                onClick={() => !showResult && onAnswer(id, opt)}
                className={cn(
                  'flex items-center gap-3 w-full text-left rounded-xl border-2 px-4 py-3 text-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
                  'font-japanese',
                  state === 'selected' &&
                    'border-indigo-500 bg-indigo-50 text-indigo-800 font-medium',
                  state === 'correct' &&
                    'border-green-500 bg-green-50 text-green-800 font-medium',
                  state === 'wrong' &&
                    'border-red-400 bg-red-50 text-red-700',
                  state === 'neutral' &&
                    !showResult &&
                    'border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 text-zinc-700',
                  state === 'neutral' &&
                    showResult &&
                    'border-zinc-100 bg-zinc-50 text-zinc-400 cursor-default',
                )}
              >
                {/* Option letter */}
                <span
                  className={cn(
                    'flex items-center justify-center rounded-full h-7 w-7 text-xs font-bold shrink-0',
                    state === 'selected' && 'bg-indigo-500 text-white',
                    state === 'correct' && 'bg-green-500 text-white',
                    state === 'wrong' && 'bg-red-400 text-white',
                    state === 'neutral' &&
                      (showResult ? 'bg-zinc-200 text-zinc-400' : 'bg-zinc-100 text-zinc-500'),
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>

                <span className="flex-1">{opt}</span>

                {/* Result icon */}
                {showResult && state === 'correct' && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                )}
                {showResult && state === 'wrong' && (
                  <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── TRUE / FALSE ─────────────────────────────────────────────
  if (type === 'TRUE_FALSE') {
    const trueLabel = '正しい'
    const falseLabel = '間違い'
    const trueValue = 'true'
    const falseValue = 'false'

    const trueState = getOptionState(trueValue)
    const falseState = getOptionState(falseValue)

    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-800 font-japanese mb-3 leading-relaxed">{prompt}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: trueValue, label: trueLabel, kana: 'はい' },
            { value: falseValue, label: falseLabel, kana: 'いいえ' },
          ].map(({ value, label, kana }) => {
            const state = getOptionState(value)
            return (
              <button
                key={value}
                type="button"
                disabled={showResult}
                onClick={() => !showResult && onAnswer(id, value)}
                className={cn(
                  'flex flex-col items-center justify-center rounded-xl border-2 py-4 px-3 gap-1 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
                  state === 'selected' && 'border-indigo-500 bg-indigo-50',
                  state === 'correct' && 'border-green-500 bg-green-50',
                  state === 'wrong' && 'border-red-400 bg-red-50',
                  state === 'neutral' &&
                    !showResult &&
                    'border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/50',
                  state === 'neutral' && showResult && 'border-zinc-100 bg-zinc-50 opacity-50',
                )}
              >
                <span
                  className={cn(
                    'text-lg font-bold font-japanese',
                    state === 'selected' && 'text-indigo-700',
                    state === 'correct' && 'text-green-700',
                    state === 'wrong' && 'text-red-600',
                    (state === 'neutral') && 'text-zinc-600',
                  )}
                >
                  {label}
                </span>
                <span className="text-xs text-zinc-400 font-japanese">{kana}</span>
                {showResult && state === 'correct' && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
                )}
                {showResult && state === 'wrong' && (
                  <XCircle className="h-4 w-4 text-red-400 mt-1" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── FILL BLANK ───────────────────────────────────────────────
  if (type === 'FILL_BLANK') {
    const isCorrect = showResult && isCorrectAnswer(selectedAnswer ?? '')
    const isWrong = showResult && !isCorrectAnswer(selectedAnswer ?? '')

    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-800 font-japanese mb-2 leading-relaxed">{prompt}</p>
        <div className="relative">
          <Input
            value={selectedAnswer ?? ''}
            onChange={(e) => {
              // Handle IME composition: rely on onChange after compositionend
              onAnswer(id, e.target.value)
            }}
            onCompositionEnd={(e) => {
              onAnswer(id, (e.target as HTMLInputElement).value)
            }}
            disabled={showResult}
            placeholder="Nhập câu trả lời..."
            className={cn(
              'font-japanese pr-9 transition-colors',
              isCorrect && 'border-green-500 bg-green-50 text-green-800',
              isWrong && 'border-red-400 bg-red-50 text-red-700',
            )}
          />
          {showResult && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {isCorrect ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
            </span>
          )}
        </div>
        {showResult && isWrong && (
          <p className="text-xs text-zinc-500">
            Đáp án đúng:{' '}
            <span className="font-semibold text-green-700 font-japanese">
              {Array.isArray(correctAnswer) ? correctAnswer.join(' / ') : String(correctAnswer)}
            </span>
          </p>
        )}
      </div>
    )
  }

  // ── SHORT ANSWER / fallback ──────────────────────────────────
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-800 font-japanese leading-relaxed">{prompt}</p>
      <Input
        value={selectedAnswer ?? ''}
        onChange={(e) => onAnswer(id, e.target.value)}
        onCompositionEnd={(e) => {
          onAnswer(id, (e.target as HTMLInputElement).value)
        }}
        disabled={showResult}
        placeholder="Nhập câu trả lời..."
        className="font-japanese"
      />
    </div>
  )
}
