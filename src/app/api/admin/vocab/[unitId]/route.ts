import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  titleJa: z.string().min(1).max(200).optional(),
  jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).optional(),
  order: z.number().int().min(0).optional(),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if (session.user.role !== 'ADMIN') return null
  return session
}

type Params = { params: Promise<{ unitId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const { unitId } = await params

  try {
    const unit = await db.vocabUnit.findUnique({
      where: { id: unitId },
      include: { lessons: { orderBy: { order: 'asc' } } },
    })
    if (!unit) {
      return NextResponse.json({ ok: false, error: 'Vocab unit not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: unit })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch vocab unit'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const { unitId } = await params

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)
    const unit = await db.vocabUnit.update({ where: { id: unitId }, data })
    return NextResponse.json({ ok: true, data: unit })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to update vocab unit'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const { unitId } = await params

  try {
    await db.vocabUnit.delete({ where: { id: unitId } })
    return NextResponse.json({ ok: true, data: null })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to delete vocab unit'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
