import Link from 'next/link'
import { db } from '@/lib/db'
import { JLPTBadge } from '@/components/admin/jlpt-badge'
import { DeleteButton } from '@/components/admin/delete-button'

export const dynamic = 'force-dynamic'

export default async function AdminGrammarPage() {
  const units = await db.grammarUnit.findMany({
    orderBy: [{ jlptLevel: 'asc' }, { order: 'asc' }],
    include: { _count: { select: { lessons: true } } },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Grammar Units</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{units.length} units total</p>
        </div>
        <Link
          href="/admin/grammar/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Thêm Unit
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {units.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-zinc-400">
            データなし
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Title</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">日本語</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">JLPT</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Lessons</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Order</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {units.map((unit) => (
                <tr key={unit.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{unit.title}</td>
                  <td
                    className="px-4 py-3 text-zinc-700"
                    style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                  >
                    {unit.titleJa}
                  </td>
                  <td className="px-4 py-3">
                    <JLPTBadge level={unit.jlptLevel} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{unit._count.lessons}</td>
                  <td className="px-4 py-3 text-zinc-600">{unit.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <DeleteButton
                        id={unit.id}
                        endpoint="/api/admin/grammar"
                        label="grammar unit"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
