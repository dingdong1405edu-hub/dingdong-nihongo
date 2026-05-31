'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Clock,
  Eye,
  EyeOff,
  AlignLeft,
  AlignJustify,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertCircle,
  RotateCcw,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { JlptBadge } from '@/components/shared/jlpt-badge'
import { QuestionRenderer } from '@/components/learn/QuestionRenderer'
import { saveAttempt } from '@/server/actions/progress'
import { formatDuration, cn } from '@/lib/utils'

interface Question {
  id: string
  type: string
  prompt: string
  promptFurigana: string | null
  options: string[] | null
  correctAnswer: string | string[]
  explanation: string | null
}

interface ReadingTestClientProps {
  test: {
    id: string
    title: string
    titleJa: string
    jlptLevel: string
    passage: string
    furigana: string | null
    timeLimit: number
    questions: Question[]
  }
}

interface LookupPopup {
  text: string
  x: number
  y: number
}

type Phase = 'test' | 'results'

export function ReadingTestClient({ test }: ReadingTestClientProps) {
  const router = useRouter()
  const passageRef = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef<number>(Date.now())

  const [phase, setPhase] = useState<Phase>('test')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(test.timeLimit)
  const [showFurigana, setShowFurigana] = useState(
    test.jlptLevel === 'N5' || test.jlptLevel === 'N4',
  )
  const [verticalText, setVerticalText] = useState(false)
  const [lookup, setLookup] = useState<LookupPopup | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [score, setScore] = useState(0)
  const [mobileTab, setMobileTab] = useState<'passage' | 'questions'>('passage')

  const allAnswered = test.questions.length > 0 &&
    test.questions.every((q) => answers[q.id] !== undefined)

  // Timer countdown
  useEffect(() => {
    if (phase !== 'test') return
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
  }, [phase, timeLeft])

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
        skill: 'READING',
        refId: test.id,
        rawAnswer: answers,
        score: finalScore,
        durationSec,
      })

      setPhase('results')
      setSubmitting(false)
    },
    [submitting, allAnswered, answers, calculateScore, test.id, test.questions],
  )

  // Click-to-lookup on passage words
  const handlePassageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const containerRect = passageRef.current?.getBoundingClientRect()
      if (containerRect) {
        setLookup({
          text: selection.toString().trim(),
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 8,
        })
      }
      return
    }
    // Single click — try to get the word under cursor
    const target = e.target as HTMLElement
    const word = target.textContent?.trim()
    if (word && word.length > 0 && word.length < 20) {
      const rect = target.getBoundingClientRect()
      const containerRect = passageRef.current?.getBoundingClientRect()
      if (containerRect) {
        setLookup({
          text: word,
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 8,
        })
      }
    }
  }, [])

  const timerColor =
    timeLeft > test.timeLimit * 0.4
      ? 'text-zinc-700'
      : timeLeft > test.timeLimit * 0.15
        ? 'text-yellow-600'
        : 'text-red-600'

  // ── Results phase ──────────────────────────────────────────────
  if (phase === 'results') {
    return (
      <ResultsPanel
        test={test}
        answers={answers}
        score={score}
        onRetry={() => router.push(`/reading/${test.id}`)}
        onBack={() => router.push('/reading')}
      />
    )
  }

  // ── Test phase ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-zinc-200 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-zinc-600"
            onClick={() => router.push('/reading')}
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

          <div className={cn('flex items-center gap-1.5 font-mono font-bold text-sm', timerColor)}>
            <Clock className="h-4 w-4" />
            {formatDuration(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-6xl mx-auto mt-2">
          <Progress
            value={(Object.keys(answers).length / Math.max(test.questions.length, 1)) * 100}
            className="h-1.5 bg-zinc-100 [&>div]:bg-indigo-500"
          />
          <p className="text-right text-xs text-zinc-400 mt-0.5">
            {Object.keys(answers).length} / {test.questions.length} câu
          </p>
        </div>
      </div>

      {/* Mobile tab toggle */}
      <div className="lg:hidden sticky top-[72px] z-20 bg-white border-b border-zinc-200 px-4 py-2 flex gap-2">
        <Button
          size="sm"
          variant={mobileTab === 'passage' ? 'default' : 'outline'}
          className={cn(
            'flex-1',
            mobileTab === 'passage' && 'bg-indigo-600 hover:bg-indigo-700',
          )}
          onClick={() => setMobileTab('passage')}
        >
          <AlignLeft className="h-3.5 w-3.5 mr-1.5" />
          Bài đọc
        </Button>
        <Button
          size="sm"
          variant={mobileTab === 'questions' ? 'default' : 'outline'}
          className={cn(
            'flex-1',
            mobileTab === 'questions' && 'bg-indigo-600 hover:bg-indigo-700',
          )}
          onClick={() => setMobileTab('questions')}
        >
          <AlignJustify className="h-3.5 w-3.5 mr-1.5" />
          Câu hỏi ({Object.keys(answers).length}/{test.questions.length})
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[1fr_420px] lg:gap-6 lg:items-start">
        {/* ── Passage panel ── */}
        <div
          className={cn(
            'bg-white rounded-xl border border-zinc-200 shadow-sm',
            mobileTab === 'questions' && 'hidden lg:block',
          )}
        >
          {/* Passage toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <span className="text-sm font-semibold text-zinc-700 font-japanese">
              {test.titleJa}
            </span>
            <div className="flex items-center gap-2">
              {/* Furigana toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-zinc-500 hover:text-zinc-700"
                onClick={() => setShowFurigana((v) => !v)}
                title={showFurigana ? 'Ẩn furigana' : 'Hiện furigana'}
              >
                {showFurigana ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {showFurigana ? 'Ẩn furigana' : 'Furigana'}
                </span>
              </Button>

              {/* Vertical text toggle */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 gap-1.5 text-xs',
                  verticalText ? 'text-indigo-600 bg-indigo-50' : 'text-zinc-500 hover:text-zinc-700',
                )}
                onClick={() => setVerticalText((v) => !v)}
                title="Chữ dọc (縦書き)"
              >
                <span className="text-xs font-japanese">縦</span>
              </Button>
            </div>
          </div>

          {/* Passage content */}
          <div
            className={cn(
              'p-4 sm:p-6 overflow-auto',
              verticalText
                ? 'max-h-[calc(100vh-220px)] flex justify-end'
                : 'max-h-[calc(100vh-220px)]',
            )}
          >
            <div
              ref={passageRef}
              onClick={handlePassageClick}
              className={cn(
                'relative font-japanese text-base leading-[2.4] cursor-text select-text',
                verticalText && 'writing-vertical',
              )}
              style={
                verticalText
                  ? {
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      maxHeight: '60vh',
                    }
                  : undefined
              }
            >
              {/* Lookup popup */}
              <AnimatePresence>
                {lookup && (
                  <motion.div
                    key="lookup"
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute z-50 bg-zinc-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none"
                    style={{
                      left: lookup.x,
                      top: lookup.y,
                      transform: 'translate(-50%, -100%)',
                      whiteSpace: 'nowrap',
                      maxWidth: '220px',
                    }}
                  >
                    <span className="font-japanese font-semibold">{lookup.text}</span>
                    <p className="text-zinc-400 mt-0.5">Từ được chọn</p>
                    <div
                      className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Render passage with or without furigana */}
              {test.furigana ? (
                <div
                  className={cn(
                    '[&_rt]:text-[0.55em] [&_rt]:text-indigo-500 [&_ruby]:inline-flex [&_ruby]:flex-col [&_ruby]:items-center',
                    !showFurigana && '[&_rt]:opacity-0 [&_rt]:pointer-events-none [&_rt]:select-none',
                  )}
                  dangerouslySetInnerHTML={{ __html: test.furigana }}
                  onClick={() => setLookup(null)}
                />
              ) : (
                <div
                  onClick={() => setLookup(null)}
                  className="whitespace-pre-wrap"
                >
                  {test.passage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Questions panel ── */}
        <div
          className={cn(
            'space-y-4',
            mobileTab === 'passage' && 'hidden lg:block',
          )}
        >
          {test.questions.length === 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
              <AlertCircle className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">Bài thi này chưa có câu hỏi.</p>
            </div>
          ) : (
            test.questions.map((q, idx) => (
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
            ))
          )}

          {/* Submit button */}
          <div className="pt-2 pb-8">
            <Button
              size="lg"
              className={cn(
                'w-full font-semibold',
                allAnswered
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
            {!allAnswered && test.questions.length > 0 && (
              <p className="text-center text-xs text-zinc-400 mt-2">
                Còn{' '}
                {test.questions.filter((q) => !answers[q.id]).length} câu chưa trả lời
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close lookup */}
      {lookup && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setLookup(null)}
        />
      )}
    </div>
  )
}

// ── Results Panel ────────────────────────────────────────────────

interface ResultsPanelProps {
  test: ReadingTestClientProps['test']
  answers: Record<string, string>
  score: number
  onRetry: () => void
  onBack: () => void
}

function ResultsPanel({ test, answers, score, onRetry, onBack }: ResultsPanelProps) {
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
    score >= 80
      ? 'text-green-600'
      : score >= 60
        ? 'text-yellow-600'
        : 'text-red-600'

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

          <div className="flex gap-3 mt-6">
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

        {/* Answer review */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
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
                    <p className="text-xs font-semibold text-zinc-400 mb-1">
                      Câu {idx + 1}
                    </p>
                    <p className="text-sm text-zinc-800 font-japanese mb-2">
                      {q.prompt}
                    </p>

                    <QuestionRenderer
                      question={q}
                      selectedAnswer={userAns}
                      onAnswer={() => {}}
                      showResult
                    />

                    {!isCorrect && (
                      <div className="mt-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 space-y-1">
                        <p className="text-xs text-green-700">
                          <span className="font-semibold">Đáp án đúng: </span>
                          <span className="font-japanese">
                            {Array.isArray(ca) ? ca.join(' / ') : String(ca)}
                          </span>
                        </p>
                        {q.explanation && (
                          <p className="text-xs text-zinc-600 italic">{q.explanation}</p>
                        )}
                      </div>
                    )}
                    {isCorrect && q.explanation && (
                      <p className="mt-2 text-xs text-zinc-500 italic">{q.explanation}</p>
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
