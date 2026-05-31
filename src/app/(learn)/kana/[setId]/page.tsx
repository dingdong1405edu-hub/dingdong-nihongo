import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { KanaStudyClient } from './KanaStudyClient'

export const dynamic = 'force-dynamic'

interface KanaSetPageProps {
  params: Promise<{ setId: string }>
}

export default async function KanaSetPage({ params }: KanaSetPageProps) {
  const { setId } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const [kanaSet, progressRecord] = await Promise.all([
    db.kanaSet.findUnique({ where: { id: setId } }),
    db.kanaProgress.findUnique({
      where: { userId_kanaSetId: { userId: session.user.id, kanaSetId: setId } },
    }),
  ])

  if (!kanaSet) notFound()

  const characters = kanaSet.characters as { kana: string; romaji: string }[]

  return (
    <KanaStudyClient
      kanaSet={{
        id: kanaSet.id,
        type: kanaSet.type,
        row: kanaSet.row,
        characters,
      }}
      initialProgress={progressRecord ? { mastered: progressRecord.mastered } : null}
    />
  )
}
