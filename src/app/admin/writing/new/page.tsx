'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const
const TASK_TYPES = ['ESSAY', 'OPINION', 'LETTER', 'DESCRIPTION'] as const

export default function NewWritingTaskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [requireKeigo, setRequireKeigo] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const body = {
      taskType: fd.get('taskType') as string,
      prompt: fd.get('prompt') as string,
      promptJa: (fd.get('promptJa') as string) || undefined,
      imageUrl: (fd.get('imageUrl') as string) || undefined,
      minChars: parseInt(fd.get('minChars') as string, 10),
      timeLimit: parseInt(fd.get('timeLimit') as string, 10) * 60,
      jlptLevel: fd.get('jlptLevel') as string,
      requireKeigo,
    }

    try {
      const res = await fetch('/ja/api/admin/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
      router.push('/admin/writing')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Thêm Writing Task</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-700">Thông tin</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Task Type <span className="text-red-500">*</span>
              </label>
              <select
                name="taskType"
                required
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
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
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Min Characters <span className="text-red-500">*</span>
              </label>
              <input
                name="minChars"
                type="number"
                required
                min="1"
                defaultValue="200"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Time Limit (phút) <span className="text-red-500">*</span>
              </label>
              <input
                name="timeLimit"
                type="number"
                required
                min="1"
                defaultValue="20"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Image URL (tùy chọn)
              </label>
              <input
                name="imageUrl"
                type="url"
                placeholder="https://..."
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Prompt (tiếng Việt) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="prompt"
              required
              rows={3}
              placeholder="VD: Viết về kế hoạch du lịch của bạn trong kỳ nghỉ hè..."
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Prompt (tiếng Nhật, tùy chọn)
            </label>
            <textarea
              name="promptJa"
              rows={3}
              placeholder="夏休みの旅行計画について書いてください..."
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            />
          </div>

          {/* Keigo toggle */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-zinc-700">Yêu cầu kính ngữ (敬語)</p>
              <p className="text-xs text-zinc-400">
                Bật nếu task yêu cầu người học dùng kính ngữ
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={requireKeigo}
              onClick={() => setRequireKeigo((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${requireKeigo ? 'bg-indigo-600' : 'bg-zinc-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${requireKeigo ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
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
            {loading ? 'Đang lưu...' : 'Tạo Writing Task'}
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
