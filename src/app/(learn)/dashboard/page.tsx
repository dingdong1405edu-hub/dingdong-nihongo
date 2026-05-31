import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { JlptBadge } from '@/components/shared/jlpt-badge'
import { XpBar } from '@/components/shared/xp-bar'
import { StreakFlame } from '@/components/shared/streak-flame'
import { HeartsDisplay } from '@/components/shared/hearts-display'
import { scoreColor, formatDuration } from '@/lib/utils'
import {
  BookOpen,
  Headphones,
  Mic,
  PenLine,
  Layers,
  AlignLeft,
  Sparkles,
  FileText,
  ChevronRight,
  Trophy,
  Clock,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const JLPT_PROVERBS = [
  {
    ja: '七転び八起き',
    reading: 'ななころびやおき',
    vn: 'Ngã bảy lần, đứng dậy tám lần — Kiên trì là chìa khóa thành công.',
  },
  {
    ja: '継続は力なり',
    reading: 'けいぞくはちからなり',
    vn: 'Kiên trì là sức mạnh — Hãy học mỗi ngày dù chỉ một chút.',
  },
  {
    ja: '塵も積もれば山となる',
    reading: 'ちりもつもればやまとなる',
    vn: 'Bụi tích lại thành núi — Nỗ lực nhỏ mỗi ngày sẽ tạo nên điều lớn lao.',
  },
]

interface ModuleCard {
  href: string
  icon: React.ReactNode
  titleVn: string
  titleJa: string
  description: string
  color: string
  borderColor: string
  bgColor: string
}

const MODULE_CARDS: ModuleCard[] = [
  {
    href: '/kana',
    icon: <span className="font-japanese text-2xl font-bold">あ→ア</span>,
    titleVn: 'Kana',
    titleJa: 'ひらがな・カタカナ',
    description: 'Hiragana & Katakana — bảng chữ cơ bản của tiếng Nhật',
    color: 'text-violet-700',
    borderColor: 'border-violet-200',
    bgColor: 'bg-violet-50 hover:bg-violet-100',
  },
  {
    href: '/vocab',
    icon: <BookOpen className="h-7 w-7" />,
    titleVn: 'Từ vựng',
    titleJa: '語彙',
    description: 'N5 → N1 theo chuẩn JLPT, gamified như Duolingo',
    color: 'text-blue-700',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
  },
  {
    href: '/grammar',
    icon: <AlignLeft className="h-7 w-7" />,
    titleVn: 'Ngữ pháp',
    titleJa: '文法',
    description: 'Cấu trúc câu, kính ngữ (敬語) theo từng level',
    color: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    bgColor: 'bg-cyan-50 hover:bg-cyan-100',
  },
  {
    href: '/kanji',
    icon: <span className="font-japanese text-2xl font-bold">漢</span>,
    titleVn: 'Kanji',
    titleJa: '漢字',
    description: 'Stroke order animation + nhận biết bộ thủ + quiz',
    color: 'text-red-700',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50 hover:bg-red-100',
  },
  {
    href: '/reading',
    icon: <FileText className="h-7 w-7" />,
    titleVn: 'Đọc hiểu',
    titleJa: '読解',
    description: 'Văn bản JLPT thật + furigana toggle + click-to-lookup',
    color: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
  },
  {
    href: '/listening',
    icon: <Headphones className="h-7 w-7" />,
    titleVn: 'Nghe hiểu',
    titleJa: '聴解',
    description: 'Audio JLPT thật — hội thoại & monologue',
    color: 'text-amber-700',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
  },
  {
    href: '/writing',
    icon: <PenLine className="h-7 w-7" />,
    titleVn: 'Viết luận',
    titleJa: '作文',
    description: 'AI (Claude) chấm ngữ pháp, từ vựng, kính ngữ, mạch lạc',
    color: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100',
  },
  {
    href: '/speaking',
    icon: <Mic className="h-7 w-7" />,
    titleVn: 'Luyện nói',
    titleJa: '会話',
    description: 'Ghi âm → Deepgram → Claude chấm phát âm & lưu loát',
    color: 'text-pink-700',
    borderColor: 'border-pink-200',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
  },
]

const SKILL_LABELS: Record<string, string> = {
  READING: '📖 Đọc hiểu',
  LISTENING: '🎧 Nghe hiểu',
  WRITING: '✏️ Viết luận',
  SPEAKING: '🎤 Luyện nói',
  VOCAB: '📚 Từ vựng',
  GRAMMAR: '文 Ngữ pháp',
  KANJI: '漢 Kanji',
  KANA: 'あ Kana',
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const [user, recentAttempts, vocabProgressCount, kanaProgressCount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, hearts: true, streakDays: true, jlptLevel: true, name: true },
    }),
    db.attempt.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    db.vocabProgress.count({ where: { userId: session.user.id, completed: true } }),
    db.kanaProgress.count({ where: { userId: session.user.id, mastered: true } }),
  ])

  if (!user) redirect('/login')

  const proverb = JLPT_PROVERBS[new Date().getDate() % JLPT_PROVERBS.length]
  const firstName = user.name ? user.name.split(' ').pop() ?? user.name : 'bạn'

  // Today's date as Japanese
  const now = new Date()
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']
  const todayJa = `${now.getMonth() + 1}月${now.getDate()}日（${dayNames[now.getDay()]}）`

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-5 text-white shadow-lg">
        <p className="text-sm font-medium text-indigo-200 font-japanese">{todayJa}</p>
        <h1 className="mt-1 text-2xl font-bold">
          こんにちは、<span className="font-japanese">{firstName}</span>さん！
        </h1>
        <p className="mt-1 text-sm text-indigo-200">
          今日も日本語を勉強しましょう！— Hãy học tiếng Nhật hôm nay!
        </p>
        <div className="mt-4">
          <XpBar xp={user.xp} level={user.jlptLevel} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-zinc-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Kinh nghiệm</p>
                <p className="text-lg font-bold text-zinc-900">{user.xp.toLocaleString()}</p>
                <p className="text-xs text-indigo-600 font-medium">XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
                <span className="text-xl">❤️</span>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Mạng sống</p>
                <HeartsDisplay count={user.hearts} max={5} />
                <p className="text-xs text-rose-600 font-medium">{user.hearts}/5 hearts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <StreakFlame days={user.streakDays} />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Chuỗi ngày</p>
                <p className="text-lg font-bold text-zinc-900">{user.streakDays}</p>
                <p className="text-xs text-orange-600 font-medium">ngày liên tục</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Mục tiêu</p>
                <JlptBadge level={user.jlptLevel} className="mt-1" />
                <p className="text-xs text-zinc-500 mt-0.5">JLPT target</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's progress */}
      <Card className="border-zinc-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-zinc-800 flex items-center gap-2">
            <span>📊</span> Tiến độ hôm nay
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-zinc-600">Kana đã thuộc</span>
              <span className="font-semibold text-violet-700">{kanaProgressCount} / 46</span>
            </div>
            <Progress value={Math.min((kanaProgressCount / 46) * 100, 100)} className="h-2" />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-zinc-600">Bài từ vựng hoàn thành</span>
              <span className="font-semibold text-blue-700">{vocabProgressCount} bài</span>
            </div>
            <Progress value={Math.min((vocabProgressCount / 20) * 100, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Module grid */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-zinc-900">
          Các module học tập
          <span className="ml-2 text-sm font-normal text-zinc-500">— Chọn bài để bắt đầu</span>
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MODULE_CARDS.map((mod) => (
            <Link key={mod.href} href={mod.href} className="group">
              <Card
                className={`h-full border transition-all duration-200 ${mod.borderColor} ${mod.bgColor} hover:shadow-md hover:-translate-y-0.5`}
              >
                <CardContent className="p-4">
                  <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ${mod.color}`}>
                    {mod.icon}
                  </div>
                  <h3 className={`font-bold ${mod.color}`}>{mod.titleVn}</h3>
                  <p className={`text-xs font-japanese mb-1 ${mod.color} opacity-70`}>
                    {mod.titleJa}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{mod.description}</p>
                  <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${mod.color}`}>
                    Bắt đầu <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom grid: Recent attempts + Proverb */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent attempts */}
        <div className="lg:col-span-2">
          <Card className="border-zinc-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-zinc-800 flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-500" />
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAttempts.length === 0 ? (
                <div className="py-8 text-center text-sm text-zinc-400">
                  <p className="font-japanese text-2xl mb-2">まだ何もありません</p>
                  <p>Chưa có hoạt động nào — hãy bắt đầu học!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {SKILL_LABELS[attempt.skill] ?? attempt.skill}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {attempt.createdAt.toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {attempt.score !== null && (
                          <span
                            className={`text-sm font-bold ${scoreColor(attempt.score)}`}
                          >
                            {Math.round(attempt.score)}đ
                          </span>
                        )}
                        {attempt.durationSec !== null && (
                          <span className="text-xs text-zinc-400">
                            {formatDuration(attempt.durationSec)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Proverb */}
        <div>
          <Card className="h-full border-zinc-200 bg-gradient-to-br from-indigo-50 to-pink-50/60">
            <CardContent className="flex h-full flex-col justify-between p-5">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Tục ngữ Nhật hôm nay
                </p>
                <p className="font-japanese text-2xl font-bold text-zinc-900 leading-relaxed">
                  {proverb.ja}
                </p>
                <p className="mt-1 font-japanese text-sm text-zinc-500">
                  ({proverb.reading})
                </p>
              </div>
              <p className="mt-4 text-sm text-zinc-600 leading-relaxed italic">
                &ldquo;{proverb.vn}&rdquo;
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
