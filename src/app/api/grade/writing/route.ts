import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { gradeWriting } from '@/lib/claude'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  text: z.string().min(1).max(3000),
  level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  taskType: z.string(),
  requireKeigo: z.boolean().default(false),
  minChars: z.number().default(100),
  refId: z.string(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const params = schema.parse(body)
    const result = await gradeWriting(params)

    await db.attempt.create({
      data: {
        userId: session.user.id,
        skill: 'WRITING',
        refId: params.refId,
        rawAnswer: { text: params.text },
        score: result.score,
        feedback: result as unknown as Record<string, unknown>,
      },
    })

    return NextResponse.json({ ok: true, data: result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Grading failed'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
