import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { KanjiListClient } from './KanjiListClient'
import { type JLPTLevel } from '@prisma/client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kanji | DingDong Nihongo',
  description: 'Học Kanji theo chuẩn JLPT N5–N1 — stroke order, bộ thủ, On/Kun reading',
}

interface PageProps {
  searchParams: Promise<{ level?: string }>
}

const VALID_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

function isValidLevel(val: string | undefined): val is JLPTLevel {
  return VALID_LEVELS.includes(val as JLPTLevel)
}

export default async function KanjiPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { level } = await searchParams
  const activeLevel: JLPTLevel = isValidLevel(level) ? level : 'N5'

  const [allKanji, progressRows] = await Promise.all([
    db.kanjiCharacter.findMany({
      select: {
        id: true,
        character: true,
        meaning: true,
        onyomi: true,
        jlptLevel: true,
        grade: true,
        strokeCount: true,
      },
      orderBy: [{ jlptLevel: 'asc' }, { grade: 'asc' }],
    }),
    db.kanjiProgress.findMany({
      where: { userId: session.user.id, mastered: true },
      select: { kanjiId: true },
    }),
  ])

  const masteredIds = progressRows.map((p) => p.kanjiId)

  const kanjiItems = allKanji.map((k) => ({
    id: k.id,
    character: k.character,
    meaning: k.meaning,
    onyomi: k.onyomi as string[],
    jlptLevel: k.jlptLevel as JLPTLevel,
    grade: k.grade,
    strokeCount: k.strokeCount,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900">
            Học Kanji <span className="font-japanese text-indigo-600">漢字</span>
          </h1>
          <p className="text-sm text-zinc-500">
            Stroke order, bộ thủ (radical), âm On/Kun và bài quiz theo chuẩn JLPT
          </p>
        </div>

        <KanjiListClient
          allKanji={kanjiItems}
          masteredIds={masteredIds}
          initialLevel={activeLevel}
        />
      </div>
    </div>
  )
}
