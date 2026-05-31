import { NextRequest, NextResponse } from 'next/server'
import { toFuriganaHtml } from '@/lib/furigana'
import { z } from 'zod'

const schema = z.object({ text: z.string().min(1).max(5000) })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text } = schema.parse(body)
    const html = await toFuriganaHtml(text)
    return NextResponse.json({ ok: true, html })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
