import Link from 'next/link'
import { db } from '@/lib/db'
import { DeleteButton } from '@/components/admin/delete-button'

export const dynamic = 'force-dynamic'

export default async function AdminKanaPage() {
  const sets = await db.kanaSet.findMany({
    orderBy: [{ type: 'asc' }, { order: 'asc' }],
    include: { _count: { select: { progress: true } } },
  })

  const hiragana = sets.filter((s) => s.type === 'HIRAGANA')
  const katakana = sets.filter((s) => s.type === 'KATAKANA')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Kana Sets</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{sets.length} sets total</p>
        </div>
        <Link
          href="/admin/kana/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Thêm Set
        </Link>
      </div>

      {[
        { label: 'Hiragana (ひらがな)', data: hiragana },
        { label: 'Katakana (カタカナ)', data: katakana },
      ].map(({ label, data }) => (
        <div key={label} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
            <h3
              className="text-sm font-medium text-zinc-700"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            >
              {label}
            </h3>
          </div>
          {data.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-sm text-zinc-400">
              データなし
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Row</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Characters</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Order</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Learners</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.map((s) => {
                  const chars = Array.isArray(s.characters) ? s.characters as Array<{ kana: string }> : []
                  return (
                    <tr key={s.id} className="hover:bg-zinc-50">
                      <td
                        className="px-4 py-3 font-medium text-zinc-900"
                        style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                      >
                        {s.row}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {chars.slice(0, 8).map((c, i) => (
                            <span
                              key={i}
                              className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-700"
                              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                            >
                              {c.kana}
                            </span>
                          ))}
                          {chars.length > 8 && (
                            <span className="text-xs text-zinc-400">+{chars.length - 8}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{s.order}</td>
                      <td className="px-4 py-3 text-zinc-500">{s._count.progress}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/kana/${s.id}/edit`}
                            className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                          >
                            Edit
                          </Link>
                          <DeleteButton
                            id={s.id}
                            endpoint="/api/admin/kana"
                            label="kana set"
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
      ))}
    </div>
  )
}
