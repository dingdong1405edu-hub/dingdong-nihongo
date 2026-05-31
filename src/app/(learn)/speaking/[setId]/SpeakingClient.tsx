'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { JlptBadge } from '@/components/shared/jlpt-badge'
import { AudioVisualizer } from '@/components/learn/AudioVisualizer'
import { SpeakingFeedback } from '@/components/learn/SpeakingFeedback'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Mic,
  MicOff,
  Clock,
  PlayCircle,
  SkipForward,
  StopCircle,
  AlertCircle,
  Info,
  ChevronRight,
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { toast } from 'sonner'
import type { SpeakingGradeResult } from '@/types'

type Phase = 'IDLE' | 'PREP' | 'RECORDING' | 'PROCESSING' | 'RESULT'

const TASK_TYPE_LABELS: Record<string, string> = {
  INTERVIEW: 'Phỏng vấn',
  PICTURE_DESC: 'Mô tả ảnh',
  OPINION: 'Ý kiến',
  ROLEPLAY: 'Nhập vai',
}

interface SpeakingClientProps {
  speakingSet: {
    id: string
    jlptLevel: string
    taskType: string
    topic: string
    topicJa: string
    prompts: { question: string; imageUrl?: string }[]
    prepTimeSec: number
    speakTimeSec: number
    imageUrl: string | null
  }
}

