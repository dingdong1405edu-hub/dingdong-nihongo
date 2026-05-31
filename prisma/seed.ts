import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// KANA DATA
// ---------------------------------------------------------------------------

const hiraganaRows = [
  {
    row: 'あ行',
    order: 1,
    characters: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'い', romaji: 'i' },
      { kana: 'う', romaji: 'u' },
      { kana: 'え', romaji: 'e' },
      { kana: 'お', romaji: 'o' },
    ],
  },
  {
    row: 'か行',
    order: 2,
    characters: [
      { kana: 'か', romaji: 'ka' },
      { kana: 'き', romaji: 'ki' },
      { kana: 'く', romaji: 'ku' },
      { kana: 'け', romaji: 'ke' },
      { kana: 'こ', romaji: 'ko' },
    ],
  },
  {
    row: 'さ行',
    order: 3,
    characters: [
      { kana: 'さ', romaji: 'sa' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'す', romaji: 'su' },
      { kana: 'せ', romaji: 'se' },
      { kana: 'そ', romaji: 'so' },
    ],
  },
  {
    row: 'た行',
    order: 4,
    characters: [
      { kana: 'た', romaji: 'ta' },
      { kana: 'ち', romaji: 'chi' },
      { kana: 'つ', romaji: 'tsu' },
      { kana: 'て', romaji: 'te' },
      { kana: 'と', romaji: 'to' },
    ],
  },
  {
    row: 'な行',
    order: 5,
    characters: [
      { kana: 'な', romaji: 'na' },
      { kana: 'に', romaji: 'ni' },
      { kana: 'ぬ', romaji: 'nu' },
      { kana: 'ね', romaji: 'ne' },
      { kana: 'の', romaji: 'no' },
    ],
  },
  {
    row: 'は行',
    order: 6,
    characters: [
      { kana: 'は', romaji: 'ha' },
      { kana: 'ひ', romaji: 'hi' },
      { kana: 'ふ', romaji: 'fu' },
      { kana: 'へ', romaji: 'he' },
      { kana: 'ほ', romaji: 'ho' },
    ],
  },
  {
    row: 'ま行',
    order: 7,
    characters: [
      { kana: 'ま', romaji: 'ma' },
      { kana: 'み', romaji: 'mi' },
      { kana: 'む', romaji: 'mu' },
      { kana: 'め', romaji: 'me' },
      { kana: 'も', romaji: 'mo' },
    ],
  },
  {
    row: 'や行',
    order: 8,
    characters: [
      { kana: 'や', romaji: 'ya' },
      { kana: 'ゆ', romaji: 'yu' },
      { kana: 'よ', romaji: 'yo' },
    ],
  },
  {
    row: 'ら行',
    order: 9,
    characters: [
      { kana: 'ら', romaji: 'ra' },
      { kana: 'り', romaji: 'ri' },
      { kana: 'る', romaji: 'ru' },
      { kana: 'れ', romaji: 're' },
      { kana: 'ろ', romaji: 'ro' },
    ],
  },
  {
    row: 'わ行',
    order: 10,
    characters: [
      { kana: 'わ', romaji: 'wa' },
      { kana: 'を', romaji: 'wo' },
      { kana: 'ん', romaji: 'n' },
    ],
  },
  {
    row: '濁音',
    order: 11,
    characters: [
      { kana: 'が', romaji: 'ga' },
      { kana: 'ぎ', romaji: 'gi' },
      { kana: 'ぐ', romaji: 'gu' },
      { kana: 'げ', romaji: 'ge' },
      { kana: 'ご', romaji: 'go' },
      { kana: 'ざ', romaji: 'za' },
      { kana: 'じ', romaji: 'ji' },
      { kana: 'ず', romaji: 'zu' },
      { kana: 'ぜ', romaji: 'ze' },
      { kana: 'ぞ', romaji: 'zo' },
      { kana: 'だ', romaji: 'da' },
      { kana: 'ぢ', romaji: 'di' },
      { kana: 'づ', romaji: 'du' },
      { kana: 'で', romaji: 'de' },
      { kana: 'ど', romaji: 'do' },
      { kana: 'ば', romaji: 'ba' },
      { kana: 'び', romaji: 'bi' },
      { kana: 'ぶ', romaji: 'bu' },
      { kana: 'べ', romaji: 'be' },
      { kana: 'ぼ', romaji: 'bo' },
      { kana: 'ぱ', romaji: 'pa' },
      { kana: 'ぴ', romaji: 'pi' },
      { kana: 'ぷ', romaji: 'pu' },
      { kana: 'ぺ', romaji: 'pe' },
      { kana: 'ぽ', romaji: 'po' },
    ],
  },
  {
    row: '拗音',
    order: 12,
    characters: [
      { kana: 'きゃ', romaji: 'kya' },
      { kana: 'きゅ', romaji: 'kyu' },
      { kana: 'きょ', romaji: 'kyo' },
      { kana: 'しゃ', romaji: 'sha' },
      { kana: 'しゅ', romaji: 'shu' },
      { kana: 'しょ', romaji: 'sho' },
      { kana: 'ちゃ', romaji: 'cha' },
      { kana: 'ちゅ', romaji: 'chu' },
      { kana: 'ちょ', romaji: 'cho' },
      { kana: 'にゃ', romaji: 'nya' },
      { kana: 'にゅ', romaji: 'nyu' },
      { kana: 'にょ', romaji: 'nyo' },
      { kana: 'ひゃ', romaji: 'hya' },
      { kana: 'ひゅ', romaji: 'hyu' },
      { kana: 'ひょ', romaji: 'hyo' },
      { kana: 'みゃ', romaji: 'mya' },
      { kana: 'みゅ', romaji: 'myu' },
      { kana: 'みょ', romaji: 'myo' },
      { kana: 'りゃ', romaji: 'rya' },
      { kana: 'りゅ', romaji: 'ryu' },
      { kana: 'りょ', romaji: 'ryo' },
      { kana: 'ぎゃ', romaji: 'gya' },
      { kana: 'ぎゅ', romaji: 'gyu' },
      { kana: 'ぎょ', romaji: 'gyo' },
      { kana: 'じゃ', romaji: 'ja' },
      { kana: 'じゅ', romaji: 'ju' },
      { kana: 'じょ', romaji: 'jo' },
      { kana: 'びゃ', romaji: 'bya' },
      { kana: 'びゅ', romaji: 'byu' },
      { kana: 'びょ', romaji: 'byo' },
      { kana: 'ぴゃ', romaji: 'pya' },
      { kana: 'ぴゅ', romaji: 'pyu' },
      { kana: 'ぴょ', romaji: 'pyo' },
    ],
  },
]

const katakanaRows = [
  {
    row: 'ア行',
    order: 1,
    characters: [
      { kana: 'ア', romaji: 'a' },
      { kana: 'イ', romaji: 'i' },
      { kana: 'ウ', romaji: 'u' },
      { kana: 'エ', romaji: 'e' },
      { kana: 'オ', romaji: 'o' },
    ],
  },
  {
    row: 'カ行',
    order: 2,
    characters: [
      { kana: 'カ', romaji: 'ka' },
      { kana: 'キ', romaji: 'ki' },
      { kana: 'ク', romaji: 'ku' },
      { kana: 'ケ', romaji: 'ke' },
      { kana: 'コ', romaji: 'ko' },
    ],
  },
  {
    row: 'サ行',
    order: 3,
    characters: [
      { kana: 'サ', romaji: 'sa' },
      { kana: 'シ', romaji: 'shi' },
      { kana: 'ス', romaji: 'su' },
      { kana: 'セ', romaji: 'se' },
      { kana: 'ソ', romaji: 'so' },
    ],
  },
  {
    row: 'タ行',
    order: 4,
    characters: [
      { kana: 'タ', romaji: 'ta' },
      { kana: 'チ', romaji: 'chi' },
      { kana: 'ツ', romaji: 'tsu' },
      { kana: 'テ', romaji: 'te' },
      { kana: 'ト', romaji: 'to' },
    ],
  },
  {
    row: 'ナ行',
    order: 5,
    characters: [
      { kana: 'ナ', romaji: 'na' },
      { kana: 'ニ', romaji: 'ni' },
      { kana: 'ヌ', romaji: 'nu' },
      { kana: 'ネ', romaji: 'ne' },
      { kana: 'ノ', romaji: 'no' },
    ],
  },
  {
    row: 'ハ行',
    order: 6,
    characters: [
      { kana: 'ハ', romaji: 'ha' },
      { kana: 'ヒ', romaji: 'hi' },
      { kana: 'フ', romaji: 'fu' },
      { kana: 'ヘ', romaji: 'he' },
      { kana: 'ホ', romaji: 'ho' },
    ],
  },
  {
    row: 'マ行',
    order: 7,
    characters: [
      { kana: 'マ', romaji: 'ma' },
      { kana: 'ミ', romaji: 'mi' },
      { kana: 'ム', romaji: 'mu' },
      { kana: 'メ', romaji: 'me' },
      { kana: 'モ', romaji: 'mo' },
    ],
  },
  {
    row: 'ヤ行',
    order: 8,
    characters: [
      { kana: 'ヤ', romaji: 'ya' },
      { kana: 'ユ', romaji: 'yu' },
      { kana: 'ヨ', romaji: 'yo' },
    ],
  },
  {
    row: 'ラ行',
    order: 9,
    characters: [
      { kana: 'ラ', romaji: 'ra' },
      { kana: 'リ', romaji: 'ri' },
      { kana: 'ル', romaji: 'ru' },
      { kana: 'レ', romaji: 're' },
      { kana: 'ロ', romaji: 'ro' },
    ],
  },
  {
    row: 'ワ行',
    order: 10,
    characters: [
      { kana: 'ワ', romaji: 'wa' },
      { kana: 'ヲ', romaji: 'wo' },
      { kana: 'ン', romaji: 'n' },
    ],
  },
  {
    row: '濁音',
    order: 11,
    characters: [
      { kana: 'ガ', romaji: 'ga' },
      { kana: 'ギ', romaji: 'gi' },
      { kana: 'グ', romaji: 'gu' },
      { kana: 'ゲ', romaji: 'ge' },
      { kana: 'ゴ', romaji: 'go' },
      { kana: 'ザ', romaji: 'za' },
      { kana: 'ジ', romaji: 'ji' },
      { kana: 'ズ', romaji: 'zu' },
      { kana: 'ゼ', romaji: 'ze' },
      { kana: 'ゾ', romaji: 'zo' },
      { kana: 'ダ', romaji: 'da' },
      { kana: 'ヂ', romaji: 'di' },
      { kana: 'ヅ', romaji: 'du' },
      { kana: 'デ', romaji: 'de' },
      { kana: 'ド', romaji: 'do' },
      { kana: 'バ', romaji: 'ba' },
      { kana: 'ビ', romaji: 'bi' },
      { kana: 'ブ', romaji: 'bu' },
      { kana: 'ベ', romaji: 'be' },
      { kana: 'ボ', romaji: 'bo' },
      { kana: 'パ', romaji: 'pa' },
      { kana: 'ピ', romaji: 'pi' },
      { kana: 'プ', romaji: 'pu' },
      { kana: 'ペ', romaji: 'pe' },
      { kana: 'ポ', romaji: 'po' },
    ],
  },
  {
    row: '拗音',
    order: 12,
    characters: [
      { kana: 'キャ', romaji: 'kya' },
      { kana: 'キュ', romaji: 'kyu' },
      { kana: 'キョ', romaji: 'kyo' },
      { kana: 'シャ', romaji: 'sha' },
      { kana: 'シュ', romaji: 'shu' },
      { kana: 'ショ', romaji: 'sho' },
      { kana: 'チャ', romaji: 'cha' },
      { kana: 'チュ', romaji: 'chu' },
      { kana: 'チョ', romaji: 'cho' },
      { kana: 'ニャ', romaji: 'nya' },
      { kana: 'ニュ', romaji: 'nyu' },
      { kana: 'ニョ', romaji: 'nyo' },
      { kana: 'ヒャ', romaji: 'hya' },
      { kana: 'ヒュ', romaji: 'hyu' },
      { kana: 'ヒョ', romaji: 'hyo' },
      { kana: 'ミャ', romaji: 'mya' },
      { kana: 'ミュ', romaji: 'myu' },
      { kana: 'ミョ', romaji: 'myo' },
      { kana: 'リャ', romaji: 'rya' },
      { kana: 'リュ', romaji: 'ryu' },
      { kana: 'リョ', romaji: 'ryo' },
      { kana: 'ギャ', romaji: 'gya' },
      { kana: 'ギュ', romaji: 'gyu' },
      { kana: 'ギョ', romaji: 'gyo' },
      { kana: 'ジャ', romaji: 'ja' },
      { kana: 'ジュ', romaji: 'ju' },
      { kana: 'ジョ', romaji: 'jo' },
      { kana: 'ビャ', romaji: 'bya' },
      { kana: 'ビュ', romaji: 'byu' },
      { kana: 'ビョ', romaji: 'byo' },
      { kana: 'ピャ', romaji: 'pya' },
      { kana: 'ピュ', romaji: 'pyu' },
      { kana: 'ピョ', romaji: 'pyo' },
    ],
  },
]

