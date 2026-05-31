import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  character: z.string().min(1).max(1).optional(),
  onyomi: z.array(z.string()).optional(),
  kunyomi: z.array(z.string()).optional(),
  meaning: z.string().min(1).optional(),
  jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).optional(),
  grade: z.number().int().min(1).optional(),
  strokeCount: z.number().int().min(1).optional(),
  strokeOrder: z.record(z.unknown()).optional(),
  radicals: z
    .array(z.object({ radical: z.string(), meaning: z.string() }))
    .optional(),
  examples: z
    .array(z.object({ word: z.string(), reading: z.string(), meaning: z.string() }))
    .optional(),
  mnemonic: z.string().optional(),
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
    const kanji = await db.kanjiCharacter.findUnique({ where: { id } })
    if (!kanji) {
      return NextResponse.json({ ok: false, error: 'Kanji not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: kanji })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch kanji'
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
    const kanji = await db.kanjiCharacter.update({ where: { id }, data })
    return NextResponse.json({ ok: true, data: kanji })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to update kanji'
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
    await db.kanjiCharacter.delete({ where: { id } })
    return NextResponse.json({ ok: true, data: null })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to delete kanji'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
