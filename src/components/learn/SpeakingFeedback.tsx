'use client'

import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  RotateCcw,
  ChevronRight,
  AlertCircle,
  Info,
  Zap,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react'
import type { SpeakingGradeResult } from '@/types'

interface SpeakingFeedbackProps {
  result: SpeakingGradeResult
  onRetry: () => void
  onNext?: () => void
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

function ScoreBar({
  label,
  labelJa,
  score,
}: {
  label: string
  labelJa: string
  score: number
}) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-medium text-zinc-700">{label}</span>
          <span className="text-xs text-zinc-400 font-japanese">{labelJa}</span>
        </div>
        <span className={`text-sm font-bold tabular-nums ${color}`}>{Math.round(score)}</span>
      </div>
      <Progress
        value={score}
        className="h-2 bg-zinc-100"
      />
    </div>
  )
}

export function SpeakingFeedback({ result, onRetry, onNext }: SpeakingFeedbackProps) {
  const overallLabel =
    result.score >= 80
      ? 'Xuất sắc!'
      : result.score >= 70
      ? 'Khá tốt!'
      : result.score >= 60
      ? 'Trung bình'
      : 'Cần cải thiện'

  const overallColor =
    result.score >= 80
      ? 'text-green-600'
      : result.score >= 60
      ? 'text-yellow-600'
      : 'text-red-600'

  return (
    <div className="space-y-5">
      {/* Overall score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6"
      >
        <ScoreCircle score={result.score} />
        <div className="text-center sm:text-left space-y-1">
          <p className={`text-2xl font-bold ${overallColor}`}>{overallLabel}</p>
          <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
            {result.overallFeedback}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-xs text-zinc-500">Chấm bởi Claude AI (Speaking Coach)</span>
          </div>
        </div>
      </motion.div>

      {/* Score breakdown */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5 space-y-4">
        <h3 className="font-semibold text-zinc-800 text-sm uppercase tracking-wide">
          Điểm chi tiết
        </h3>
        <ScoreBar label="Phát âm" labelJa="発音" score={result.criteria.pronunciation.score} />
        <ScoreBar label="Ngữ pháp nói" labelJa="話し言葉" score={result.criteria.grammar.score} />
        <ScoreBar label="Lưu loát" labelJa="流暢さ" score={result.criteria.fluency.score} />

        {/* Pitch accent disclaimer */}
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-800">Ngữ điệu (アクセント)</p>
            <p className="text-xs text-blue-600 mt-0.5">{result.criteria.pitchAccent.note}</p>
          </div>
        </div>
      </div>

      {/* Fluency stats */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-indigo-600" />
          <h3 className="font-semibold text-zinc-800">Thống kê lưu loát</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-indigo-50 p-3 text-center">
            <p className="text-2xl font-bold text-indigo-700 tabular-nums">
              {result.criteria.fluency.wordsPerMinute}
            </p>
            <p className="text-xs text-indigo-500 mt-0.5">từ / phút</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 text-center">
            <p className="text-2xl font-bold text-zinc-700 tabular-nums">
              {result.criteria.fluency.fillerCount}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">filler words</p>
            <p className="text-xs text-zinc-400">(あの、えーと...)</p>
          </div>
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed">
          {result.criteria.fluency.feedback}
        </p>
      </div>

      {/* Pronunciation errors */}
      {result.criteria.pronunciation.errors.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h3 className="font-semibold text-zinc-800">Lỗi phát âm cần chú ý</h3>
          </div>
          <div className="space-y-2">
            {result.criteria.pronunciation.errors.map((err, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5"
              >
                <Badge
                  variant="outline"
                  className="text-xs font-japanese border-red-200 text-red-700 bg-white shrink-0"
                >
                  {err.word}
                </Badge>
                <p className="text-xs text-red-700 leading-relaxed">{err.issue}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar errors */}
      {result.criteria.grammar.errors.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <h3 className="font-semibold text-zinc-800">Lỗi ngữ pháp</h3>
          </div>
          <ul className="space-y-1.5">
            {result.criteria.grammar.errors.map((err, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-xs text-yellow-800 bg-yellow-50 rounded-md px-2 py-1.5"
              >
                <span className="mt-0.5 shrink-0">•</span>
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transcript */}
      {result.transcript && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5 space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-zinc-500" />
            <h3 className="font-semibold text-zinc-800 text-sm">Bản ghi chép (Transcript)</h3>
          </div>
          <p className="text-sm font-japanese text-zinc-600 leading-loose whitespace-pre-wrap bg-zinc-50 rounded-lg p-3">
            {result.transcript}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <Button
          onClick={onRetry}
          variant="outline"
          className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          <RotateCcw className="h-4 w-4" />
          Thử lại
        </Button>
        {onNext && (
          <Button
            onClick={onNext}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Câu tiếp theo
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
