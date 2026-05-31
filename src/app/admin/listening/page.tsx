import Link from 'next/link'
import { db } from '@/lib/db'
import { JLPTBadge } from '@/components/admin/jlpt-badge'
import { DeleteButton } from '@/components/admin/delete-button'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ jlpt?: string; page?: string }>
}

export default async function AdminListeningPage({ searchParams }: Props) {
  const sp = await searchParams
  const jlptLevel = ['N5', 'N4', 'N3', 'N2', 'N1'].includes(sp.jlpt ?? '')
    ? (sp.jlpt as 'N5' | 'N4' | 'N3' | 'N2' | 'N1')
    : undefined
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const limit = 20

  const where = jlptLevel ? { jlptLevel } : {}

  const [total, tests] = await db.$transaction([
    db.listeningTest.count({ where }),
    db.listeningTest.findMany({
      where,
      orderBy: { id: 'desc' },
      include: { _count: { select: { questions: true } } },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Listening Tests</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{total} tests total</p>
        </div>
        <Link
          href="/admin/listening/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Thêm Test
        </Link>
      </div>

      {/* JLPT filter */}
      <div className="flex gap-2">
        <Link
          href="/admin/listening"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!jlptLevel ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
        >
          All
        </Link>
        {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((l) => (
          <Link
            key={l}
            href={`/admin/listening?jlpt=${l}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${jlptLevel === l ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
          >
            {l}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {tests.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-zinc-400">
            データなし
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Title</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">JLPT</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Audio</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Transcript</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Questions</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Time (min)</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{t.title}</td>
                  <td className="px-4 py-3">
                    <JLPTBadge level={t.jlptLevel} />
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={t.audioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="max-w-[180px] truncate block text-xs text-indigo-600 hover:underline"
                    >
                      {t.audioUrl}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {t.transcript ? (
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                        có
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-400">
                        không
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{t._count.questions}</td>
                  <td className="px-4 py-3 text-zinc-600">{Math.round(t.timeLimit / 60)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <DeleteButton
                        id={t.id}
                        endpoint="/api/admin/listening"
                        label="listening test"
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
          <span className="text-zinc-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/listening?${new URLSearchParams({ ...(jlptLevel ? { jlpt: jlptLevel } : {}), page: String(page - 1) })}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/listening?${new URLSearchParams({ ...(jlptLevel ? { jlpt: jlptLevel } : {}), page: String(page + 1) })}`}
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
