import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { LessonClient } from './LessonClient'
import type { Exercise } from '@/types'

interface PageProps {
  params: Promise<{ unitId: string; lessonId: string }>
}

export default async function GrammarLessonPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { unitId, lessonId } = await params

  const [lesson, user] = await Promise.all([
    db.grammarLesson.findUnique({
      where: { id: lessonId },
      include: {
        unit: { select: { id: true, title: true, jlptLevel: true } },
      },
    }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { hearts: true },
    }),
  ])

  if (!lesson || lesson.unitId !== unitId) notFound()
  if (!user) redirect('/login')

  const exercises = (lesson.exercises as Exercise[]) ?? []

  return (
    <LessonClient
      lesson={{ id: lesson.id, exercises, title: lesson.title }}
      unitId={unitId}
      userHearts={user.hearts}
      returnPath={`/grammar/${unitId}`}
      module="grammar"
    />
  )
}
