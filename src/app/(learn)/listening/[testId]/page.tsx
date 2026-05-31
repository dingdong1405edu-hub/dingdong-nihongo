import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ListeningTestClient } from './ListeningTestClient'

interface ListeningTestPageProps {
  params: Promise<{ testId: string }>
}

export default async function ListeningTestPage({ params }: ListeningTestPageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { testId } = await params

  const test = await db.listeningTest.findUnique({
    where: { id: testId },
    include: {
      questions: {
        orderBy: { id: 'asc' },
        select: {
          id: true,
          type: true,
          prompt: true,
          options: true,
          correctAnswer: true,
        },
      },
    },
  })

  if (!test) notFound()

  const serialized = {
    id: test.id,
    title: test.title,
    jlptLevel: test.jlptLevel as string,
    audioUrl: test.audioUrl,
    transcript: test.transcript,
    timeLimit: test.timeLimit ?? 0,
    questions: test.questions.map((q) => ({
      id: q.id,
      type: q.type as string,
      prompt: q.prompt,
      options: q.options as string[] | null,
      correctAnswer: q.correctAnswer as string | string[],
    })),
  }

  return <ListeningTestClient test={serialized} />
}