// ---------------------------------------------------------------------------
// KANJI DATA — 30 N5 Kanji
// ---------------------------------------------------------------------------

const kanjiData = [
  {
    character: '日',
    onyomi: ['ニチ', 'ジツ'],
    kunyomi: ['ひ', 'か'],
    meaning: 'Mặt trời, ngày',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 4,
    radicals: [{ radical: '日', meaning: 'mặt trời' }],
    examples: [
      { word: '日曜日', reading: 'にちようび', meaning: 'Chủ nhật' },
      { word: '今日', reading: 'きょう', meaning: 'Hôm nay' },
      { word: '毎日', reading: 'まいにち', meaning: 'Mỗi ngày' },
    ],
    mnemonic: 'Hình vuông có thanh ngang ở giữa — cửa sổ nhìn ra mặt trời',
  },
  {
    character: '月',
    onyomi: ['ゲツ', 'ガツ'],
    kunyomi: ['つき'],
    meaning: 'Mặt trăng, tháng',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 4,
    radicals: [{ radical: '月', meaning: 'mặt trăng' }],
    examples: [
      { word: '月曜日', reading: 'げつようび', meaning: 'Thứ Hai' },
      { word: '今月', reading: 'こんげつ', meaning: 'Tháng này' },
      { word: '月', reading: 'つき', meaning: 'Mặt trăng' },
    ],
    mnemonic: 'Hình lưỡi liềm — mặt trăng khuyết nhìn ngang',
  },
  {
    character: '火',
    onyomi: ['カ'],
    kunyomi: ['ひ', 'ほ'],
    meaning: 'Lửa',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 4,
    radicals: [{ radical: '火', meaning: 'lửa' }],
    examples: [
      { word: '火曜日', reading: 'かようび', meaning: 'Thứ Ba' },
      { word: '火山', reading: 'かざん', meaning: 'Núi lửa' },
      { word: '花火', reading: 'はなび', meaning: 'Pháo hoa' },
    ],
    mnemonic: 'Người đang nhảy múa giữa ngọn lửa — lửa (火) bốc cao',
  },
  {
    character: '水',
    onyomi: ['スイ'],
    kunyomi: ['みず'],
    meaning: 'Nước',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 4,
    radicals: [{ radical: '水', meaning: 'nước' }],
    examples: [
      { word: '水曜日', reading: 'すいようび', meaning: 'Thứ Tư' },
      { word: '水', reading: 'みず', meaning: 'Nước' },
      { word: '水泳', reading: 'すいえい', meaning: 'Bơi lội' },
    ],
    mnemonic: 'Dòng sông chảy với 3 nhánh — nước chảy tự nhiên',
  },
  {
    character: '木',
    onyomi: ['モク', 'ボク'],
    kunyomi: ['き', 'こ'],
    meaning: 'Cây gỗ',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 4,
    radicals: [{ radical: '木', meaning: 'cây' }],
    examples: [
      { word: '木曜日', reading: 'もくようび', meaning: 'Thứ Năm' },
      { word: '木', reading: 'き', meaning: 'Cây' },
      { word: '木造', reading: 'もくぞう', meaning: 'Bằng gỗ' },
    ],
    mnemonic: 'Hình cây có thân, cành trên và rễ dưới — cây đang đứng',
  },
  {
    character: '金',
    onyomi: ['キン', 'コン'],
    kunyomi: ['かね', 'かな'],
    meaning: 'Vàng, tiền',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 8,
    radicals: [{ radical: '金', meaning: 'kim loại' }],
    examples: [
      { word: '金曜日', reading: 'きんようび', meaning: 'Thứ Sáu' },
      { word: 'お金', reading: 'おかね', meaning: 'Tiền' },
      { word: '金色', reading: 'きんいろ', meaning: 'Màu vàng' },
    ],
    mnemonic: 'Mỏ vàng dưới lòng đất — kim loại quý giá',
  },
  {
    character: '土',
    onyomi: ['ド', 'ト'],
    kunyomi: ['つち'],
    meaning: 'Đất',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 3,
    radicals: [{ radical: '土', meaning: 'đất' }],
    examples: [
      { word: '土曜日', reading: 'どようび', meaning: 'Thứ Bảy' },
      { word: '土地', reading: 'とち', meaning: 'Đất đai' },
      { word: '土', reading: 'つち', meaning: 'Đất' },
    ],
    mnemonic: 'Cây thập giá cắm xuống đất — đất vững chắc',
  },
  {
    character: '山',
    onyomi: ['サン'],
    kunyomi: ['やま'],
    meaning: 'Núi',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 3,
    radicals: [{ radical: '山', meaning: 'núi' }],
    examples: [
      { word: '山', reading: 'やま', meaning: 'Núi' },
      { word: '富士山', reading: 'ふじさん', meaning: 'Núi Phú Sĩ' },
      { word: '山登り', reading: 'やまのぼり', meaning: 'Leo núi' },
    ],
    mnemonic: 'Ba đỉnh núi nhô lên — núi có nhiều đỉnh',
  },
  {
    character: '川',
    onyomi: ['セン'],
    kunyomi: ['かわ'],
    meaning: 'Sông',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 3,
    radicals: [{ radical: '川', meaning: 'sông' }],
    examples: [
      { word: '川', reading: 'かわ', meaning: 'Sông' },
      { word: '河川', reading: 'かせん', meaning: 'Sông ngòi' },
      { word: '川原', reading: 'かわら', meaning: 'Bãi sông' },
    ],
    mnemonic: 'Ba đường thẳng song song — dòng nước chảy xuôi',
  },
  {
    character: '田',
    onyomi: ['デン'],
    kunyomi: ['た'],
    meaning: 'Ruộng lúa',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 5,
    radicals: [{ radical: '田', meaning: 'ruộng' }],
    examples: [
      { word: '田んぼ', reading: 'たんぼ', meaning: 'Ruộng lúa' },
      { word: '田中', reading: 'たなか', meaning: 'Họ Tanaka' },
      { word: '水田', reading: 'すいでん', meaning: 'Ruộng ngập nước' },
    ],
    mnemonic: 'Ô vuông chia thành 4 mảnh — ruộng lúa được chia lô',
  },
  {
    character: '人',
    onyomi: ['ジン', 'ニン'],
    kunyomi: ['ひと'],
    meaning: 'Người',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 2,
    radicals: [{ radical: '人', meaning: 'người' }],
    examples: [
      { word: '人', reading: 'ひと', meaning: 'Người' },
      { word: '日本人', reading: 'にほんじん', meaning: 'Người Nhật' },
      { word: '人気', reading: 'にんき', meaning: 'Nổi tiếng' },
    ],
    mnemonic: 'Hai nét như hai chân đang bước — người đang đi',
  },
  {
    character: '口',
    onyomi: ['コウ', 'ク'],
    kunyomi: ['くち'],
    meaning: 'Miệng',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 3,
    radicals: [{ radical: '口', meaning: 'miệng' }],
    examples: [
      { word: '口', reading: 'くち', meaning: 'Miệng' },
      { word: '入口', reading: 'いりぐち', meaning: 'Lối vào' },
      { word: '出口', reading: 'でぐち', meaning: 'Lối ra' },
    ],
    mnemonic: 'Hình vuông nhỏ — miệng há ra',
  },
  {
    character: '手',
    onyomi: ['シュ'],
    kunyomi: ['て'],
    meaning: 'Tay',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 4,
    radicals: [{ radical: '手', meaning: 'tay' }],
    examples: [
      { word: '手', reading: 'て', meaning: 'Tay' },
      { word: '手紙', reading: 'てがみ', meaning: 'Thư' },
      { word: '上手', reading: 'じょうず', meaning: 'Giỏi' },
    ],
    mnemonic: 'Bàn tay xòe ra với các ngón tay — tay người',
  },
  {
    character: '目',
    onyomi: ['モク', 'ボク'],
    kunyomi: ['め'],
    meaning: 'Mắt',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 5,
    radicals: [{ radical: '目', meaning: 'mắt' }],
    examples: [
      { word: '目', reading: 'め', meaning: 'Mắt' },
      { word: '目標', reading: 'もくひょう', meaning: 'Mục tiêu' },
      { word: '注目', reading: 'ちゅうもく', meaning: 'Chú ý' },
    ],
    mnemonic: 'Hình con mắt nhìn thẳng — con ngươi trong mắt',
  },
  {
    character: '耳',
    onyomi: ['ジ'],
    kunyomi: ['みみ'],
    meaning: 'Tai',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 6,
    radicals: [{ radical: '耳', meaning: 'tai' }],
    examples: [
      { word: '耳', reading: 'みみ', meaning: 'Tai' },
      { word: '耳鼻科', reading: 'じびか', meaning: 'Khoa tai mũi' },
      { word: '耳元', reading: 'みみもと', meaning: 'Bên tai' },
    ],
    mnemonic: 'Hình cái tai với đường viền — tai đang lắng nghe',
  },
  {
    character: '足',
    onyomi: ['ソク'],
    kunyomi: ['あし', 'た'],
    meaning: 'Chân',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 7,
    radicals: [{ radical: '足', meaning: 'chân' }],
    examples: [
      { word: '足', reading: 'あし', meaning: 'Chân' },
      { word: '足りる', reading: 'たりる', meaning: 'Đủ' },
      { word: '満足', reading: 'まんぞく', meaning: 'Thỏa mãn' },
    ],
    mnemonic: 'Phần trên là đầu gối, phần dưới là bàn chân — cái chân',
  },
  {
    character: '車',
    onyomi: ['シャ'],
    kunyomi: ['くるま'],
    meaning: 'Xe',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 7,
    radicals: [{ radical: '車', meaning: 'xe' }],
    examples: [
      { word: '車', reading: 'くるま', meaning: 'Xe' },
      { word: '電車', reading: 'でんしゃ', meaning: 'Tàu điện' },
      { word: '自転車', reading: 'じてんしゃ', meaning: 'Xe đạp' },
    ],
    mnemonic: 'Nhìn từ trên xuống thấy bánh xe và trục — xe có bánh',
  },
  {
    character: '電',
    onyomi: ['デン'],
    kunyomi: [],
    meaning: 'Điện',
    jlptLevel: 'N5' as const,
    grade: 2,
    strokeCount: 13,
    radicals: [
      { radical: '雨', meaning: 'mưa' },
      { radical: '電', meaning: 'điện' },
    ],
    examples: [
      { word: '電車', reading: 'でんしゃ', meaning: 'Tàu điện' },
      { word: '電話', reading: 'でんわ', meaning: 'Điện thoại' },
      { word: '電気', reading: 'でんき', meaning: 'Điện' },
    ],
    mnemonic: 'Mưa (雨) tạo ra sét — điện từ bầu trời',
  },
  {
    character: '気',
    onyomi: ['キ', 'ケ'],
    kunyomi: [],
    meaning: 'Khí, tinh thần',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 6,
    radicals: [{ radical: '气', meaning: 'hơi khí' }],
    examples: [
      { word: '天気', reading: 'てんき', meaning: 'Thời tiết' },
      { word: '元気', reading: 'げんき', meaning: 'Khỏe mạnh' },
      { word: '気持ち', reading: 'きもち', meaning: 'Cảm xúc' },
    ],
    mnemonic: 'Hơi nước bốc lên — khí tràn ra ngoài',
  },
  {
    character: '学',
    onyomi: ['ガク'],
    kunyomi: ['まな'],
    meaning: 'Học',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 8,
    radicals: [
      { radical: '子', meaning: 'đứa trẻ' },
      { radical: '学', meaning: 'học' },
    ],
    examples: [
      { word: '学校', reading: 'がっこう', meaning: 'Trường học' },
      { word: '大学', reading: 'だいがく', meaning: 'Đại học' },
      { word: '学生', reading: 'がくせい', meaning: 'Học sinh/sinh viên' },
    ],
    mnemonic: 'Đứa trẻ (子) ngồi dưới mái nhà học bài — học sinh',
  },
  {
    character: '校',
    onyomi: ['コウ'],
    kunyomi: [],
    meaning: 'Trường học',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 10,
    radicals: [{ radical: '木', meaning: 'cây gỗ' }],
    examples: [
      { word: '学校', reading: 'がっこう', meaning: 'Trường học' },
      { word: '高校', reading: 'こうこう', meaning: 'Trường trung học phổ thông' },
      { word: '校長', reading: 'こうちょう', meaning: 'Hiệu trưởng' },
    ],
    mnemonic: 'Ngôi trường làm bằng gỗ (木) — trường học xưa',
  },
  {
    character: '先',
    onyomi: ['セン'],
    kunyomi: ['さき'],
    meaning: 'Trước, người đi trước',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 6,
    radicals: [{ radical: '先', meaning: 'trước' }],
    examples: [
      { word: '先生', reading: 'せんせい', meaning: 'Giáo viên' },
      { word: '先週', reading: 'せんしゅう', meaning: 'Tuần trước' },
      { word: '先輩', reading: 'せんぱい', meaning: 'Đàn anh/chị' },
    ],
    mnemonic: 'Người đi trước dẫn đường — tiên sinh, thầy giáo',
  },
  {
    character: '生',
    onyomi: ['セイ', 'ショウ'],
    kunyomi: ['い', 'う', 'は', 'お', 'き'],
    meaning: 'Sống, sinh ra',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 5,
    radicals: [{ radical: '生', meaning: 'sống' }],
    examples: [
      { word: '学生', reading: 'がくせい', meaning: 'Học sinh' },
      { word: '先生', reading: 'せんせい', meaning: 'Giáo viên' },
      { word: '誕生日', reading: 'たんじょうび', meaning: 'Sinh nhật' },
    ],
    mnemonic: 'Cây cỏ mọc từ đất — sự sống nảy sinh',
  },
  {
    character: '本',
    onyomi: ['ホン'],
    kunyomi: ['もと'],
    meaning: 'Sách, gốc',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 5,
    radicals: [{ radical: '木', meaning: 'cây' }],
    examples: [
      { word: '本', reading: 'ほん', meaning: 'Sách' },
      { word: '日本', reading: 'にほん', meaning: 'Nhật Bản' },
      { word: '本当', reading: 'ほんとう', meaning: 'Thật sự' },
    ],
    mnemonic: 'Cây (木) với đường gạch ở gốc — gốc rễ, nguồn gốc',
  },
  {
    character: '語',
    onyomi: ['ゴ'],
    kunyomi: ['かた'],
    meaning: 'Ngôn ngữ, nói',
    jlptLevel: 'N5' as const,
    grade: 2,
    strokeCount: 14,
    radicals: [
      { radical: '言', meaning: 'lời nói' },
      { radical: '吾', meaning: 'ta' },
    ],
    examples: [
      { word: '日本語', reading: 'にほんご', meaning: 'Tiếng Nhật' },
      { word: '語学', reading: 'ごがく', meaning: 'Ngoại ngữ' },
      { word: '物語', reading: 'ものがたり', meaning: 'Câu chuyện' },
    ],
    mnemonic: 'Lời nói (言) của bản thân (吾) — ngôn ngữ',
  },
  {
    character: '読',
    onyomi: ['ドク', 'トク'],
    kunyomi: ['よ'],
    meaning: 'Đọc',
    jlptLevel: 'N5' as const,
    grade: 2,
    strokeCount: 14,
    radicals: [
      { radical: '言', meaning: 'lời nói' },
      { radical: '売', meaning: 'bán' },
    ],
    examples: [
      { word: '読む', reading: 'よむ', meaning: 'Đọc' },
      { word: '読書', reading: 'どくしょ', meaning: 'Đọc sách' },
      { word: '音読み', reading: 'おんよみ', meaning: 'Âm On' },
    ],
    mnemonic: 'Nói (言) để bán (売) — đọc to để truyền đạt',
  },
  {
    character: '書',
    onyomi: ['ショ'],
    kunyomi: ['か'],
    meaning: 'Viết',
    jlptLevel: 'N5' as const,
    grade: 2,
    strokeCount: 10,
    radicals: [{ radical: '日', meaning: 'mặt trời' }],
    examples: [
      { word: '書く', reading: 'かく', meaning: 'Viết' },
      { word: '教科書', reading: 'きょうかしょ', meaning: 'Sách giáo khoa' },
      { word: '図書館', reading: 'としょかん', meaning: 'Thư viện' },
    ],
    mnemonic: 'Cây bút (聿) viết dưới mặt trời — viết chữ',
  },
  {
    character: '食',
    onyomi: ['ショク', 'ジキ'],
    kunyomi: ['た', 'く'],
    meaning: 'Ăn, thức ăn',
    jlptLevel: 'N5' as const,
    grade: 2,
    strokeCount: 9,
    radicals: [{ radical: '食', meaning: 'ăn' }],
    examples: [
      { word: '食べる', reading: 'たべる', meaning: 'Ăn' },
      { word: '食事', reading: 'しょくじ', meaning: 'Bữa ăn' },
      { word: '食堂', reading: 'しょくどう', meaning: 'Căn tin' },
    ],
    mnemonic: 'Cái nắp đậy trên cái bát — thức ăn được đậy lại',
  },
  {
    character: '飲',
    onyomi: ['イン'],
    kunyomi: ['の'],
    meaning: 'Uống',
    jlptLevel: 'N5' as const,
    grade: 3,
    strokeCount: 12,
    radicals: [
      { radical: '食', meaning: 'ăn' },
      { radical: '欠', meaning: 'thiếu, ngáp' },
    ],
    examples: [
      { word: '飲む', reading: 'のむ', meaning: 'Uống' },
      { word: '飲み物', reading: 'のみもの', meaning: 'Đồ uống' },
      { word: '飲食', reading: 'いんしょく', meaning: 'Ăn uống' },
    ],
    mnemonic: 'Ăn (食) mà miệng còn mở (欠) — uống vào',
  },
  {
    character: '見',
    onyomi: ['ケン'],
    kunyomi: ['み'],
    meaning: 'Nhìn, xem',
    jlptLevel: 'N5' as const,
    grade: 1,
    strokeCount: 7,
    radicals: [
      { radical: '目', meaning: 'mắt' },
      { radical: '儿', meaning: 'người' },
    ],
    examples: [
      { word: '見る', reading: 'みる', meaning: 'Xem, nhìn' },
      { word: '見物', reading: 'けんぶつ', meaning: 'Tham quan' },
      { word: '意見', reading: 'いけん', meaning: 'Ý kiến' },
    ],
    mnemonic: 'Con mắt (目) trên chân người (儿) — người đứng nhìn',
  },
]

