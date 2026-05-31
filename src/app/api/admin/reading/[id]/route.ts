import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { toFuriganaHtml } from '@/lib/furigana'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  titleJa: z.string().min(1).max(300).optional(),
  jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).optional(),
  passage: z.string().min(1).optional(),
  timeLimit: z.number().int().min(60).optional(),
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
    const test = await db.readingTest.findUnique({
      where: { id },
      include: { questions: { orderBy: { id: 'asc' } } },
    })
    if (!test) {
      return NextResponse.json({ ok: false, error: 'Reading test not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: test })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch reading test'
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

    // If passage is updated, regenerate furigana
    let furigana: string | undefined
    if (data.passage) {
      furigana = await toFuriganaHtml(data.passage)
    }

    const test = await db.readingTest.update({
      where: { id },
      data: { ...data, ...(furigana ? { furigana } : {}) },
      include: { questions: true },
    })
    return NextResponse.json({ ok: true, data: test })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to update reading test'
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
    await db.readingTest.delete({ where: { id } })
    return NextResponse.json({ ok: true, data: null })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to delete reading test'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
