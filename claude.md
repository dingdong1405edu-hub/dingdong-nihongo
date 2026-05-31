# DingDong Nihongo — Nền tảng học tiếng Nhật

> Full-stack web app học tiếng Nhật với các module: Từ vựng & Ngữ pháp JLPT (Duolingo-style), Kanji (stroke order), Đọc hiểu, Nghe hiểu, Viết luận, Luyện nói — được chấm điểm bằng Claude AI.

---

## 1. Mục tiêu sản phẩm

Một nền tảng học tiếng Nhật tích hợp giúp người học:
- Học **từ vựng & ngữ pháp** theo chuẩn JLPT N5–N1 qua bài học ngắn, gamified như Duolingo (XP, streak, hearts, lessons unlock).
- Học **Hiragana / Katakana** từ đầu với bảng âm tương tác + quiz.
- Luyện **viết Kanji** — stroke order animation, nhận biết bộ thủ (radical).
- Luyện **Đọc hiểu** với văn bản tiếng Nhật + câu hỏi (theo format đề JLPT thật).
- Luyện **Nghe hiểu** với audio tiếng Nhật + câu hỏi (theo format JLPT).
- Luyện **Viết** (luận văn tiếng Nhật) — AI chấm ngữ pháp, từ vựng, kính ngữ, mạch lạc.
- Luyện **Nói** (phỏng vấn, trình bày ý kiến, mô tả ảnh) — ghi âm browser → AI chấm Phát âm, Ngữ điệu, Lưu loát.

Giao diện: **chuyên nghiệp, tối giản, mobile-first**, responsive cho mọi breakpoint.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 15** (App Router) + TypeScript |
| Styling | Tailwind CSS + **shadcn/ui** (Radix primitives) |
| Icons | lucide-react |
| Animation | framer-motion (Duolingo-style feedback + stroke order) |
| Database | **PostgreSQL** (Railway managed) |
| ORM | **Prisma** |
| Auth | **Auth.js (NextAuth v5)** — email/password + Google OAuth |
| AI Grading | **Anthropic Claude API** (`@anthropic-ai/sdk`, model `claude-sonnet-4-6`) |
| Speech-to-Text | **Deepgram API** (model `nova-2`, language `ja`) |
| Kanji Stroke | `hanzi-writer` (hỗ trợ cả Kanji Nhật) |
| Furigana | `kuroshiro` + `kuromoji` (Kanji → Hiragana/Romaji) |
| File Storage | Railway volume hoặc Cloudflare R2 cho audio uploads |
| State | React Server Components + Zustand cho client UI state |
| Forms | react-hook-form + zod |
| Deployment | **Railway** (web + Postgres), **GitHub** (source + CI) |

**Lý do chọn kuroshiro + kuromoji**: chạy server-side, không cần API ngoài, convert Kanji → Furigana chính xác với full morphological analysis.

---

## 3. Cấu trúc thư mục

```
dingdong-nihongo/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── audio/                   # Listening files
│   └── images/
├── src/
│   ├── app/
│   │   ├── (marketing)/         # Landing page
│   │   ├── (auth)/              # login, register
│   │   ├── (learn)/             # learner-facing routes
│   │   │   ├── dashboard/
│   │   │   ├── kana/            # Hiragana + Katakana
│   │   │   ├── vocab/[unitId]/
│   │   │   ├── grammar/[unitId]/
│   │   │   ├── kanji/[kanjiId]/  # luyện viết + nhận biết Kanji
│   │   │   ├── reading/[testId]/
│   │   │   ├── listening/[testId]/
│   │   │   ├── writing/[taskId]/
│   │   │   └── speaking/[setId]/
│   │   ├── admin/
│   │   │   ├── reading/
│   │   │   ├── listening/
│   │   │   ├── writing/
│   │   │   ├── speaking/
│   │   │   ├── vocab/
│   │   │   ├── grammar/
│   │   │   ├── kanji/
│   │   │   └── users/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── grade/writing/route.ts
│   │   │   ├── grade/speaking/route.ts
│   │   │   ├── transcribe/route.ts    # Deepgram ja
│   │   │   ├── furigana/route.ts      # kuroshiro convert
│   │   │   └── admin/.../route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── learn/               # LessonCard, HeartBar, XPBar, StreakFlame, FuriganaText
│   │   ├── kanji/               # StrokeOrderCanvas, RadicalBadge, KanjiQuiz
│   │   ├── kana/                # KanaGrid, KanaQuiz
│   │   ├── admin/
│   │   └── shared/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   ├── claude.ts            # Anthropic client + grading prompts tiếng Nhật
│   │   ├── deepgram.ts          # Speech-to-text ja
│   │   ├── furigana.ts          # kuroshiro server-side utils
│   │   └── utils.ts
│   ├── server/
│   │   └── actions/
│   └── types/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── package.json
├── railway.toml
└── README.md
```

