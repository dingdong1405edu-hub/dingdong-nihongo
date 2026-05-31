'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'

type ExerciseType =
  | 'match'
  | 'translate'
  | 'listen'
  | 'kanjiRead'
  | 'kanaInput'
  | 'sentenceOrder'
  | 'keigo'

const EXERCISE_TYPES: { value: ExerciseType; label: string }[] = [
  { value: 'match', label: 'Match — nối từ ↔ nghĩa' },
  { value: 'translate', label: 'Translate — dịch câu' },
  { value: 'listen', label: 'Listen — nghe → chọn' },
  { value: 'kanjiRead', label: 'Kanji Read — chọn cách đọc' },
  { value: 'kanaInput', label: 'Kana Input — gõ Hiragana/Katakana' },
  { value: 'sentenceOrder', label: 'Sentence Order — sắp xếp từ' },
  { value: 'keigo', label: 'Keigo — chuyển kính ngữ' },
]

const EXERCISE_SCHEMA: Record<ExerciseType, string> = {
  match: JSON.stringify(
    { type: 'match', pairs: [{ ja: '食べる', vi: 'ăn' }] },
    null,
    2
  ),
  translate: JSON.stringify(
    { type: 'translate', sentence: '私は学生です。', answer: 'Tôi là học sinh.' },
    null,
    2
  ),
  listen: JSON.stringify(
    { type: 'listen', audioUrl: '/audio/xxx.mp3', options: ['ねこ', 'いぬ', 'とり'], answer: 'ねこ' },
    null,
    2
  ),
  kanjiRead: JSON.stringify(
    { type: 'kanjiRead', kanji: '食べる', options: ['たべる', 'しょくべる', 'くべる'], answer: 'たべる' },
    null,
    2
  ),
  kanaInput: JSON.stringify(
    { type: 'kanaInput', word: 'ねこ', meaning: 'con mèo' },
    null,
    2
  ),
  sentenceOrder: JSON.stringify(
    { type: 'sentenceOrder', words: ['私', 'は', '学生', 'です'], answer: '私は学生です' },
    null,
    2
  ),
  keigo: JSON.stringify(
    { type: 'keigo', plain: '食べる', polite: '食べます', level: 'teineigo' },
    null,
    2
  ),
}

interface ExerciseEntry {
  id: number
  type: ExerciseType
  json: string
  error: string
}

type Props = { params: Promise<{ unitId: string }> }

export default function NewVocabLessonPage({ params }: Props) {
  const { unitId } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exercises, setExercises] = useState<ExerciseEntry[]>([])
  const [nextId, setNextId] = useState(0)
  const [addType, setAddType] = useState<ExerciseType>('match')

  function addExercise() {
    setExercises((prev) => [
      ...prev,
      { id: nextId, type: addType, json: EXERCISE_SCHEMA[addType], error: '' },
    ])
    setNextId((n) => n + 1)
  }

  function removeExercise(id: number) {
    setExercises((prev) => prev.filter((e) => e.id !== id))
  }

  function updateExercise(id: number, json: string) {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        let err = ''
        try {
          JSON.parse(json)
        } catch {
          err = 'Invalid JSON'
        }
        return { ...e, json, error: err }
      })
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    // Validate all exercise JSON
    const hasErrors = exercises.some((ex) => ex.error)
    if (hasErrors) {
      setError('Fix JSON errors in exercises before saving')
      return
    }

    const parsed = exercises.map((ex) => JSON.parse(ex.json))

    const fd = new FormData(e.currentTarget)
    const body = {
      unitId,
      order: parseInt(fd.get('order') as string, 10) || 0,
      exercises: parsed,
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/vocab/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
      router.push(`/admin/vocab/${unitId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lesson')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Thêm Lesson mới</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Unit ID: {unitId}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-700">Thông tin</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                required
                placeholder="VD: Chào hỏi 1"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Order</label>
              <input
                name="order"
                type="number"
                min="0"
                defaultValue="1"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-700">
            Exercises ({exercises.length})
          </h3>

          {exercises.map((ex, idx) => (
            <div key={ex.id} className="rounded-lg border border-zinc-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 uppercase">
                  #{idx + 1} — {ex.type}
                </span>
                <button
                  type="button"
                  onClick={() => removeExercise(ex.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Xóa
                </button>
              </div>
              <textarea
                value={ex.json}
                onChange={(e) => updateExercise(ex.id, e.target.value)}
                rows={6}
                className={`w-full rounded-md border px-3 py-2 font-mono text-xs outline-none focus:ring-1 ${
                  ex.error
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {ex.error && <p className="text-xs text-red-500">{ex.error}</p>}
            </div>
          ))}

          {/* Add exercise */}
          <div className="flex items-center gap-2 pt-1">
            <select
              value={addType}
              onChange={(e) => setAddType(e.target.value as ExerciseType)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {EXERCISE_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addExercise}
              className="rounded-md border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
            >
              + Thêm exercise
            </button>
          </div>

          {/* Schema hint */}
          <details className="text-xs text-zinc-400">
            <summary className="cursor-pointer hover:text-zinc-600">Schema example cho type đang chọn</summary>
            <pre className="mt-1 overflow-x-auto rounded bg-zinc-50 p-2 text-zinc-600">
              {EXERCISE_SCHEMA[addType]}
            </pre>
          </details>
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
            {loading ? 'Đang lưu...' : 'Tạo Lesson'}
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
    </div>
  )
}
