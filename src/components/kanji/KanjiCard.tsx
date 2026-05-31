'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { type JLPTLevel } from '@prisma/client'

interface KanjiCardProps {
  character: string
  onyomi: string[]
  kunyomi: string[]
  meaning: string
  jlptLevel: JLPTLevel
  examples?: Array<{ word: string; reading: string; meaning: string }>
}

export function KanjiCard({
  character,
  onyomi,
  kunyomi,
  meaning,
  jlptLevel,
  examples = [],
}: KanjiCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="relative w-64 h-80 cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      aria-label={flipped ? `裏面: ${character}の読み方` : `${character}をクリックして読み方を見る`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setFlipped((f) => !f)
      }}
    >
      <motion.div
        className="w-full h-full relative"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-zinc-200 flex flex-col items-center justify-center gap-3"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="font-japanese text-8xl text-zinc-800 leading-none">
            {character}
          </span>
          <Badge variant={jlptLevel}>{jlptLevel}</Badge>
          <p className="text-xs text-zinc-400">Nhấn để xem</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-indigo-50 rounded-2xl shadow-lg border border-indigo-200 p-5 flex flex-col gap-3 overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Compact kanji top-right */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div>
                <p className="text-xs text-zinc-400 mb-0.5">音読み</p>
                <p className="font-japanese text-base text-indigo-700 leading-snug">
                  {onyomi.length > 0 ? onyomi.join('、') : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-0.5">訓読み</p>
                <p className="font-japanese text-base text-indigo-700 leading-snug">
                  {kunyomi.length > 0 ? kunyomi.join('、') : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-0.5">Nghĩa</p>
                <p className="text-sm font-medium text-zinc-800">{meaning}</p>
              </div>
            </div>
            <span className="font-japanese text-4xl text-indigo-300 ml-2 leading-none shrink-0">
              {character}
            </span>
          </div>

          {/* Examples */}
          {examples.length > 0 && (
            <div className="mt-auto pt-2 border-t border-indigo-200">
              <p className="text-xs text-zinc-400 mb-1">Ví dụ</p>
              <div className="space-y-1">
                {examples.slice(0, 2).map((ex) => (
                  <div key={ex.word} className="flex items-baseline gap-1.5">
                    <span className="font-japanese text-sm text-indigo-800">{ex.word}</span>
                    <span className="font-japanese text-xs text-zinc-500">({ex.reading})</span>
                    <span className="text-xs text-zinc-600 truncate">— {ex.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