---

## 4. Database Schema (Prisma)

```prisma
model User {
  id            String     @id @default(cuid())
  email         String     @unique
  name          String?
  passwordHash  String?
  role          Role       @default(LEARNER)
  xp            Int        @default(0)
  hearts        Int        @default(5)
  streakDays    Int        @default(0)
  jlptLevel     JLPTLevel  @default(N5)
  lastActiveAt  DateTime?
  createdAt     DateTime   @default(now())

  vocabProgress    VocabProgress[]
  grammarProgress  GrammarProgress[]
  kanjiProgress    KanjiProgress[]
  kanaProgress     KanaProgress[]
  attempts         Attempt[]
}

model VocabUnit {
  id          String     @id @default(cuid())
  title       String
  titleJa     String     // VD: "日常会話"
  jlptLevel   JLPTLevel  // N5 | N4 | N3 | N2 | N1
  order       Int
  lessons     VocabLesson[]
}

model VocabLesson {
  id        String      @id @default(cuid())
  unitId    String
  unit      VocabUnit   @relation(fields: [unitId], references: [id])
  order     Int
  exercises Json        // [{ type: "match" | "translate" | "listen" | "kanjiRead" | "kanaInput" | "sentenceOrder", ... }]
}

model KanjiCharacter {
  id          String    @id @default(cuid())
  character   String    @unique   // VD: "食"
  onyomi      Json                // âm On: ["ショク", "ジキ"]
  kunyomi     Json                // âm Kun: ["た.べる", "く.う"]
  meaning     String              // nghĩa tiếng Việt
  jlptLevel   JLPTLevel
  grade       Int?                // lớp học ở Nhật (1-6, 中学, etc.)
  strokeCount Int
  strokeOrder Json                // data cho hanzi-writer
  radicals    Json                // [{ radical: "食", meaning: "ăn" }]
  examples    Json                // [{ word: "食事", reading: "しょくじ", meaning: "bữa ăn" }]

  progress    KanjiProgress[]
}

model KanaSet {
  id        String    @id @default(cuid())
  type      KanaType  // HIRAGANA | KATAKANA
  row       String    // "あ行", "か行", ...
  characters Json     // [{ kana: "あ", romaji: "a" }, ...]
}

model GrammarUnit { /* tương tự VocabUnit, exercises gồm fill-blank, transform, keigo-convert */ }
model GrammarLesson { /* tương tự VocabLesson */ }

model ReadingTest {
  id          String    @id @default(cuid())
  title       String
  titleJa     String
  jlptLevel   JLPTLevel
  passage     String    @db.Text    // văn bản tiếng Nhật
  furigana    String?   @db.Text    // bản có furigana (HTML ruby)
  timeLimit   Int
  questions   Question[]
  createdAt   DateTime  @default(now())
}

model ListeningTest {
  id          String    @id @default(cuid())
  title       String
  jlptLevel   JLPTLevel
  audioUrl    String
  transcript  String?   @db.Text
  questions   Question[]
}

model Question {
  id            String       @id @default(cuid())
  type          QuestionType // MCQ | FILL_BLANK | TRUE_FALSE | MATCHING | SHORT_ANSWER
  prompt        String       @db.Text
  promptFurigana String?     @db.Text
  options       Json?
  correctAnswer Json
  readingId     String?
  listeningId   String?
}

model WritingTask {
  id          String          @id @default(cuid())
  taskType    WritingTaskType // ESSAY | OPINION | LETTER | DESCRIPTION
  prompt      String          @db.Text
  promptJa    String?         @db.Text
  imageUrl    String?
  minChars    Int
  timeLimit   Int
  jlptLevel   JLPTLevel
  requireKeigo Boolean        @default(false)  // có yêu cầu kính ngữ không
}

model SpeakingSet {
  id            String    @id @default(cuid())
  jlptLevel     JLPTLevel
  taskType      SpeakingTaskType  // INTERVIEW | PICTURE_DESC | OPINION | ROLEPLAY
  topic         String
  topicJa       String
  prompts       Json      // câu hỏi / tình huống
  prepTimeSec   Int       @default(30)
  speakTimeSec  Int       @default(90)
}

model Attempt {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  skill         Skill     // READING | LISTENING | WRITING | SPEAKING | VOCAB | GRAMMAR | KANJI | KANA
  refId         String
  rawAnswer     Json
  score         Float?
  feedback      Json?
  durationSec   Int?
  createdAt     DateTime  @default(now())
}

enum Role       { LEARNER ADMIN }
enum JLPTLevel  { N5 N4 N3 N2 N1 }
enum KanaType   { HIRAGANA KATAKANA }
enum Skill      { READING LISTENING WRITING SPEAKING VOCAB GRAMMAR KANJI KANA }
enum QuestionType { MCQ FILL_BLANK TRUE_FALSE MATCHING SHORT_ANSWER }
enum WritingTaskType { ESSAY OPINION LETTER DESCRIPTION }
enum SpeakingTaskType { INTERVIEW PICTURE_DESC OPINION ROLEPLAY }
```

