'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizQuestion {
  type: 'reading' | 'meaning' | 'recognition'
  question: string
  character?: string
  options: string[]
  correct: string
}

interface KanjiQuizProps {
  kanji: {
    id: string
    character: string
    onyomi: string[]
    kunyomi: string[]
    meaning: string
  }
  /** Provide extra distractor kanji characters for recognition questions */
  distractors?: Array<{ character: string; meaning: string }>
  onComplete: (score: number) => void
}

type AnswerState = 'unanswered' | 'correct' | 'wrong'

function buildQuestions(
  kanji: KanjiQuizProps['kanji'],
  distractors: Array<{ character: string; meaning: string }>,
): QuizQuestion[] {
  const questions: QuizQuestion[] = []

  // Q1 — reading: "Chữ Kanji này đọc là gì?" (onyomi)
  if (kanji.onyomi.length > 0) {
    const correct = kanji.onyomi[0]
    // Generate plausible-looking distractors using common On'yomi patterns
    const fakeOnyomi = ['カン', 'シン', 'コウ', 'ショク', 'キン', 'ハン', 'セイ', 'テン', 'ジン', 'ブン']
      .filter((r) => r !== correct)
      .slice(0, 3)
    const options = shuffle([correct, ...fakeOnyomi.slice(0, 3)])
    questions.push({
      type: 'reading',
      question: `「${kanji.character}」の音読みは？`,
      character: kanji.character,
      options,
      correct,
    })
  }

  // Q2 — meaning: "Nghĩa của X là?"
  {
    const correct = kanji.meaning
    const fakeMeanings = distractors.map((d) => d.meaning).filter((m) => m !== correct)
    const fillerMeanings = ['ăn', 'uống', 'đi', 'đến', 'nước', 'lửa', 'người', 'lớn', 'nhỏ', 'núi']
    const pool = [...new Set([...fakeMeanings, ...fillerMeanings])].filter((m) => m !== correct)
    const options = shuffle([correct, ...pool.slice(0, 3)])
    questions.push({
      type: 'meaning',
      question: `Nghĩa của「${kanji.character}」là gì?`,
      character: kanji.character,
      options,
      correct,
    })
  }

  // Q3 — recognition: "Chữ nào có nghĩa '...'"
  if (distractors.length >= 3) {
    const correct = kanji.character
    const wrongChars = distractors.slice(0, 3).map((d) => d.character)
    const options = shuffle([correct, ...wrongChars])
    questions.push({
      type: 'recognition',
      question: `Chữ nào có nghĩa「${kanji.meaning}」?`,
      options,
      correct,
    })
  }

  return questions
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function KanjiQuiz({ kanji, distractors = [], onComplete }: KanjiQuizProps) {
  const [questions] = useState<QuizQuestion[]>(() =>
    buildQuestions(kanji, distractors),
  )
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered')
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)

  const question = questions[current]

  const handleSelect = useCallback(
    (option: string) => {
      if (answerState !== 'unanswered') return
      setSelected(option)
      const isCorrect = option === question.correct
      setAnswerState(isCorrect ? 'correct' : 'wrong')
      if (isCorrect) setCorrectCount((c) => c + 1)
    },
    [answerState, question],
  )

  const handleNext = useCallback(() => {
    if (current + 1 >= questions.length) {
      // correctCount is already updated by handleSelect (React state commit) before
      // the user can click "next", so it reflects the full final count.
      const score = Math.round((correctCount / questions.length) * 100)
      setDone(true)
      onComplete(score)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setAnswerState('unanswered')
    }
  }, [current, questions.length, correctCount, onComplete])

  if (done) {
    const score = Math.round((correctCount / questions.length) * 100)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 py-8"
      >
        <Trophy className="w-16 h-16 text-yellow-500" />
        <div className="text-center">
          <p className="text-2xl font-bold text-zinc-800">{score} điểm</p>
          <p className="text-sm text-zinc-500 mt-1">
            {correctCount}/{questions.length} câu đúng
          </p>
        </div>
        {score >= 80 ? (
          <p className="text-green-600 font-medium">Xuất sắc! 素晴らしい！</p>
        ) : score >= 60 ? (
          <p className="text-yellow-600 font-medium">Tốt lắm! よくできました！</p>
        ) : (
          <p className="text-red-600 font-medium">Cần ôn thêm. もっと練習しましょう！</p>
        )}
      </motion.div>
    )
  }

  if (!question) return null

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${(current / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-zinc-500 shrink-0">
          {current + 1}/{questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {/* Question prompt */}
          <div className="text-center space-y-2">
            {question.character && (
              <div className="font-japanese text-6xl text-zinc-800">{question.character}</div>
            )}
            <p className="text-base font-medium text-zinc-700">{question.question}</p>
          </div>

          {/* Options */}
          <div className={cn(
            'grid gap-3',
            question.type === 'recognition' ? 'grid-cols-2' : 'grid-cols-1',
          )}>
            {question.options.map((option) => {
              const isSelected = selected === option
              const isCorrect = option === question.correct
              const showResult = answerState !== 'unanswered'

              let optionClass = 'border border-zinc-200 bg-white text-zinc-700 hover:border-indigo-400 hover:bg-indigo-50'
              if (showResult && isCorrect) {
                optionClass = 'border-2 border-green-500 bg-green-50 text-green-800'
              } else if (showResult && isSelected && !isCorrect) {
                optionClass = 'border-2 border-red-400 bg-red-50 text-red-700'
              } else if (!showResult) {
                optionClass = isSelected
                  ? 'border-2 border-indigo-500 bg-indigo-50 text-indigo-800'
                  : 'border border-zinc-200 bg-white text-zinc-700 hover:border-indigo-400 hover:bg-indigo-50'
              }

              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={answerState !== 'unanswered'}
                  className={cn(
                    'relative w-full rounded-xl px-4 py-3 text-left transition-all duration-150',
                    question.type === 'recognition' ? 'text-center font-japanese text-3xl py-4' : 'text-sm font-medium',
                    optionClass,
                    'disabled:cursor-default',
                  )}
                >
                  {option}
                  {showResult && isCorrect && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Feedback + next button */}
          <AnimatePresence>
            {answerState !== 'unanswered' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div
                  className={cn(
                    'rounded-xl p-3 text-sm text-center font-medium',
                    answerState === 'correct'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700',
                  )}
                >
                  {answerState === 'correct' ? (
                    '正解！ Chính xác!'
                  ) : (
                    <>
                      Đáp án đúng:{' '}
                      <span className="font-japanese">{question.correct}</span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  {current + 1 >= questions.length ? 'Xem kết quả' : 'Câu tiếp theo →'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
