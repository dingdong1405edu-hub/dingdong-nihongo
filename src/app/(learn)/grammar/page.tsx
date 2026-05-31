import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { JlptBadge } from '@/components/shared/jlpt-badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { GraduationCap, ChevronRight } from 'lucide-react'
import type { JLPTLevel } from '@/types'

const JLPT_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

interface PageProps {
  searchParams: Promise<{ level?: string }>
}

export default async function GrammarPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const params = await searchParams
  const rawLevel = params.level?.toUpperCase()
  const targetLevel: JLPTLevel = JLPT_LEVELS.includes(rawLevel as JLPTLevel)
    ? (rawLevel as JLPTLevel)
    : 'N5'

  const units = await db.grammarUnit.findMany({
    where: { jlptLevel: targetLevel },
    include: {
      lessons: {
        include: {
          progress: { where: { userId: session.user.id } },
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-zinc-900">Ngữ pháp</h1>
        </div>
        <p className="text-sm text-zinc-500">
          Học ngữ pháp tiếng Nhật theo chuẩn JLPT N5–N1, kèm bài tập kính ngữ.
        </p>
      </div>

      {/* Level tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {JLPT_LEVELS.map((level) => (
          <Link
            key={level}
            href={`/grammar?level=${level}`}
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

      {/* Units grid */}
      {units.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <GraduationCap className="h-12 w-12 text-zinc-300 mb-3" />
          <p className="text-zinc-500 font-medium">
            Chưa có bài học ngữ pháp cho cấp độ {targetLevel}.
          </p>
          <p className="text-zinc-400 text-sm mt-1">
            Admin sẽ sớm bổ sung nội dung!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => {
            const totalLessons = unit.lessons.length
            const completedLessons = unit.lessons.filter((l) =>
              l.progress.some((p) => p.completed)
            ).length
            const progressPct =
              totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0
            const isStarted = completedLessons > 0

            return (
              <Link key={unit.id} href={`/grammar/${unit.id}`}>
                <Card className="h-full hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-semibold text-zinc-900 truncate group-hover:text-indigo-700 transition-colors">
                          {unit.title}
                        </p>
                        <p className="text-lg font-japanese text-indigo-600">
                          {unit.titleJa}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <JlptBadge level={unit.jlptLevel} />
                        <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{totalLessons} bài học</span>
                      <span className="font-medium text-zinc-700">
                        {completedLessons}/{totalLessons} hoàn thành
                      </span>
                    </div>
                    <Progress
                      value={progressPct}
                      className="h-2 bg-zinc-100 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-indigo-600"
                    />
                    {isStarted && progressPct < 100 && (
                      <p className="text-xs text-indigo-600 font-medium">
                        Đang học...
                      </p>
                    )}
                    {progressPct === 100 && (
                      <p className="text-xs text-green-600 font-medium">
                        Hoàn thành!
                      </p>
                    )}
                    {!isStarted && (
                      <p className="text-xs text-zinc-400">Chưa bắt đầu</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
