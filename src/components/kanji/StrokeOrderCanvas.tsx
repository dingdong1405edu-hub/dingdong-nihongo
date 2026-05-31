'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pencil, StepForward, RotateCcw } from 'lucide-react'

// Minimal type surface for hanzi-writer we actually use
interface HanziWriterInstance {
  animateCharacter: (opts?: { onComplete?: () => void }) => void
  animateStroke: (strokeNum: number, opts?: { onComplete?: () => void }) => void
  quiz: (opts: {
    onMistake?: (strokeData: { strokeNum: number; mistakesOnStroke: number; totalMistakes: number }) => void
    onCorrectStroke?: (strokeData: { strokeNum: number; totalMistakes: number }) => void
    onComplete?: (summaryData: { totalMistakes: number }) => void
  }) => void
  cancelQuiz: () => void
  setCharacter: (character: string) => void
}

interface HanziWriterStatic {
  create: (
    element: HTMLElement,
    character: string,
    options: {
      width: number
      height: number
      padding: number
      strokeColor: string
      radicalColor: string
      outlineColor: string
      showCharacter: boolean
      showOutline: boolean
      strokeAnimationSpeed?: number
      delayBetweenStrokes?: number
    },
  ) => HanziWriterInstance
}

interface StrokeOrderCanvasProps {
  character: string
  width?: number
  height?: number
  autoPlay?: boolean
  strokeCount?: number
}

type Mode = 'idle' | 'animating' | 'quiz' | 'stepping'

export function StrokeOrderCanvas({
  character,
  width = 300,
  height = 300,
  autoPlay = false,
  strokeCount = 0,
}: StrokeOrderCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<HanziWriterInstance | null>(null)
  const [mode, setMode] = useState<Mode>('idle')
  const [currentStroke, setCurrentStroke] = useState(0)
  const [quizMistakes, setQuizMistakes] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    if (!containerRef.current) return

    let cancelled = false

    async function initWriter() {
      const HanziWriter = ((await import('hanzi-writer')) as { default: HanziWriterStatic }).default
      if (cancelled || !containerRef.current) return

      // Clear previous SVG
      containerRef.current.innerHTML = ''

      writerRef.current = HanziWriter.create(containerRef.current, character, {
        width,
        height,
        padding: 5,
        strokeColor: '#4f46e5', // indigo-600
        radicalColor: '#FFB7C5', // sakura
        outlineColor: '#e4e4e7', // zinc-200
        showCharacter: false,
        showOutline: true,
        strokeAnimationSpeed: speed,
        delayBetweenStrokes: 300,
      })

      if (autoPlay) {
        setMode('animating')
        writerRef.current.animateCharacter({
          onComplete: () => setMode('idle'),
        })
      }
    }

    void initWriter()
    return () => {
      cancelled = true
    }
  }, [character, width, height, autoPlay, speed])

  function handleAnimate() {
    if (!writerRef.current) return
    setMode('animating')
    setCurrentStroke(0)
    setQuizComplete(false)
    writerRef.current.animateCharacter({
      onComplete: () => setMode('idle'),
    })
  }

  function handleStep() {
    if (!writerRef.current) return
    const next = currentStroke
    setMode('stepping')
    writerRef.current.animateStroke(next, {
      onComplete: () => {
        setCurrentStroke(next + 1)
        if (strokeCount > 0 && next + 1 >= strokeCount) {
          setMode('idle')
        } else {
          setMode('stepping')
        }
      },
    })
  }

  function handleReset() {
    writerRef.current?.cancelQuiz()
    // Reinitialise by re-setting character (triggers effect cleanup is not needed — just re-create)
    setMode('idle')
    setCurrentStroke(0)
    setQuizComplete(false)
    setQuizMistakes(0)

    if (!containerRef.current) return
    containerRef.current.innerHTML = ''
    import('hanzi-writer')
      .then((mod) => {
        const HanziWriter = (mod as { default: HanziWriterStatic }).default
        if (!containerRef.current) return
        writerRef.current = HanziWriter.create(containerRef.current, character, {
          width,
          height,
          padding: 5,
          strokeColor: '#4f46e5',
          radicalColor: '#FFB7C5',
          outlineColor: '#e4e4e7',
          showCharacter: false,
          showOutline: true,
          strokeAnimationSpeed: speed,
          delayBetweenStrokes: 300,
        })
      })
      .catch(() => {})
  }

  function handleQuiz() {
    if (!writerRef.current) return
    setMode('quiz')
    setQuizMistakes(0)
    setQuizComplete(false)
    setCurrentStroke(0)
    writerRef.current.quiz({
      onMistake: (data) => {
        setQuizMistakes(data.totalMistakes)
      },
      onCorrectStroke: (data) => {
        setCurrentStroke(data.strokeNum + 1)
      },
      onComplete: (summary) => {
        setQuizMistakes(summary.totalMistakes)
        setQuizComplete(true)
        setMode('idle')
      },
    })
  }

  const isAnimating = mode === 'animating' || mode === 'stepping'

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Canvas */}
      <div
        ref={containerRef}
        className="border border-zinc-200 rounded-2xl bg-white shadow-sm"
        style={{ width, height }}
      />

      {/* Status strip */}
      {mode === 'quiz' && !quizComplete && (
        <div className="text-sm text-zinc-600 text-center">
          ✏️ Vẽ nét bút theo thứ tự đúng
          {quizMistakes > 0 && (
            <span className="ml-2 text-red-500">• {quizMistakes} lỗi</span>
          )}
        </div>
      )}
      {quizComplete && (
        <div className="text-sm font-medium text-green-600 text-center">
          Hoàn thành! Tổng lỗi: {quizMistakes}
        </div>
      )}
      {mode === 'stepping' && strokeCount > 0 && (
        <div className="text-sm text-zinc-500 text-center">
          Nét {currentStroke}/{strokeCount}
        </div>
      )}

      {/* Speed selector */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span>Tốc độ:</span>
        {[0.5, 1, 1.5, 2].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 rounded border text-xs transition-colors ${
              speed === s
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-zinc-300 text-zinc-600 hover:border-indigo-400'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={handleAnimate}
          disabled={isAnimating}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-3.5 h-3.5" />
          Xem nét bút
        </button>

        <button
          onClick={handleStep}
          disabled={isAnimating || mode === 'quiz'}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-zinc-300 text-zinc-700 rounded-lg text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <StepForward className="w-3.5 h-3.5" />
          Từng nét
        </button>

        <button
          onClick={handleQuiz}
          disabled={isAnimating || mode === 'quiz'}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFB7C5] border border-pink-200 text-pink-900 rounded-lg text-sm font-medium hover:bg-pink-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Pencil className="w-3.5 h-3.5" />
          Luyện viết
        </button>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-zinc-300 text-zinc-600 rounded-lg text-sm font-medium hover:border-zinc-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>
    </div>
  )
}
