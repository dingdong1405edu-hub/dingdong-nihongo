import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ReadingEditForm } from '@/components/admin/reading-edit-form'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function ReadingEditPage({ params }: Props) {
  const { id } = await params

  const test = await db.readingTest.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: 'asc' } } },
  })

  if (!test) notFound()

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Edit Reading Test</h2>
        <p className="mt-0.5 text-sm text-zinc-500">{test.title}</p>
      </div>
      <ReadingEditForm test={test} />
    </div>
  )
}
