'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { completeVocabLesson, completeGrammarLesson } from '@/server/actions/progress'
import { ExerciseMatch } from '@/components/learn/ExerciseMatch'
import { ExerciseTranslate } from '@/components/learn/ExerciseTranslate'
import { ExerciseKanjiRead } from '@/components/learn/ExerciseKanjiRead'
import { ExerciseKanaInput } from '@/components/learn/ExerciseKanaInput'
import { ExerciseSentenceOrder } from '@/components/learn/ExerciseSentenceOrder'
import { ExerciseKeigo } from '@/components/learn/ExerciseKeigo'
import { LessonComplete } from '@/components/learn/LessonComplete'
import { HeartsDisplay } from '@/components/shared/hearts-display'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type {
  Exercise,
  MatchExercise,
  TranslateExercise,
  KanjiReadExercise,
  KanaInputExercise,
  SentenceOrderExercise,
  KeigoExercise,
} from '@/types'

export interface LessonClientProps {
  lesson: { id: string; exercises: Exercise[]; title: string }
  unitId: string
  userHearts: number
  returnPath: string
  module: 'vocab' | 'grammar'
}

type AnswerState = 'idle' | 'correct' | 'wrong'

export function LessonClient({
  lesson,
  unitId,
  userHearts,
  returnPath,
  module,
}: LessonClientProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hearts, setHearts] = useState(Math.min(userHearts, 5))
  const [correctCount, setCorrectCount] = useState(0)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [isComplete, setIsComplete] = useState(false)
  const [xpGained, setXpGained] = useState(0)
  const [floatingXp, setFloatingXp] = useState(false)

  const exercises = lesson.exercises
  const totalExercises = exercises.length
  const currentExercise = exercises[currentIndex]
  const progressPct =
    totalExercises > 0 ? (currentIndex / totalExercises) * 100 : 0

  const handleCorrect = useCallback(() => {
    setAnswerState('correct')
    setCorrectCount((c) => c + 1)
    setFloatingXp(true)
    setTimeout(() => setFloatingXp(false), 1200)
  }, [])

  const handleWrong = useCallback(() => {
    setAnswerState('wrong')
    setHearts((h) => Math.max(0, h - 1))
  }, [])

  const handleNext = useCallback(async () => {
    setAnswerState('idle')
    if (currentIndex + 1 >= totalExercises) {
      // Lesson complete
      const score = Math.round((correctCount / totalExercises) * 100)
      const result =
        module === 'vocab'
          ? await completeVocabLesson(lesson.id, score)
          : await completeGrammarLesson(lesson.id, score)

      if (result.ok) {
        setXpGained('xpGained' in result ? (result.xpGained ?? 0) : 0)
      } else {
        toast.error(result.error ?? 'Có lỗi xảy ra')
      }
      setIsComplete(true)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [currentIndex, totalExercises, correctCount, lesson.id, module])

  const handleQuit = () => {
    router.push(returnPath)
  }

  if (isComplete) {
    return (
      <LessonComplete
        score={Math.round((correctCount / totalExercises) * 100)}
        correctCount={correctCount}
        totalCount={totalExercises}
        xpGained={xpGained}
        returnPath={returnPath}
      />
    )
  }

  if (!currentExercise) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-4 py-4">
        <button
          onClick={handleQuit}
          className="rounded-full p-1.5 hover:bg-zinc-100 transition-colors"
          aria-label="Thoát bài học"
        >
          <X className="h-5 w-5 text-zinc-400 hover:text-zinc-600" />
        </button>

        <div className="flex-1">
          <Progress
            value={progressPct}
            className="h-3 bg-zinc-100 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-indigo-400 [&>div]:transition-all [&>div]:duration-500"
          />
        </div>

        <HeartsDisplay count={hearts} />
      </div>

      {/* Exercise area */}
      <div className="flex-1 flex flex-col justify-center relative">
        {/* Floating +XP */}
        <AnimatePresence>
          {floatingXp && (
            <motion.div
              key="xp-float"
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -40, scale: 1 }}
              exit={{ opacity: 0, y: -70 }}
              transition={{ duration: 1.0 }}
              className="absolute top-4 right-4 text-green-600 font-bold text-lg pointer-events-none z-10"
            >
              +10 XP ⚡
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer feedback flash */}
        <AnimatePresence>
          {answerState !== 'idle' && (
            <motion.div
              key={`flash-${answerState}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.08 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 rounded-2xl pointer-events-none ${
                answerState === 'correct' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-full"
          >
            {currentExercise.type === 'match' && (
              <ExerciseMatch
                exercise={currentExercise as MatchExercise}
                onCorrect={handleCorrect}
                onWrong={handleWrong}
                answerState={answerState}
              />
            )}
            {currentExercise.type === 'translate' && (
              <ExerciseTranslate
                exercise={currentExercise as TranslateExercise}
                onCorrect={handleCorrect}
                onWrong={handleWrong}
                answerState={answerState}
              />
            )}
            {currentExercise.type === 'kanjiRead' && (
              <ExerciseKanjiRead
                exercise={currentExercise as KanjiReadExercise}
                onCorrect={handleCorrect}
                onWrong={handleWrong}
                answerState={answerState}
              />
            )}
            {currentExercise.type === 'kanaInput' && (
              <ExerciseKanaInput
                exercise={currentExercise as KanaInputExercise}
                onCorrect={handleCorrect}
                onWrong={handleWrong}
                answerState={answerState}
              />
            )}
            {currentExercise.type === 'sentenceOrder' && (
              <ExerciseSentenceOrder
                exercise={currentExercise as SentenceOrderExercise}
                onCorrect={handleCorrect}
                onWrong={handleWrong}
                answerState={answerState}
              />
            )}
            {currentExercise.type === 'keigo' && (
              <ExerciseKeigo
                exercise={currentExercise as KeigoExercise}
                onCorrect={handleCorrect}
                onWrong={handleWrong}
                answerState={answerState}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action area */}
      <div
        className={`py-4 transition-colors duration-300 ${
          answerState === 'correct'
            ? 'bg-green-50/80'
            : answerState === 'wrong'
              ? 'bg-red-50/80'
              : ''
        }`}
      >
        {answerState === 'idle' ? null : (
          <div className="flex items-center justify-between gap-4">
            <div>
              {answerState === 'correct' ? (
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <span className="text-xl">✓</span>
                  <span>Chính xác!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700 font-semibold">
                  <span className="text-xl">✗</span>
                  <span>
                    {hearts === 0
                      ? 'Hết tim! Hãy thử lại.'
                      : 'Chưa đúng, cố lên!'}
                  </span>
                </div>
              )}
            </div>
            <Button
              onClick={handleNext}
              size="lg"
              className={`min-w-[120px] font-bold ${
                answerState === 'correct'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              次へ
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
