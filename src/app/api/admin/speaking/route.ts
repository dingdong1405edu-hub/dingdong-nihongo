import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  taskType: z.enum(['INTERVIEW', 'PICTURE_DESC', 'OPINION', 'ROLEPLAY']),
  topic: z.string().min(1).max(300),
  topicJa: z.string().min(1).max(300),
  prompts: z.array(z.unknown()).min(1),
  prepTimeSec: z.number().int().min(0).default(30),
  speakTimeSec: z.number().int().min(10).default(90),
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
  const jlptLevel = searchParams.get('jlptLevel') as 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null
  const taskType = searchParams.get('taskType') as
    | 'INTERVIEW'
    | 'PICTURE_DESC'
    | 'OPINION'
    | 'ROLEPLAY'
    | null
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  const where = {
    ...(jlptLevel ? { jlptLevel } : {}),
    ...(taskType ? { taskType } : {}),
  }

  try {
    const [total, sets] = await db.$transaction([
      db.speakingSet.count({ where }),
      db.speakingSet.findMany({
        where,
        orderBy: [{ jlptLevel: 'asc' }, { taskType: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])
    return NextResponse.json({
      ok: true,
      data: sets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch speaking sets'
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
    const set = await db.speakingSet.create({ data })
    return NextResponse.json({ ok: true, data: set }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to create speaking set'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
