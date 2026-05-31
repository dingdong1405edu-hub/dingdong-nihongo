import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { JlptBadge } from '@/components/shared/jlpt-badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  GraduationCap,
  ChevronRight,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ unitId: string }>
}

export default async function GrammarUnitPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { unitId } = await params

  const unit = await db.grammarUnit.findUnique({
    where: { id: unitId },
    include: {
      lessons: {
        include: {
          progress: { where: { userId: session.user.id } },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!unit) notFound()

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/grammar"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Tất cả đơn vị
      </Link>

      {/* Unit header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-3">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900">{unit.title}</h1>
              <JlptBadge level={unit.jlptLevel} />
            </div>
            <p className="text-xl font-japanese text-indigo-600 mt-0.5">
              {unit.titleJa}
            </p>
          </div>
        </div>
        <p className="text-sm text-zinc-500">
          {unit.lessons.length} bài học · JLPT {unit.jlptLevel}
        </p>
      </div>

      {/* Lessons list */}
      <div className="space-y-3">
        {unit.lessons.map((lesson, idx) => {
          const isCompleted = lesson.progress.some((p) => p.completed)
          const prevLesson = idx > 0 ? unit.lessons[idx - 1] : null
          const prevCompleted =
            idx === 0 ||
            prevLesson?.progress.some((p) => p.completed) === true
          const isLocked = !prevCompleted
          const exerciseCount = Array.isArray(lesson.exercises)
            ? lesson.exercises.length
            : 0

          return (
            <div key={lesson.id}>
              {isLocked ? (
                <Card className="opacity-60 cursor-not-allowed border-zinc-200">
                  <CardContent className="flex items-center gap-4 py-4 px-5">
                    <div className="rounded-lg bg-zinc-100 p-2.5 shrink-0">
                      <Lock className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-zinc-400">
                        Bài {idx + 1}
                        {lesson.title ? ` — ${lesson.title}` : ''}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {exerciseCount} bài tập · Hoàn thành bài trước để mở
                        khoá
                      </p>
                    </div>
                    <Lock className="h-4 w-4 text-zinc-300 shrink-0" />
                  </CardContent>
                </Card>
              ) : (
                <Link href={`/grammar/${unitId}/${lesson.id}`}>
                  <Card
                    className={cn(
                      'hover:shadow-md transition-all cursor-pointer group',
                      isCompleted
                        ? 'border-green-200 bg-green-50/50'
                        : 'border-indigo-200 hover:border-indigo-300',
                    )}
                  >
                    <CardContent className="flex items-center gap-4 py-4 px-5">
                      <div
                        className={cn(
                          'rounded-lg p-2.5 shrink-0',
                          isCompleted ? 'bg-green-100' : 'bg-indigo-100',
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-indigo-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'font-semibold',
                            isCompleted ? 'text-green-800' : 'text-zinc-900',
                            'group-hover:text-indigo-700 transition-colors',
                          )}
                        >
                          Bài {idx + 1}
                          {lesson.title ? ` — ${lesson.title}` : ''}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {exerciseCount} bài tập
                          {isCompleted && (
                            <span className="ml-2 text-green-600 font-medium">
                              ✓ Hoàn thành
                            </span>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
