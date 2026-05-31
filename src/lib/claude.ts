import Groq from 'groq-sdk'
import type { WritingGradeResult, SpeakingGradeResult } from '@/types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const WRITING_SYSTEM_PROMPT = `You are a certified JLPT Japanese language examiner with 20 years of experience.
Evaluate Japanese writing by Vietnamese learners. Be constructive and specific.
Note: The learner's native language is Vietnamese.
Return ONLY valid JSON matching the schema exactly, no markdown, no explanation outside JSON.`

const SPEAKING_SYSTEM_PROMPT = `You are a Japanese language speaking coach specializing in JLPT preparation.
Evaluate transcripts of Vietnamese learners speaking Japanese. Be constructive and specific.
Note: Pitch accent evaluation is limited — assess based on transcript patterns only, not actual audio.
Return ONLY valid JSON matching the schema exactly, no markdown, no explanation outside JSON.`

export async function gradeWriting(params: {
  text: string
  level: string
  taskType: string
  requireKeigo: boolean
  minChars: number
}): Promise<WritingGradeResult> {
  const { text, level, taskType, requireKeigo, minChars } = params

  const userPrompt = `JLPT Level: ${level}
Task Type: ${taskType}
Minimum Characters: ${minChars}
${requireKeigo ? 'IMPORTANT: This task requires polite/formal Japanese (敬語). Evaluate keigo usage as a separate criterion.' : ''}

Student's writing:
${text}

Return JSON matching this schema exactly:
{
  "score": <0-100>,
  "criteria": {
    "grammar": { "score": <0-100>, "feedback": "<string>", "errors": ["<string>"] },
    "vocabulary": { "score": <0-100>, "feedback": "<string>", "suggestions": ["<string>"] },
    ${requireKeigo ? '"keigo": { "score": <0-100>, "feedback": "<string>", "errors": ["<string>"] },' : ''}
    "coherence": { "score": <0-100>, "feedback": "<string>" }
  },
  "annotations": [{ "original": "<string>", "issue": "<string>", "correction": "<string>", "explanation": "<string>" }],
  "correctedVersion": "<string>"
}`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2048,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: WRITING_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  })

  const content = response.choices[0]?.message?.content ?? ''
  const cleaned = content.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(cleaned) as WritingGradeResult
}

export async function gradeSpeaking(params: {
  transcript: string
  level: string
  taskType: string
  durationSec: number
}): Promise<SpeakingGradeResult> {
  const { transcript, level, taskType, durationSec } = params

  const wordCount = transcript.replace(/\s+/g, ' ').trim().split(' ').length
  const wpm = Math.round((wordCount / durationSec) * 60)

  const userPrompt = `JLPT Level: ${level}
Task Type: ${taskType}
Duration: ${durationSec} seconds
Estimated words spoken: ${wordCount} (${wpm} wpm)

Transcript of student's speech:
${transcript}

Return JSON matching this schema exactly:
{
  "score": <0-100>,
  "criteria": {
    "pronunciation": { "score": <0-100>, "errors": [{ "word": "<string>", "issue": "<string>" }] },
    "pitchAccent": { "score": null, "note": "Cannot evaluate pitch accent from transcript only" },
    "grammar": { "score": <0-100>, "errors": ["<string>"] },
    "fluency": { "score": <0-100>, "wordsPerMinute": ${wpm}, "fillerCount": <number>, "feedback": "<string>" }
  },
  "transcript": "<the original transcript>",
  "overallFeedback": "<string>"
}`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1536,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SPEAKING_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  })

  const content = response.choices[0]?.message?.content ?? ''
  const cleaned = content.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(cleaned) as SpeakingGradeResult
}

export async function gradeVocabFeedback(params: {
  word: string
  userAnswer: string
  correctAnswer: string
}): Promise<{ feedback: string; isCorrect: boolean }> {
  const { word, userAnswer, correctAnswer } = params

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    max_tokens: 256,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: `Japanese word: ${word}\nStudent answer: ${userAnswer}\nCorrect answer: ${correctAnswer}\n\nIs the student answer correct or close enough? Reply with JSON: {"isCorrect": boolean, "feedback": "short Vietnamese feedback"}`,
      },
    ],
  })

  const content = response.choices[0]?.message?.content ?? ''
  const cleaned = content.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(cleaned) as { feedback: string; isCorrect: boolean }
}
