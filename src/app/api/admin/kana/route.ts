import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const kanaCharSchema = z.object({
  kana: z.string().min(1),
  romaji: z.string().min(1),
})

const createSchema = z.object({
  type: z.enum(['HIRAGANA', 'KATAKANA']),
  row: z.string().min(1).max(50),
  order: z.number().int().min(0).default(0),
  characters: z.array(kanaCharSchema).min(1),
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
    const sets = await db.kanaSet.findMany({
      orderBy: [{ type: 'asc' }, { order: 'asc' }],
    })
    return NextResponse.json({ ok: true, data: sets })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch kana sets'
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
    const set = await db.kanaSet.create({ data })
    return NextResponse.json({ ok: true, data: set }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to create kana set'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
