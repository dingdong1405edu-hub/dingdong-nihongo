import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { SpeakingClient } from './SpeakingClient'

interface PageProps {
  params: Promise<{ setId: string }>
}

export default async function SpeakingSetPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { setId } = await params

  const set = await db.speakingSet.findUnique({
    where: { id: setId },
  })

  if (!set) notFound()

  const prompts = set.prompts as { question: string; imageUrl?: string }[]

  return (
    <SpeakingClient
      speakingSet={{
        id: set.id,
        jlptLevel: set.jlptLevel,
        taskType: set.taskType,
        topic: set.topic,
        topicJa: set.topicJa,
        prompts,
        prepTimeSec: set.prepTimeSec,
        speakTimeSec: set.speakTimeSec,
        imageUrl: null,
      }}
    />
  )
}