export function SpeakingClient({ speakingSet }: SpeakingClientProps) {
  const [phase, setPhase] = useState<Phase>('IDLE')
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0)
  const [prepTime, setPrepTime] = useState(speakingSet.prepTimeSec)
  const [speakTime, setSpeakTime] = useState(speakingSet.speakTimeSec)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [result, setResult] = useState<SpeakingGradeResult | null>(null)
  const [micError, setMicError] = useState<string | null>(null)
  const [isBrowserSupported, setIsBrowserSupported] = useState(true)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordingStartRef = useRef<number>(0)
  // Use a ref to hold startRecording so effects can call it without stale closure
  const startRecordingRef = useRef<() => Promise<void>>()

  // Check browser support
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setIsBrowserSupported(false)
    }
  }, [])

  // Keep streamRef in sync with state
  useEffect(() => {
    streamRef.current = stream
  }, [stream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setStream(null)
  }, [])

  const requestMicPermission = useCallback(async (): Promise<MediaStream | null> => {
    setMicError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      return s
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setMicError(
            'Bạn đã từ chối quyền truy cập microphone. Vào Cài đặt trình duyệt → Site Settings → Microphone → cho phép trang này.'
          )
        } else if (err.name === 'NotFoundError') {
          setMicError('Không tìm thấy microphone. Hãy kiểm tra thiết bị của bạn.')
        } else {
          setMicError(`Lỗi microphone: ${err.message}`)
        }
      } else {
        setMicError('Không thể truy cập microphone. Vui lòng thử lại.')
      }
      return null
    }
  }, [])

  const processRecording = useCallback(
    async (audioBlob: Blob) => {
      const durationSec = Math.max(1, Math.round((Date.now() - recordingStartRef.current) / 1000))
      try {
        // Step 1: transcribe
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.webm')
        const transcribeRes = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        })
        const transcribeJson = (await transcribeRes.json()) as {
          ok: boolean
          transcript?: string
          error?: string
        }
        if (!transcribeJson.ok || !transcribeJson.transcript) {
          throw new Error(transcribeJson.error ?? 'Chuyển âm thành văn bản thất bại')
        }
        const transcript = transcribeJson.transcript

        // Step 2: grade
        const gradeRes = await fetch('/api/grade/speaking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript,
            level: speakingSet.jlptLevel,
            taskType: speakingSet.taskType,
            durationSec,
            refId: speakingSet.id,
          }),
        })
        const gradeJson = (await gradeRes.json()) as {
          ok: boolean
          data?: SpeakingGradeResult
          error?: string
        }
        if (!gradeJson.ok || !gradeJson.data) {
          throw new Error(gradeJson.error ?? 'Chấm điểm thất bại')
        }

        localStorage.setItem(
          `speaking-result-${speakingSet.id}`,
          JSON.stringify(gradeJson.data)
        )
        setResult(gradeJson.data)
        setPhase('RESULT')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra'
        toast.error(msg)
        setPhase('IDLE')
      }
    },
    [speakingSet.id, speakingSet.jlptLevel, speakingSet.taskType]
  )

  const startRecording = useCallback(async () => {
    // Get or reuse stream
    let activeStream = streamRef.current
    if (!activeStream) {
      activeStream = await requestMicPermission()
      if (!activeStream) return
      streamRef.current = activeStream
      setStream(activeStream)
    }

    chunksRef.current = []

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : ''

    const recorder = new MediaRecorder(activeStream, mimeType ? { mimeType } : undefined)
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
      processRecording(blob)
    }
    recorder.start(1000)
    recorderRef.current = recorder
    recordingStartRef.current = Date.now()
    setSpeakTime(speakingSet.speakTimeSec)
    setPhase('RECORDING')
  }, [requestMicPermission, processRecording, speakingSet.speakTimeSec])

  // Keep ref in sync so effects can always call the latest version
  useEffect(() => {
    startRecordingRef.current = startRecording
  }, [startRecording])

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    stopStream()
    setPhase('PROCESSING')
  }, [stopStream])

  // PREP countdown
  useEffect(() => {
    if (phase !== 'PREP') return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setPrepTime((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  // When prepTime hits 0 during PREP → auto-start recording via ref
  useEffect(() => {
    if (phase === 'PREP' && prepTime === 0) {
      startRecordingRef.current?.()
    }
  }, [prepTime, phase])

  // RECORDING countdown
  useEffect(() => {
    if (phase !== 'RECORDING') return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setSpeakTime((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  // Auto-stop when speak timer hits 0
  useEffect(() => {
    if (phase === 'RECORDING' && speakTime === 0) {
      stopRecording()
    }
  }, [speakTime, phase, stopRecording])

  const handleStart = async () => {
    if (!isBrowserSupported) return
    const s = await requestMicPermission()
    if (!s) return
    streamRef.current = s
    setStream(s)
    setPrepTime(speakingSet.prepTimeSec)
    setPhase('PREP')
  }

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop() } catch { /* noop */ }
    }
    stopStream()
    setPhase('IDLE')
    setResult(null)
    setPrepTime(speakingSet.prepTimeSec)
    setSpeakTime(speakingSet.speakTimeSec)
    setMicError(null)
  }, [stopStream, speakingSet.prepTimeSec, speakingSet.speakTimeSec])

  const handleNextPrompt = useCallback(() => {
    const nextIdx = currentPromptIdx + 1
    if (nextIdx < speakingSet.prompts.length) {
      setCurrentPromptIdx(nextIdx)
      handleReset()
    }
  }, [currentPromptIdx, speakingSet.prompts.length, handleReset])

  const currentPrompt = speakingSet.prompts[currentPromptIdx]
  const hasNextPrompt = currentPromptIdx + 1 < speakingSet.prompts.length

  if (!isBrowserSupported) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-20 gap-4 text-center">
        <MicOff className="h-12 w-12 text-zinc-400" />
        <p className="font-semibold text-zinc-700">Trình duyệt không hỗ trợ ghi âm</p>
        <p className="text-sm text-zinc-500">
          Vui lòng dùng Chrome, Firefox hoặc Edge phiên bản mới nhất.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <JlptBadge level={speakingSet.jlptLevel} />
            <Badge variant="outline" className="text-xs">
              {TASK_TYPE_LABELS[speakingSet.taskType] ?? speakingSet.taskType}
            </Badge>
          </div>
          <h1 className="text-xl font-bold text-zinc-900">{speakingSet.topic}</h1>
          <p className="text-base font-japanese text-indigo-600">{speakingSet.topicJa}</p>
        </div>
        {speakingSet.prompts.length > 1 && (
          <span className="text-xs text-zinc-400 shrink-0 mt-1">
            {currentPromptIdx + 1} / {speakingSet.prompts.length}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ── IDLE ── */}
        {phase === 'IDLE' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Prompt card */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4 shadow-sm">
              <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">
                Chủ đề
              </p>
              {currentPrompt?.imageUrl && (
                <img
                  src={currentPrompt.imageUrl}
                  alt="Ảnh chủ đề"
                  className="rounded-lg max-h-56 object-cover w-full"
                />
              )}
              <p className="text-base font-japanese text-zinc-800 leading-loose">
                {currentPrompt?.question}
              </p>
            </div>

            {/* Instructions */}
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Hướng dẫn
              </p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Bạn có {speakingSet.prepTimeSec}s để chuẩn bị sau khi bấm bắt đầu.</li>
                <li>Sau đó mic sẽ tự động bật và bạn có {speakingSet.speakTimeSec}s để nói.</li>
                <li>Hãy nói to, rõ ràng bằng tiếng Nhật.</li>
                <li>AI sẽ chấm điểm dựa trên bản ghi chép (transcript) của bạn.</li>
              </ul>
            </div>

            {/* Microphone error */}
            {micError && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{micError}</p>
              </div>
            )}

            <Button
              onClick={handleStart}
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base"
            >
              <PlayCircle className="h-5 w-5" />
              Bắt đầu luyện nói
            </Button>
          </motion.div>
        )}

        {/* ── PREP ── */}
        {phase === 'PREP' && (
          <motion.div
            key="prep"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              {currentPrompt?.imageUrl && (
                <img
                  src={currentPrompt.imageUrl}
                  alt="Ảnh chủ đề"
                  className="rounded-lg max-h-48 object-cover w-full mb-4"
                />
              )}
              <p className="text-sm font-japanese text-zinc-800 leading-loose">
                {currentPrompt?.question}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 py-8">
              <p className="text-sm font-medium text-zinc-500">Thời gian chuẩn bị</p>
              <motion.div
                className="text-7xl font-extrabold text-indigo-600 tabular-nums"
                key={prepTime}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {prepTime}
              </motion.div>
              <p className="text-xs text-zinc-400">giây</p>
            </div>

            <Button
              variant="outline"
              onClick={startRecording}
              className="w-full gap-2"
            >
              <SkipForward className="h-4 w-4" />
              Bỏ qua chuẩn bị, bắt đầu ngay
            </Button>
          </motion.div>
        )}

        {/* ── RECORDING ── */}
        {phase === 'RECORDING' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-japanese text-zinc-700 leading-loose">
                {currentPrompt?.question}
              </p>
            </div>

            <div className="flex flex-col items-center gap-5 py-6">
              {/* Pulsing mic indicator */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  className="absolute h-24 w-24 rounded-full bg-red-100"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute h-20 w-20 rounded-full bg-red-200"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
                />
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-lg">
                  <Mic className="h-7 w-7 text-white" />
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-500" />
                <span
                  className={`font-mono text-2xl font-bold tabular-nums ${
                    speakTime <= 10 ? 'text-red-600 animate-pulse' : 'text-zinc-800'
                  }`}
                >
                  {formatDuration(speakTime)}
                </span>
              </div>

              {/* Audio visualizer */}
              <AudioVisualizer stream={stream} isActive={phase === 'RECORDING'} />

              <p className="text-sm text-zinc-500">Đang ghi âm — hãy nói bằng tiếng Nhật...</p>
            </div>

            <Button
              onClick={stopRecording}
              variant="outline"
              className="w-full gap-2 border-red-200 text-red-700 hover:bg-red-50"
            >
              <StopCircle className="h-4 w-4" />
              Dừng ghi âm
            </Button>
          </motion.div>
        )}

        {/* ── PROCESSING ── */}
        {phase === 'PROCESSING' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full bg-indigo-100"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <span className="text-2xl">🤖</span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-zinc-800">Đang xử lý...</p>
                <p className="text-sm text-zinc-500 mt-1">
                  Deepgram đang chuyển âm → Claude đang chấm điểm
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {phase === 'RESULT' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SpeakingFeedback
              result={result}
              onRetry={handleReset}
              onNext={hasNextPrompt ? handleNextPrompt : undefined}
            />
            {hasNextPrompt && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleNextPrompt}
                  className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Chuyển sang câu tiếp theo
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
