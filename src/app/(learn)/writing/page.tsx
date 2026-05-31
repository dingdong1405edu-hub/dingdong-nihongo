import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { JlptBadge } from '@/components/shared/jlpt-badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  PenLine,
  Clock,
  FileText,
  ChevronRight,
  Star,
} from 'lucide-react'
import type { JLPTLevel, WritingTaskType } from '@/types'

const JLPT_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

const TASK_TYPES: { value: WritingTaskType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ESSAY', label: 'Luận văn' },
  { value: 'OPINION', label: 'Ý kiến' },
  { value: 'LETTER', label: 'Thư / Email' },
  { value: 'DESCRIPTION', label: 'Mô tả' },
]

const TASK_TYPE_LABELS: Record<WritingTaskType, string> = {
  ESSAY: 'Luận văn',
  OPINION: 'Ý kiến',
  LETTER: 'Thư / Email',
  DESCRIPTION: 'Mô tả',
}

interface PageProps {
  searchParams: Promise<{ level?: string; type?: string }>
}

export default async function WritingPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const params = await searchParams
  const rawLevel = params.level?.toUpperCase()
  const targetLevel: JLPTLevel | 'ALL' = JLPT_LEVELS.includes(rawLevel as JLPTLevel)
    ? (rawLevel as JLPTLevel)
    : 'ALL'

  const rawType = params.type?.toUpperCase() as WritingTaskType | undefined
  const validTypes: WritingTaskType[] = ['ESSAY', 'OPINION', 'LETTER', 'DESCRIPTION']
  const targetType: WritingTaskType | 'ALL' = validTypes.includes(rawType as WritingTaskType)
    ? (rawType as WritingTaskType)
    : 'ALL'

  const tasks = await db.writingTask.findMany({
    where: {
      ...(targetLevel !== 'ALL' ? { jlptLevel: targetLevel } : {}),
      ...(targetType !== 'ALL' ? { taskType: targetType } : {}),
    },
    orderBy: [{ jlptLevel: 'asc' }, { createdAt: 'desc' }],
  })

  // Fetch user's best attempt per task
  const attempts = await db.attempt.findMany({
    where: {
      userId: session.user.id,
      skill: 'WRITING',
      refId: { in: tasks.map((t) => t.id) },
    },
    orderBy: { createdAt: 'desc' },
  })

  const bestScoreByTask = new Map<string, number>()
  for (const attempt of attempts) {
    const existing = bestScoreByTask.get(attempt.refId)
    if (attempt.score !== null && (existing === undefined || attempt.score > existing)) {
      bestScoreByTask.set(attempt.refId, attempt.score)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <PenLine className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-zinc-900">Luyện viết</h1>
        </div>
        <p className="text-sm text-zinc-500">
          Viết luận tiếng Nhật và nhận phản hồi chi tiết từ AI theo chuẩn JLPT.
        </p>
      </div>

      {/* Level filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/writing"
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
            href={`/writing?level=${level}${targetType !== 'ALL' ? `&type=${targetType}` : ''}`}
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
            href={`/writing?${targetLevel !== 'ALL' ? `level=${targetLevel}&` : ''}${value !== 'ALL' ? `type=${value}` : ''}`}
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

      {/* Tasks grid */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="h-12 w-12 text-zinc-300 mb-3" />
          <p className="text-zinc-500 font-medium">Chưa có bài tập viết nào.</p>
          <p className="text-zinc-400 text-sm mt-1">Admin sẽ sớm bổ sung nội dung!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const bestScore = bestScoreByTask.get(task.id)
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
                key={task.id}
                className="h-full hover:shadow-md hover:border-indigo-200 transition-all group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <JlptBadge level={task.jlptLevel} />
                      <Badge variant="outline" className="text-xs font-medium">
                        {TASK_TYPE_LABELS[task.taskType as WritingTaskType]}
                      </Badge>
                      {task.requireKeigo && (
                        <Badge className="bg-purple-100 text-purple-800 border-0 text-xs">
                          敬語
                        </Badge>
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
                  <p className="text-sm font-medium text-zinc-800 line-clamp-3 mt-2 leading-relaxed">
                    {task.prompt}
                  </p>
                  {task.promptJa && (
                    <p className="text-sm text-indigo-600 font-japanese line-clamp-2 mt-1">
                      {task.promptJa}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Tối thiểu {task.minChars} ký tự</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{task.timeLimit} phút</span>
                    </div>
                  </div>
                  <Link href={`/writing/${task.id}`}>
                    <Button
                      size="sm"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white group-hover:shadow-sm transition-all"
                    >
                      {bestScore !== undefined ? 'Làm lại' : 'Bắt đầu viết'}
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
