import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  character: z.string().min(1).max(1),
  onyomi: z.array(z.string()),
  kunyomi: z.array(z.string()),
  meaning: z.string().min(1),
  jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  grade: z.number().int().min(1).optional(),
  strokeCount: z.number().int().min(1),
  strokeOrder: z.record(z.unknown()),
  radicals: z.array(z.object({ radical: z.string(), meaning: z.string() })),
  examples: z.array(
    z.object({ word: z.string(), reading: z.string(), meaning: z.string() })
  ),
  mnemonic: z.string().optional(),
})

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if (session.user.role !== 'ADMIN') return null
  return session
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)))
  const jlptLevel = searchParams.get('jlptLevel') as 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null

  const where = jlptLevel ? { jlptLevel } : {}

  try {
    const [total, kanji] = await db.$transaction([
      db.kanjiCharacter.count({ where }),
      db.kanjiCharacter.findMany({
        where,
        orderBy: [{ jlptLevel: 'asc' }, { strokeCount: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])
    return NextResponse.json({
      ok: true,
      data: kanji,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch kanji'
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
    const kanji = await db.kanjiCharacter.create({ data })
    return NextResponse.json({ ok: true, data: kanji }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to create kanji'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
