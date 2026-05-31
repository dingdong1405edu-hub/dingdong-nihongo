import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Headphones,
  PenLine,
  Mic,
  Languages,
  BookMarked,
  Type,
  Users,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/vocab', label: 'Vocab', icon: BookOpen },
  { href: '/admin/grammar', label: 'Grammar', icon: Languages },
  { href: '/admin/kanji', label: 'Kanji', icon: Type },
  { href: '/admin/kana', label: 'Kana', icon: BookMarked },
  { href: '/admin/reading', label: 'Reading', icon: FileText },
  { href: '/admin/listening', label: 'Listening', icon: Headphones },
  { href: '/admin/writing', label: 'Writing', icon: PenLine },
  { href: '/admin/speaking', label: 'Speaking', icon: Mic },
  { href: '/admin/users', label: 'Users', icon: Users },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-zinc-200 bg-white">
        <div className="flex h-14 items-center border-b border-zinc-200 px-4">
          <span className="text-base font-bold text-indigo-600">DingDong</span>
          <span className="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
            Admin
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-0.5 px-2">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-zinc-200 px-4 py-3">
          <p className="truncate text-xs text-zinc-400">{session.user.email}</p>
          <Link
            href="/dashboard"
            className="mt-1 text-xs text-indigo-600 hover:underline"
          >
            Back to app
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-56 flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-zinc-200 bg-white px-6">
          <h1 className="text-sm font-medium text-zinc-500">Admin Dashboard</h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
