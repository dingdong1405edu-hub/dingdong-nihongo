'use client'

import { useState } from 'react'

export type QuestionType = 'MCQ' | 'FILL_BLANK' | 'TRUE_FALSE' | 'MATCHING' | 'SHORT_ANSWER'

export interface QuestionDraft {
  type: QuestionType
  prompt: string
  promptFurigana?: string
  options?: unknown
  correctAnswer: unknown
  explanation?: string
}

interface InternalDraft extends QuestionDraft {
  _id: number
  _optionsRaw: string
  _answerRaw: string
  _optionsError: string
  _answerError: string
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'MCQ', label: 'MCQ — Trắc nghiệm' },
  { value: 'FILL_BLANK', label: 'Fill Blank — Điền vào chỗ trống' },
  { value: 'TRUE_FALSE', label: 'True/False — Đúng / Sai' },
  { value: 'MATCHING', label: 'Matching — Nối cặp' },
  { value: 'SHORT_ANSWER', label: 'Short Answer — Trả lời ngắn' },
]

const DEFAULT_OPTIONS: Record<QuestionType, unknown> = {
  MCQ: ['選択肢A', '選択肢B', '選択肢C', '選択肢D'],
  FILL_BLANK: null,
  TRUE_FALSE: ['正しい', '間違い'],
  MATCHING: [{ left: 'A', right: 'B' }],
  SHORT_ANSWER: null,
}

const DEFAULT_ANSWER: Record<QuestionType, unknown> = {
  MCQ: '選択肢A',
  FILL_BLANK: '答え',
  TRUE_FALSE: '正しい',
  MATCHING: [{ left: 'A', right: 'B' }],
  SHORT_ANSWER: '答え',
}

interface Props {
  questions: QuestionDraft[]
  onChange: (q: QuestionDraft[]) => void
}

let globalId = 0

function toDraft(q: QuestionDraft): InternalDraft {
  return {
    ...q,
    _id: globalId++,
    _optionsRaw: q.options != null ? JSON.stringify(q.options, null, 2) : 'null',
    _answerRaw: JSON.stringify(q.correctAnswer, null, 2),
    _optionsError: '',
    _answerError: '',
  }
}

function fromDraft(d: InternalDraft): QuestionDraft | null {
  let options: unknown = null
  let answer: unknown = null

  try {
    options = JSON.parse(d._optionsRaw)
  } catch {
    return null
  }
  try {
    answer = JSON.parse(d._answerRaw)
  } catch {
    return null
  }

  return {
    type: d.type,
    prompt: d.prompt,
    promptFurigana: d.promptFurigana,
    options,
    correctAnswer: answer,
    explanation: d.explanation,
  }
}

export function QuestionEditor({ questions, onChange }: Props) {
  const [drafts, setDrafts] = useState<InternalDraft[]>(() => questions.map(toDraft))
  const [addType, setAddType] = useState<QuestionType>('MCQ')

  function sync(updated: InternalDraft[]) {
    setDrafts(updated)
    const valid = updated
      .map(fromDraft)
      .filter((q): q is QuestionDraft => q !== null)
    onChange(valid)
  }

  function addQuestion() {
    const draft: InternalDraft = {
      _id: globalId++,
      type: addType,
      prompt: '',
      _optionsRaw: JSON.stringify(DEFAULT_OPTIONS[addType], null, 2),
      _answerRaw: JSON.stringify(DEFAULT_ANSWER[addType], null, 2),
      _optionsError: '',
      _answerError: '',
      correctAnswer: DEFAULT_ANSWER[addType],
      options: DEFAULT_OPTIONS[addType],
    }
    sync([...drafts, draft])
  }

  function removeQuestion(id: number) {
    sync(drafts.filter((d) => d._id !== id))
  }

  function updateField<K extends keyof InternalDraft>(id: number, field: K, value: InternalDraft[K]) {
    sync(drafts.map((d) => (d._id === id ? { ...d, [field]: value } : d)))
  }

  function updateOptionsRaw(id: number, raw: string) {
    let err = ''
    try {
      JSON.parse(raw)
    } catch {
      err = 'Invalid JSON'
    }
    sync(drafts.map((d) => (d._id === id ? { ...d, _optionsRaw: raw, _optionsError: err } : d)))
  }

  function updateAnswerRaw(id: number, raw: string) {
    let err = ''
    try {
      JSON.parse(raw)
    } catch {
      err = 'Invalid JSON'
    }
    sync(drafts.map((d) => (d._id === id ? { ...d, _answerRaw: raw, _answerError: err } : d)))
  }

  return (
    <div className="space-y-4">
      {drafts.map((d, idx) => (
        <div key={d._id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Q{idx + 1} — {d.type}
            </span>
            <button
              type="button"
              onClick={() => removeQuestion(d._id)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Xóa
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Câu hỏi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={d.prompt}
              onChange={(e) => updateField(d._id, 'prompt', e.target.value)}
              rows={2}
              placeholder="Nhập câu hỏi..."
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Câu hỏi Furigana (tùy chọn)
            </label>
            <input
              value={d.promptFurigana ?? ''}
              onChange={(e) => updateField(d._id, 'promptFurigana', e.target.value)}
              placeholder="HTML với ruby tags..."
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {d.type !== 'FILL_BLANK' && d.type !== 'SHORT_ANSWER' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Options (JSON)
              </label>
              <textarea
                value={d._optionsRaw}
                onChange={(e) => updateOptionsRaw(d._id, e.target.value)}
                rows={3}
                className={`w-full rounded-md border bg-white px-3 py-2 font-mono text-xs outline-none focus:ring-1 ${
                  d._optionsError
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {d._optionsError && <p className="mt-1 text-xs text-red-500">{d._optionsError}</p>}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Correct Answer (JSON) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={d._answerRaw}
              onChange={(e) => updateAnswerRaw(d._id, e.target.value)}
              rows={2}
              className={`w-full rounded-md border bg-white px-3 py-2 font-mono text-xs outline-none focus:ring-1 ${
                d._answerError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {d._answerError && <p className="mt-1 text-xs text-red-500">{d._answerError}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Giải thích (tùy chọn)
            </label>
            <input
              value={d.explanation ?? ''}
              onChange={(e) => updateField(d._id, 'explanation', e.target.value)}
              placeholder="Giải thích đáp án..."
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2 pt-1">
        <select
          value={addType}
          onChange={(e) => setAddType(e.target.value as QuestionType)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          {QUESTION_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addQuestion}
          className="rounded-md border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
        >
          + Thêm câu hỏi
        </button>
      </div>
    </div>
  )
}
