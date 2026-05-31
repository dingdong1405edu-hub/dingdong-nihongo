import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1).max(200),
  titleJa: z.string().min(1).max(200),
  jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  order: z.number().int().min(0),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if (session.user.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const units = await db.grammarUnit.findMany({
      orderBy: [{ jlptLevel: 'asc' }, { order: 'asc' }],
      include: { _count: { select: { lessons: true } } },
    })
    return NextResponse.json({ ok: true, data: units })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch grammar units'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = createSchema.parse(body)
    const unit = await db.grammarUnit.create({ data })
    return NextResponse.json({ ok: true, data: unit }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to create grammar unit'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
