'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import Link from 'next/link'

interface Props {
  currentJlpt?: string
  currentQ?: string
}

export function KanjiSearchFilter({ currentJlpt, currentQ }: Props) {
  const router = useRouter()

  const buildUrl = useCallback(
    (params: Record<string, string | undefined>) => {
      const sp = new URLSearchParams()
      if (params.jlpt) sp.set('jlpt', params.jlpt)
      if (params.q) sp.set('q', params.q)
      const str = sp.toString()
      return `/admin/kanji${str ? `?${str}` : ''}`
    },
    []
  )

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const q = (fd.get('q') as string).trim()
    router.push(buildUrl({ jlpt: currentJlpt, q: q || undefined }))
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <input
          name="q"
          defaultValue={currentQ ?? ''}
          placeholder="Search kanji / meaning..."
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Search
        </button>
        {currentQ && (
          <Link href={buildUrl({ jlpt: currentJlpt })} className="text-sm text-zinc-400 hover:text-zinc-600">
            Clear
          </Link>
        )}
      </form>

      <span className="border-l border-zinc-200 h-5 mx-1" />

      {/* JLPT filter */}
      <Link
        href={buildUrl({ q: currentQ })}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!currentJlpt ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
      >
        All
      </Link>
      {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((l) => (
        <Link
          key={l}
          href={buildUrl({ jlpt: l !== currentJlpt ? l : undefined, q: currentQ })}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${currentJlpt === l ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
        >
          {l}
        </Link>
      ))}
    </div>
  )
}
