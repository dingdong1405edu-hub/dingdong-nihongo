import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { transcribeAudio } from '@/lib/deepgram'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null
    if (!audioFile) {
      return NextResponse.json({ ok: false, error: 'No audio file' }, { status: 400 })
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const transcript = await transcribeAudio(buffer, audioFile.type)
    return NextResponse.json({ ok: true, transcript })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Transcription failed'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
