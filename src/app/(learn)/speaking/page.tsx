import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { JlptBadge } from '@/components/shared/jlpt-badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Mic,
  Clock,
  ChevronRight,
  Star,
  Users,
  Image,
  MessageCircle,
  Theater,
} from 'lucide-react'
import type { JLPTLevel, SpeakingTaskType } from '@/types'

const JLPT_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

const TASK_TYPES: { value: SpeakingTaskType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'INTERVIEW', label: 'Phỏng vấn' },
  { value: 'PICTURE_DESC', label: 'Mô tả ảnh' },
  { value: 'OPINION', label: 'Ý kiến' },
  { value: 'ROLEPLAY', label: 'Nhập vai' },
]

const TASK_TYPE_META: Record<
  SpeakingTaskType,
  { label: string; icon: React.ElementType; color: string }
> = {
  INTERVIEW: { label: 'Phỏng vấn', icon: Users, color: 'bg-blue-100 text-blue-800' },
  PICTURE_DESC: { label: 'Mô tả ảnh', icon: Image, color: 'bg-green-100 text-green-800' },
  OPINION: { label: 'Ý kiến', icon: MessageCircle, color: 'bg-yellow-100 text-yellow-800' },
  ROLEPLAY: { label: 'Nhập vai', icon: Theater, color: 'bg-purple-100 text-purple-800' },
}

interface PageProps {
  searchParams: Promise<{ level?: string; type?: string }>
}

export default async function SpeakingPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const params = await searchParams
  const rawLevel = params.level?.toUpperCase()
  const targetLevel: JLPTLevel | 'ALL' = JLPT_LEVELS.includes(rawLevel as JLPTLevel)
    ? (rawLevel as JLPTLevel)
    : 'ALL'

  const rawType = params.type?.toUpperCase() as SpeakingTaskType | undefined
  const validTypes: SpeakingTaskType[] = ['INTERVIEW', 'PICTURE_DESC', 'OPINION', 'ROLEPLAY']
  const targetType: SpeakingTaskType | 'ALL' = validTypes.includes(rawType as SpeakingTaskType)
    ? (rawType as SpeakingTaskType)
    : 'ALL'

  const sets = await db.speakingSet.findMany({
    where: {
      ...(targetLevel !== 'ALL' ? { jlptLevel: targetLevel } : {}),
      ...(targetType !== 'ALL' ? { taskType: targetType } : {}),
    },
    orderBy: [{ jlptLevel: 'asc' }, { createdAt: 'desc' }],
  })

  const attempts = await db.attempt.findMany({
    where: {
      userId: session.user.id,
      skill: 'SPEAKING',
      refId: { in: sets.map((s) => s.id) },
    },
    orderBy: { createdAt: 'desc' },
  })

  const bestScoreBySet = new Map<string, number>()
  for (const attempt of attempts) {
    const existing = bestScoreBySet.get(attempt.refId)
    if (attempt.score !== null && (existing === undefined || attempt.score > existing)) {
      bestScoreBySet.set(attempt.refId, attempt.score)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Mic className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-zinc-900">Luyện nói</h1>
        </div>
        <p className="text-sm text-zinc-500">
          Ghi âm tiếng Nhật và nhận phản hồi về phát âm, ngữ pháp và lưu loát từ AI.
        </p>
      </div>

      {/* Level filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/speaking"
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
            targetLevel === 'ALL'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          Tất cả
        </Link>
        {JLPT_LEVELS.map((level) => (
          <Link
            key={level}
            href={`/speaking?level=${level}${targetType !== 'ALL' ? `&type=${targetType}` : ''}`}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              level === targetLevel
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            {level}
          </Link>
        ))}
      </div>

      {/* Task type tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {TASK_TYPES.map(({ value, label }) => (
          <Link
            key={value}
            href={`/speaking?${targetLevel !== 'ALL' ? `level=${targetLevel}&` : ''}${value !== 'ALL' ? `type=${value}` : ''}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              value === targetType
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Sets grid */}
      {sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Mic className="h-12 w-12 text-zinc-300 mb-3" />
          <p className="text-zinc-500 font-medium">Chưa có bài luyện nói nào.</p>
          <p className="text-zinc-400 text-sm mt-1">Admin sẽ sớm bổ sung nội dung!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map((set) => {
            const bestScore = bestScoreBySet.get(set.id)
            const meta = TASK_TYPE_META[set.taskType as SpeakingTaskType]
            const Icon = meta?.icon ?? Mic
            const scoreColor =
              bestScore === undefined
                ? ''
                : bestScore >= 80
                ? 'text-green-600'
                : bestScore >= 60
                ? 'text-yellow-600'
                : 'text-red-600'

            return (
              <Card
                key={set.id}
                className="h-full hover:shadow-md hover:border-indigo-200 transition-all group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <JlptBadge level={set.jlptLevel} />
                      {meta && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      )}
                    </div>
                    {bestScore !== undefined && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className={`text-sm font-bold ${scoreColor}`}>
                          {Math.round(bestScore)}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-zinc-800 mt-2">{set.topic}</p>
                  <p className="text-base font-japanese text-indigo-600">{set.topicJa}</p>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Chuẩn bị: {set.prepTimeSec}s</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mic className="h-3.5 w-3.5" />
                      <span>Nói: {set.speakTimeSec}s</span>
                    </div>
                  </div>
                  <Link href={`/speaking/${set.id}`}>
                    <Button
                      size="sm"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white group-hover:shadow-sm transition-all"
                    >
                      {bestScore !== undefined ? 'Thử lại' : 'Bắt đầu'}
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
