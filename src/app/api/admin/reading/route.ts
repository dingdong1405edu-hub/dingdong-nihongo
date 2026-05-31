import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { toFuriganaHtml } from '@/lib/furigana'
import { z } from 'zod'

const questionSchema = z.object({
  type: z.enum(['MCQ', 'FILL_BLANK', 'TRUE_FALSE', 'MATCHING', 'SHORT_ANSWER']),
  prompt: z.string().min(1),
  promptFurigana: z.string().optional(),
  options: z.unknown().optional(),
  correctAnswer: z.unknown(),
})

const createSchema = z.object({
  title: z.string().min(1).max(300),
  titleJa: z.string().min(1).max(300),
  jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  passage: z.string().min(1),
  timeLimit: z.number().int().min(60),
  questions: z.array(questionSchema).min(1),
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
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  const where = jlptLevel ? { jlptLevel } : {}

  try {
    const [total, tests] = await db.$transaction([
      db.readingTest.count({ where }),
      db.readingTest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { questions: true } } },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])
    return NextResponse.json({
      ok: true,
      data: tests,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch reading tests'
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
    const { questions, ...rest } = createSchema.parse(body)

    // Auto-generate furigana for the passage
    const furigana = await toFuriganaHtml(rest.passage)

    const test = await db.readingTest.create({
      data: {
        ...rest,
        furigana,
        questions: {
          create: questions.map((q) => ({
            type: q.type,
            prompt: q.prompt,
            promptFurigana: q.promptFurigana,
            options: q.options ?? null,
            correctAnswer: q.correctAnswer,
          })),
        },
      },
      include: { questions: true },
    })
    return NextResponse.json({ ok: true, data: test }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to create reading test'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
