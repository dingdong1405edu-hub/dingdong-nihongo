import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { WritingClient } from './WritingClient'

interface PageProps {
  params: Promise<{ taskId: string }>
}

export default async function WritingTaskPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { taskId } = await params

  const task = await db.writingTask.findUnique({
    where: { id: taskId },
  })

  if (!task) notFound()

  return (
    <WritingClient
      task={{
        id: task.id,
        taskType: task.taskType,
        prompt: task.prompt,
        promptJa: task.promptJa,
        imageUrl: task.imageUrl,
        minChars: task.minChars,
        timeLimit: task.timeLimit,
        jlptLevel: task.jlptLevel,
        requireKeigo: task.requireKeigo,
      }}
    />
  )
}
