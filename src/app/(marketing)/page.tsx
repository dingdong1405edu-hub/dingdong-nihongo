'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Headphones,
  Mic,
  PenLine,
  Sparkles,
  Star,
  Volume2,
  Zap,
} from 'lucide-react'

// ─── Animation variants ─────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Từ vựng & Ngữ pháp',
    titleJa: '語彙・文法',
    desc: 'Bài học Duolingo-style với XP, Hearts và Streak. Furigana toggle, Keigo exercises theo JLPT N5–N1.',
    color: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  {
    icon: <PenLine className="w-6 h-6" />,
    title: 'Kanji',
    titleJa: '漢字',
    desc: 'Stroke order animation, nhận biết bộ thủ (Radical), On/Kun reading cards, quiz vẽ nét tay.',
    color: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: 'Hiragana & Katakana',
    titleJa: 'ひらがな・カタカナ',
    desc: 'Bảng âm tương tác, flashcard mode, quiz nghe–chọn. Dakuten và tổ hợp âm (きゃ, しゅ...).',
    color: 'from-pink-500 to-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Đọc hiểu',
    titleJa: '読解',
    desc: 'Văn bản JLPT thật với furigana toggle, click-to-lookup, vertical text (縦書き). Timer + auto-grade.',
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: 'Nghe hiểu',
    titleJa: '聴解',
    desc: 'Audio hội thoại & monologue chuẩn JLPT, speed control 0.75×–1.5×, transcript ẩn cho đến khi nộp.',
    color: 'from-sky-500 to-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
  },
  {
    icon: <Mic className="w-6 h-6" />,
    title: 'Viết & Luyện nói',
    titleJa: '作文・スピーキング',
    desc: 'Viết luận AI chấm ngữ pháp, kính ngữ, mạch lạc. Luyện nói qua Deepgram + Claude — phát âm & lưu loát.',
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
]

