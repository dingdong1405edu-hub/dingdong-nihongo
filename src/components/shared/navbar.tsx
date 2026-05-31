"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Menu,
  X,
  LayoutDashboard,
  Grid3X3,
  BookOpen,
  GraduationCap,
  PenTool,
  FileText,
  Headphones,
  Edit3,
  Mic,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HeartsDisplay } from "@/components/shared/hearts-display"
import { cn } from "@/lib/utils"

interface NavbarUser {
  name?: string | null
  email?: string | null
  image?: string | null
  xp: number
  hearts: number
  streakDays?: number
  jlptLevel?: string
}

interface NavbarProps {
  user: NavbarUser
  onSignOut?: () => void
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kana", label: "Kana", icon: Grid3X3 },
  { href: "/vocab", label: "Từ vựng", icon: BookOpen },
  { href: "/grammar", label: "Ngữ pháp", icon: GraduationCap },
  { href: "/kanji", label: "Kanji", icon: PenTool },
  { href: "/reading", label: "Đọc hiểu", icon: FileText },
  { href: "/listening", label: "Nghe hiểu", icon: Headphones },
  { href: "/writing", label: "Viết luận", icon: Edit3 },
  { href: "/speaking", label: "Luyện nói", icon: Mic },
]

export function Navbar({ user, onSignOut }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-white/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 md:px-6 max-w-screen-xl mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-indigo-600 text-lg shrink-0"
        >
          <span className="text-xl" role="img" aria-label="bell">🔔</span>
          <span className="hidden sm:inline">DingDong Nihongo</span>
          <span className="sm:hidden">DingDong</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side: XP + Hearts + User */}
        <div className="flex items-center gap-3">
          {/* XP chip */}
          <div className="hidden sm:flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <span>⚡</span>
            <span>{user.xp.toLocaleString()} XP</span>
          </div>

          {/* Hearts */}
          <div className="hidden sm:block">
            <HeartsDisplay count={user.hearts} />
          </div>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  {user.image && (
                    <AvatarImage src={user.image} alt={user.name ?? ""} />
                  )}
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3 w-3 text-zinc-400 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-semibold truncate">
                  {user.name ?? "Learner"}
                </p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Hồ sơ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                onClick={onSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white px-4 py-3 shadow-md">
          {/* Mobile stats row */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full px-3 py-1">
              <span>⚡</span>
              <span>{user.xp.toLocaleString()} XP</span>
            </div>
            <HeartsDisplay count={user.hearts} />
          </div>

          <nav className="grid grid-cols-2 gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                <Icon className="h-4 w-4 text-indigo-500" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
