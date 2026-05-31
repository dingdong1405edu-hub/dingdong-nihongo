'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function markKanjiMastered(kanjiId: string) {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'Chưa đăng nhập' }

  await db.$transaction([
    db.kanjiProgress.upsert({
      where: { userId_kanjiId: { userId: session.user.id, kanjiId } },
      create: { userId: session.user.id, kanjiId, mastered: true, reviewCount: 1 },
      update: { mastered: true, reviewCount: { increment: 1 } },
    }),
    db.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: 15 }, lastActiveAt: new Date() },
    }),
  ])

  revalidatePath('/kanji')
  revalidatePath(`/kanji/${kanjiId}`)
  return { ok: true }
}

export async function recordKanjiReview(kanjiId: string, mastered: boolean) {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'Chưa đăng nhập' }

  const xpGained = mastered ? 15 : 5

  await db.$transaction([
    db.kanjiProgress.upsert({
      where: { userId_kanjiId: { userId: session.user.id, kanjiId } },
      create: { userId: session.user.id, kanjiId, mastered, reviewCount: 1 },
      update: { mastered, reviewCount: { increment: 1 } },
    }),
    db.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: xpGained }, lastActiveAt: new Date() },
    }),
  ])

  revalidatePath('/kanji')
  revalidatePath(`/kanji/${kanjiId}`)
  return { ok: true, xpGained }
}
