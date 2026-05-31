'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  MessageSquare,
  Lightbulb,
} from 'lucide-react'
import type { WritingGradeResult } from '@/types'

interface WritingFeedbackProps {
  result: WritingGradeResult
  onRetry: () => void
}

function ScoreCircle({ score }: { score: number }) {
  const radius = 54
  const circ = 2 * Math.PI * radius
  const pct = Math.min(100, Math.max(0, score))
  const offset = circ - (pct / 100) * circ
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg width="144" height="144" className="-rotate-90" aria-hidden>
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#f4f4f5" strokeWidth="10" />
        <motion.circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-extrabold tabular-nums"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          {Math.round(pct)}
        </motion.span>
        <span className="text-xs text-zinc-400 font-medium">/ 100</span>
      </div>
    </div>
  )
}

function CriterionCard({
  label,
  labelJa,
  score,
  feedback,
  items,
  itemType,
}: {
  label: string
  labelJa: string
  score: number
  feedback: string
  items?: string[]
  itemType: 'error' | 'suggestion'
}) {
  const isGood = score >= 80
  const isMid = score >= 60 && score < 80
  const textColor = isGood ? 'text-green-600' : isMid ? 'text-yellow-600' : 'text-red-600'
  const barClass = isGood
    ? 'h-2 bg-zinc-100 [&>div]:bg-green-500'
    : isMid
    ? 'h-2 bg-zinc-100 [&>div]:bg-yellow-400'
    : 'h-2 bg-zinc-100 [&>div]:bg-red-400'

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-zinc-800">{label}</p>
          <p className="text-xs text-zinc-400 font-japanese">{labelJa}</p>
        </div>
        <span className={`text-xl font-extrabold tabular-nums ${textColor}`}>
          {Math.round(score)}
        </span>
      </div>
      <div className="space-y-1">
        <Progress value={score} className={barClass} />
      </div>
      <p className="text-sm text-zinc-600 leading-relaxed">{feedback}</p>
      {items && items.length > 0 && (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li
              key={i}
              className={`flex items-start gap-1.5 text-xs rounded-md px-2 py-1.5 ${
                itemType === 'error'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              {itemType === 'error' ? (
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              ) : (
                <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              )}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function WritingFeedback({ result, onRetry }: WritingFeedbackProps) {
  const [showCorrected, setShowCorrected] = useState(false)

  const overallColor =
    result.score >= 80
      ? 'text-green-600'
      : result.score >= 60
      ? 'text-yellow-600'
      : 'text-red-600'

  const overallLabel =
    result.score >= 80
      ? 'Xuất sắc!'
      : result.score >= 70
      ? 'Khá tốt!'
      : result.score >= 60
      ? 'Trung bình'
      : 'Cần cải thiện'

  return (
    <div className="space-y-6">
      {/* Score overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6"
      >
        <ScoreCircle score={result.score} />
        <div className="text-center sm:text-left space-y-1">
          <p className={`text-2xl font-bold ${overallColor}`}>{overallLabel}</p>
          <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
            Điểm tổng hợp dựa trên ngữ pháp, từ vựng, mạch lạc
            {result.criteria.keigo ? ' và kính ngữ' : ''}.
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-xs text-zinc-500">Chấm bởi Claude AI (JLPT Examiner)</span>
          </div>
        </div>
      </motion.div>

      {/* Criteria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CriterionCard
          label="Ngữ pháp"
          labelJa="文法"
          score={result.criteria.grammar.score}
          feedback={result.criteria.grammar.feedback}
          items={result.criteria.grammar.errors}
          itemType="error"
        />
        <CriterionCard
          label="Từ vựng"
          labelJa="語彙"
          score={result.criteria.vocabulary.score}
          feedback={result.criteria.vocabulary.feedback}
          items={result.criteria.vocabulary.suggestions}
          itemType="suggestion"
        />
        {result.criteria.keigo && (
          <CriterionCard
            label="Kính ngữ"
            labelJa="敬語"
            score={result.criteria.keigo.score}
            feedback={result.criteria.keigo.feedback}
            items={result.criteria.keigo.errors}
            itemType="error"
          />
        )}
        <CriterionCard
          label="Mạch lạc"
          labelJa="文章の流れ"
          score={result.criteria.coherence.score}
          feedback={result.criteria.coherence.feedback}
          itemType="suggestion"
        />
      </div>

      {/* Annotations */}
      {result.annotations.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-600" />
            <h3 className="font-semibold text-zinc-800">Chú thích lỗi</h3>
          </div>
          <div className="space-y-3">
            {result.annotations.map((ann, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-lg border border-red-100 bg-red-50 p-3 space-y-2"
              >
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="text-xs bg-red-200 text-red-800 rounded px-1.5 py-0.5 font-japanese shrink-0">
                    {ann.original}
                  </span>
                  <span className="text-xs text-red-600 font-medium">→</span>
                  <span className="text-xs bg-green-100 text-green-800 rounded px-1.5 py-0.5 font-japanese shrink-0">
                    {ann.correction}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  <span className="font-medium text-zinc-700">{ann.issue}:</span> {ann.explanation}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Corrected version */}
      {result.correctedVersion && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCorrected((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span className="font-semibold text-zinc-800">Bản sửa lỗi hoàn chỉnh</span>
            </div>
            {showCorrected ? (
              <ChevronUp className="h-4 w-4 text-zinc-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            )}
          </button>
          <AnimatePresence>
            {showCorrected && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 border-t border-zinc-100">
                  <p className="text-sm font-japanese text-zinc-700 leading-loose whitespace-pre-wrap pt-4">
                    {result.correctedVersion}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Retry */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={onRetry}
          variant="outline"
          className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          <RotateCcw className="h-4 w-4" />
          Làm lại bài viết
        </Button>
      </div>
    </div>
  )
}
