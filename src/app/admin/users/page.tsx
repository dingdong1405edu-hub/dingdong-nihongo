import Link from 'next/link'
import { db } from '@/lib/db'
import { JLPTBadge } from '@/components/admin/jlpt-badge'
import { UserActions } from '@/components/admin/user-actions'

export const dynamic = 'force-dynamic'

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-rose-100 text-rose-700',
  LEARNER: 'bg-zinc-100 text-zinc-600',
}

type Props = {
  searchParams: Promise<{ role?: string; jlpt?: string; q?: string; page?: string }>
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const sp = await searchParams
  const role = ['ADMIN', 'LEARNER'].includes(sp.role ?? '') ? sp.role : undefined
  const jlptLevel = ['N5', 'N4', 'N3', 'N2', 'N1'].includes(sp.jlpt ?? '')
    ? (sp.jlpt as 'N5' | 'N4' | 'N3' | 'N2' | 'N1')
    : undefined
  const search = sp.q?.trim() ?? ''
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const limit = 50

  const where = {
    ...(role ? { role: role as 'ADMIN' | 'LEARNER' } : {}),
    ...(jlptLevel ? { jlptLevel } : {}),
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [total, users] = await db.$transaction([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        xp: true,
        hearts: true,
        streakDays: true,
        jlptLevel: true,
        lastActiveAt: true,
        createdAt: true,
        _count: { select: { attempts: true } },
      },
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Users</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{total} users total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <form method="GET" action="/admin/users" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={search}
            placeholder="Search email / name..."
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {role && <input type="hidden" name="role" value={role} />}
          {jlptLevel && <input type="hidden" name="jlpt" value={jlptLevel} />}
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Search
          </button>
          {search && (
            <Link href="/admin/users" className="text-sm text-zinc-400 hover:text-zinc-600">
              Clear
            </Link>
          )}
        </form>

        <span className="border-l border-zinc-200 h-5 mx-1" />

        {/* Role filter */}
        {['ADMIN', 'LEARNER'].map((r) => (
          <Link
            key={r}
            href={`/admin/users?${new URLSearchParams({ ...(r !== role ? { role: r } : {}), ...(jlptLevel ? { jlpt: jlptLevel } : {}), ...(search ? { q: search } : {}) })}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${role === r ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
          >
            {r}
          </Link>
        ))}

        <span className="border-l border-zinc-200 h-5 mx-1" />

        {/* JLPT filter */}
        {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((l) => (
          <Link
            key={l}
            href={`/admin/users?${new URLSearchParams({ ...(role ? { role } : {}), ...(l !== jlptLevel ? { jlpt: l } : {}), ...(search ? { q: search } : {}) })}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${jlptLevel === l ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
          >
            {l}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {users.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-zinc-400">
            データなし
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Name / Email</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Role</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">JLPT</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">XP</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Hearts</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Streak</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Attempts</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Joined</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{u.name ?? '—'}</p>
                    <p className="text-xs text-zinc-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[u.role] ?? 'bg-zinc-100 text-zinc-600'}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <JLPTBadge level={u.jlptLevel} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{u.xp.toLocaleString()}</td>
                  <td className="px-4 py-3 text-zinc-600">{u.hearts}</td>
                  <td className="px-4 py-3 text-zinc-600">{u.streakDays}d</td>
                  <td className="px-4 py-3 text-zinc-600">{u._count.attempts}</td>
                  <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <UserActions userId={u.id} currentJlpt={u.jlptLevel} />
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
            Page {page} of {totalPages} ({total} users)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/users?${new URLSearchParams({ ...(role ? { role } : {}), ...(jlptLevel ? { jlpt: jlptLevel } : {}), ...(search ? { q: search } : {}), page: String(page - 1) })}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/users?${new URLSearchParams({ ...(role ? { role } : {}), ...(jlptLevel ? { jlpt: jlptLevel } : {}), ...(search ? { q: search } : {}), page: String(page + 1) })}`}
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
