'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionEditor, type QuestionDraft } from '@/components/admin/question-editor'
import type { ReadingTest, Question } from '@prisma/client'

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

type ReadingWithQuestions = ReadingTest & { questions: Question[] }

interface Props {
  test: ReadingWithQuestions
}

export function ReadingEditForm({ test }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState<QuestionDraft[]>(() =>
    test.questions.map((q) => ({
      type: q.type,
      prompt: q.prompt,
      promptFurigana: q.promptFurigana ?? undefined,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation ?? undefined,
    }))
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const body = {
      title: fd.get('title') as string,
      titleJa: fd.get('titleJa') as string,
      jlptLevel: fd.get('jlptLevel') as string,
      passage: fd.get('passage') as string,
      timeLimit: parseInt(fd.get('timeLimit') as string, 10) * 60,
      questions,
    }

    try {
      const res = await fetch(`/ja/api/admin/reading/${test.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
      router.push('/admin/reading')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Metadata */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-700">Thông tin</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Title</label>
            <input
              name="title"
              required
              defaultValue={test.title}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Title (日本語)</label>
            <input
              name="titleJa"
              required
              defaultValue={test.titleJa}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">JLPT Level</label>
            <select
              name="jlptLevel"
              defaultValue={test.jlptLevel}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {JLPT_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Time Limit (phút)
            </label>
            <input
              name="timeLimit"
              type="number"
              required
              min="1"
              defaultValue={Math.round(test.timeLimit / 60)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Passage */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-700">Passage</h3>
        <textarea
          name="passage"
          required
          rows={10}
          defaultValue={test.passage}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
        />
      </div>

      {/* Questions */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-700">Câu hỏi ({questions.length})</h3>
        <QuestionEditor questions={questions} onChange={setQuestions} />
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