const jlptLevels = [
  { level: 'N5', label: 'Sơ cấp', color: 'bg-green-100 text-green-800 border-green-200', desc: '800 từ vựng' },
  { level: 'N4', label: 'Sơ–Trung', color: 'bg-blue-100 text-blue-800 border-blue-200', desc: '1,500 từ vựng' },
  { level: 'N3', label: 'Trung cấp', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', desc: '3,000 từ vựng' },
  { level: 'N2', label: 'Trung–Cao', color: 'bg-orange-100 text-orange-800 border-orange-200', desc: '6,000 từ vựng' },
  { level: 'N1', label: 'Cao cấp', color: 'bg-red-100 text-red-800 border-red-200', desc: '10,000+ từ vựng' },
]

const stats = [
  { icon: <Volume2 className="w-5 h-5" />, value: '800+', label: 'từ vựng N5' },
  { icon: <PenLine className="w-5 h-5" />, value: '100+', label: 'Kanji N5' },
  { icon: <Zap className="w-5 h-5" />, value: 'AI', label: 'chấm điểm tức thì' },
  { icon: <Star className="w-5 h-5" />, value: '100%', label: 'Mobile-friendly' },
]

// Floating Japanese chars for hero decoration
const floatingChars = ['日', '本', '語', 'を', '学', 'ぼ', 'う', '！', 'あ', 'い', 'う', 'え', 'お']

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🔔</span>
          <span className="text-indigo-600">DingDong</span>
          <span className="font-japanese text-zinc-700">Nihongo</span>
        </Link>

        {/* Nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-600 font-medium">
          <Link href="#features" className="hover:text-indigo-600 transition-colors">
            Tính năng
          </Link>
          <Link href="#jlpt" className="hover:text-indigo-600 transition-colors">
            Lộ trình JLPT
          </Link>
          <Link href="#stats" className="hover:text-indigo-600 transition-colors">
            Thống kê
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium text-zinc-700 hover:text-indigo-600 px-4 py-2 rounded-lg transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="inline-flex text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Bắt đầu
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-indigo-50/40 to-pink-50/30 pt-16">
      {/* Floating characters */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        {floatingChars.map((char, i) => (
          <motion.span
            key={i}
            className="absolute font-japanese font-bold text-indigo-200/60"
            style={{
              left: `${(i * 7.3 + 5) % 95}%`,
              top: `${(i * 11.7 + 8) % 85}%`,
              fontSize: `${1.2 + (i % 3) * 0.7}rem`,
            }}
            animate={{
              y: [-10, 10, -10],
              rotate: [-5 + i * 2, 5 - i * 2, -5 + i * 2],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4 + (i % 4),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Học JLPT N5 → N1 · AI chấm điểm
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-japanese font-bold text-5xl sm:text-6xl md:text-7xl text-zinc-900 leading-tight mb-4"
        >
          学ぼう、日本語を。
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto mb-3"
        >
          Nền tảng học tiếng Nhật toàn diện theo chuẩn JLPT
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-base text-zinc-500 max-w-xl mx-auto mb-10"
        >
          Từ N5 đến N1 · Từ vựng, Kanji, Kana, Đọc hiểu, Nghe hiểu, Viết & Luyện nói
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            Bắt đầu miễn phí
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold px-8 py-3.5 rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            Xem demo
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-12 flex items-center justify-center gap-6 text-sm text-zinc-400"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
            Miễn phí 100%
          </span>
          <span className="w-px h-4 bg-zinc-200" />
          <span>Không cần thẻ tín dụng</span>
          <span className="w-px h-4 bg-zinc-200" />
          <span>Mobile-first</span>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Features ────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="font-japanese text-indigo-600 font-medium mb-2">
            機能
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            Mọi kỹ năng bạn cần
          </motion.h2>
          <motion.p variants={fadeUp} className="text-zinc-500 max-w-xl mx-auto">
            Sáu module học tập tích hợp, được thiết kế riêng cho người học tiếng Nhật từ Việt Nam.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className={`group rounded-2xl border ${f.border} ${f.bg} p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
            >
              <div
                className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} text-white mb-4 shadow-sm`}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-zinc-900 text-lg mb-0.5">{f.title}</h3>
              <p className="font-japanese text-xs text-zinc-400 mb-2">{f.titleJa}</p>
              <p className="text-sm text-zinc-600 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── JLPT levels ─────────────────────────────────────────────────────────────

function JLPTSection() {
  return (
    <section id="jlpt" className="py-20 sm:py-28 bg-gradient-to-br from-indigo-50/60 via-white to-pink-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="font-japanese text-indigo-600 font-medium mb-2">
            レベル
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            Lộ trình từ N5 đến N1
          </motion.h2>
          <motion.p variants={fadeUp} className="text-zinc-500 max-w-xl mx-auto">
            Học theo cấp độ JLPT chuẩn quốc tế. Nội dung được biên soạn bám sát đề thi thật.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-stretch"
        >
          {jlptLevels.map((lvl, i) => (
            <motion.div
              key={lvl.level}
              variants={fadeUp}
              custom={i}
              className="flex-1 min-w-0 bg-white rounded-2xl border border-zinc-100 p-5 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <span
                className={`inline-block text-sm font-bold px-3 py-1 rounded-full border mb-3 ${lvl.color}`}
              >
                {lvl.level}
              </span>
              <p className="font-semibold text-zinc-800 text-sm">{lvl.label}</p>
              <p className="text-xs text-zinc-400 mt-1">{lvl.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500 max-w-lg mx-auto origin-left"
        />
        <p className="text-center text-xs text-zinc-400 mt-2">N5 (Cơ bản) → N1 (Thành thạo)</p>
      </div>
    </section>
  )
}

// ─── Stats ───────────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <section id="stats" className="py-14 bg-indigo-600">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="text-center text-white"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl mb-3">
                {s.icon}
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{s.value}</p>
              <p className="text-indigo-200 text-sm mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── CTA Footer ──────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-white to-indigo-50/60">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p variants={fadeUp} className="font-japanese text-4xl font-bold text-zinc-900 mb-3">
            今すぐ始めよう！
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-zinc-800 mb-4">
            Bắt đầu học hôm nay
          </motion.h2>
          <motion.p variants={fadeUp} className="text-zinc-500 mb-8">
            Tạo tài khoản miễn phí và bắt đầu hành trình chinh phục tiếng Nhật của bạn ngay bây giờ.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              Bắt đầu miễn phí
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold px-8 py-3.5 rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              Đăng nhập
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
        <div className="flex items-center gap-2 font-medium text-zinc-600">
          <span className="text-xl">🔔</span>
          <span className="text-indigo-600 font-bold">DingDong</span>
          <span className="font-japanese">Nihongo</span>
        </div>
        <p>© {new Date().getFullYear()} DingDong Nihongo. Nền tảng học tiếng Nhật JLPT.</p>
      </div>
    </footer>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <JLPTSection />
      <StatsBar />
      <CTASection />
      <Footer />
    </div>
  )
}
