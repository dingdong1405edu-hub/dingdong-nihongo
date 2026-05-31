'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function completeVocabLesson(lessonId: string, score: number) {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'Chưa đăng nhập' }

  const xpGained = Math.round(score / 10) + 10

  await db.$transaction([
    db.vocabProgress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      create: { userId: session.user.id, lessonId, completed: true, score },
      update: { completed: true, score: Math.max(score, 0) },
    }),
    db.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: xpGained }, lastActiveAt: new Date() },
    }),
  ])

  revalidatePath('/dashboard')
  return { ok: true, xpGained }
}

export async function completeGrammarLesson(lessonId: string, score: number) {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'Chưa đăng nhập' }

  const xpGained = Math.round(score / 10) + 10

  await db.$transaction([
    db.grammarProgress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      create: { userId: session.user.id, lessonId, completed: true, score },
      update: { completed: true, score: Math.max(score, 0) },
    }),
    db.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: xpGained }, lastActiveAt: new Date() },
    }),
  ])

  revalidatePath('/dashboard')
  return { ok: true, xpGained }
}

export async function completeKanaSet(kanaSetId: string) {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'Chưa đăng nhập' }

  await db.$transaction([
    db.kanaProgress.upsert({
      where: { userId_kanaSetId: { userId: session.user.id, kanaSetId } },
      create: { userId: session.user.id, kanaSetId, mastered: true },
      update: { mastered: true },
    }),
    db.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: 20 }, lastActiveAt: new Date() },
    }),
  ])

  revalidatePath('/kana')
  return { ok: true }
}

export async function updateStreakAndHearts(lostHeart: boolean = false) {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'Chưa đăng nhập' }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user) return { ok: false, error: 'Không tìm thấy user' }

  const now = new Date()
  const lastActive = user.lastActiveAt
  let newStreak = user.streakDays

  if (lastActive) {
    const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / 86400000)
    if (daysDiff === 1) newStreak += 1
    else if (daysDiff > 1) newStreak = 1
  } else {
    newStreak = 1
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      streakDays: newStreak,
      lastActiveAt: now,
      hearts: lostHeart ? Math.max(0, user.hearts - 1) : Math.min(5, user.hearts + 1),
    },
  })

  revalidatePath('/dashboard')
  return { ok: true, streak: newStreak }
}

export async function saveAttempt(params: {
  skill: string
  refId: string
  rawAnswer: unknown
  score?: number
  feedback?: unknown
  durationSec?: number
}) {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'Chưa đăng nhập' }

  await db.attempt.create({
    data: {
      userId: session.user.id,
      skill: params.skill as never,
      refId: params.refId,
      rawAnswer: params.rawAnswer as never,
      score: params.score,
      feedback: params.feedback as never,
      durationSec: params.durationSec,
    },
  })

  return { ok: true }
}
