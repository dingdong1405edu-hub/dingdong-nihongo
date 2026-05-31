import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  order: z.number().int().min(0).optional(),
  title: z.string().max(200).optional(),
  exercises: z.array(z.record(z.unknown())).optional(),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if (session.user.role !== 'ADMIN') return null
  return session
}

type Params = { params: Promise<{ lessonId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const { lessonId } = await params

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)
    const lesson = await db.vocabLesson.update({ where: { id: lessonId }, data })
    return NextResponse.json({ ok: true, data: lesson })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to update lesson'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const { lessonId } = await params

  try {
    await db.vocabLesson.delete({ where: { id: lessonId } })
    return NextResponse.json({ ok: true, data: null })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to delete lesson'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
