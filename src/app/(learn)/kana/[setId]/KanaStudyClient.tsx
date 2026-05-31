'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { completeKanaSet } from '@/server/actions/progress'
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  Trophy,
  Grid3X3,
  CreditCard,
  HelpCircle,
} from 'lucide-react'
import Link from 'next/link'

export interface KanaStudyClientProps {
  kanaSet: {
    id: string
    type: string
    row: string
    characters: { kana: string; romaji: string }[]
  }
  initialProgress: { mastered: boolean } | null
}

type Mode = 'table' | 'flashcard' | 'quiz'

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export function KanaStudyClient({ kanaSet, initialProgress }: KanaStudyClientProps) {
  const [mode, setMode] = useState<Mode>('table')
  const router = useRouter()

  const isHiragana = kanaSet.type === 'HIRAGANA'
  const accentColor = isHiragana ? 'violet' : 'blue'

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/kana">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-zinc-900 truncate">
            {kanaSet.row}
          </h1>
          <p className="text-xs text-zinc-500">
            {isHiragana ? 'Hiragana • ひらがな' : 'Katakana • カタカナ'}
            {' '}— {kanaSet.characters.length} ký tự
          </p>
        </div>
        {initialProgress?.mastered && (
          <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Đã thuộc
          </Badge>
        )}
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { key: 'table', label: 'Bảng chữ', labelJa: '表', icon: Grid3X3 },
            { key: 'flashcard', label: 'Flashcard', labelJa: 'フラッシュ', icon: CreditCard },
            { key: 'quiz', label: 'Quiz', labelJa: 'クイズ', icon: HelpCircle },
          ] as const
        ).map(({ key, label, labelJa, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
              mode === key
                ? accentColor === 'violet'
                  ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-sm'
                  : 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
            <span className="font-japanese text-xs opacity-70">{labelJa}</span>
          </button>
        ))}
      </div>

      {/* Mode content */}
      <AnimatePresence mode="wait">
        {mode === 'table' && (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <KanaTable kanaSet={kanaSet} accentColor={accentColor} />
          </motion.div>
        )}
        {mode === 'flashcard' && (
          <motion.div
            key="flashcard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <KanaFlashcard kanaSet={kanaSet} accentColor={accentColor} />
          </motion.div>
        )}
        {mode === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <KanaQuiz
              kanaSet={kanaSet}
              accentColor={accentColor}
              onComplete={() => {
                router.push('/kana')
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────
// Table mode
// ─────────────────────────────────────────────
function KanaTable({
  kanaSet,
  accentColor,
}: {
  kanaSet: KanaStudyClientProps['kanaSet']
  accentColor: 'violet' | 'blue'
}) {
  const speakKana = useCallback((kana: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(kana)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }, [])

  const kanaColor = accentColor === 'violet' ? 'text-violet-700' : 'text-blue-700'
  const hoverBg = accentColor === 'violet' ? 'hover:bg-violet-50' : 'hover:bg-blue-50'
  const romajiColor = accentColor === 'violet' ? 'text-violet-500' : 'text-blue-500'

  return (
    <Card className="border-zinc-200">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-zinc-400" />
          <p className="text-xs text-zinc-500">
            Nhấn vào ký tự để nghe phát âm
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
          {kanaSet.characters.map((char) => (
            <button
              key={char.kana}
              onClick={() => speakKana(char.kana)}
              className={`group flex flex-col items-center justify-center gap-1 rounded-xl border border-zinc-100 bg-white p-3 transition-all hover:shadow-sm active:scale-95 ${hoverBg}`}
            >
              <span
                className={`font-japanese text-2xl font-bold transition-transform group-hover:scale-110 ${kanaColor}`}
              >
                {char.kana}
              </span>
              <span className={`text-xs font-mono ${romajiColor}`}>{char.romaji}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Flashcard mode
// ─────────────────────────────────────────────
function KanaFlashcard({
  kanaSet,
  accentColor,
}: {
  kanaSet: KanaStudyClientProps['kanaSet']
  accentColor: 'violet' | 'blue'
}) {
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Set<number>>(new Set())

  const total = kanaSet.characters.length
  const char = kanaSet.characters[current]

  const speakKana = useCallback((kana: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(kana)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }, [])

  const next = () => {
    setFlipped(false)
    setCurrent((c) => (c + 1) % total)
  }

  const prev = () => {
    setFlipped(false)
    setCurrent((c) => (c - 1 + total) % total)
  }

  const markKnown = () => {
    setKnown((prev) => new Set([...prev, current]))
    next()
  }

  const markUnknown = () => {
    setKnown((prev) => {
      const next = new Set(prev)
      next.delete(current)
      return next
    })
    next()
  }

  const kanaColor = accentColor === 'violet' ? 'text-violet-700' : 'text-blue-700'
  const progressValue = total > 0 ? (known.size / total) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          {current + 1} / {total}
        </span>
        <span className="font-medium text-green-600">{known.size} đã biết</span>
      </div>
      <Progress value={progressValue} className="h-2" />

      {/* Card */}
      <div
        className="cursor-pointer select-none"
        onClick={() => setFlipped((f) => !f)}
        style={{ perspective: 1000 }}
      >
        <motion.div
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="relative"
        >
          {/* Front: Kana */}
          <Card
            className="border-2 border-zinc-200 bg-white"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
              <p className={`font-japanese text-7xl font-bold ${kanaColor}`}>{char.kana}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  speakKana(char.kana)
                }}
                className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-200 transition-colors"
              >
                <Volume2 className="h-3 w-3" />
                Nghe
              </button>
              <p className="text-xs text-zinc-400">Nhấn để lật</p>
            </CardContent>
          </Card>

          {/* Back: Romaji */}
          <Card
            className={`absolute inset-0 border-2 ${
              accentColor === 'violet' ? 'border-violet-200 bg-violet-50' : 'border-blue-200 bg-blue-50'
            }`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
              <p className={`font-japanese text-6xl font-bold ${kanaColor}`}>{char.kana}</p>
              <p className="font-mono text-4xl font-bold text-zinc-700">{char.romaji}</p>
              <p className="text-xs text-zinc-400">Nhấn để lật lại</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={prev} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Trước
        </Button>

        {flipped && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={markUnknown}
              className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4" />
              Chưa biết
            </Button>
            <Button
              size="sm"
              onClick={markKnown}
              className="gap-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              Biết rồi
            </Button>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={next} className="gap-1">
          Tiếp
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Quiz mode
// ─────────────────────────────────────────────
type QuizQuestion = {
  prompt: string
  promptType: 'kana' | 'romaji'
  options: string[]
  correctAnswer: string
}

function buildQuizQuestions(
  characters: { kana: string; romaji: string }[],
): QuizQuestion[] {
  // Shuffle
  const shuffled = [...characters].sort(() => Math.random() - 0.5)
  return shuffled.map((char) => {
    const showKana = Math.random() > 0.5
    // 3 wrong options
    const others = characters
      .filter((c) => c.kana !== char.kana)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    if (showKana) {
      const options = [char.romaji, ...others.map((o) => o.romaji)].sort(() => Math.random() - 0.5)
      return {
        prompt: char.kana,
        promptType: 'kana',
        options,
        correctAnswer: char.romaji,
      }
    } else {
      const options = [char.kana, ...others.map((o) => o.kana)].sort(() => Math.random() - 0.5)
      return {
        prompt: char.romaji,
        promptType: 'romaji',
        options,
        correctAnswer: char.kana,
      }
    }
  })
}

function KanaQuiz({
  kanaSet,
  accentColor,
  onComplete,
}: {
  kanaSet: KanaStudyClientProps['kanaSet']
  accentColor: 'violet' | 'blue'
  onComplete: () => void
}) {
  const [questions] = useState<QuizQuestion[]>(() =>
    buildQuizQuestions(kanaSet.characters),
  )
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const total = questions.length
  const question = questions[currentIdx]
  const isCorrect = selected !== null && selected === question?.correctAnswer

  const handleSelect = (option: string) => {
    if (selected !== null) return
    setSelected(option)
    if (option === question.correctAnswer) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = async () => {
    if (currentIdx < total - 1) {
      setSelected(null)
      setCurrentIdx((i) => i + 1)
    } else {
      setIsSubmitting(true)
      // Save completion
      const result = await completeKanaSet(kanaSet.id)
      setIsSubmitting(false)
      if (result.ok) {
        toast.success('Hoàn thành! +20 XP', { description: `Điểm: ${score + (isCorrect ? 1 : 0)}/${total}` })
      }
      setFinished(true)
    }
  }

  const handleRetry = () => {
    setCurrentIdx(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  const finalScore = score + (selected !== null && isCorrect ? 1 : 0)
  const progressValue = total > 0 ? ((currentIdx + (selected !== null ? 1 : 0)) / total) * 100 : 0

  const accentBtn =
    accentColor === 'violet'
      ? 'bg-violet-600 hover:bg-violet-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white'
  const kanaColor = accentColor === 'violet' ? 'text-violet-700' : 'text-blue-700'

  if (finished) {
    const pct = total > 0 ? Math.round((finalScore / total) * 100) : 0
    return (
      <Card className="border-zinc-200">
        <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          >
            <Trophy className={`h-16 w-16 ${pct >= 80 ? 'text-yellow-400' : 'text-zinc-300'}`} />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Hoàn thành!</h2>
            <p className="text-zinc-500 font-japanese">クイズ完了！</p>
          </div>
          <div className="text-5xl font-bold tabular-nums">
            <span className={pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-500'}>
              {pct}%
            </span>
          </div>
          <p className="text-sm text-zinc-600">
            Đúng {finalScore} / {total} câu
          </p>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              onClick={handleRetry}
              className="gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Làm lại
            </Button>
            <Button
              className={accentBtn}
              onClick={onComplete}
            >
              Tiếp tục
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Câu {currentIdx + 1} / {total}</span>
          <span className="font-medium text-green-600">{score} đúng</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-zinc-200">
            <CardContent className="pt-6 pb-4 px-5">
              {/* Prompt */}
              <div className="flex flex-col items-center gap-2 mb-6">
                <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">
                  {question.promptType === 'kana'
                    ? 'Ký tự này đọc là gì?'
                    : 'Chọn ký tự tương ứng'}
                </p>
                <p
                  className={
                    question.promptType === 'kana'
                      ? `font-japanese text-6xl font-bold ${kanaColor}`
                      : `font-mono text-4xl font-bold text-zinc-800`
                  }
                >
                  {question.prompt}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2">
                {question.options.map((opt) => {
                  const isSelected = selected === opt
                  const isRight = opt === question.correctAnswer
                  let optClass =
                    'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50'
                  if (selected !== null) {
                    if (isRight) {
                      optClass = 'border-green-400 bg-green-50 text-green-800'
                    } else if (isSelected && !isRight) {
                      optClass = 'border-red-400 bg-red-50 text-red-800'
                    } else {
                      optClass = 'border-zinc-100 bg-white text-zinc-400 opacity-60'
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      disabled={selected !== null}
                      className={`relative flex h-14 items-center justify-center rounded-xl border-2 text-lg font-bold transition-all active:scale-95 disabled:cursor-default ${
                        question.promptType === 'kana' ? 'font-mono' : 'font-japanese'
                      } ${optClass}`}
                    >
                      {opt}
                      {selected !== null && isRight && (
                        <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-green-500" />
                      )}
                      {selected !== null && isSelected && !isRight && (
                        <XCircle className="absolute right-2 top-2 h-4 w-4 text-red-500" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Feedback & next */}
              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-3"
                >
                  <div
                    className={`rounded-lg px-4 py-2.5 text-sm font-medium ${
                      isCorrect
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {isCorrect ? (
                      <>✅ Chính xác! <span className="font-japanese">{question.prompt}</span> = {question.correctAnswer}</>
                    ) : (
                      <>❌ Chưa đúng. Đáp án: <strong>{question.correctAnswer}</strong></>
                    )}
                  </div>
                  <Button
                    className={`w-full ${accentBtn}`}
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    {currentIdx < total - 1 ? 'Câu tiếp theo' : isSubmitting ? 'Đang lưu...' : 'Hoàn thành'}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
