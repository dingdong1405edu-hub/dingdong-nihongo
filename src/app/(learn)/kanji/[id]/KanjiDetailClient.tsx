'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, BookOpen, PenLine, HelpCircle, ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { StrokeOrderCanvas } from '@/components/kanji/StrokeOrderCanvas'
import { RadicalBadge } from '@/components/kanji/RadicalBadge'
import { KanjiCard } from '@/components/kanji/KanjiCard'
import { KanjiQuiz } from '@/components/kanji/KanjiQuiz'
import { recordKanjiReview } from '@/server/actions/kanji'
import { type JLPTLevel } from '@prisma/client'

interface Radical {
  radical: string
  meaning: string
}

interface Example {
  word: string
  reading: string
  meaning: string
}

interface KanjiData {
  id: string
  character: string
  onyomi: string[]
  kunyomi: string[]
  meaning: string
  jlptLevel: JLPTLevel
  grade: number | null
  strokeCount: number
  radicals: Radical[]
  examples: Example[]
  mnemonic: string | null
}

interface DistractorKanji {
  character: string
  meaning: string
}

interface KanjiDetailClientProps {
  kanji: KanjiData
  isMastered: boolean
  distractors: DistractorKanji[]
}

export function KanjiDetailClient({
  kanji,
  isMastered: initialMastered,
  distractors,
}: KanjiDetailClientProps) {
  const [mastered, setMastered] = useState(initialMastered)
  const [quizScore, setQuizScore] = useState<number | null>(null)

  async function handleQuizComplete(score: number) {
    setQuizScore(score)
    const achieved = score >= 70
    const result = await recordKanjiReview(kanji.id, achieved)
    if (result.ok) {
      if (achieved && !mastered) {
        setMastered(true)
        toast.success(`+${result.xpGained ?? 15} XP — Đã thuộc「${kanji.character}」！`)
      } else if (result.xpGained) {
        toast.success(`+${result.xpGained} XP`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Back navigation */}
        <Link
          href="/kanji"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Danh sách Kanji
        </Link>

        {/* Header */}
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 bg-white rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-center">
              <span className="font-japanese text-8xl text-zinc-800 leading-none">
                {kanji.character}
              </span>
            </div>
            {mastered && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-xs text-green-600 font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã thuộc
              </motion.div>
            )}
          </div>

          <div className="flex-1 space-y-3 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={kanji.jlptLevel}>{kanji.jlptLevel}</Badge>
              {kanji.grade !== null && (
                <Badge variant="outline" className="text-zinc-500">
                  Lớp {kanji.grade}
                </Badge>
              )}
              <Badge variant="secondary">{kanji.strokeCount} nét</Badge>
            </div>

            <h1 className="text-2xl font-bold text-zinc-800">{kanji.meaning}</h1>

            <div className="space-y-1">
              {kanji.onyomi.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-400 w-16 shrink-0">音読み</span>
                  <div className="flex flex-wrap gap-1">
                    {kanji.onyomi.map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-sm font-japanese"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {kanji.kunyomi.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-400 w-16 shrink-0">訓読み</span>
                  <div className="flex flex-wrap gap-1">
                    {kanji.kunyomi.map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-sm font-japanese"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-zinc-100 rounded-xl">
            <TabsTrigger value="overview" className="flex items-center gap-1.5 py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <BookOpen className="w-3.5 h-3.5" />
              概要
            </TabsTrigger>
            <TabsTrigger value="stroke" className="flex items-center gap-1.5 py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <PenLine className="w-3.5 h-3.5" />
              筆順
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-1.5 py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <HelpCircle className="w-3.5 h-3.5" />
              クイズ
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Overview ── */}
          <TabsContent value="overview">
            <AnimatePresence mode="wait">
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pt-4"
              >
                {/* Flip card */}
                <div className="flex justify-center">
                  <KanjiCard
                    character={kanji.character}
                    onyomi={kanji.onyomi}
                    kunyomi={kanji.kunyomi}
                    meaning={kanji.meaning}
                    jlptLevel={kanji.jlptLevel}
                    examples={kanji.examples}
                  />
                </div>

                {/* Radicals */}
                {kanji.radicals.length > 0 && (
                  <section className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
                    <h2 className="text-sm font-semibold text-zinc-700">Bộ thủ (部首)</h2>
                    <div className="flex flex-wrap gap-2">
                      {kanji.radicals.map((rad) => (
                        <RadicalBadge key={rad.radical} radical={rad.radical} meaning={rad.meaning} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Examples */}
                {kanji.examples.length > 0 && (
                  <section className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
                    <h2 className="text-sm font-semibold text-zinc-700">Từ ví dụ</h2>
                    <div className="divide-y divide-zinc-100">
                      {kanji.examples.map((ex) => (
                        <div key={ex.word} className="py-3 flex items-baseline gap-3">
                          <span className="font-japanese text-xl text-zinc-800 shrink-0">
                            {ex.word}
                          </span>
                          <span className="font-japanese text-sm text-indigo-600">
                            {ex.reading}
                          </span>
                          <span className="text-sm text-zinc-500 truncate">
                            {ex.meaning}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Mnemonic */}
                {kanji.mnemonic && (
                  <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                      <Star className="w-4 h-4" />
                      Gợi nhớ
                    </div>
                    <p className="text-sm text-amber-800 leading-relaxed">{kanji.mnemonic}</p>
                  </section>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── Tab 2: Stroke Order ── */}
          <TabsContent value="stroke">
            <AnimatePresence mode="wait">
              <motion.div
                key="stroke"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-6 space-y-4"
              >
                <p className="text-sm text-zinc-500 text-center">
                  Số nét: <span className="font-semibold text-zinc-700">{kanji.strokeCount}</span>
                </p>
                <div className="flex justify-center">
                  <StrokeOrderCanvas
                    character={kanji.character}
                    width={300}
                    height={300}
                    autoPlay={false}
                    strokeCount={kanji.strokeCount}
                  />
                </div>
                <p className="text-xs text-zinc-400 text-center max-w-sm mx-auto">
                  Nhấn <strong>Xem nét bút</strong> để xem animation, <strong>Từng nét</strong> để
                  xem từng nét, hoặc <strong>Luyện viết</strong> để luyện tập trực tiếp trên màn hình.
                </p>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* ── Tab 3: Quiz ── */}
          <TabsContent value="quiz">
            <AnimatePresence mode="wait">
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4"
              >
                {quizScore !== null ? (
                  <div className="text-center space-y-4 py-8">
                    <p className="text-4xl font-bold text-zinc-800">{quizScore} điểm</p>
                    {mastered && (
                      <div className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Đã thuộc!
                      </div>
                    )}
                    <button
                      onClick={() => setQuizScore(null)}
                      className="block mx-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Làm lại
                    </button>
                  </div>
                ) : (
                  <KanjiQuiz
                    kanji={{
                      id: kanji.id,
                      character: kanji.character,
                      onyomi: kanji.onyomi,
                      kunyomi: kanji.kunyomi,
                      meaning: kanji.meaning,
                    }}
                    distractors={distractors}
                    onComplete={handleQuizComplete}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
