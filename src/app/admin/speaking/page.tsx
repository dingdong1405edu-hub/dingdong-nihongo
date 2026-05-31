import Link from 'next/link'
import { db } from '@/lib/db'
import { JLPTBadge } from '@/components/admin/jlpt-badge'
import { DeleteButton } from '@/components/admin/delete-button'

export const dynamic = 'force-dynamic'

const TASK_TYPE_COLORS: Record<string, string> = {
  INTERVIEW: 'bg-sky-100 text-sky-700',
  PICTURE_DESC: 'bg-violet-100 text-violet-700',
  OPINION: 'bg-orange-100 text-orange-700',
  ROLEPLAY: 'bg-pink-100 text-pink-700',
}

type Props = {
  searchParams: Promise<{ jlpt?: string; type?: string; page?: string }>
}

export default async function AdminSpeakingPage({ searchParams }: Props) {
  const sp = await searchParams
  const jlptLevel = ['N5', 'N4', 'N3', 'N2', 'N1'].includes(sp.jlpt ?? '')
    ? (sp.jlpt as 'N5' | 'N4' | 'N3' | 'N2' | 'N1')
    : undefined
  const taskType = ['INTERVIEW', 'PICTURE_DESC', 'OPINION', 'ROLEPLAY'].includes(sp.type ?? '')
    ? (sp.type as 'INTERVIEW' | 'PICTURE_DESC' | 'OPINION' | 'ROLEPLAY')
    : undefined
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const limit = 20

  const where = {
    ...(jlptLevel ? { jlptLevel } : {}),
    ...(taskType ? { taskType } : {}),
  }

  const [total, sets] = await db.$transaction([
    db.speakingSet.count({ where }),
    db.speakingSet.findMany({
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
          <h2 className="text-xl font-semibold text-zinc-900">Speaking Sets</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{total} sets total</p>
        </div>
        <Link
          href="/admin/speaking/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Thêm Set
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((l) => (
          <Link
            key={l}
            href={`/admin/speaking?${new URLSearchParams({ ...(l !== jlptLevel ? { jlpt: l } : {}), ...(taskType ? { type: taskType } : {}) })}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${jlptLevel === l ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
          >
            {l}
          </Link>
        ))}
        <span className="border-l border-zinc-200 mx-1" />
        {(['INTERVIEW', 'PICTURE_DESC', 'OPINION', 'ROLEPLAY'] as const).map((t) => (
          <Link
            key={t}
            href={`/admin/speaking?${new URLSearchParams({ ...(jlptLevel ? { jlpt: jlptLevel } : {}), ...(t !== taskType ? { type: t } : {}) })}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${taskType === t ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
          >
            {t}
          </Link>
        ))}
        {(jlptLevel || taskType) && (
          <Link
            href="/admin/speaking"
            className="rounded-full px-3 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-600"
          >
            Clear
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {sets.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-zinc-400">
            データなし
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Type</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Topic</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">JLPT</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Prompts</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Prep</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Speak</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sets.map((s) => {
                const promptCount = Array.isArray(s.prompts) ? s.prompts.length : 0
                return (
                  <tr key={s.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TASK_TYPE_COLORS[s.taskType] ?? 'bg-zinc-100 text-zinc-600'}`}
                      >
                        {s.taskType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900">{s.topic}</p>
                      <p
                        className="text-xs text-zinc-400"
                        style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                      >
                        {s.topicJa}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <JLPTBadge level={s.jlptLevel} />
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{promptCount}</td>
                    <td className="px-4 py-3 text-zinc-600">{s.prepTimeSec}s</td>
                    <td className="px-4 py-3 text-zinc-600">{s.speakTimeSec}s</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <DeleteButton
                          id={s.id}
                          endpoint="/api/admin/speaking"
                          label="speaking set"
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/speaking?${new URLSearchParams({ ...(jlptLevel ? { jlpt: jlptLevel } : {}), ...(taskType ? { type: taskType } : {}), page: String(page - 1) })}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/speaking?${new URLSearchParams({ ...(jlptLevel ? { jlpt: jlptLevel } : {}), ...(taskType ? { type: taskType } : {}), page: String(page + 1) })}`}
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