---

## 5. Features chi tiết

### 5.1 Kana (Hiragana & Katakana)
- **Bảng âm tương tác**: grid あいうえお — click để nghe phát âm.
- **Flashcard mode**: xem Kana → đoán Romaji (hoặc ngược lại).
- **Quiz mode**: nghe âm → chọn Kana đúng.
- Dakuten (が、ざ...) và combination (きゃ、しゅ...) được tách thành bài riêng.
- Progress bar theo từng hàng (行).

### 5.2 Vocabulary & Grammar (Duolingo-style)
- **Unit → Lesson → Exercise** tree, unlock theo JLPT level.
- Exercise types:
  - **match**: nối từ tiếng Nhật ↔ nghĩa tiếng Việt
  - **translate**: dịch câu
  - **listen**: nghe → gõ/chọn từ nghe được
  - **kanjiRead**: chọn cách đọc đúng (On/Kun) cho Kanji
  - **kanaInput**: gõ từ bằng Hiragana/Katakana
  - **sentenceOrder**: sắp xếp từ thành câu (SOV word order)
  - **keigo**: chuyển thể thông thường → kính ngữ (敬語)
- **Furigana toggle**: hover/tap Kanji → hiện furigana.
- Hearts + XP + Streak animation.

### 5.3 Kanji
- **Stroke order animation** với `hanzi-writer` (hỗ trợ Kanji Nhật).
- **Radical breakdown**: hiển thị bộ thủ + nghĩa của từng bộ.
- **On/Kun reading cards**: card 2 mặt — mặt trước: Kanji, mặt sau: On + Kun + nghĩa + ví dụ.
- **Quiz mode**: vẽ nét tay hoặc chọn reading đúng.
- **Mnemonic helper**: gợi ý cách nhớ Kanji theo câu chuyện.

### 5.4 Reading
- Passage hiển thị với **furigana toggle** (ẩn mặc định ở N3+, bật ở N5-N4).
- **Click-to-lookup**: click vào từ → popup nghĩa + đọc + ví dụ.
- **Vertical text option** (縦書き) cho văn học/báo chí.
- Timer theo format JLPT thật.
- Submit → auto-grade + giải thích từng đáp án.

### 5.5 Listening
- Audio player, speed control 0.75x–1.5x.
- Format JLPT: cả đoạn hội thoại lẫn monologue.
- Transcript ẩn đến khi submit.
- Admin upload audio + transcript + questions.

### 5.6 Writing
- **ESSAY**: luận văn tự do theo chủ đề.
- **OPINION**: viết ý kiến cá nhân (format JLPT N2/N1).
- **LETTER**: viết thư/email (thể thức + kính ngữ).
- **DESCRIPTION**: mô tả ảnh/biểu đồ.
- Editor: ký tự counter (đếm cả Kana lẫn Kanji, bỏ space), autosave.
- Submit → Claude chấm:
  - **Ngữ pháp** (文法): cấu trúc câu, thể động từ.
  - **Từ vựng** (語彙): đa dạng từ, dùng đúng văn cảnh.
  - **Kính ngữ** (敬語): nếu task yêu cầu keigo.
  - **Mạch lạc** (文章の流れ): kết nối ý, paragraph structure.

