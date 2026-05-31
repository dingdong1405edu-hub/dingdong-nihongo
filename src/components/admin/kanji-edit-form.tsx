'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { KanjiCharacter } from '@prisma/client'

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

interface Radical {
  radical: string
  meaning: string
}

interface Example {
  word: string
  reading: string
  meaning: string
}

interface Props {
  kanji: KanjiCharacter
}

export function KanjiEditForm({ kanji }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const initRadicals = (Array.isArray(kanji.radicals) ? kanji.radicals : []) as Radical[]
  const initExamples = (Array.isArray(kanji.examples) ? kanji.examples : []) as Example[]

  const [radicals, setRadicals] = useState<Radical[]>(
    initRadicals.length > 0 ? initRadicals : [{ radical: '', meaning: '' }]
  )
  const [examples, setExamples] = useState<Example[]>(
    initExamples.length > 0 ? initExamples : [{ word: '', reading: '', meaning: '' }]
  )

  function addRadical() {
    setRadicals((prev) => [...prev, { radical: '', meaning: '' }])
  }
  function updateRadical(i: number, field: keyof Radical, value: string) {
    setRadicals((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }
  function removeRadical(i: number) {
    setRadicals((prev) => prev.filter((_, idx) => idx !== i))
  }

  function addExample() {
    setExamples((prev) => [...prev, { word: '', reading: '', meaning: '' }])
  }
  function updateExample(i: number, field: keyof Example, value: string) {
    setExamples((prev) => prev.map((ex, idx) => (idx === i ? { ...ex, [field]: value } : ex)))
  }
  function removeExample(i: number) {
    setExamples((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const onyomiRaw = (fd.get('onyomi') as string).trim()
    const kunyomiRaw = (fd.get('kunyomi') as string).trim()

    const body = {
      onyomi: onyomiRaw ? onyomiRaw.split(/[,、]+/).map((s) => s.trim()).filter(Boolean) : [],
      kunyomi: kunyomiRaw ? kunyomiRaw.split(/[,、]+/).map((s) => s.trim()).filter(Boolean) : [],
      meaning: fd.get('meaning') as string,
      jlptLevel: fd.get('jlptLevel') as string,
      grade: fd.get('grade') ? parseInt(fd.get('grade') as string, 10) : undefined,
      strokeCount: parseInt(fd.get('strokeCount') as string, 10),
      radicals: radicals.filter((r) => r.radical),
      examples: examples.filter((ex) => ex.word),
      mnemonic: (fd.get('mnemonic') as string) || undefined,
    }

    try {
      const res = await fetch(`/api/admin/kanji/${kanji.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
      router.push('/admin/kanji')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update kanji')
    } finally {
      setLoading(false)
    }
  }

  const onyomiStr = (Array.isArray(kanji.onyomi) ? kanji.onyomi as string[] : []).join('、')
  const kunyomiStr = (Array.isArray(kanji.kunyomi) ? kanji.kunyomi as string[] : []).join('、')

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-700">Thông tin cơ bản</h3>

        <div className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
          Character:{' '}
          <span
            className="text-2xl font-bold text-zinc-900"
            style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
          >
            {kanji.character}
          </span>{' '}
          (không thể thay đổi)
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">JLPT</label>
            <select
              name="jlptLevel"
              defaultValue={kanji.jlptLevel}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {JLPT_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Grade</label>
            <input
              name="grade"
              type="number"
              min="1"
              max="12"
              defaultValue={kanji.grade ?? ''}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Strokes</label>
            <input
              name="strokeCount"
              type="number"
              required
              min="1"
              defaultValue={kanji.strokeCount}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Meaning (VN)</label>
          <input
            name="meaning"
            required
            defaultValue={kanji.meaning}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Onyomi</label>
            <input
              name="onyomi"
              defaultValue={onyomiStr}
              placeholder="ショク、ジキ"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Kunyomi</label>
            <input
              name="kunyomi"
              defaultValue={kunyomiStr}
              placeholder="た.べる"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Mnemonic</label>
          <textarea
            name="mnemonic"
            rows={2}
            defaultValue={kanji.mnemonic ?? ''}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Radicals */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-700">Radicals</h3>
          <button type="button" onClick={addRadical} className="text-xs text-indigo-600 hover:underline">
            + Thêm
          </button>
        </div>
        {radicals.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={r.radical}
              onChange={(e) => updateRadical(i, 'radical', e.target.value)}
              placeholder="食"
              className="w-16 rounded-md border border-zinc-300 px-2 py-1.5 text-center text-sm outline-none focus:border-indigo-500"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            />
            <input
              value={r.meaning}
              onChange={(e) => updateRadical(i, 'meaning', e.target.value)}
              placeholder="ăn"
              className="flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
            />
            {radicals.length > 1 && (
              <button type="button" onClick={() => removeRadical(i)} className="text-xs text-red-500 hover:text-red-700">
                Xóa
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Examples */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-700">Examples</h3>
          <button type="button" onClick={addExample} className="text-xs text-indigo-600 hover:underline">
            + Thêm
          </button>
        </div>
        {examples.map((ex, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <input
              value={ex.word}
              onChange={(e) => updateExample(i, 'word', e.target.value)}
              placeholder="食事"
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            />
            <input
              value={ex.reading}
              onChange={(e) => updateExample(i, 'reading', e.target.value)}
              placeholder="しょくじ"
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            />
            <div className="flex items-center gap-2">
              <input
                value={ex.meaning}
                onChange={(e) => updateExample(i, 'meaning', e.target.value)}
                placeholder="bữa ăn"
                className="flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
              />
              {examples.length > 1 && (
                <button type="button" onClick={() => removeExample(i)} className="text-xs text-red-500 hover:text-red-700">
                  Xóa
                </button>
              )}
            </div>
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
