'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const
const TASK_TYPES = ['INTERVIEW', 'PICTURE_DESC', 'OPINION', 'ROLEPLAY'] as const

interface PromptEntry {
  id: number
  question: string
}

export default function NewSpeakingSetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [prompts, setPrompts] = useState<PromptEntry[]>([{ id: 0, question: '' }])
  const [nextId, setNextId] = useState(1)

  function addPrompt() {
    setPrompts((prev) => [...prev, { id: nextId, question: '' }])
    setNextId((n) => n + 1)
  }

  function updatePrompt(id: number, value: string) {
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, question: value } : p)))
  }

  function removePrompt(id: number) {
    setPrompts((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const validPrompts = prompts.filter((p) => p.question.trim())
    if (validPrompts.length === 0) {
      setError('Phải có ít nhất 1 prompt')
      return
    }

    const fd = new FormData(e.currentTarget)
    const body = {
      jlptLevel: fd.get('jlptLevel') as string,
      taskType: fd.get('taskType') as string,
      topic: fd.get('topic') as string,
      topicJa: fd.get('topicJa') as string,
      prompts: validPrompts.map((p) => ({ question: p.question })),
      prepTimeSec: parseInt(fd.get('prepTimeSec') as string, 10),
      speakTimeSec: parseInt(fd.get('speakTimeSec') as string, 10),
    }

    setLoading(true)
    try {
      const res = await fetch('/ja/api/admin/speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
      router.push('/admin/speaking')
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
        <h2 className="text-xl font-semibold text-zinc-900">Thêm Speaking Set</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Metadata */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-700">Thông tin</h3>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Topic (EN/VN) <span className="text-red-500">*</span>
              </label>
              <input
                name="topic"
                required
                placeholder="VD: Sở thích cá nhân"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Topic (日本語) <span className="text-red-500">*</span>
              </label>
              <input
                name="topicJa"
                required
                placeholder="趣味について"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Prep Time (giây)
              </label>
              <input
                name="prepTimeSec"
                type="number"
                min="0"
                defaultValue="30"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Speaking Time (giây)
              </label>
              <input
                name="speakTimeSec"
                type="number"
                min="10"
                defaultValue="90"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Prompts */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-700">
              Prompts / Câu hỏi ({prompts.length})
            </h3>
            <button
              type="button"
              onClick={addPrompt}
              className="text-xs text-indigo-600 hover:underline"
            >
              + Thêm
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            Nhập các câu hỏi / tình huống người học sẽ thực hành nói.
          </p>
          {prompts.map((p, idx) => (
            <div key={p.id} className="flex items-start gap-2">
              <span className="mt-2.5 text-xs font-medium text-zinc-400 w-5 text-right">
                {idx + 1}.
              </span>
              <textarea
                value={p.question}
                onChange={(e) => updatePrompt(p.id, e.target.value)}
                rows={2}
                placeholder={`VD: 趣味は何ですか？`}
                className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
              />
              {prompts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePrompt(p.id)}
                  className="mt-2 text-xs text-red-500 hover:text-red-700"
                >
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
            {loading ? 'Đang lưu...' : 'Tạo Speaking Set'}
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
