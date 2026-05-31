import Link from 'next/link'
import { db } from '@/lib/db'
import { JLPTBadge } from '@/components/admin/jlpt-badge'
import { DeleteButton } from '@/components/admin/delete-button'
import { KanjiSearchFilter } from '@/components/admin/kanji-search-filter'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ jlpt?: string; q?: string; page?: string }>
}

export default async function AdminKanjiPage({ searchParams }: Props) {
  const sp = await searchParams
  const jlptLevel = ['N5', 'N4', 'N3', 'N2', 'N1'].includes(sp.jlpt ?? '')
    ? (sp.jlpt as 'N5' | 'N4' | 'N3' | 'N2' | 'N1')
    : undefined
  const search = sp.q?.trim() ?? ''
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const limit = 50

  const where = {
    ...(jlptLevel ? { jlptLevel } : {}),
    ...(search
      ? {
          OR: [
            { character: { contains: search } },
            { meaning: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [total, kanji] = await db.$transaction([
    db.kanjiCharacter.count({ where }),
    db.kanjiCharacter.findMany({
      where,
      orderBy: [{ jlptLevel: 'asc' }, { strokeCount: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Kanji</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{total} characters total</p>
        </div>
        <Link
          href="/admin/kanji/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Thêm Kanji
        </Link>
      </div>

      <KanjiSearchFilter currentJlpt={jlptLevel} currentQ={search} />

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {kanji.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-zinc-400">
            データなし
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Character</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Meaning</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">On/Kun</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">JLPT</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Grade</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Strokes</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {kanji.map((k) => {
                const onyomi = Array.isArray(k.onyomi) ? (k.onyomi as string[]).join('、') : ''
                const kunyomi = Array.isArray(k.kunyomi) ? (k.kunyomi as string[]).join('、') : ''
                return (
                  <tr key={k.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <span
                        className="text-2xl font-bold text-zinc-900"
                        style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                      >
                        {k.character}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{k.meaning}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {onyomi && <div>On: {onyomi}</div>}
                      {kunyomi && <div>Kun: {kunyomi}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <JLPTBadge level={k.jlptLevel} />
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{k.grade ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-500">{k.strokeCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/kanji/${k.id}/edit`}
                          className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          id={k.id}
                          endpoint="/api/admin/kanji"
                          label="kanji"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/kanji?${new URLSearchParams({ ...(jlptLevel ? { jlpt: jlptLevel } : {}), ...(search ? { q: search } : {}), page: String(page - 1) })}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/kanji?${new URLSearchParams({ ...(jlptLevel ? { jlpt: jlptLevel } : {}), ...(search ? { q: search } : {}), page: String(page + 1) })}`}
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
