'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { KanaSet } from '@prisma/client'

interface KanaChar {
  id: number
  kana: string
  romaji: string
}

interface Props {
  set: KanaSet
}

export function KanaEditForm({ set }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const initChars = (Array.isArray(set.characters) ? set.characters : []) as Array<{ kana: string; romaji: string }>
  const [chars, setChars] = useState<KanaChar[]>(
    initChars.length > 0
      ? initChars.map((c, i) => ({ id: i, kana: c.kana, romaji: c.romaji }))
      : [{ id: 0, kana: '', romaji: '' }]
  )
  const [nextId, setNextId] = useState(initChars.length)

  function addChar() {
    setChars((prev) => [...prev, { id: nextId, kana: '', romaji: '' }])
    setNextId((n) => n + 1)
  }

  function updateChar(id: number, field: 'kana' | 'romaji', value: string) {
    setChars((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  function removeChar(id: number) {
    setChars((prev) => prev.filter((c) => c.id !== id))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const validChars = chars.filter((c) => c.kana && c.romaji)
    if (validChars.length === 0) {
      setError('Phải có ít nhất 1 ký tự')
      return
    }

    const fd = new FormData(e.currentTarget)
    const body = {
      row: fd.get('row') as string,
      order: parseInt(fd.get('order') as string, 10) || 0,
      characters: validChars.map(({ kana, romaji }) => ({ kana, romaji })),
    }

    setLoading(true)
    try {
      const res = await fetch(`/ja/api/admin/kana/${set.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
      router.push('/admin/kana')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
        <div className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
          Type: <span className="font-medium text-zinc-700">{set.type}</span> (không thể thay đổi)
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Row (行)</label>
            <input
              name="row"
              required
              defaultValue={set.row}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Order</label>
            <input
              name="order"
              type="number"
              min="0"
              defaultValue={set.order}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-700">Characters ({chars.length})</h3>
          <button type="button" onClick={addChar} className="text-xs text-indigo-600 hover:underline">
            + Thêm
          </button>
        </div>
        {chars.map((c) => (
          <div key={c.id} className="flex items-center gap-2">
            <input
              value={c.kana}
              onChange={(e) => updateChar(c.id, 'kana', e.target.value)}
              placeholder="あ"
              className="w-20 rounded-md border border-zinc-300 px-2 py-1.5 text-center text-sm outline-none focus:border-indigo-500"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            />
            <input
              value={c.romaji}
              onChange={(e) => updateChar(c.id, 'romaji', e.target.value)}
              placeholder="a"
              className="flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
            />
            {chars.length > 1 && (
              <button type="button" onClick={() => removeChar(c.id)} className="text-xs text-red-500 hover:text-red-700">
                Xóa
              </button>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
        >
          Hủy
        </button>
      </div>
    </form>
  )
}
