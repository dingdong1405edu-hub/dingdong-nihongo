"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Grid3X3,
  BookOpen,
  GraduationCap,
  PenTool,
  FileText,
  Headphones,
  Edit3,
  Mic,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { JlptBadge } from "@/components/shared/jlpt-badge"

interface SidebarProps {
  jlptLevel?: string
  className?: string
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    labelJa: "ダッシュボード",
    icon: LayoutDashboard,
  },
  {
    href: "/kana",
    label: "Kana",
    labelJa: "かな",
    icon: Grid3X3,
  },
  {
    href: "/vocab",
    label: "Từ vựng",
    labelJa: "語彙",
    icon: BookOpen,
  },
  {
    href: "/grammar",
    label: "Ngữ pháp",
    labelJa: "文法",
    icon: GraduationCap,
  },
  {
    href: "/kanji",
    label: "Kanji",
    labelJa: "漢字",
    icon: PenTool,
  },
  {
    href: "/reading",
    label: "Đọc hiểu",
    labelJa: "読解",
    icon: FileText,
  },
  {
    href: "/listening",
    label: "Nghe hiểu",
    labelJa: "聴解",
    icon: Headphones,
  },
  {
    href: "/writing",
    label: "Viết luận",
    labelJa: "作文",
    icon: Edit3,
  },
  {
    href: "/speaking",
    label: "Luyện nói",
    labelJa: "会話",
    icon: Mic,
  },
]

export function Sidebar({ jlptLevel = "N5", className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-[240px] shrink-0 border-r border-border bg-white h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto",
        className
      )}
    >
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, labelJa, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/")

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-indigo-600"
                    : "text-zinc-400 group-hover:text-zinc-600"
                )}
              />
              <div className="flex flex-col min-w-0">
                <span className="truncate">{label}</span>
                <span
                  className={cn(
                    "text-[10px] font-japanese truncate",
                    isActive ? "text-indigo-400" : "text-zinc-400"
                  )}
                >
                  {labelJa}
                </span>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="ml-auto h-4 w-0.5 rounded-full bg-indigo-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer: JLPT level badge */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-500">Mục tiêu JLPT</p>
            <p className="text-xs font-japanese text-zinc-400">目標レベル</p>
          </div>
          <JlptBadge level={jlptLevel} className="text-sm px-3 py-1" />
        </div>
      </div>
    </aside>
  )
}
