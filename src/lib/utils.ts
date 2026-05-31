import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function jlptBadgeColor(level: string): string {
  const colors: Record<string, string> = {
    N5: 'bg-green-100 text-green-800',
    N4: 'bg-blue-100 text-blue-800',
    N3: 'bg-yellow-100 text-yellow-800',
    N2: 'bg-orange-100 text-orange-800',
    N1: 'bg-red-100 text-red-800',
  }
  return colors[level] ?? 'bg-zinc-100 text-zinc-800'
}

export function countJapaneseChars(text: string): number {
  // Count all chars except spaces/whitespace
  return text.replace(/\s/g, '').length
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function xpForLevel(streakDays: number): number {
  return streakDays * 10 + 100
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}
