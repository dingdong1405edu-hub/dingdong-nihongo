import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { KanjiDetailClient } from './KanjiDetailClient'
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

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function KanjiDetailPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params

  const [kanji, progress, distractors] = await Promise.all([
    db.kanjiCharacter.findUnique({ where: { id } }),
    db.kanjiProgress.findUnique({
      where: { userId_kanjiId: { userId: session.user.id, kanjiId: id } },
    }),
    // Fetch other kanji at same level for quiz distractors
    db.kanjiCharacter.findMany({
      where: { id: { not: id } },
      select: { character: true, meaning: true },
      take: 10,
      orderBy: { grade: 'asc' },
    }),
  ])

  if (!kanji) return notFound()

  return (
    <KanjiDetailClient
      kanji={{
        id: kanji.id,
        character: kanji.character,
        onyomi: kanji.onyomi as string[],
        kunyomi: kanji.kunyomi as string[],
        meaning: kanji.meaning,
        jlptLevel: kanji.jlptLevel as JLPTLevel,
        grade: kanji.grade,
        strokeCount: kanji.strokeCount,
        radicals: kanji.radicals as Radical[],
        examples: kanji.examples as Example[],
        mnemonic: kanji.mnemonic,
      }}
      isMastered={progress?.mastered ?? false}
      distractors={distractors.map((d) => ({
        character: d.character,
        meaning: d.meaning,
      }))}
    />
  )
}
