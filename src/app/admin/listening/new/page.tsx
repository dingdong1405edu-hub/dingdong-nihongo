'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionEditor, type QuestionDraft } from '@/components/admin/question-editor'

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

export default function NewListeningTestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState<QuestionDraft[]>([])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (questions.length === 0) {
      setError('Phải có ít nhất 1 câu hỏi')
      return
    }

    const fd = new FormData(e.currentTarget)
    const body = {
      title: fd.get('title') as string,
      jlptLevel: fd.get('jlptLevel') as string,
      audioUrl: fd.get('audioUrl') as string,
      transcript: (fd.get('transcript') as string) || undefined,
      timeLimit: parseInt(fd.get('timeLimit') as string, 10) * 60,
      questions,
    }

    setLoading(true)
    try {
      const res = await fetch('/ja/api/admin/listening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
      router.push('/admin/listening')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Thêm Listening Test</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Metadata */}
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
                placeholder="VD: Hội thoại tại ga tàu"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                JLPT Level <span className="text-red-500">*</span>
              </label>
              <select
                name="jlptLevel"
                required
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {JLPT_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Audio URL <span className="text-red-500">*</span>
            </label>
            <input
              name="audioUrl"
              type="url"
              required
              placeholder="https://... hoặc /audio/filename.mp3"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-zinc-400">
              URL đến file audio MP3/M4A. Dùng /audio/ cho file local trong public/.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Time Limit (phút) <span className="text-red-500">*</span>
            </label>
            <input
              name="timeLimit"
              type="number"
              required
              min="1"
              defaultValue="10"
              className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Transcript */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-700">Transcript (tùy chọn)</h3>
          <p className="text-xs text-zinc-400">
            Transcript sẽ ẩn với người học cho đến khi họ nộp bài.
          </p>
          <textarea
            name="transcript"
            rows={6}
            placeholder="駅員：いらっしゃいませ。どちらまで？..."
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
          />
        </div>

        {/* Questions */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-700">
            Câu hỏi ({questions.length})
          </h3>
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
            {loading ? 'Đang lưu...' : 'Tạo Listening Test'}
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
