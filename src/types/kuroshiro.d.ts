declare module 'kuroshiro' {
  interface KuroshiroOptions {
    analyzer: unknown
  }

  type Mode = 'normal' | 'spaced' | 'okurigana' | 'furigana'
  type To = 'hiragana' | 'katakana' | 'romaji'

  interface ConvertOptions {
    mode?: Mode
    to?: To
    romajiSystem?: 'hepburn' | 'nippon' | 'passport'
    delimiter_start?: string
    delimiter_end?: string
  }

  class Kuroshiro {
    init(analyzer: unknown): Promise<void>
    convert(text: string, options?: ConvertOptions): Promise<string>
  }

  export default Kuroshiro
}

declare module 'kuroshiro-analyzer-kuromoji' {
  class KuromojiAnalyzer {
    constructor(options?: { dictPath?: string })
  }
  export default KuromojiAnalyzer
}
