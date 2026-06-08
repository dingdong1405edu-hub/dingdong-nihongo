'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { JlptBadge } from '@/components/shared/jlpt-badge'
import { WritingFeedback } from '@/components/learn/WritingFeedback'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Clock,
  RotateCcw,
  Send,
  Save,
  AlertCircle,
} from 'lucide-react'
import { countJapaneseChars, formatDuration } from '@/lib/utils'
import { toast } from 'sonner'
import type { WritingGradeResult } from '@/types'

const TASK_TYPE_LABELS: Record<string, string> = {
  ESSAY: 'Luận văn',
  OPINION: 'Ý kiến',
  LETTER: 'Thư / Email',
  DESCRIPTION: 'Mô tả',
}

interface WritingClientProps {
  task: {
    id: string
    taskType: string
    prompt: string
    promptJa: string | null
    imageUrl: string | null
    minChars: number
    timeLimit: number
    jlptLevel: string
    requireKeigo: boolean
  }
}

type Phase = 'writing' | 'grading' | 'result'

export function WritingClient({ task }: WritingClientProps) {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<Phase>('writing')
  const [result, setResult] = useState<WritingGradeResult | null>(null)
  const [timeLeft, setTimeLeft] = useState(task.timeLimit * 60)
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autosaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const storageKey = `writing-draft-${task.id}`

  // Restore draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      setText(saved)
      toast.info('Đã khôi phục bản nháp', { duration: 2000 })
    }
  }, [storageKey])

  // Timer
  useEffect(() => {
    if (phase !== 'writing' || timeLeft <= 0) return
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase, timeLeft])

  // Autosave every 30 seconds
  useEffect(() => {
    if (phase !== 'writing') return
    autosaveRef.current = setInterval(() => {
      if (text.trim()) {
        localStorage.setItem(storageKey, text)
        toast.success('Đã lưu tự động', { duration: 1500, id: 'autosave' })
      }
    }, 30_000)
    return () => {
      if (autosaveRef.current) clearInterval(autosaveRef.current)
    }
  }, [phase, text, storageKey])

  const charCount = countJapaneseChars(text)
  const isUnderMin = charCount < task.minChars
  const isTimedOut = timeLeft === 0
  const canSubmit = !isUnderMin && !isTimedOut && text.trim().length > 0

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isComposing) setText(e.target.value)
    },
    [isComposing]
  )

  const handleCompositionStart = () => setIsComposing(true)
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    setIsComposing(false)
    setText((e.target as HTMLTextAreaElement).value)
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setPhase('grading')
    localStorage.removeItem(storageKey)

    try {
      const res = await fetch('/ja/api/grade/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          level: task.jlptLevel,
          taskType: task.taskType,
          requireKeigo: task.requireKeigo,
          minChars: task.minChars,
          refId: task.id,
        }),
      })
      const json = (await res.json()) as { ok: boolean; data?: WritingGradeResult; error?: string }
      if (!json.ok || !json.data) throw new Error(json.error ?? 'Chấm điểm thất bại')

      // Persist result
      localStorage.setItem(`writing-result-${task.id}`, JSON.stringify(json.data))
      setResult(json.data)
      setPhase('result')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra'
      toast.error(msg)
      setPhase('writing')
    }
  }

  const handleReset = () => {
    setText('')
    setResult(null)
    setTimeLeft(task.timeLimit * 60)
    setPhase('writing')
    localStorage.removeItem(storageKey)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const timerColor =
    timeLeft > task.timeLimit * 60 * 0.3
      ? 'text-zinc-700'
      : timeLeft > 60
      ? 'text-yellow-600'
      : 'text-red-600 animate-pulse'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <JlptBadge level={task.jlptLevel} />
            <Badge variant="outline" className="text-xs">
              {TASK_TYPE_LABELS[task.taskType] ?? task.taskType}
            </Badge>
            {task.requireKeigo && (
              <Badge className="bg-purple-100 text-purple-800 border-0 text-xs">
                敬語 必須
              </Badge>
            )}
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Luyện viết tiếng Nhật</h1>
        </div>

        {/* Timer */}
        {phase === 'writing' && (
          <div className={`flex items-center gap-1.5 font-mono text-lg font-semibold ${timerColor}`}>
            <Clock className="h-5 w-5" />
            {formatDuration(timeLeft)}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ── WRITING PHASE ── */}
        {phase === 'writing' && (
          <motion.div
            key="writing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Prompt card */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3 shadow-sm">
              <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">
                Đề bài
              </p>
              <p className="text-zinc-800 leading-relaxed">{task.prompt}</p>
              {task.promptJa && (
                <p className="text-base font-japanese text-indigo-700 leading-relaxed border-t border-zinc-100 pt-3">
                  {task.promptJa}
                </p>
              )}
              {task.imageUrl && (
                <img
                  src={task.imageUrl}
                  alt="Ảnh đề bài"
                  className="mt-2 rounded-lg max-h-64 object-cover w-full"
                />
              )}
              <div className="flex gap-4 text-xs text-zinc-400 pt-1">
                <span>Tối thiểu {task.minChars} ký tự</span>
                <span>Thời gian: {task.timeLimit} phút</span>
              </div>
            </div>

            {/* Editor */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleChange}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                placeholder="Viết câu trả lời của bạn bằng tiếng Nhật ở đây..."
                className="w-full min-h-[280px] p-4 text-base font-japanese text-zinc-800 placeholder:text-zinc-400 resize-y focus:outline-none bg-transparent leading-loose"
                disabled={isTimedOut}
                autoFocus
              />
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-100 bg-zinc-50">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      isUnderMin ? 'text-red-500' : 'text-green-600'
                    }`}
                  >
                    {charCount}
                  </span>
                  <span className="text-sm text-zinc-400">/ {task.minChars} ký tự tối thiểu</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(storageKey, text)
                    toast.success('Đã lưu bản nháp', { duration: 1500 })
                  }}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-600 transition-colors"
                >
                  <Save className="h-3.5 w-3.5" />
                  Lưu nháp
                </button>
              </div>
            </div>

            {/* Timer warning */}
            {isTimedOut && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Hết giờ! Bạn không thể chỉnh sửa thêm.
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 text-zinc-600"
              >
                <RotateCcw className="h-4 w-4" />
                Xóa &amp; Làm lại
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Nộp bài
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── GRADING PHASE ── */}
        {phase === 'grading' && (
          <motion.div
            key="grading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full bg-indigo-100"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <span className="text-2xl">🤖</span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-zinc-800">Claude đang chấm điểm...</p>
                <p className="text-sm text-zinc-500 mt-1">
                  Phân tích ngữ pháp, từ vựng và mạch lạc
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── RESULT PHASE ── */}
        {phase === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <WritingFeedback result={result} onRetry={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
