import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const kanaCharSchema = z.object({
  kana: z.string().min(1),
  romaji: z.string().min(1),
})

const updateSchema = z.object({
  type: z.enum(['HIRAGANA', 'KATAKANA']).optional(),
  row: z.string().min(1).max(50).optional(),
  order: z.number().int().min(0).optional(),
  characters: z.array(kanaCharSchema).min(1).optional(),
})

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
    const data = updateSchema.parse(body)
    const set = await db.kanaSet.update({ where: { id }, data })
    return NextResponse.json({ ok: true, data: set })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to update kana set'
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
    await db.kanaSet.delete({ where: { id } })
    return NextResponse.json({ ok: true, data: null })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to delete kana set'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