// ---------------------------------------------------------------------------
// VOCAB UNITS & LESSONS
// ---------------------------------------------------------------------------

type ExerciseType = 'match' | 'translate' | 'kanjiRead' | 'kanaInput' | 'sentenceOrder'

interface Exercise {
  type: ExerciseType
  id: string
  [key: string]: unknown
}

interface VocabUnitData {
  title: string
  titleJa: string
  order: number
  lessons: {
    order: number
    title: string
    exercises: Exercise[]
  }[]
}

const vocabUnitsData: VocabUnitData[] = [
  {
    title: 'Chào hỏi',
    titleJa: '挨拶',
    order: 1,
    lessons: [
      {
        order: 1,
        title: 'Xin chào cơ bản',
        exercises: [
          {
            type: 'match',
            id: 'u1l1e1',
            pairs: [
              { japanese: 'おはようございます', vietnamese: 'Chào buổi sáng (lịch sự)' },
              { japanese: 'こんにちは', vietnamese: 'Xin chào (buổi trưa)' },
              { japanese: 'こんばんは', vietnamese: 'Chào buổi tối' },
              { japanese: 'おやすみなさい', vietnamese: 'Chúc ngủ ngon' },
            ],
          },
          {
            type: 'translate',
            id: 'u1l1e2',
            sentence: 'はじめまして。',
            answer: 'Rất vui được gặp bạn.',
            hint: 'Câu dùng khi gặp lần đầu',
          },
          {
            type: 'translate',
            id: 'u1l1e3',
            sentence: 'よろしくおねがいします。',
            answer: 'Xin hãy quan tâm giúp đỡ tôi.',
            hint: 'Câu dùng sau khi tự giới thiệu',
          },
          {
            type: 'kanaInput',
            id: 'u1l1e4',
            prompt: 'Gõ "xin chào (buổi trưa)" bằng Hiragana',
            answer: 'こんにちは',
          },
          {
            type: 'sentenceOrder',
            id: 'u1l1e5',
            words: ['は', 'こんにち'],
            answer: 'こんにちは',
            meaning: 'Xin chào',
          },
        ],
      },
      {
        order: 2,
        title: 'Tạm biệt',
        exercises: [
          {
            type: 'match',
            id: 'u1l2e1',
            pairs: [
              { japanese: 'さようなら', vietnamese: 'Tạm biệt (lâu dài)' },
              { japanese: 'じゃあね', vietnamese: 'Tạm biệt (thân mật)' },
              { japanese: 'またね', vietnamese: 'Gặp lại sau' },
              { japanese: 'いってきます', vietnamese: 'Tôi đi nhé (khi rời nhà)' },
            ],
          },
          {
            type: 'translate',
            id: 'u1l2e2',
            sentence: 'いってらっしゃい。',
            answer: 'Đi cẩn thận nhé / Bình an trở về nhé.',
            hint: 'Câu đáp lại khi ai đó rời nhà',
          },
          {
            type: 'translate',
            id: 'u1l2e3',
            sentence: 'ただいま。',
            answer: 'Tôi về rồi.',
            hint: 'Câu nói khi về nhà',
          },
          {
            type: 'kanaInput',
            id: 'u1l2e4',
            prompt: 'Gõ "tạm biệt" (lâu dài) bằng Hiragana',
            answer: 'さようなら',
          },
          {
            type: 'sentenceOrder',
            id: 'u1l2e5',
            words: ['また', 'ね'],
            answer: 'またね',
            meaning: 'Gặp lại sau',
          },
        ],
      },
      {
        order: 3,
        title: 'Cảm ơn & Xin lỗi',
        exercises: [
          {
            type: 'match',
            id: 'u1l3e1',
            pairs: [
              { japanese: 'ありがとうございます', vietnamese: 'Cảm ơn (lịch sự)' },
              { japanese: 'すみません', vietnamese: 'Xin lỗi / Thứ lỗi cho tôi' },
              { japanese: 'ごめんなさい', vietnamese: 'Tôi xin lỗi' },
              { japanese: 'どういたしまして', vietnamese: 'Không có gì' },
            ],
          },
          {
            type: 'translate',
            id: 'u1l3e2',
            sentence: 'どうぞよろしく。',
            answer: 'Xin hãy giúp đỡ tôi.',
            hint: 'Dạng thân mật của よろしくおねがいします',
          },
          {
            type: 'kanaInput',
            id: 'u1l3e3',
            prompt: 'Gõ "cảm ơn" (thông dụng) bằng Hiragana',
            answer: 'ありがとう',
          },
          {
            type: 'translate',
            id: 'u1l3e4',
            sentence: 'おねがいします。',
            answer: 'Làm ơn / Xin hãy…',
            hint: 'Câu dùng khi nhờ vả',
          },
          {
            type: 'sentenceOrder',
            id: 'u1l3e5',
            words: ['ありがとう', 'ございます'],
            answer: 'ありがとうございます',
            meaning: 'Cảm ơn bạn',
          },
        ],
      },
    ],
  },
  {
    title: 'Số đếm',
    titleJa: '数字',
    order: 2,
    lessons: [
      {
        order: 1,
        title: 'Số 1–10',
        exercises: [
          {
            type: 'match',
            id: 'u2l1e1',
            pairs: [
              { japanese: 'いち', vietnamese: '1' },
              { japanese: 'に', vietnamese: '2' },
              { japanese: 'さん', vietnamese: '3' },
              { japanese: 'し／よん', vietnamese: '4' },
            ],
          },
          {
            type: 'match',
            id: 'u2l1e2',
            pairs: [
              { japanese: 'ご', vietnamese: '5' },
              { japanese: 'ろく', vietnamese: '6' },
              { japanese: 'しち／なな', vietnamese: '7' },
              { japanese: 'はち', vietnamese: '8' },
            ],
          },
          {
            type: 'kanaInput',
            id: 'u2l1e3',
            prompt: 'Gõ số "9" bằng Hiragana',
            answer: 'きゅう',
          },
          {
            type: 'kanaInput',
            id: 'u2l1e4',
            prompt: 'Gõ số "10" bằng Hiragana',
            answer: 'じゅう',
          },
          {
            type: 'translate',
            id: 'u2l1e5',
            sentence: 'りんごが３つあります。',
            answer: 'Có 3 quả táo.',
            hint: 'つ là bộ đếm đồ vật',
          },
        ],
      },
      {
        order: 2,
        title: 'Số 11–100',
        exercises: [
          {
            type: 'translate',
            id: 'u2l2e1',
            sentence: 'じゅういち',
            answer: '11',
            hint: 'じゅう (10) + いち (1)',
          },
          {
            type: 'translate',
            id: 'u2l2e2',
            sentence: 'にじゅうご',
            answer: '25',
            hint: 'に (2) + じゅう (10) + ご (5)',
          },
          {
            type: 'kanaInput',
            id: 'u2l2e3',
            prompt: 'Gõ số "100" bằng Hiragana',
            answer: 'ひゃく',
          },
          {
            type: 'match',
            id: 'u2l2e4',
            pairs: [
              { japanese: 'じゅう', vietnamese: '10' },
              { japanese: 'にじゅう', vietnamese: '20' },
              { japanese: 'さんじゅう', vietnamese: '30' },
              { japanese: 'ひゃく', vietnamese: '100' },
            ],
          },
          {
            type: 'sentenceOrder',
            id: 'u2l2e5',
            words: ['じゅう', 'に'],
            answer: 'じゅうに',
            meaning: '12',
          },
        ],
      },
      {
        order: 3,
        title: 'Bộ đếm',
        exercises: [
          {
            type: 'match',
            id: 'u2l3e1',
            pairs: [
              { japanese: 'いっぽん', vietnamese: '1 cái (dài, mỏng)' },
              { japanese: 'にまい', vietnamese: '2 tờ (dẹt)' },
              { japanese: 'さんびき', vietnamese: '3 con (thú nhỏ)' },
              { japanese: 'よんだい', vietnamese: '4 chiếc (xe, máy)' },
            ],
          },
          {
            type: 'translate',
            id: 'u2l3e2',
            sentence: 'えんぴつが２ほんあります。',
            answer: 'Có 2 cái bút chì.',
            hint: 'ほん là bộ đếm vật dài',
          },
          {
            type: 'translate',
            id: 'u2l3e3',
            sentence: 'ねこが１ぴきいます。',
            answer: 'Có 1 con mèo.',
            hint: 'ひき/ぴき là bộ đếm động vật nhỏ',
          },
          {
            type: 'kanaInput',
            id: 'u2l3e4',
            prompt: 'Gõ "3 tờ giấy" bằng Hiragana (bộ đếm tờ giấy)',
            answer: 'さんまい',
          },
          {
            type: 'sentenceOrder',
            id: 'u2l3e5',
            words: ['が', 'ほん', 'ご', 'あります', 'さつ'],
            answer: 'ごさつあります',
            meaning: 'Có 5 cuốn sách',
          },
        ],
      },
    ],
  },
  {
    title: 'Màu sắc',
    titleJa: '色',
    order: 3,
    lessons: [
      {
        order: 1,
        title: 'Màu cơ bản',
        exercises: [
          {
            type: 'match',
            id: 'u3l1e1',
            pairs: [
              { japanese: 'あか', vietnamese: 'Đỏ' },
              { japanese: 'あお', vietnamese: 'Xanh lam' },
              { japanese: 'きいろ', vietnamese: 'Vàng' },
              { japanese: 'しろ', vietnamese: 'Trắng' },
            ],
          },
          {
            type: 'match',
            id: 'u3l1e2',
            pairs: [
              { japanese: 'くろ', vietnamese: 'Đen' },
              { japanese: 'みどり', vietnamese: 'Xanh lá' },
              { japanese: 'むらさき', vietnamese: 'Tím' },
              { japanese: 'ちゃいろ', vietnamese: 'Nâu' },
            ],
          },
          {
            type: 'kanjiRead',
            id: 'u3l1e3',
            kanji: '赤',
            options: ['あか', 'あお', 'しろ', 'くろ'],
            answer: 'あか',
            meaning: 'màu đỏ',
          },
          {
            type: 'kanaInput',
            id: 'u3l1e4',
            prompt: 'Gõ màu "xanh lam" bằng Hiragana',
            answer: 'あおい',
          },
          {
            type: 'translate',
            id: 'u3l1e5',
            sentence: 'そのかばんはくろいです。',
            answer: 'Cái túi đó màu đen.',
            hint: 'くろい là tính từ đuôi い của くろ',
          },
        ],
      },
      {
        order: 2,
        title: 'Mô tả màu sắc',
        exercises: [
          {
            type: 'translate',
            id: 'u3l2e1',
            sentence: 'あのはなはなんいろですか。',
            answer: 'Bông hoa kia màu gì vậy?',
            hint: 'なんいろ = màu gì',
          },
          {
            type: 'translate',
            id: 'u3l2e2',
            sentence: 'そらはあおいです。',
            answer: 'Bầu trời màu xanh.',
            hint: 'そら = bầu trời',
          },
          {
            type: 'match',
            id: 'u3l2e3',
            pairs: [
              { japanese: 'あかい', vietnamese: 'Đỏ (tính từ)' },
              { japanese: 'あおい', vietnamese: 'Xanh lam (tính từ)' },
              { japanese: 'しろい', vietnamese: 'Trắng (tính từ)' },
              { japanese: 'くろい', vietnamese: 'Đen (tính từ)' },
            ],
          },
          {
            type: 'kanaInput',
            id: 'u3l2e4',
            prompt: 'Gõ "màu hồng" bằng Hiragana',
            answer: 'ももいろ',
          },
          {
            type: 'sentenceOrder',
            id: 'u3l2e5',
            words: ['は', 'です', 'きいろ', 'バナナ'],
            answer: 'バナナはきいろです',
            meaning: 'Chuối màu vàng',
          },
        ],
      },
      {
        order: 3,
        title: 'Màu sắc nâng cao',
        exercises: [
          {
            type: 'match',
            id: 'u3l3e1',
            pairs: [
              { japanese: 'オレンジ', vietnamese: 'Cam' },
              { japanese: 'ピンク', vietnamese: 'Hồng' },
              { japanese: 'グレー', vietnamese: 'Xám' },
              { japanese: 'ベージュ', vietnamese: 'Be' },
            ],
          },
          {
            type: 'translate',
            id: 'u3l3e2',
            sentence: 'わたしはあかいくるまがすきです。',
            answer: 'Tôi thích xe màu đỏ.',
            hint: 'すき = thích',
          },
          {
            type: 'kanjiRead',
            id: 'u3l3e3',
            kanji: '白',
            options: ['しろ', 'あか', 'みどり', 'きいろ'],
            answer: 'しろ',
            meaning: 'màu trắng',
          },
          {
            type: 'translate',
            id: 'u3l3e4',
            sentence: 'このシャツはなんいろですか。',
            answer: 'Áo sơ mi này màu gì vậy?',
            hint: 'シャツ = áo sơ mi',
          },
          {
            type: 'kanaInput',
            id: 'u3l3e5',
            prompt: 'Gõ "màu xám" bằng Katakana',
            answer: 'グレー',
          },
        ],
      },
    ],
  },
  {
    title: 'Gia đình',
    titleJa: '家族',
    order: 4,
    lessons: [
      {
        order: 1,
        title: 'Thành viên gia đình',
        exercises: [
          {
            type: 'match',
            id: 'u4l1e1',
            pairs: [
              { japanese: 'ちち', vietnamese: 'Bố (của tôi)' },
              { japanese: 'はは', vietnamese: 'Mẹ (của tôi)' },
              { japanese: 'あに', vietnamese: 'Anh (của tôi)' },
              { japanese: 'あね', vietnamese: 'Chị (của tôi)' },
            ],
          },
          {
            type: 'match',
            id: 'u4l1e2',
            pairs: [
              { japanese: 'おとうと', vietnamese: 'Em trai' },
              { japanese: 'いもうと', vietnamese: 'Em gái' },
              { japanese: 'そふ', vietnamese: 'Ông nội/ngoại (của tôi)' },
              { japanese: 'そぼ', vietnamese: 'Bà nội/ngoại (của tôi)' },
            ],
          },
          {
            type: 'translate',
            id: 'u4l1e3',
            sentence: 'わたしのかぞくはよにんです。',
            answer: 'Gia đình tôi có 4 người.',
            hint: 'よにん = 4 người',
          },
          {
            type: 'kanaInput',
            id: 'u4l1e4',
            prompt: 'Gõ "gia đình" bằng Hiragana',
            answer: 'かぞく',
          },
          {
            type: 'kanjiRead',
            id: 'u4l1e5',
            kanji: '父',
            options: ['ちち', 'はは', 'あに', 'あね'],
            answer: 'ちち',
            meaning: 'bố (của tôi)',
          },
        ],
      },
      {
        order: 2,
        title: 'Kính ngữ gia đình',
        exercises: [
          {
            type: 'match',
            id: 'u4l2e1',
            pairs: [
              { japanese: 'おとうさん', vietnamese: 'Bố (của người khác / xưng hô lịch sự)' },
              { japanese: 'おかあさん', vietnamese: 'Mẹ (của người khác / xưng hô lịch sự)' },
              { japanese: 'おにいさん', vietnamese: 'Anh (của người khác / xưng hô lịch sự)' },
              { japanese: 'おねえさん', vietnamese: 'Chị (của người khác / xưng hô lịch sự)' },
            ],
          },
          {
            type: 'translate',
            id: 'u4l2e2',
            sentence: 'おかあさんはどちらですか。',
            answer: 'Mẹ (của bạn) ở đâu vậy?',
            hint: 'どちら là cách hỏi lịch sự hơn どこ',
          },
          {
            type: 'translate',
            id: 'u4l2e3',
            sentence: 'ちちはかいしゃいんです。',
            answer: 'Bố tôi là nhân viên công ty.',
            hint: 'かいしゃいん = nhân viên công ty',
          },
          {
            type: 'kanaInput',
            id: 'u4l2e4',
            prompt: 'Gõ "em trai" bằng Hiragana',
            answer: 'おとうと',
          },
          {
            type: 'sentenceOrder',
            id: 'u4l2e5',
            words: ['は', 'おかあさん', 'です', 'せんせい'],
            answer: 'おかあさんはせんせいです',
            meaning: 'Mẹ là giáo viên',
          },
        ],
      },
      {
        order: 3,
        title: 'Nói về gia đình',
        exercises: [
          {
            type: 'translate',
            id: 'u4l3e1',
            sentence: 'きょうだいはいますか。',
            answer: 'Bạn có anh chị em không?',
            hint: 'きょうだい = anh chị em',
          },
          {
            type: 'translate',
            id: 'u4l3e2',
            sentence: 'あにはにほんにいます。',
            answer: 'Anh tôi đang ở Nhật Bản.',
            hint: 'います = có mặt (người, động vật)',
          },
          {
            type: 'match',
            id: 'u4l3e3',
            pairs: [
              { japanese: 'かのじょ', vietnamese: 'Cô ấy / bạn gái' },
              { japanese: 'かれ', vietnamese: 'Anh ấy / bạn trai' },
              { japanese: 'ひとりっこ', vietnamese: 'Con một' },
              { japanese: 'かぞく', vietnamese: 'Gia đình' },
            ],
          },
          {
            type: 'kanaInput',
            id: 'u4l3e4',
            prompt: 'Gõ "em gái" bằng Hiragana',
            answer: 'いもうと',
          },
          {
            type: 'sentenceOrder',
            id: 'u4l3e5',
            words: ['は', 'が', 'わたし', 'ふたり', 'きょうだい', 'います'],
            answer: 'わたしはきょうだいがふたりいます',
            meaning: 'Tôi có 2 anh chị em',
          },
        ],
      },
    ],
  },
  {
    title: 'Thức ăn',
    titleJa: '食べ物',
    order: 5,
    lessons: [
      {
        order: 1,
        title: 'Thức ăn cơ bản',
        exercises: [
          {
            type: 'match',
            id: 'u5l1e1',
            pairs: [
              { japanese: 'ごはん', vietnamese: 'Cơm' },
              { japanese: 'パン', vietnamese: 'Bánh mì' },
              { japanese: 'さかな', vietnamese: 'Cá' },
              { japanese: 'にく', vietnamese: 'Thịt' },
            ],
          },
          {
            type: 'match',
            id: 'u5l1e2',
            pairs: [
              { japanese: 'たまご', vietnamese: 'Trứng' },
              { japanese: 'やさい', vietnamese: 'Rau' },
              { japanese: 'くだもの', vietnamese: 'Hoa quả' },
              { japanese: 'おちゃ', vietnamese: 'Trà' },
            ],
          },
          {
            type: 'kanjiRead',
            id: 'u5l1e3',
            kanji: '食べ物',
            options: ['たべもの', 'のみもの', 'おちゃ', 'ごはん'],
            answer: 'たべもの',
            meaning: 'thức ăn',
          },
          {
            type: 'kanaInput',
            id: 'u5l1e4',
            prompt: 'Gõ "ramen" bằng Katakana',
            answer: 'ラーメン',
          },
          {
            type: 'translate',
            id: 'u5l1e5',
            sentence: 'すしがだいすきです。',
            answer: 'Tôi rất thích sushi.',
            hint: 'だいすき = rất thích',
          },
        ],
      },
      {
        order: 2,
        title: 'Uống',
        exercises: [
          {
            type: 'match',
            id: 'u5l2e1',
            pairs: [
              { japanese: 'みず', vietnamese: 'Nước' },
              { japanese: 'コーヒー', vietnamese: 'Cà phê' },
              { japanese: 'ジュース', vietnamese: 'Nước ép' },
              { japanese: 'ビール', vietnamese: 'Bia' },
            ],
          },
          {
            type: 'translate',
            id: 'u5l2e2',
            sentence: 'なにをのみますか。',
            answer: 'Bạn uống gì vậy?',
            hint: 'のむ = uống',
          },
          {
            type: 'translate',
            id: 'u5l2e3',
            sentence: 'みずをいっぱいのんでください。',
            answer: 'Hãy uống một ly nước.',
            hint: 'いっぱい = một ly / một lượng đầy',
          },
          {
            type: 'kanaInput',
            id: 'u5l2e4',
            prompt: 'Gõ "trà" bằng Hiragana',
            answer: 'おちゃ',
          },
          {
            type: 'kanjiRead',
            id: 'u5l2e5',
            kanji: '飲み物',
            options: ['のみもの', 'たべもの', 'おちゃ', 'みず'],
            answer: 'のみもの',
            meaning: 'đồ uống',
          },
        ],
      },
      {
        order: 3,
        title: 'Nhà hàng',
        exercises: [
          {
            type: 'translate',
            id: 'u5l3e1',
            sentence: 'メニューをみせてください。',
            answer: 'Cho tôi xem thực đơn.',
            hint: 'メニュー = thực đơn',
          },
          {
            type: 'translate',
            id: 'u5l3e2',
            sentence: 'これをください。',
            answer: 'Cho tôi cái này.',
            hint: 'ください = xin hãy cho tôi',
          },
          {
            type: 'match',
            id: 'u5l3e3',
            pairs: [
              { japanese: 'おいしい', vietnamese: 'Ngon' },
              { japanese: 'まずい', vietnamese: 'Dở' },
              { japanese: 'からい', vietnamese: 'Cay' },
              { japanese: 'あまい', vietnamese: 'Ngọt' },
            ],
          },
          {
            type: 'kanaInput',
            id: 'u5l3e4',
            prompt: 'Gõ "ngon" bằng Hiragana',
            answer: 'おいしい',
          },
          {
            type: 'sentenceOrder',
            id: 'u5l3e5',
            words: ['は', 'この', 'ラーメン', 'おいしい', 'です'],
            answer: 'このラーメンはおいしいです',
            meaning: 'Ramen này ngon',
          },
        ],
      },
    ],
  },
  {
    title: 'Động từ',
    titleJa: '動詞',
    order: 6,
    lessons: [
      {
        order: 1,
        title: 'Động từ hành động',
        exercises: [
          {
            type: 'match',
            id: 'u6l1e1',
            pairs: [
              { japanese: 'たべる', vietnamese: 'Ăn' },
              { japanese: 'のむ', vietnamese: 'Uống' },
              { japanese: 'みる', vietnamese: 'Xem, nhìn' },
              { japanese: 'きく', vietnamese: 'Nghe' },
            ],
          },
          {
            type: 'match',
            id: 'u6l1e2',
            pairs: [
              { japanese: 'よむ', vietnamese: 'Đọc' },
              { japanese: 'かく', vietnamese: 'Viết' },
              { japanese: 'はなす', vietnamese: 'Nói' },
              { japanese: 'かう', vietnamese: 'Mua' },
            ],
          },
          {
            type: 'kanjiRead',
            id: 'u6l1e3',
            kanji: '食べる',
            options: ['たべる', 'のむ', 'みる', 'かく'],
            answer: 'たべる',
            meaning: 'ăn',
          },
          {
            type: 'translate',
            id: 'u6l1e4',
            sentence: 'まいにちにほんごをべんきょうします。',
            answer: 'Mỗi ngày tôi học tiếng Nhật.',
            hint: 'べんきょうする = học',
          },
          {
            type: 'sentenceOrder',
            id: 'u6l1e5',
            words: ['を', 'ほん', 'よみます', 'わたしは'],
            answer: 'わたしはほんをよみます',
            meaning: 'Tôi đọc sách',
          },
        ],
      },
      {
        order: 2,
        title: 'Động từ di chuyển',
        exercises: [
          {
            type: 'match',
            id: 'u6l2e1',
            pairs: [
              { japanese: 'いく', vietnamese: 'Đi' },
              { japanese: 'くる', vietnamese: 'Đến' },
              { japanese: 'かえる', vietnamese: 'Trở về' },
              { japanese: 'のる', vietnamese: 'Lên xe, đi (phương tiện)' },
            ],
          },
          {
            type: 'translate',
            id: 'u6l2e2',
            sentence: 'がっこうへいきます。',
            answer: 'Tôi đi đến trường.',
            hint: 'へ = hướng đến',
          },
          {
            type: 'translate',
            id: 'u6l2e3',
            sentence: 'でんしゃでがっこうにきます。',
            answer: 'Tôi đến trường bằng tàu điện.',
            hint: 'で = bằng (phương tiện)',
          },
          {
            type: 'kanaInput',
            id: 'u6l2e4',
            prompt: 'Gõ "đi" (động từ) bằng Hiragana',
            answer: 'いく',
          },
          {
            type: 'sentenceOrder',
            id: 'u6l2e5',
            words: ['は', 'うち', 'かえります', 'ろくじに'],
            answer: 'ろくじにうちにかえります',
            meaning: 'Tôi về nhà lúc 6 giờ',
          },
        ],
      },
      {
        order: 3,
        title: 'Thể phủ định',
        exercises: [
          {
            type: 'translate',
            id: 'u6l3e1',
            sentence: 'たべません。',
            answer: 'Tôi không ăn.',
            hint: 'ません là thể phủ định lịch sự',
          },
          {
            type: 'translate',
            id: 'u6l3e2',
            sentence: 'にほんごがはなせません。',
            answer: 'Tôi không nói được tiếng Nhật.',
            hint: 'はなせる là thể tiềm năng của はなす',
          },
          {
            type: 'match',
            id: 'u6l3e3',
            pairs: [
              { japanese: 'いきます', vietnamese: 'Đi (khẳng định)' },
              { japanese: 'いきません', vietnamese: 'Không đi (phủ định)' },
              { japanese: 'たべます', vietnamese: 'Ăn (khẳng định)' },
              { japanese: 'たべません', vietnamese: 'Không ăn (phủ định)' },
            ],
          },
          {
            type: 'kanaInput',
            id: 'u6l3e4',
            prompt: 'Gõ thể phủ định của みます bằng Hiragana',
            answer: 'みません',
          },
          {
            type: 'sentenceOrder',
            id: 'u6l3e5',
            words: ['は', 'コーヒー', 'のみません', 'わたし'],
            answer: 'わたしはコーヒーをのみません',
            meaning: 'Tôi không uống cà phê',
          },
        ],
      },
    ],
  },
  {
    title: 'Tính từ',
    titleJa: '形容詞',
    order: 7,
    lessons: [
      {
        order: 1,
        title: 'Tính từ い',
        exercises: [
          {
            type: 'match',
            id: 'u7l1e1',
            pairs: [
              { japanese: 'おおきい', vietnamese: 'To, lớn' },
              { japanese: 'ちいさい', vietnamese: 'Nhỏ, bé' },
              { japanese: 'たかい', vietnamese: 'Cao / Đắt' },
              { japanese: 'やすい', vietnamese: 'Rẻ' },
            ],
          },
          {
            type: 'match',
            id: 'u7l1e2',
            pairs: [
              { japanese: 'あたらしい', vietnamese: 'Mới' },
              { japanese: 'ふるい', vietnamese: 'Cũ' },
              { japanese: 'いい', vietnamese: 'Tốt' },
              { japanese: 'わるい', vietnamese: 'Xấu, tệ' },
            ],
          },
          {
            type: 'translate',
            id: 'u7l1e3',
            sentence: 'このくるまはたかいです。',
            answer: 'Chiếc xe này đắt.',
            hint: 'たかい = cao / đắt',
          },
          {
            type: 'kanaInput',
            id: 'u7l1e4',
            prompt: 'Gõ "ngon" bằng Hiragana (tính từ い)',
            answer: 'おいしい',
          },
          {
            type: 'sentenceOrder',
            id: 'u7l1e5',
            words: ['です', 'ふるい', 'は', 'このほん'],
            answer: 'このほんはふるいです',
            meaning: 'Quyển sách này cũ',
          },
        ],
      },
      {
        order: 2,
        title: 'Tính từ な',
        exercises: [
          {
            type: 'match',
            id: 'u7l2e1',
            pairs: [
              { japanese: 'きれい', vietnamese: 'Đẹp / Sạch' },
              { japanese: 'しずか', vietnamese: 'Yên tĩnh' },
              { japanese: 'にぎやか', vietnamese: 'Náo nhiệt, sôi động' },
              { japanese: 'げんき', vietnamese: 'Khỏe mạnh' },
            ],
          },
          {
            type: 'translate',
            id: 'u7l2e2',
            sentence: 'このまちはにぎやかです。',
            answer: 'Thành phố này náo nhiệt.',
            hint: 'まち = thành phố, thị trấn',
          },
          {
            type: 'translate',
            id: 'u7l2e3',
            sentence: 'あのひとはきれいなひとです。',
            answer: 'Người kia là người đẹp.',
            hint: 'な được thêm vào trước danh từ',
          },
          {
            type: 'kanaInput',
            id: 'u7l2e4',
            prompt: 'Gõ "yên tĩnh" bằng Hiragana (tính từ な)',
            answer: 'しずか',
          },
          {
            type: 'sentenceOrder',
            id: 'u7l2e5',
            words: ['は', 'げんき', 'です', 'やまださん'],
            answer: 'やまださんはげんきです',
            meaning: 'Bạn Yamada khỏe mạnh',
          },
        ],
      },
      {
        order: 3,
        title: 'So sánh',
        exercises: [
          {
            type: 'translate',
            id: 'u7l3e1',
            sentence: 'このほうがおおきいです。',
            answer: 'Cái này to hơn.',
            hint: 'このほう = phía/cái này',
          },
          {
            type: 'translate',
            id: 'u7l3e2',
            sentence: 'AとBとどちらがすきですか。',
            answer: 'Giữa A và B, bạn thích cái nào hơn?',
            hint: 'どちら = cái nào (trong 2)',
          },
          {
            type: 'match',
            id: 'u7l3e3',
            pairs: [
              { japanese: 'もっとおおきい', vietnamese: 'To hơn' },
              { japanese: 'いちばん', vietnamese: 'Nhất, số một' },
              { japanese: 'おなじ', vietnamese: 'Giống nhau' },
              { japanese: 'ちがう', vietnamese: 'Khác nhau' },
            ],
          },
          {
            type: 'kanaInput',
            id: 'u7l3e4',
            prompt: 'Gõ "nhất" bằng Hiragana',
            answer: 'いちばん',
          },
          {
            type: 'sentenceOrder',
            id: 'u7l3e5',
            words: ['が', 'ラーメン', 'すし', 'より', 'すきです'],
            answer: 'すしよりラーメンがすきです',
            meaning: 'Tôi thích ramen hơn sushi',
          },
        ],
      },
    ],
  },
  {
    title: 'Thời gian',
    titleJa: '時間',
    order: 8,
    lessons: [
      {
        order: 1,
        title: 'Giờ',
        exercises: [
          {
            type: 'match',
            id: 'u8l1e1',
            pairs: [
              { japanese: 'いちじ', vietnamese: '1 giờ' },
              { japanese: 'にじ', vietnamese: '2 giờ' },
              { japanese: 'さんじ', vietnamese: '3 giờ' },
              { japanese: 'よじ', vietnamese: '4 giờ' },
            ],
          },
          {
            type: 'translate',
            id: 'u8l1e2',
            sentence: 'いまなんじですか。',
            answer: 'Bây giờ là mấy giờ?',
            hint: 'なんじ = mấy giờ',
          },
          {
            type: 'translate',
            id: 'u8l1e3',
            sentence: 'じゅうにじはんです。',
            answer: 'Bây giờ là 12 giờ rưỡi.',
            hint: 'はん = rưỡi',
          },
          {
            type: 'kanaInput',
            id: 'u8l1e4',
            prompt: 'Gõ "7 giờ" bằng Hiragana',
            answer: 'しちじ',
          },
          {
            type: 'kanjiRead',
            id: 'u8l1e5',
            kanji: '時間',
            options: ['じかん', 'にちじ', 'ひかん', 'じこく'],
            answer: 'じかん',
            meaning: 'thời gian',
          },
        ],
      },
      {
        order: 2,
        title: 'Ngày trong tuần',
        exercises: [
          {
            type: 'match',
            id: 'u8l2e1',
            pairs: [
              { japanese: 'げつようび', vietnamese: 'Thứ Hai' },
              { japanese: 'かようび', vietnamese: 'Thứ Ba' },
              { japanese: 'すいようび', vietnamese: 'Thứ Tư' },
              { japanese: 'もくようび', vietnamese: 'Thứ Năm' },
            ],
          },
          {
            type: 'match',
            id: 'u8l2e2',
            pairs: [
              { japanese: 'きんようび', vietnamese: 'Thứ Sáu' },
              { japanese: 'どようび', vietnamese: 'Thứ Bảy' },
              { japanese: 'にちようび', vietnamese: 'Chủ Nhật' },
              { japanese: 'なんようび', vietnamese: 'Thứ mấy' },
            ],
          },
          {
            type: 'translate',
            id: 'u8l2e3',
            sentence: 'きょうはなんようびですか。',
            answer: 'Hôm nay là thứ mấy?',
            hint: 'なんようび = thứ mấy',
          },
          {
            type: 'kanaInput',
            id: 'u8l2e4',
            prompt: 'Gõ "Thứ Sáu" bằng Hiragana',
            answer: 'きんようび',
          },
          {
            type: 'kanjiRead',
            id: 'u8l2e5',
            kanji: '月曜日',
            options: ['げつようび', 'かようび', 'すいようび', 'にちようび'],
            answer: 'げつようび',
            meaning: 'Thứ Hai',
          },
        ],
      },
      {
        order: 3,
        title: 'Tháng và năm',
        exercises: [
          {
            type: 'match',
            id: 'u8l3e1',
            pairs: [
              { japanese: 'いちがつ', vietnamese: 'Tháng 1' },
              { japanese: 'にがつ', vietnamese: 'Tháng 2' },
              { japanese: 'さんがつ', vietnamese: 'Tháng 3' },
              { japanese: 'しがつ', vietnamese: 'Tháng 4' },
            ],
          },
          {
            type: 'translate',
            id: 'u8l3e2',
            sentence: 'なんがつうまれですか。',
            answer: 'Bạn sinh tháng mấy?',
            hint: 'うまれ = sinh ra',
          },
          {
            type: 'kanaInput',
            id: 'u8l3e3',
            prompt: 'Gõ "tháng 12" bằng Hiragana',
            answer: 'じゅうにがつ',
          },
          {
            type: 'kanjiRead',
            id: 'u8l3e4',
            kanji: '今年',
            options: ['ことし', 'きょねん', 'らいねん', 'まいとし'],
            answer: 'ことし',
            meaning: 'năm nay',
          },
          {
            type: 'sentenceOrder',
            id: 'u8l3e5',
            words: ['は', 'たんじょうび', 'わたしの', 'ごがつ', 'とおかです'],
            answer: 'わたしのたんじょうびはごがつとおかです',
            meaning: 'Sinh nhật tôi là ngày 10 tháng 5',
          },
        ],
      },
    ],
  },
  {
    title: 'Địa điểm',
    titleJa: '場所',
    order: 9,
    lessons: [
      {
        order: 1,
        title: 'Nơi chốn',
        exercises: [
          {
            type: 'match',
            id: 'u9l1e1',
            pairs: [
              { japanese: 'がっこう', vietnamese: 'Trường học' },
              { japanese: 'びょういん', vietnamese: 'Bệnh viện' },
              { japanese: 'ゆうびんきょく', vietnamese: 'Bưu điện' },
              { japanese: 'ぎんこう', vietnamese: 'Ngân hàng' },
            ],
          },
          {
            type: 'match',
            id: 'u9l1e2',
            pairs: [
              { japanese: 'スーパー', vietnamese: 'Siêu thị' },
              { japanese: 'えき', vietnamese: 'Ga tàu' },
              { japanese: 'くうこう', vietnamese: 'Sân bay' },
              { japanese: 'ホテル', vietnamese: 'Khách sạn' },
            ],
          },
          {
            type: 'translate',
            id: 'u9l1e3',
            sentence: 'えきはどこですか。',
            answer: 'Ga tàu ở đâu vậy?',
            hint: 'どこ = ở đâu',
          },
          {
            type: 'kanaInput',
            id: 'u9l1e4',
            prompt: 'Gõ "trường học" bằng Hiragana',
            answer: 'がっこう',
          },
          {
            type: 'kanjiRead',
            id: 'u9l1e5',
            kanji: '学校',
            options: ['がっこう', 'びょういん', 'ぎんこう', 'えき'],
            answer: 'がっこう',
            meaning: 'trường học',
          },
        ],
      },
      {
        order: 2,
        title: 'Chỉ đường',
        exercises: [
          {
            type: 'match',
            id: 'u9l2e1',
            pairs: [
              { japanese: 'みぎ', vietnamese: 'Phải' },
              { japanese: 'ひだり', vietnamese: 'Trái' },
              { japanese: 'まっすぐ', vietnamese: 'Thẳng' },
              { japanese: 'まがる', vietnamese: 'Rẽ' },
            ],
          },
          {
            type: 'translate',
            id: 'u9l2e2',
            sentence: 'まっすぐいってください。',
            answer: 'Hãy đi thẳng.',
            hint: 'いってください = hãy đi',
          },
          {
            type: 'translate',
            id: 'u9l2e3',
            sentence: 'つぎのかどをひだりにまがってください。',
            answer: 'Hãy rẽ trái ở góc tiếp theo.',
            hint: 'つぎ = tiếp theo, かど = góc đường',
          },
          {
            type: 'kanaInput',
            id: 'u9l2e4',
            prompt: 'Gõ "bên phải" bằng Hiragana',
            answer: 'みぎ',
          },
          {
            type: 'sentenceOrder',
            id: 'u9l2e5',
            words: ['を', 'みぎ', 'まがります', 'つぎのかど', 'に'],
            answer: 'つぎのかどをみぎにまがります',
            meaning: 'Tôi rẽ phải ở góc tiếp theo',
          },
        ],
      },
      {
        order: 3,
        title: 'Trong nhà',
        exercises: [
          {
            type: 'match',
            id: 'u9l3e1',
            pairs: [
              { japanese: 'へや', vietnamese: 'Phòng' },
              { japanese: 'だいどころ', vietnamese: 'Bếp' },
              { japanese: 'トイレ', vietnamese: 'Nhà vệ sinh' },
              { japanese: 'リビング', vietnamese: 'Phòng khách' },
            ],
          },
          {
            type: 'translate',
            id: 'u9l3e2',
            sentence: 'わたしのへやはにかいにあります。',
            answer: 'Phòng tôi ở trên tầng hai.',
            hint: 'にかい = tầng 2',
          },
          {
            type: 'translate',
            id: 'u9l3e3',
            sentence: 'テレビはリビングにあります。',
            answer: 'Tivi ở phòng khách.',
            hint: 'あります = có (đồ vật)',
          },
          {
            type: 'kanaInput',
            id: 'u9l3e4',
            prompt: 'Gõ "phòng ngủ" bằng Hiragana',
            answer: 'しんしつ',
          },
          {
            type: 'sentenceOrder',
            id: 'u9l3e5',
            words: ['に', 'があります', 'だいどころ', 'れいぞうこ'],
            answer: 'だいどころにれいぞうこがあります',
            meaning: 'Có tủ lạnh trong bếp',
          },
        ],
      },
    ],
  },
  {
    title: 'Hội thoại hàng ngày',
    titleJa: '日常会話',
    order: 10,
    lessons: [
      {
        order: 1,
        title: 'Tự giới thiệu',
        exercises: [
          {
            type: 'translate',
            id: 'u10l1e1',
            sentence: 'わたしのなまえはグエンです。',
            answer: 'Tên tôi là Nguyen.',
            hint: 'なまえ = tên',
          },
          {
            type: 'translate',
            id: 'u10l1e2',
            sentence: 'ベトナムからきました。',
            answer: 'Tôi đến từ Việt Nam.',
            hint: 'から = từ',
          },
          {
            type: 'match',
            id: 'u10l1e3',
            pairs: [
              { japanese: 'しごと', vietnamese: 'Công việc' },
              { japanese: 'がくせい', vietnamese: 'Học sinh/sinh viên' },
              { japanese: 'かいしゃいん', vietnamese: 'Nhân viên công ty' },
              { japanese: 'せんせい', vietnamese: 'Giáo viên' },
            ],
          },
          {
            type: 'kanaInput',
            id: 'u10l1e4',
            prompt: 'Gõ "tên" bằng Hiragana',
            answer: 'なまえ',
          },
          {
            type: 'sentenceOrder',
            id: 'u10l1e5',
            words: ['は', 'がくせい', 'わたし', 'です'],
            answer: 'わたしはがくせいです',
            meaning: 'Tôi là học sinh',
          },
        ],
      },
      {
        order: 2,
        title: 'Mua sắm',
        exercises: [
          {
            type: 'translate',
            id: 'u10l2e1',
            sentence: 'これはいくらですか。',
            answer: 'Cái này giá bao nhiêu?',
            hint: 'いくら = bao nhiêu (tiền)',
          },
          {
            type: 'translate',
            id: 'u10l2e2',
            sentence: 'ごひゃくえんです。',
            answer: 'Năm trăm yên.',
            hint: 'えん = yên Nhật',
          },
          {
            type: 'match',
            id: 'u10l2e3',
            pairs: [
              { japanese: 'たかい', vietnamese: 'Đắt' },
              { japanese: 'やすい', vietnamese: 'Rẻ' },
              { japanese: 'みせ', vietnamese: 'Cửa hàng' },
              { japanese: 'レジ', vietnamese: 'Quầy thanh toán' },
            ],
          },
          {
            type: 'kanaInput',
            id: 'u10l2e4',
            prompt: 'Gõ "giá bao nhiêu" bằng Hiragana',
            answer: 'いくら',
          },
          {
            type: 'sentenceOrder',
            id: 'u10l2e5',
            words: ['を', 'ください', 'これ', 'ふたつ'],
            answer: 'これをふたつください',
            meaning: 'Cho tôi 2 cái này',
          },
        ],
      },
      {
        order: 3,
        title: 'Sức khỏe',
        exercises: [
          {
            type: 'translate',
            id: 'u10l3e1',
            sentence: 'かぜをひきました。',
            answer: 'Tôi bị cảm lạnh.',
            hint: 'かぜをひく = bị cảm',
          },
          {
            type: 'translate',
            id: 'u10l3e2',
            sentence: 'あたまがいたいです。',
            answer: 'Tôi bị đau đầu.',
            hint: 'いたい = đau',
          },
          {
            type: 'match',
            id: 'u10l3e3',
            pairs: [
              { japanese: 'びょうき', vietnamese: 'Bệnh' },
              { japanese: 'くすり', vietnamese: 'Thuốc' },
              { japanese: 'いしゃ', vietnamese: 'Bác sĩ' },
              { japanese: 'びょういん', vietnamese: 'Bệnh viện' },
            ],
          },
          {
            type: 'kanaInput',
            id: 'u10l3e4',
            prompt: 'Gõ "đau đầu" bằng Hiragana',
            answer: 'あたまがいたい',
          },
          {
            type: 'sentenceOrder',
            id: 'u10l3e5',
            words: ['に', 'びょういん', 'いきます', 'あした'],
            answer: 'あしたびょういんにいきます',
            meaning: 'Ngày mai tôi đi bệnh viện',
          },
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// WRITING TASKS
// ---------------------------------------------------------------------------

const writingTasksData = [
  {
    taskType: 'ESSAY' as const,
    prompt: 'Please write about your family in Japanese.',
    promptJa: 'あなたの家族について書いてください。',
    minChars: 150,
    timeLimit: 1200,
    jlptLevel: 'N5' as const,
    requireKeigo: false,
  },
  {
    taskType: 'DESCRIPTION' as const,
    prompt: 'Please describe your favorite food in Japanese.',
    promptJa: 'あなたの好きな食べ物について説明してください。',
    minChars: 100,
    timeLimit: 900,
    jlptLevel: 'N5' as const,
    requireKeigo: false,
  },
]

// ---------------------------------------------------------------------------
// SPEAKING SETS
// ---------------------------------------------------------------------------

const speakingSetsData = [
  {
    jlptLevel: 'N5' as const,
    taskType: 'INTERVIEW' as const,
    topic: 'Tự giới thiệu',
    topicJa: 'じこしょうかい',
    prompts: [
      { question: 'お名前は何ですか？', questionVi: 'Tên bạn là gì?' },
      { question: 'お仕事は何ですか？', questionVi: 'Công việc của bạn là gì?' },
      { question: '趣味は何ですか？', questionVi: 'Sở thích của bạn là gì?' },
    ],
    prepTimeSec: 30,
    speakTimeSec: 90,
  },
  {
    jlptLevel: 'N5' as const,
    taskType: 'INTERVIEW' as const,
    topic: 'Cuộc sống hàng ngày',
    topicJa: 'にちじょうせいかつ',
    prompts: [
      { question: '毎日何時に起きますか？', questionVi: 'Hàng ngày bạn thức dậy lúc mấy giờ?' },
      { question: '朝ごはんは何を食べますか？', questionVi: 'Bạn ăn gì vào bữa sáng?' },
    ],
    prepTimeSec: 30,
    speakTimeSec: 90,
  },
]

// ---------------------------------------------------------------------------
// MAIN SEED FUNCTION
// ---------------------------------------------------------------------------

async function main() {
  console.log('Starting seed...')

  // Skip if already seeded (idempotency check for production restarts)
  const existing = await prisma.kanaSet.count()
  if (existing > 0) {
    console.log(`Database already seeded (${existing} KanaSets found). Skipping.`)
    return
  }

  // --- 1. Clean existing data (reverse dependency order) ---
  console.log('Cleaning existing data...')
  await prisma.attempt.deleteMany()
  await prisma.kanaProgress.deleteMany()
  await prisma.kanjiProgress.deleteMany()
  await prisma.grammarProgress.deleteMany()
  await prisma.vocabProgress.deleteMany()
  await prisma.question.deleteMany()
  await prisma.readingTest.deleteMany()
  await prisma.listeningTest.deleteMany()
  await prisma.writingTask.deleteMany()
  await prisma.speakingSet.deleteMany()
  await prisma.vocabLesson.deleteMany()
  await prisma.vocabUnit.deleteMany()
  await prisma.grammarLesson.deleteMany()
  await prisma.grammarUnit.deleteMany()
  await prisma.kanjiCharacter.deleteMany()
  await prisma.kanaSet.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()
  console.log('Existing data cleaned.')

  // --- 2. Create Hiragana KanaSets ---
  console.log('Creating Hiragana kana sets...')
  for (const row of hiraganaRows) {
    await prisma.kanaSet.create({
      data: {
        type: 'HIRAGANA',
        row: row.row,
        characters: row.characters,
        order: row.order,
      },
    })
  }
  console.log(`Created ${hiraganaRows.length} Hiragana rows.`)

  // --- 3. Create Katakana KanaSets ---
  console.log('Creating Katakana kana sets...')
  for (const row of katakanaRows) {
    await prisma.kanaSet.create({
      data: {
        type: 'KATAKANA',
        row: row.row,
        characters: row.characters,
        order: row.order,
      },
    })
  }
  console.log(`Created ${katakanaRows.length} Katakana rows.`)

  // --- 4. Create Kanji characters ---
  console.log('Creating N5 Kanji characters...')
  for (const k of kanjiData) {
    await prisma.kanjiCharacter.create({ data: k })
  }
  console.log(`Created ${kanjiData.length} Kanji characters.`)

  // --- 5. Create Vocab units and lessons ---
  console.log('Creating Vocab units and lessons...')
  for (const unitData of vocabUnitsData) {
    const unit = await prisma.vocabUnit.create({
      data: {
        title: unitData.title,
        titleJa: unitData.titleJa,
        jlptLevel: 'N5',
        order: unitData.order,
      },
    })
    for (const lessonData of unitData.lessons) {
      await prisma.vocabLesson.create({
        data: {
          unitId: unit.id,
          order: lessonData.order,
          title: lessonData.title,
          exercises: JSON.parse(JSON.stringify(lessonData.exercises)),
        },
      })
    }
    console.log(`  Created unit "${unitData.titleJa}" with ${unitData.lessons.length} lessons.`)
  }
  console.log(`Created ${vocabUnitsData.length} Vocab units (${vocabUnitsData.reduce((s, u) => s + u.lessons.length, 0)} lessons total).`)

  // --- 6. Create Writing tasks ---
  console.log('Creating Writing tasks...')
  for (const task of writingTasksData) {
    await prisma.writingTask.create({ data: task })
  }
  console.log(`Created ${writingTasksData.length} Writing tasks.`)

  // --- 7. Create Speaking sets ---
  console.log('Creating Speaking sets...')
  for (const set of speakingSetsData) {
    await prisma.speakingSet.create({ data: set })
  }
  console.log(`Created ${speakingSetsData.length} Speaking sets.`)

  console.log('\nSeed completed successfully!')
  console.log('Summary:')
  console.log(`  - ${hiraganaRows.length} Hiragana rows`)
  console.log(`  - ${katakanaRows.length} Katakana rows`)
  console.log(`  - ${kanjiData.length} N5 Kanji characters`)
  console.log(`  - ${vocabUnitsData.length} Vocab units`)
  console.log(`  - ${vocabUnitsData.reduce((s, u) => s + u.lessons.length, 0)} Vocab lessons`)
  console.log(`  - ${writingTasksData.length} Writing tasks`)
  console.log(`  - ${speakingSetsData.length} Speaking sets`)
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
