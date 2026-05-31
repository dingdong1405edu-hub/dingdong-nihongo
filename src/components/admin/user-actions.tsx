'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

interface Props {
  userId: string
  currentJlpt: string
}

export function UserActions({ userId, currentJlpt }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showJlpt, setShowJlpt] = useState(false)

  async function resetHearts() {
    setLoading('hearts')
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetHearts: true }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
      router.refresh()
    } catch {
      // silent
    } finally {
      setLoading(null)
    }
  }

  async function setJlpt(level: string) {
    setLoading('jlpt')
    setShowJlpt(false)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jlptLevel: level }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
      router.refresh()
    } catch {
      // silent
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Reset hearts */}
      <button
        onClick={resetHearts}
        disabled={loading === 'hearts'}
        title="Reset hearts to 5"
        className="rounded px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 disabled:opacity-60"
      >
        {loading === 'hearts' ? '...' : 'Hearts'}
      </button>

      {/* Set JLPT */}
      <div className="relative">
        <button
          onClick={() => setShowJlpt((v) => !v)}
          disabled={loading === 'jlpt'}
          title="Set JLPT level"
          className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
        >
          {loading === 'jlpt' ? '...' : 'JLPT'}
        </button>

        {showJlpt && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowJlpt(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-1 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
              {JLPT_LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setJlpt(l)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-zinc-50 ${currentJlpt === l ? 'font-semibold text-indigo-600' : 'text-zinc-700'}`}
                >
                  {currentJlpt === l && <span>✓</span>}
                  {currentJlpt !== l && <span className="w-3" />}
                  {l}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