### 5.7 Speaking
- **INTERVIEW**: câu hỏi cá nhân (shigoto, shumi, kazoku…).
- **PICTURE_DESC**: mô tả ảnh/tình huống bằng tiếng Nhật.
- **OPINION**: trình bày ý kiến về chủ đề xã hội (N2/N1).
- **ROLEPLAY**: tình huống nhập vai (mua đồ, đặt lịch hẹn…).
- MediaRecorder → Deepgram `ja` → Claude grade.
- Output:
  - **Phát âm** (発音): âm đặc trưng Nhật (つ、ら行, long vowels).
  - **Ngữ điệu / Pitch accent** (アクセント): disclaimer rõ — AI chỉ đánh giá qua transcript, không nghe trực tiếp pitch.
  - **Ngữ pháp nói** (話し言葉): dùng đúng thể (です/ます vs. plain).
  - **Lưu loát** (流暢さ): tốc độ, filler (あの、えーと), độ tự nhiên.

### 5.8 Admin Dashboard
- CRUD: Reading, Listening, Writing, Speaking, Vocab, Grammar, Kanji, Kana sets.
- **JLPT filter**: quản lý content theo N5–N1.
- Furigana auto-generate khi admin nhập văn bản (gọi `/api/furigana`).
- Upload audio + transcript.
- User management: xem list, set JLPT target, reset hearts.

---

## 6. AI Grading Prompts

Template trong [src/lib/claude.ts](src/lib/claude.ts):

**Writing system prompt**:
```
You are a certified JLPT Japanese language examiner.
Evaluate the following Japanese writing by a Vietnamese learner at JLPT {level} level.
{requireKeigo ? "This task requires polite/formal Japanese (敬語). Evaluate keigo usage separately." : ""}
Note: The learner's native language is Vietnamese.
Return structured JSON only.
```

**Speaking system prompt**:
```
You are a Japanese language speaking coach specializing in JLPT preparation.
Evaluate this transcript of a Vietnamese learner speaking Japanese at JLPT {level} level.
Note: Pitch accent evaluation is limited — assess based on transcript patterns only, not actual audio.
Return structured JSON only.
```

- Model: `claude-sonnet-4-6` (writing/speaking), `claude-haiku-4-5` (vocab feedback).
- **Prompt caching** cho system prompt + rubric.
- Temperature: 0.3.

Output schema Writing:
```json
{
  "score": 80,
  "criteria": {
    "grammar":     { "score": 78, "feedback": "...", "errors": ["..."] },
    "vocabulary":  { "score": 82, "feedback": "...", "suggestions": ["..."] },
    "keigo":       { "score": 75, "feedback": "...", "errors": ["..."] },
    "coherence":   { "score": 85, "feedback": "..." }
  },
  "annotations": [
    { "original": "...", "issue": "...", "correction": "...", "explanation": "..." }
  ],
  "correctedVersion": "..."
}
```

Output schema Speaking:
```json
{
  "score": 76,
  "criteria": {
    "pronunciation": { "score": 72, "errors": [{ "word": "...", "issue": "..." }] },
    "pitchAccent":   { "score": null, "note": "Cannot evaluate from transcript only" },
    "grammar":       { "score": 78, "errors": ["..."] },
    "fluency":       { "score": 80, "wordsPerMinute": 95, "fillerCount": 3, "feedback": "..." }
  },
  "transcript": "...",
  "overallFeedback": "..."
}
```

---

## 7. UI/UX Guidelines

- **Color palette**: primary indigo-600, accent sakura-pink (`#FFB7C5`), success green-500, neutral zinc.
- **Typography**:
  - UI latin: Inter
  - Tiếng Nhật: `Noto Sans JP` (Google Fonts, `font-display: swap`)
  - Vertical text: `writing-mode: vertical-rl` CSS khi cần縦書き
- **Furigana**: dùng HTML `<ruby>` tag:
  ```html
  <ruby>食<rt>た</rt></ruby>べる
  ```
- **Spacing**: Tailwind 4/8 scale.
- **Mobile-first**: test 375px.
- **JLPT level badges**: N5=xanh lá, N4=xanh dương, N3=vàng, N2=cam, N1=đỏ.
- **Kana grid**: monospace font cho alignment đẹp.
- **Loading**: skeleton. **Toasts**: sonner.

shadcn/ui bắt buộc: Button, Card, Dialog, Input, Textarea, Select, Toast, Tabs, Progress, Badge, Sheet.

---

## 8. Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dingdong_nihongo"

# Auth
AUTH_SECRET=""
AUTH_TRUST_HOST="true"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# Anthropic
ANTHROPIC_API_KEY=""

# Deepgram (Speech-to-Text tiếng Nhật)
DEEPGRAM_API_KEY=""

# Storage
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 9. Deployment — Railway + GitHub

