import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { JlptBadge } from '@/components/shared/jlpt-badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Headphones,
  Clock,
  HelpCircle,
  ChevronRight,
  Trophy,
  Volume2,
} from 'lucide-react'
import type { JLPTLevel } from '@prisma/client'
import { scoreColor } from '@/lib/utils'

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

interface ListeningPageProps {
  searchParams: Promise<{ level?: string }>
}

async function ListeningTestList({ level }: { level: JLPTLevel }) {
  const session = await auth()

  const [tests, attempts] = await Promise.all([
    db.listeningTest.findMany({
      where: { jlptLevel: level },
      include: { questions: { select: { id: true } } },
      orderBy: { id: 'desc' },
    }),
    session?.user
      ? db.attempt.findMany({
          where: { userId: session.user.id, skill: 'LISTENING' },
          select: { refId: true, score: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
  ])

  // Best score per test
  const bestScores = new Map<string, number>()
  for (const a of attempts) {
    const prev = bestScores.get(a.refId)
    if (a.score !== null && (prev === undefined || a.score > prev)) {
      bestScores.set(a.refId, a.score)
    }
  }

  if (tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Volume2 className="h-14 w-14 text-zinc-300 mb-4" />
        <p className="text-lg font-semibold text-zinc-500">
          Chưa có bài nghe hiểu {level}
        </p>
        <p className="text-sm text-zinc-400 mt-1">
          Admin sẽ sớm thêm nội dung cho cấp độ này.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
      {tests.map((test) => {
        const best = bestScores.get(test.id)
        const questionCount = test.questions.length
        const minutes = test.timeLimit ? Math.ceil(test.timeLimit / 60) : null

        return (
          <Card
            key={test.id}
            className="group border border-zinc-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
          >
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-zinc-900 truncate group-hover:text-indigo-700 transition-colors">
                    {test.title}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {test.audioUrl ? 'Audio sẵn sàng' : 'Không có audio'}
                  </p>
                </div>
                <JlptBadge level={test.jlptLevel} className="shrink-0" />
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-2">
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" />
                  {questionCount} câu hỏi
                </span>
                {minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {minutes} phút
                  </span>
                )}
              </div>

              {best !== undefined && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
                  <Trophy className="h-4 w-4 text-yellow-500 shrink-0" />
                  <span className="text-xs text-zinc-600">
                    Điểm tốt nhất:{' '}
                    <span className={`font-bold ${scoreColor(best)}`}>
                      {Math.round(best)}%
                    </span>
                  </span>
                </div>
              )}
            </CardContent>

            <CardFooter className="px-4 pb-4 pt-2">
              <Button
                asChild
                size="sm"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Link href={`/listening/${test.id}`}>
                  {best !== undefined ? 'Làm lại' : 'Bắt đầu'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

export default async function ListeningPage({ searchParams }: ListeningPageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const params = await searchParams
  const activeLevel = (
    LEVELS.includes(params.level as JLPTLevel) ? params.level : 'N5'
  ) as JLPTLevel

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-indigo-100">
            <Headphones className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Nghe hiểu</h1>
            <p className="text-sm text-zinc-500">
              Luyện nghe tiếng Nhật theo chuẩn JLPT
            </p>
          </div>
        </div>
      </div>

      {/* JLPT Level Tabs */}
      <Tabs defaultValue={activeLevel}>
        <TabsList className="mb-6 h-auto p-1 bg-zinc-100 rounded-xl gap-1">
          {LEVELS.map((lvl) => (
            <TabsTrigger
              key={lvl}
              value={lvl}
              asChild
              className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Link href={`/listening?level=${lvl}`}>
                <JlptBadge level={lvl} />
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>

        {LEVELS.map((lvl) => (
          <TabsContent key={lvl} value={lvl}>
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border border-zinc-200">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-1" />
                      </CardHeader>
                      <CardContent className="px-4 pb-2">
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                      <CardFooter className="px-4 pb-4 pt-2">
                        <Skeleton className="h-9 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              }
            >
              {lvl === activeLevel && <ListeningTestList level={lvl} />}
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
