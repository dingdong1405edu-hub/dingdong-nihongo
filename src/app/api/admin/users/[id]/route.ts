import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).optional(),
  resetHearts: z.boolean().optional(),
  role: z.enum(['LEARNER', 'ADMIN']).optional(),
  name: z.string().min(1).max(200).optional(),
})

const MAX_HEARTS = 5

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if (session.user.role !== 'ADMIN') return null
  return session
}

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { resetHearts, jlptLevel, role, name } = updateSchema.parse(body)

    const updateData: Record<string, unknown> = {}
    if (jlptLevel !== undefined) updateData.jlptLevel = jlptLevel
    if (role !== undefined) updateData.role = role
    if (name !== undefined) updateData.name = name
    if (resetHearts === true) updateData.hearts = MAX_HEARTS

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ ok: false, error: 'No fields to update' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        xp: true,
        hearts: true,
        streakDays: true,
        jlptLevel: true,
        lastActiveAt: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ ok: true, data: user })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to update user'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        xp: true,
        hearts: true,
        streakDays: true,
        jlptLevel: true,
        lastActiveAt: true,
        createdAt: true,
        _count: { select: { attempts: true } },
      },
    })
    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: user })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch user'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