### 9.1 `railway.toml`
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npx prisma generate && npx prisma migrate deploy && npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
restartPolicyType = "ON_FAILURE"
```

### 9.2 CI
- `.github/workflows/ci.yml`: lint + typecheck + prisma validate.
- Auto deploy khi push `main`.

---

## 10. Development Commands

```bash
npm install
cp .env.example .env.local
npx prisma migrate dev
npx prisma db seed              # seed N5 vocab (800 từ), Hiragana/Katakana, 100 Kanji N5

npm run dev                     # http://localhost:3000
npm run typecheck
npm run lint
npm run build && npm start

npx prisma studio
npx prisma migrate dev --name <change>
```

---

## 11. Roadmap thứ tự build

1. **Skeleton**: Next.js + TS + Tailwind + shadcn + Prisma + Auth.js.
2. **Auth**: email + Google login.
3. **DB schema + migrations**: seed Kana tables + N5 vocab (800 từ) + 100 Kanji N5.
4. **Learner dashboard**: XP, streak, hearts, JLPT target, module list.
5. **Kana module**: bảng âm tương tác + flashcard + quiz (Hiragana trước, Katakana sau).
6. **Vocab & Grammar Duolingo-style**: furigana tooltip + keigo exercises.
7. **Kanji module**: stroke order + radical + On/Kun quiz.
8. **Reading module**: passage + furigana toggle + click-to-lookup + auto-grade.
9. **Listening module**: audio player + questions.
10. **Writing module + AI grading**: editor + keigo checker + Claude.
11. **Speaking module + AI grading**: recorder + Deepgram ja + Claude.
12. **Admin dashboard**: CRUD + furigana auto-generate.
13. **Polish**: animations, vertical text option, mobile QA.
14. **Deploy**: Railway live + custom domain.

---

## 12. Coding Conventions

- **TypeScript strict**: không `any`, dùng `unknown` + type guard.
- **Server Actions** ưu tiên hơn API routes cho mutations.
- **Validation**: zod ở mọi boundary.
- **Error handling**: `{ ok, error }` + `toast.error()`.
- **File limits**: 1 component/file, >300 dòng thì tách.
- **Naming**: PascalCase components, camelCase utils, kebab-case routes.
- **Imports**: `@/` alias.
- **Encoding**: UTF-8 toàn bộ — Kanji, Kana, Romaji đều cần.
- Không tự ý thêm lib mới — hỏi trước.
- Không commit secrets.
- Migration mới cho mỗi schema change.
- **Test trước khi báo done**: `npm run typecheck && npm run build`.

---

## 13. Đặc thù tiếng Nhật — lưu ý khi code

- **3 bảng chữ**: Hiragana (ひらがな), Katakana (カタカナ), Kanji (漢字) — UI phải hiển thị đúng font cho cả 3.
- **IME support**: handle `compositionstart/end` events — không fire `onChange` trong khi user đang gõ IME.
- **Furigana server-side**: chạy `kuroshiro` + `kuromoji` trên server (nặng khi init, dùng singleton). Route `/api/furigana` cache kết quả theo text hash.
- **Vertical text**: CSS `writing-mode: vertical-rl; text-orientation: mixed;` — test trên Safari/iOS vì có quirks.
- **Pitch accent**: KHÔNG cố chấm pitch accent qua audio vì quá phức tạp. Chỉ note disclaimer trong feedback.
- **Keigo levels**: 丁寧語 (teineigo) → 尊敬語 (sonkeigo) → 謙譲語 (kenjōgo) — Claude prompt phải ghi rõ level nào được yêu cầu.
- **Long vowels**: ō (おう/おお), ū (うう) — Deepgram transcript hay bỏ sót, cần post-process.
- **Small tsu** (っ): doubled consonant — quan trọng về nghĩa (来た vs 切った), log transcript để debug.
- **Word segmentation**: tiếng Nhật không có space — dùng `kuromoji` tokenizer (đã có qua kuroshiro) để segment khi cần đếm từ.

---

## 14. Khi user yêu cầu thay đổi

- Thay đổi nhỏ (style, copy): làm trực tiếp.
- Feature mới / thay schema: plan ngắn → xác nhận → làm.
- Bug AI grading: kiểm tra prompt + log raw Claude response trước.
- User paste token: **không** echo lại, confirm "đã nhận" + lưu `.env.local`.

---

## 15. Liên hệ & ghi chú

- Owner: dingdong1405edu@gmail.com
- Tokens cần thiết: `ANTHROPIC_API_KEY`, `DEEPGRAM_API_KEY`, `RAILWAY_TOKEN`, `GITHUB_TOKEN`.
- Mọi quyết định kiến trúc lớn → hỏi user trước.
