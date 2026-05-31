// Re-export Prisma enums
export type { JLPTLevel, Role, KanaType, Skill, QuestionType, WritingTaskType, SpeakingTaskType } from '@prisma/client'

// Exercise types for Vocab/Grammar lessons
export type ExerciseType = 'match' | 'translate' | 'listen' | 'kanjiRead' | 'kanaInput' | 'sentenceOrder' | 'keigo'

export interface MatchExercise {
  type: 'match'
  pairs: { japanese: string; vietnamese: string; reading?: string }[]
}

export interface TranslateExercise {
  type: 'translate'
  sentence: string
  sentenceJa: string
  options: string[]
  correct: string
}

export interface KanjiReadExercise {
  type: 'kanjiRead'
  kanji: string
  options: string[]
  correct: string
  readingType: 'on' | 'kun'
}

export interface KanaInputExercise {
  type: 'kanaInput'
  word: string
  meaning: string
  correct: string
}

export interface SentenceOrderExercise {
  type: 'sentenceOrder'
  words: string[]
  correct: string[]
  translation: string
}

export interface KeigoExercise {
  type: 'keigo'
  plain: string
  correct: string
  keigoType: 'teineigo' | 'sonkeigo' | 'kenjogo'
}

export type Exercise =
  | MatchExercise
  | TranslateExercise
  | KanjiReadExercise
  | KanaInputExercise
  | SentenceOrderExercise
  | KeigoExercise

// Writing grading output
export interface WritingGradeResult {
  score: number
  criteria: {
    grammar: { score: number; feedback: string; errors: string[] }
    vocabulary: { score: number; feedback: string; suggestions: string[] }
    keigo?: { score: number; feedback: string; errors: string[] }
    coherence: { score: number; feedback: string }
  }
  annotations: { original: string; issue: string; correction: string; explanation: string }[]
  correctedVersion: string
}

// Speaking grading output
export interface SpeakingGradeResult {
  score: number
  criteria: {
    pronunciation: { score: number; errors: { word: string; issue: string }[] }
    pitchAccent: { score: null; note: string }
    grammar: { score: number; errors: string[] }
    fluency: { score: number; wordsPerMinute: number; fillerCount: number; feedback: string }
  }
  transcript: string
  overallFeedback: string
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

// Kana character
export interface KanaCharacter {
  kana: string
  romaji: string
}

// Kanji example
export interface KanjiExample {
  word: string
  reading: string
  meaning: string
}

// Kanji radical
export interface KanjiRadical {
  radical: string
  meaning: string
}

// User stats for dashboard
export interface UserStats {
  xp: number
  hearts: number
  streakDays: number
  jlptLevel: string
  totalAttempts: number
}
