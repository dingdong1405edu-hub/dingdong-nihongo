import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, BookOpen, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function KanaPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const [hiraganaSets, katakanaSets, progressList] = await Promise.all([
    db.kanaSet.findMany({ where: { type: 'HIRAGANA' }, orderBy: { order: 'asc' } }),
    db.kanaSet.findMany({ where: { type: 'KATAKANA' }, orderBy: { order: 'asc' } }),
    db.kanaProgress.findMany({ where: { userId: session.user.id } }),
  ])

  const masteredSetIds = new Set(
    progressList.filter((p) => p.mastered).map((p) => p.kanaSetId),
  )

  const hiraganaTotal = hiraganaSets.length
  const katakanaTotal = katakanaSets.length
  const hiraganaMastered = hiraganaSets.filter((s) => masteredSetIds.has(s.id)).length
  const katakanaMastered = katakanaSets.filter((s) => masteredSetIds.has(s.id)).length
  const totalSets = hiraganaTotal + katakanaTotal
  const totalMastered = hiraganaMastered + katakanaMastered

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Kana{' '}
          <span className="font-japanese text-indigo-600">（かな）</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Học Hiragana và Katakana — hai bảng chữ cái cơ bản của tiếng Nhật
        </p>
      </div>

      {/* Overall progress */}
      <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-zinc-700">Tổng tiến độ</p>
              <p className="text-xs text-zinc-500">
                Đã thuộc {totalMastered} / {totalSets} bộ Kana
              </p>
            </div>
            <span className="text-3xl font-bold text-indigo-600">
              {totalSets > 0 ? Math.round((totalMastered / totalSets) * 100) : 0}%
            </span>
          </div>
          <Progress
            value={totalSets > 0 ? (totalMastered / totalSets) * 100 : 0}
            className="h-3"
          />
          <div className="mt-3 grid grid-cols-2 gap-3 text-center text-xs">
            <div className="rounded-lg bg-white/80 py-2">
              <p className="font-japanese text-lg font-bold text-violet-700">ひ</p>
              <p className="text-zinc-500">Hiragana</p>
              <p className="font-semibold text-violet-700">
                {hiraganaMastered}/{hiraganaTotal} bộ
              </p>
            </div>
            <div className="rounded-lg bg-white/80 py-2">
              <p className="font-japanese text-lg font-bold text-blue-700">ア</p>
              <p className="text-zinc-500">Katakana</p>
              <p className="font-semibold text-blue-700">
                {katakanaMastered}/{katakanaTotal} bộ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="hiragana">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hiragana" className="font-japanese">
            ひらがな Hiragana
          </TabsTrigger>
          <TabsTrigger value="katakana" className="font-japanese">
            カタカナ Katakana
          </TabsTrigger>
        </TabsList>

        {/* Hiragana sets */}
        <TabsContent value="hiragana" className="mt-4 space-y-3">
          {hiraganaSets.length === 0 ? (
            <EmptyState type="Hiragana" />
          ) : (
            hiraganaSets.map((set, idx) => {
              const chars = set.characters as { kana: string; romaji: string }[]
              const mastered = masteredSetIds.has(set.id)
              const isUnlocked = idx === 0 || masteredSetIds.has(hiraganaSets[idx - 1]?.id ?? '')
              return (
                <KanaSetCard
                  key={set.id}
                  id={set.id}
                  row={set.row}
                  characters={chars}
                  mastered={mastered}
                  isUnlocked={isUnlocked || mastered}
                  accentColor="violet"
                />
              )
            })
          )}
        </TabsContent>

        {/* Katakana sets */}
        <TabsContent value="katakana" className="mt-4 space-y-3">
          {katakanaSets.length === 0 ? (
            <EmptyState type="Katakana" />
          ) : (
            katakanaSets.map((set, idx) => {
              const chars = set.characters as { kana: string; romaji: string }[]
              const mastered = masteredSetIds.has(set.id)
              const isUnlocked = idx === 0 || masteredSetIds.has(katakanaSets[idx - 1]?.id ?? '')
              return (
                <KanaSetCard
                  key={set.id}
                  id={set.id}
                  row={set.row}
                  characters={chars}
                  mastered={mastered}
                  isUnlocked={isUnlocked || mastered}
                  accentColor="blue"
                />
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ type }: { type: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-200 py-12 text-center">
      <p className="font-japanese text-3xl mb-2">
        {type === 'Hiragana' ? 'ひらがな' : 'カタカナ'}
      </p>
      <p className="text-sm text-zinc-500">Chưa có dữ liệu {type}.</p>
      <p className="text-xs text-zinc-400 mt-1">Admin cần seed dữ liệu trước.</p>
    </div>
  )
}

interface KanaSetCardProps {
  id: string
  row: string
  characters: { kana: string; romaji: string }[]
  mastered: boolean
  isUnlocked: boolean
  accentColor: 'violet' | 'blue'
}

function KanaSetCard({ id, row, characters, mastered, isUnlocked, accentColor }: KanaSetCardProps) {
  const colorMap = {
    violet: {
      border: mastered ? 'border-violet-300' : isUnlocked ? 'border-zinc-200' : 'border-zinc-100',
      bg: mastered ? 'bg-violet-50' : isUnlocked ? 'bg-white' : 'bg-zinc-50',
      badge: 'bg-violet-600',
      kana: 'text-violet-700',
      btn: 'bg-violet-600 hover:bg-violet-700',
    },
    blue: {
      border: mastered ? 'border-blue-300' : isUnlocked ? 'border-zinc-200' : 'border-zinc-100',
      bg: mastered ? 'bg-blue-50' : isUnlocked ? 'bg-white' : 'bg-zinc-50',
      badge: 'bg-blue-600',
      kana: 'text-blue-700',
      btn: 'bg-blue-600 hover:bg-blue-700',
    },
  }
  const c = colorMap[accentColor]

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${c.border} ${c.bg} ${
        isUnlocked ? 'hover:shadow-sm' : 'opacity-60'
      }`}
    >
      {/* Status icon */}
      <div className="shrink-0">
        {mastered ? (
          <CheckCircle2 className={`h-7 w-7 ${accentColor === 'violet' ? 'text-violet-500' : 'text-blue-500'}`} />
        ) : (
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
              isUnlocked ? c.badge : 'bg-zinc-300'
            }`}
          >
            {isUnlocked ? <BookOpen className="h-4 w-4" /> : '🔒'}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-zinc-900 text-sm">{row}</p>
          {mastered && (
            <Badge
              variant="secondary"
              className={`text-xs ${accentColor === 'violet' ? 'text-violet-700 bg-violet-100' : 'text-blue-700 bg-blue-100'}`}
            >
              Đã thuộc
            </Badge>
          )}
        </div>
        {/* Preview characters */}
        <div className="flex flex-wrap gap-1.5">
          {characters.slice(0, 8).map((char) => (
            <span
              key={char.kana}
              className={`font-japanese text-sm font-medium ${c.kana}`}
              title={char.romaji}
            >
              {char.kana}
            </span>
          ))}
          {characters.length > 8 && (
            <span className="text-xs text-zinc-400">+{characters.length - 8}</span>
          )}
        </div>
      </div>

      {/* Action button */}
      {isUnlocked && (
        <Link href={`/kana/${id}`} className="shrink-0">
          <Button
            size="sm"
            className={`text-white text-xs px-3 ${c.btn}`}
          >
            {mastered ? 'Ôn lại' : 'Bắt đầu học'}
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      )}
    </div>
  )
}
