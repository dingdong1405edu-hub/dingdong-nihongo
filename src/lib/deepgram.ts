import { createClient } from '@deepgram/sdk'

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!)

export async function transcribeAudio(audioBuffer: Buffer, _mimeType: string): Promise<string> {
  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    audioBuffer,
    {
      model: 'nova-2',
      language: 'ja',
      smart_format: true,
      punctuate: true,
    },
  )

  if (error) throw new Error(`Deepgram error: ${error.message}`)

  // Post-process: restore long vowels commonly dropped by Deepgram
  const transcript =
    result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ''
  return transcript
}
