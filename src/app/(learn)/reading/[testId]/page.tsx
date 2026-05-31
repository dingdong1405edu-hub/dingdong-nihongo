import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ReadingTestClient } from './ReadingTestClient'

interface ReadingTestPageProps {
  params: Promise<{ testId: string }>
}

export default async function ReadingTestPage({ params }: ReadingTestPageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { testId } = await params

  const test = await db.readingTest.findUnique({
    where: { id: testId },
    include: {
      questions: {
        orderBy: { id: 'asc' },
        select: {
          id: true,
          type: true,
          prompt: true,
          promptFurigana: true,
          options: true,
          correctAnswer: true,
          explanation: true,
        },
      },
    },
  })

  if (!test) notFound()

  // Serialize dates to plain strings so they can be passed to client component
  const serialized = {
    id: test.id,
    title: test.title,
    titleJa: test.titleJa,
    jlptLevel: test.jlptLevel as string,
    passage: test.passage,
    furigana: test.furigana,
    timeLimit: test.timeLimit,
    questions: test.questions.map((q) => ({
      id: q.id,
      type: q.type as string,
      prompt: q.prompt,
      promptFurigana: q.promptFurigana,
      options: q.options as string[] | null,
      correctAnswer: q.correctAnswer as string | string[],
      explanation: q.explanation,
    })),
  }

  return <ReadingTestClient test={serialized} />
}
