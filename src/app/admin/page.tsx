import Link from 'next/link'
import { db } from '@/lib/db'
import {
  Users,
  BookOpen,
  FileText,
  Headphones,
  PenLine,
  Mic,
  Type,
  Activity,
  Languages,
  BookMarked,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const [
    userCount,
    attemptCount,
    vocabCount,
    grammarCount,
    readingCount,
    listeningCount,
    writingCount,
    speakingCount,
    kanjiCount,
    kanaCount,
  ] = await Promise.all([
    db.user.count(),
    db.attempt.count(),
    db.vocabUnit.count(),
    db.grammarUnit.count(),
    db.readingTest.count(),
    db.listeningTest.count(),
    db.writingTask.count(),
    db.speakingSet.count(),
    db.kanjiCharacter.count(),
    db.kanaSet.count(),
  ])

  const stats = [
    { label: 'Total Users', value: userCount, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', href: '/admin/users' },
    { label: 'Total Attempts', value: attemptCount, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', href: null },
  ]

  const content = [
    { label: 'Vocab Units', value: vocabCount, icon: BookOpen, href: '/admin/vocab' },
    { label: 'Grammar Units', value: grammarCount, icon: Languages, href: '/admin/grammar' },
    { label: 'Reading Tests', value: readingCount, icon: FileText, href: '/admin/reading' },
    { label: 'Listening Tests', value: listeningCount, icon: Headphones, href: '/admin/listening' },
    { label: 'Writing Tasks', value: writingCount, icon: PenLine, href: '/admin/writing' },
    { label: 'Speaking Sets', value: speakingCount, icon: Mic, href: '/admin/speaking' },
    { label: 'Kanji Characters', value: kanjiCount, icon: Type, href: '/admin/kanji' },
    { label: 'Kana Sets', value: kanaCount, icon: BookMarked, href: '/admin/kana' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Overview</h2>
        <p className="mt-1 text-sm text-zinc-500">Platform-wide statistics</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => {
          const card = (
            <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-sm text-zinc-500">{label}</p>
                <p className="text-2xl font-bold text-zinc-900">{value.toLocaleString()}</p>
              </div>
            </div>
          )
          return href ? (
            <Link key={label} href={href} className="hover:opacity-90">
              {card}
            </Link>
          ) : (
            <div key={label}>{card}</div>
          )
        })}
      </div>

      {/* Content stats */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Content
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {content.map(({ label, value, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-start gap-2 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
            >
              <Icon className="h-5 w-5 text-indigo-500" />
              <span className="text-xl font-bold text-zinc-900">{value.toLocaleString()}</span>
              <span className="text-xs text-zinc-500">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Quick Add
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '+ Vocab Unit', href: '/admin/vocab/new' },
            { label: '+ Reading Test', href: '/admin/reading/new' },
            { label: '+ Listening Test', href: '/admin/listening/new' },
            { label: '+ Writing Task', href: '/admin/writing/new' },
            { label: '+ Speaking Set', href: '/admin/speaking/new' },
            { label: '+ Kanji', href: '/admin/kanji/new' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
