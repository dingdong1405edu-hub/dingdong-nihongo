import Kuroshiro from 'kuroshiro'
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji'
import crypto from 'crypto'

let kuroshiroInstance: Kuroshiro | null = null
const cache = new Map<string, string>()

async function getKuroshiro(): Promise<Kuroshiro> {
  if (kuroshiroInstance) return kuroshiroInstance
  const k = new Kuroshiro()
  await k.init(new KuromojiAnalyzer())
  kuroshiroInstance = k
  return k
}

export async function toFuriganaHtml(text: string): Promise<string> {
  const hash = crypto.createHash('md5').update(text).digest('hex')
  if (cache.has(hash)) return cache.get(hash)!

  const k = await getKuroshiro()
  const result = await k.convert(text, { mode: 'furigana', to: 'hiragana' })
  cache.set(hash, result)
  return result
}

export async function toRomaji(text: string): Promise<string> {
  const k = await getKuroshiro()
  return k.convert(text, { mode: 'normal', to: 'romaji', romajiSystem: 'hepburn' })
}

export async function toHiragana(text: string): Promise<string> {
  const k = await getKuroshiro()
  return k.convert(text, { mode: 'normal', to: 'hiragana' })
}
