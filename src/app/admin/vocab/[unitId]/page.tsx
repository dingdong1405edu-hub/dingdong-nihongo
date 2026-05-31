import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { JLPTBadge } from '@/components/admin/jlpt-badge'
import { DeleteButton } from '@/components/admin/delete-button'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ unitId: string }> }

export default async function VocabUnitDetailPage({ params }: Props) {
  const { unitId } = await params

  const unit = await db.vocabUnit.findUnique({
    where: { id: unitId },
    include: { lessons: { orderBy: { order: 'asc' } } },
  })

  if (!unit) notFound()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/vocab" className="text-sm text-zinc-400 hover:text-zinc-600">
              Vocab
            </Link>
            <span className="text-zinc-300">/</span>
            <h2 className="text-xl font-semibold text-zinc-900">{unit.title}</h2>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="text-sm text-zinc-500"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            >
              {unit.titleJa}
            </span>
            <JLPTBadge level={unit.jlptLevel} />
            <span className="text-xs text-zinc-400">Order: {unit.order}</span>
          </div>
        </div>
        <Link
          href={`/admin/vocab/${unit.id}/lessons/new`}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Thêm Lesson
        </Link>
      </div>

      {/* Lessons table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
          <h3 className="text-sm font-medium text-zinc-700">
            Lessons ({unit.lessons.length})
          </h3>
        </div>
        {unit.lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-zinc-400">
            <span>データなし</span>
            <Link
              href={`/admin/vocab/${unit.id}/lessons/new`}
              className="text-indigo-600 hover:underline"
            >
              Thêm lesson đầu tiên
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Order</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Title</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Exercises</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Created</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {unit.lessons.map((lesson) => {
                const exercises = Array.isArray(lesson.exercises) ? lesson.exercises : []
                return (
                  <tr key={lesson.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 text-zinc-500">{lesson.order}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {lesson.title || `Lesson ${lesson.order}`}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{exercises.length}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {new Date(lesson.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <DeleteButton
                          id={lesson.id}
                          endpoint="/api/admin/vocab/lessons"
                          label="lesson"
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
