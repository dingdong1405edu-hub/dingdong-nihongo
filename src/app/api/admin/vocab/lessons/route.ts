import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  unitId: z.string().min(1),
  title: z.string().max(200).optional(),
  order: z.number().int().min(0),
  exercises: z.array(z.record(z.unknown())).min(1),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if (session.user.role !== 'ADMIN') return null
  return session
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const unitExists = await db.vocabUnit.findUnique({ where: { id: data.unitId } })
    if (!unitExists) {
      return NextResponse.json({ ok: false, error: 'Vocab unit not found' }, { status: 404 })
    }

    const lesson = await db.vocabLesson.create({
      data: {
        unitId: data.unitId,
        title: data.title ?? '',
        order: data.order,
        exercises: data.exercises,
      },
    })
    return NextResponse.json({ ok: true, data: lesson }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to create lesson'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
