'use client'

import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  stream: MediaStream | null
  isActive: boolean
}

export function AudioVisualizer({ stream, isActive }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)

  useEffect(() => {
    if (!stream || !isActive) {
      // Clean up
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (sourceRef.current) {
        try { sourceRef.current.disconnect() } catch { /* noop */ }
        sourceRef.current = null
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => { /* noop */ })
        audioCtxRef.current = null
      }
      analyserRef.current = null
      // Clear canvas
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

    const audioCtx = new AudioContext()
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 128
    analyser.smoothingTimeConstant = 0.8

    const source = audioCtx.createMediaStreamSource(stream)
    source.connect(analyser)

    audioCtxRef.current = audioCtx
    analyserRef.current = analyser
    sourceRef.current = source

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      const barCount = 32
      const step = Math.floor(bufferLength / barCount)
      const barWidth = width / barCount - 2
      const maxBarHeight = height - 4

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] ?? 0
        const barHeight = Math.max(4, (value / 255) * maxBarHeight)
        const x = i * (barWidth + 2)
        const y = height - barHeight

        // Gradient: indigo to pink
        const gradient = ctx.createLinearGradient(x, y + barHeight, x, y)
        gradient.addColorStop(0, 'rgba(99,102,241,0.9)')   // indigo-500
        gradient.addColorStop(1, 'rgba(255,183,197,0.9)')  // sakura-pink

        ctx.fillStyle = gradient
        ctx.beginPath()
        // roundRect may not be available in all browsers
        const ctxAny = ctx as CanvasRenderingContext2D & {
          roundRect?: (x: number, y: number, w: number, h: number, r: number) => void
        }
        if (typeof ctxAny.roundRect === 'function') {
          ctxAny.roundRect(x, y, barWidth, barHeight, 2)
        } else {
          ctx.rect(x, y, barWidth, barHeight)
        }
        ctx.fill()
      }
    }

    draw()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      try { source.disconnect() } catch { /* noop */ }
      if (audioCtx.state !== 'closed') audioCtx.close().catch(() => { /* noop */ })
    }
  }, [stream, isActive])

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={60}
      className="rounded-lg w-full max-w-xs mx-auto"
      aria-hidden
    />
  )
}
