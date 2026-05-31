import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  taskType: z.enum(['ESSAY', 'OPINION', 'LETTER', 'DESCRIPTION']),
  prompt: z.string().min(1),
  promptJa: z.string().optional(),
  imageUrl: z.string().url().optional(),
  minChars: z.number().int().min(1),
  timeLimit: z.number().int().min(60),
  jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  requireKeigo: z.boolean().default(false),
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
    | 'ESSAY'
    | 'OPINION'
    | 'LETTER'
    | 'DESCRIPTION'
    | null
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  const where = {
    ...(jlptLevel ? { jlptLevel } : {}),
    ...(taskType ? { taskType } : {}),
  }

  try {
    const [total, tasks] = await db.$transaction([
      db.writingTask.count({ where }),
      db.writingTask.findMany({
        where,
        orderBy: [{ jlptLevel: 'asc' }, { taskType: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])
    return NextResponse.json({
      ok: true,
      data: tasks,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch writing tasks'
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
    const task = await db.writingTask.create({ data })
    return NextResponse.json({ ok: true, data: task }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to create writing task'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
