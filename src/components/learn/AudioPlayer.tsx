'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5] as const
type SpeedOption = (typeof SPEED_OPTIONS)[number]

interface AudioPlayerProps {
  src: string
  onPlay?: () => void
  onEnded?: () => void
  className?: string
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioPlayer({ src, onPlay, onEnded, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState<SpeedOption>(1)
  const [loop, setLoop] = useState(false)
  const [muted, setMuted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dragging, setDragging] = useState(false)

  // Sync audio element properties
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = speed
  }, [speed])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.loop = loop
  }, [loop])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = muted
  }, [muted])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setLoading(false)
    }

    const handleTimeUpdate = () => {
      if (!dragging) setCurrentTime(audio.currentTime)
    }

    const handlePlay = () => {
      setPlaying(true)
      onPlay?.()
    }

    const handlePause = () => setPlaying(false)

    const handleEnded = () => {
      setPlaying(false)
      if (!loop) {
        onEnded?.()
      }
    }

    const handleCanPlay = () => setLoading(false)
    const handleWaiting = () => setLoading(true)

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('waiting', handleWaiting)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('waiting', handleWaiting)
    }
  }, [dragging, loop, onEnded, onPlay])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  }, [playing])

  const handleRestart = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [])

  // Progress bar scrubbing
  const seekTo = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current
    const audio = audioRef.current
    if (!bar || !audio || !duration) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = ratio * duration
    setCurrentTime(ratio * duration)
  }, [duration])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true)
    seekTo(e)
  }, [seekTo])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dragging) return
      seekTo(e)
    },
    [dragging, seekTo],
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dragging) return
      setDragging(false)
      seekTo(e)
    },
    [dragging, seekTo],
  )

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className={cn(
        'rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 shadow-lg select-none',
        className,
      )}
    >
      {/* Hidden native audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Top row: loop + mute + speed */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Loop button */}
          <button
            type="button"
            onClick={() => setLoop((v) => !v)}
            title="Lặp lại"
            className={cn(
              'flex items-center justify-center h-8 w-8 rounded-full transition-colors',
              loop
                ? 'bg-white/25 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/10',
            )}
          >
            <Repeat className="h-4 w-4" />
          </button>

          {/* Mute button */}
          <button
            type="button"
            onClick={() => setMuted((v) => !v)}
            title={muted ? 'Bật âm' : 'Tắt âm'}
            className="flex items-center justify-center h-8 w-8 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-1">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
                speed === s
                  ? 'bg-white text-indigo-700'
                  : 'text-white/60 hover:text-white hover:bg-white/10',
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Main controls row */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Restart */}
        <button
          type="button"
          onClick={handleRestart}
          title="Nghe lại từ đầu"
          className="flex items-center justify-center h-10 w-10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        {/* Play / Pause — large circular */}
        <button
          type="button"
          onClick={togglePlay}
          disabled={loading}
          className={cn(
            'flex items-center justify-center h-16 w-16 rounded-full shadow-md transition-all duration-150 active:scale-95',
            loading
              ? 'bg-white/20 cursor-not-allowed'
              : 'bg-white hover:bg-white/90 text-indigo-700',
          )}
          aria-label={playing ? 'Tạm dừng' : 'Phát'}
        >
          {loading ? (
            <span className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : playing ? (
            <Pause className="h-7 w-7 fill-current" />
          ) : (
            <Play className="h-7 w-7 fill-current ml-0.5" />
          )}
        </button>

        {/* Placeholder for symmetry */}
        <div className="h-10 w-10" />
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div
          ref={progressRef}
          className="relative h-2 w-full rounded-full bg-white/20 cursor-pointer group"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setDragging(false)}
          // Touch support
          onTouchStart={(e) => {
            const touch = e.touches[0]
            const bar = progressRef.current
            const audio = audioRef.current
            if (!bar || !audio || !duration) return
            const rect = bar.getBoundingClientRect()
            const ratio = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
            audio.currentTime = ratio * duration
            setCurrentTime(ratio * duration)
          }}
        >
          {/* Track fill */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
          {/* Thumb */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow-md -translate-x-1/2 transition-opacity',
              dragging ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100',
            )}
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between text-xs text-white/70">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
