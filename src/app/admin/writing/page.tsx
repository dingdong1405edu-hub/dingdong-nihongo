import Link from 'next/link'
import { db } from '@/lib/db'
import { JLPTBadge } from '@/components/admin/jlpt-badge'
import { DeleteButton } from '@/components/admin/delete-button'

export const dynamic = 'force-dynamic'

const TASK_TYPE_COLORS: Record<string, string> = {
  ESSAY: 'bg-purple-100 text-purple-700',
  OPINION: 'bg-blue-100 text-blue-700',
  LETTER: 'bg-amber-100 text-amber-700',
  DESCRIPTION: 'bg-teal-100 text-teal-700',
}

type Props = {
  searchParams: Promise<{ jlpt?: string; type?: string; page?: string }>
}

export default async function AdminWritingPage({ searchParams }: Props) {
  const sp = await searchParams
  const jlptLevel = ['N5', 'N4', 'N3', 'N2', 'N1'].includes(sp.jlpt ?? '')
    ? (sp.jlpt as 'N5' | 'N4' | 'N3' | 'N2' | 'N1')
    : undefined
  const taskType = ['ESSAY', 'OPINION', 'LETTER', 'DESCRIPTION'].includes(sp.type ?? '')
    ? (sp.type as 'ESSAY' | 'OPINION' | 'LETTER' | 'DESCRIPTION')
    : undefined
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const limit = 20

  const where = {
    ...(jlptLevel ? { jlptLevel } : {}),
    ...(taskType ? { taskType } : {}),
  }

  const [total, tasks] = await db.$transaction([
    db.writingTask.count({ where }),
    db.writingTask.findMany({
      where,
      orderBy: [{ jlptLevel: 'asc' }, { taskType: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Writing Tasks</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{total} tasks total</p>
        </div>
        <Link
          href="/admin/writing/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Thêm Task
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((l) => (
          <Link
            key={l}
            href={`/admin/writing?${new URLSearchParams({ ...(l !== jlptLevel ? { jlpt: l } : {}), ...(taskType ? { type: taskType } : {}) })}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${jlptLevel === l ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
          >
            {l}
          </Link>
        ))}
        <span className="border-l border-zinc-200 mx-1" />
        {(['ESSAY', 'OPINION', 'LETTER', 'DESCRIPTION'] as const).map((t) => (
          <Link
            key={t}
            href={`/admin/writing?${new URLSearchParams({ ...(jlptLevel ? { jlpt: jlptLevel } : {}), ...(t !== taskType ? { type: t } : {}) })}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${taskType === t ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
          >
            {t}
          </Link>
        ))}
        {(jlptLevel || taskType) && (
          <Link
            href="/admin/writing"
            className="rounded-full px-3 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-600"
          >
            Clear
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-zinc-400">
            データなし
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Type</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Prompt</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">JLPT</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Min chars</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Time (min)</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Keigo</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TASK_TYPE_COLORS[t.taskType] ?? 'bg-zinc-100 text-zinc-600'}`}
                    >
                      {t.taskType}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="truncate text-zinc-700">{t.prompt}</p>
                    {t.promptJa && (
                      <p
                        className="truncate text-xs text-zinc-400"
                        style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                      >
                        {t.promptJa}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <JLPTBadge level={t.jlptLevel} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{t.minChars}</td>
                  <td className="px-4 py-3 text-zinc-600">{Math.round(t.timeLimit / 60)}</td>
                  <td className="px-4 py-3">
                    {t.requireKeigo ? (
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-xs font-medium text-rose-700">
                        có
                      </span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <DeleteButton
                        id={t.id}
                        endpoint="/api/admin/writing"
                        label="writing task"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/writing?${new URLSearchParams({ ...(jlptLevel ? { jlpt: jlptLevel } : {}), ...(taskType ? { type: taskType } : {}), page: String(page - 1) })}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/writing?${new URLSearchParams({ ...(jlptLevel ? { jlpt: jlptLevel } : {}), ...(taskType ? { type: taskType } : {}), page: String(page + 1) })}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
