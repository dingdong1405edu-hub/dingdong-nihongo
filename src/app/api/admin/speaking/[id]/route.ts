import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).optional(),
  taskType: z.enum(['INTERVIEW', 'PICTURE_DESC', 'OPINION', 'ROLEPLAY']).optional(),
  topic: z.string().min(1).max(300).optional(),
  topicJa: z.string().min(1).max(300).optional(),
  prompts: z.array(z.unknown()).min(1).optional(),
  prepTimeSec: z.number().int().min(0).optional(),
  speakTimeSec: z.number().int().min(10).optional(),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if (session.user.role !== 'ADMIN') return null
  return session
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  try {
    const set = await db.speakingSet.findUnique({ where: { id } })
    if (!set) {
      return NextResponse.json({ ok: false, error: 'Speaking set not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: set })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch speaking set'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)
    const set = await db.speakingSet.update({ where: { id }, data })
    return NextResponse.json({ ok: true, data: set })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to update speaking set'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  try {
    await db.speakingSet.delete({ where: { id } })
    return NextResponse.json({ ok: true, data: null })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to delete speaking set'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
