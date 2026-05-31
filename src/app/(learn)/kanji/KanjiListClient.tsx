'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { cn, jlptBadgeColor } from '@/lib/utils'
import { type JLPTLevel } from '@prisma/client'

interface KanjiItem {
  id: string
  character: string
  meaning: string
  onyomi: string[]
  jlptLevel: JLPTLevel
  grade: number | null
  strokeCount: number
}

interface KanjiListClientProps {
  allKanji: KanjiItem[]
  /** Array of mastered kanjiIds — serializable for RSC→client boundary */
  masteredIds: string[]
  initialLevel: JLPTLevel
}

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

export function KanjiListClient({
  allKanji,
  masteredIds: masteredIdsArr,
  initialLevel,
}: KanjiListClientProps) {
  const [activeLevel, setActiveLevel] = useState<JLPTLevel>(initialLevel)
  const [search, setSearch] = useState('')
  // Convert array to Set on client for O(1) lookups
  const masteredIds = useMemo(() => new Set(masteredIdsArr), [masteredIdsArr])

  const filtered = useMemo(() => {
    const byLevel = allKanji.filter((k) => k.jlptLevel === activeLevel)
    if (!search.trim()) return byLevel
    const q = search.trim().toLowerCase()
    return byLevel.filter(
      (k) =>
        k.character.includes(q) ||
        k.meaning.toLowerCase().includes(q) ||
        k.onyomi.some((r) => r.toLowerCase().includes(q)),
    )
  }, [allKanji, activeLevel, search])

  const levelKanji = useMemo(
    () => allKanji.filter((k) => k.jlptLevel === activeLevel),
    [allKanji, activeLevel],
  )
  const masteredCount = useMemo(
    () => levelKanji.filter((k) => masteredIds.has(k.id)).length,
    [levelKanji, masteredIds],
  )
  const progressPct = levelKanji.length > 0 ? Math.round((masteredCount / levelKanji.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Level filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {LEVELS.map((lvl) => {
          const total = allKanji.filter((k) => k.jlptLevel === lvl).length
          const done = allKanji.filter((k) => k.jlptLevel === lvl && masteredIds.has(k.id)).length
          return (
            <button
              key={lvl}
              onClick={() => {
                setActiveLevel(lvl)
                setSearch('')
              }}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                activeLevel === lvl
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-indigo-300 hover:text-indigo-600',
              )}
            >
              <span className={cn('w-2 h-2 rounded-full', activeLevel === lvl ? 'bg-white' : '', jlptBadgeColor(lvl).split(' ')[0])} />
              {lvl}
              <span className={cn('text-xs', activeLevel === lvl ? 'text-indigo-200' : 'text-zinc-400')}>
                {done}/{total}
              </span>
            </button>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-700">
            Đã thuộc {masteredCount}/{levelKanji.length} Kanji {activeLevel}
          </span>
          <span className="text-indigo-600 font-semibold">{progressPct}%</span>
        </div>
        <Progress value={progressPct} className="h-2.5" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm Kanji, nghĩa, hoặc âm đọc…"
          className="pl-9 h-10 bg-white rounded-xl"
        />
      </div>

      {/* Results count */}
      {search.trim() && (
        <p className="text-sm text-zinc-500">
          {filtered.length} kết quả cho &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Kanji grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-4xl font-japanese mb-3">漢字</p>
          <p className="text-sm">Không tìm thấy Kanji nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filtered.map((kanji, i) => {
            const isMastered = masteredIds.has(kanji.id)
            return (
              <motion.div
                key={kanji.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
              >
                <Link
                  href={`/kanji/${kanji.id}`}
                  className={cn(
                    'group relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5',
                    isMastered
                      ? 'bg-green-50 border-green-200 hover:border-green-400'
                      : 'bg-white border-zinc-200 hover:border-indigo-300',
                  )}
                >
                  {/* Mastered checkmark */}
                  {isMastered && (
                    <CheckCircle2 className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-green-500" />
                  )}

                  {/* Kanji character */}
                  <span
                    className={cn(
                      'font-japanese text-3xl leading-none transition-colors',
                      isMastered ? 'text-green-700' : 'text-zinc-800 group-hover:text-indigo-700',
                    )}
                  >
                    {kanji.character}
                  </span>

                  {/* Meaning */}
                  <span className="text-xs text-zinc-500 text-center leading-tight line-clamp-2 w-full">
                    {kanji.meaning}
                  </span>

                  {/* JLPT badge */}
                  <Badge
                    variant={kanji.jlptLevel}
                    className="text-[10px] px-1.5 py-0 h-4"
                  >
                    {kanji.jlptLevel}
                  </Badge>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
