import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  taskType: z.enum(['ESSAY', 'OPINION', 'LETTER', 'DESCRIPTION']).optional(),
  prompt: z.string().min(1).optional(),
  promptJa: z.string().optional(),
  imageUrl: z.string().url().optional(),
  minChars: z.number().int().min(1).optional(),
  timeLimit: z.number().int().min(60).optional(),
  jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).optional(),
  requireKeigo: z.boolean().optional(),
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
    const task = await db.writingTask.findUnique({ where: { id } })
    if (!task) {
      return NextResponse.json({ ok: false, error: 'Writing task not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: task })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch writing task'
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
    const task = await db.writingTask.update({ where: { id }, data })
    return NextResponse.json({ ok: true, data: task })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to update writing task'
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
    await db.writingTask.delete({ where: { id } })
    return NextResponse.json({ ok: true, data: null })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to delete writing task'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
