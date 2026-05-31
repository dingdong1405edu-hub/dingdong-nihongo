import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Navbar } from '@/components/shared/navbar'
import { Sidebar } from '@/components/shared/sidebar'
import { signOut } from '@/lib/auth'

async function handleSignOut() {
  'use server'
  await signOut({ redirectTo: '/login' })
}

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      xp: true,
      hearts: true,
      streakDays: true,
      jlptLevel: true,
    },
  })

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar jlptLevel={user.jlptLevel} className="hidden lg:flex" />
      <div className="flex flex-1 flex-col lg:ml-[240px]">
        <Navbar
          user={{
            name: user.name,
            email: user.email,
            image: user.image,
            xp: user.xp,
            hearts: user.hearts,
            streakDays: user.streakDays,
            jlptLevel: user.jlptLevel,
          }}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
