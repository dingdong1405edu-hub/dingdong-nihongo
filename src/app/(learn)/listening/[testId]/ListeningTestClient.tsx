'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Clock,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  ScrollText,
  EyeOff,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { JlptBadge } from '@/components/shared/jlpt-badge'
import { AudioPlayer } from '@/components/learn/AudioPlayer'
import { QuestionRenderer } from '@/components/learn/QuestionRenderer'
import { saveAttempt } from '@/server/actions/progress'
import { formatDuration, scoreColor, cn } from '@/lib/utils'

interface Question {
  id: string
  type: string
  prompt: string
  options: string[] | null
  correctAnswer: string | string[]
}

interface ListeningTestClientProps {
  test: {
    id: string
    title: string
    jlptLevel: string
    audioUrl: string
    transcript: string | null
    timeLimit: number
    questions: Question[]
  }
}

type Phase = 'test' | 'results'

export function ListeningTestClient({ test }: ListeningTestClientProps) {
  const router = useRouter()
  const startTimeRef = useRef<number>(Date.now())

  const [phase, setPhase] = useState<Phase>('test')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(test.timeLimit > 0 ? test.timeLimit : 0)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [score, setScore] = useState(0)

  const allAnswered =
    test.questions.length > 0 &&
    test.questions.every((q) => answers[q.id] !== undefined)

  // Timer (only active if timeLimit > 0)
  useEffect(() => {
    if (phase !== 'test' || test.timeLimit <= 0) return
    if (timeLeft <= 0) {
      handleSubmit(true)
      return
    }
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft, test.timeLimit])

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }, [])

  const calculateScore = useCallback((): number => {
    if (test.questions.length === 0) return 0
    let correct = 0
    for (const q of test.questions) {
      const userAns = answers[q.id]
      if (userAns === undefined) continue
      const ca = q.correctAnswer
      if (Array.isArray(ca)) {
        if (ca.includes(userAns)) correct++
      } else {
        if (userAns.trim().toLowerCase() === String(ca).trim().toLowerCase()) correct++
      }
    }
    return Math.round((correct / test.questions.length) * 100)
  }, [answers, test.questions])

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submitting) return

      if (!auto && !hasPlayed) {
        toast.warning('Hãy nghe audio ít nhất một lần trước khi nộp bài')
        return
      }

      if (!auto && !allAnswered) {
        const unanswered = test.questions.filter((q) => !answers[q.id]).length
        toast.warning(`Còn ${unanswered} câu chưa trả lời`)
        return
      }

      setSubmitting(true)
      const finalScore = calculateScore()
      setScore(finalScore)

      const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000)

      await saveAttempt({
        skill: 'LISTENING',
        refId: test.id,
        rawAnswer: answers,
        score: finalScore,
        durationSec,
      })

      setPhase('results')
      setSubmitting(false)
    },
    [submitting, hasPlayed, allAnswered, answers, calculateScore, test.id, test.questions],
  )

  const timerColor =
    test.timeLimit <= 0
      ? 'text-zinc-500'
      : timeLeft > test.timeLimit * 0.4
        ? 'text-zinc-700'
        : timeLeft > test.timeLimit * 0.15
          ? 'text-yellow-600'
          : 'text-red-600'

  // ── Results phase ──────────────────────────────────────────────
  if (phase === 'results') {
    return (
      <ListeningResultsPanel
        test={test}
        answers={answers}
        score={score}
        onRetry={() => router.push(`/listening/${test.id}`)}
        onBack={() => router.push('/listening')}
      />
    )
  }

  // ── Test phase ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-zinc-200 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-zinc-600"
            onClick={() => router.push('/listening')}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Danh sách</span>
          </Button>

          <div className="flex items-center gap-2 min-w-0">
            <JlptBadge level={test.jlptLevel} />
            <p className="text-sm font-semibold text-zinc-800 truncate hidden sm:block">
              {test.title}
            </p>
          </div>

          {test.timeLimit > 0 ? (
            <div className={cn('flex items-center gap-1.5 font-mono font-bold text-sm', timerColor)}>
              <Clock className="h-4 w-4" />
              {formatDuration(timeLeft)}
            </div>
          ) : (
            <div className="w-20" />
          )}
        </div>

        {/* Progress bar */}
        {test.questions.length > 0 && (
          <div className="max-w-5xl mx-auto mt-2">
            <Progress
              value={(Object.keys(answers).length / test.questions.length) * 100}
              className="h-1.5 bg-zinc-100 [&>div]:bg-indigo-500"
            />
            <p className="text-right text-xs text-zinc-400 mt-0.5">
              {Object.keys(answers).length} / {test.questions.length} câu
            </p>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Audio player */}
        <AudioPlayer
          src={test.audioUrl}
          onPlay={() => setHasPlayed(true)}
          className="w-full"
        />

        {/* "Must play audio" hint */}
        <AnimatePresence>
          {!hasPlayed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 overflow-hidden"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              Hãy nghe audio ít nhất một lần trước khi nộp bài.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Questions */}
        {test.questions.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500">Bài thi này chưa có câu hỏi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {test.questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4"
              >
                <p className="text-xs font-semibold text-indigo-600 mb-2">
                  Câu {idx + 1}
                </p>
                <QuestionRenderer
                  question={q}
                  selectedAnswer={answers[q.id]}
                  onAnswer={handleAnswer}
                />
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <div className="pb-8">
          <Button
            size="lg"
            className={cn(
              'w-full font-semibold',
              allAnswered && hasPlayed
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-zinc-200 text-zinc-500 cursor-not-allowed hover:bg-zinc-200',
            )}
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang nộp...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Nộp bài
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          {!hasPlayed && (
            <p className="text-center text-xs text-amber-600 mt-2">
              Phải nghe audio trước khi nộp bài
            </p>
          )}
          {hasPlayed && !allAnswered && test.questions.length > 0 && (
            <p className="text-center text-xs text-zinc-400 mt-2">
              Còn {test.questions.filter((q) => !answers[q.id]).length} câu chưa trả lời
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Results Panel ────────────────────────────────────────────────

interface ListeningResultsPanelProps {
  test: ListeningTestClientProps['test']
  answers: Record<string, string>
  score: number
  onRetry: () => void
  onBack: () => void
}

function ListeningResultsPanel({
  test,
  answers,
  score,
  onRetry,
  onBack,
}: ListeningResultsPanelProps) {
  const [showTranscript, setShowTranscript] = useState(false)

  const correct = test.questions.filter((q) => {
    const userAns = answers[q.id]
    if (userAns === undefined) return false
    const ca = q.correctAnswer
    if (Array.isArray(ca)) return ca.includes(userAns)
    return userAns.trim().toLowerCase() === String(ca).trim().toLowerCase()
  }).length

  const gradeLabel =
    score >= 80 ? 'Xuất sắc!' : score >= 60 ? 'Khá tốt!' : 'Cần luyện thêm'

  const gradeColor =
    score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 text-center mb-6"
        >
          <Trophy className={cn('h-12 w-12 mx-auto mb-3', gradeColor)} />
          <p className={cn('text-4xl font-black mb-1', gradeColor)}>{score}%</p>
          <p className="text-lg font-semibold text-zinc-700">{gradeLabel}</p>
          <p className="text-sm text-zinc-500 mt-1">
            Đúng {correct} / {test.questions.length} câu
          </p>

          <div className="mt-4">
            <Progress
              value={score}
              className={cn(
                'h-3 rounded-full',
                score >= 80
                  ? '[&>div]:bg-green-500'
                  : score >= 60
                    ? '[&>div]:bg-yellow-500'
                    : '[&>div]:bg-red-500',
              )}
            />
          </div>

          {/* Replay audio in results */}
          <div className="mt-5">
            <AudioPlayer src={test.audioUrl} className="w-full" />
          </div>

          <div className="flex gap-3 mt-5">
            <Button variant="outline" className="flex-1 gap-2" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" />
              Danh sách
            </Button>
            <Button
              className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={onRetry}
            >
              <RotateCcw className="h-4 w-4" />
              Làm lại
            </Button>
          </div>
        </motion.div>

        {/* Transcript reveal */}
        {test.transcript && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-zinc-200 shadow-sm mb-6 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setShowTranscript((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-indigo-500" />
                Transcript (スクリプト)
              </span>
              {showTranscript ? (
                <EyeOff className="h-4 w-4 text-zinc-400" />
              ) : (
                <Eye className="h-4 w-4 text-zinc-400" />
              )}
            </button>

            <AnimatePresence>
              {showTranscript && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-zinc-100">
                    <p className="text-sm text-zinc-700 font-japanese leading-relaxed whitespace-pre-wrap mt-4">
                      {test.transcript}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Answer review */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="space-y-4"
        >
          <h2 className="text-base font-bold text-zinc-800 px-1">Chi tiết đáp án</h2>
          {test.questions.map((q, idx) => {
            const userAns = answers[q.id]
            const ca = q.correctAnswer
            const isCorrect = (() => {
              if (userAns === undefined) return false
              if (Array.isArray(ca)) return ca.includes(userAns)
              return userAns.trim().toLowerCase() === String(ca).trim().toLowerCase()
            })()

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={cn(
                  'bg-white rounded-xl border p-4 shadow-sm',
                  isCorrect ? 'border-green-200' : 'border-red-200',
                )}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-400 mb-1">Câu {idx + 1}</p>
                    <p className="text-sm text-zinc-800 font-japanese mb-2">{q.prompt}</p>

                    <QuestionRenderer
                      question={q}
                      selectedAnswer={userAns}
                      onAnswer={() => {}}
                      showResult
                    />

                    {!isCorrect && (
                      <div className="mt-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                        <p className="text-xs text-green-700">
                          <span className="font-semibold">Đáp án đúng: </span>
                          <span className="font-japanese">
                            {Array.isArray(ca) ? ca.join(' / ') : String(ca)}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
