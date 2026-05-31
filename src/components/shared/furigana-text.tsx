"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FuriganaTextProps {
  /** HTML string containing <ruby> tags produced by kuroshiro server-side */
  html: string
  className?: string
  /** Show furigana by default (true for N5/N4, false for N3+) */
  defaultShow?: boolean
}

export function FuriganaText({
  html,
  className,
  defaultShow = true,
}: FuriganaTextProps) {
  const [show, setShow] = useState(defaultShow)

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShow(!show)}
        className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-700"
      >
        {show ? "ふりがな非表示" : "ふりがな表示"}
      </Button>

      <div
        className={cn(
          "font-japanese text-base leading-loose",
          /* Hide only the <rt> (reading) elements when toggled off */
          !show && "[&_rt]:opacity-0 [&_rt]:select-none",
          className
        )}
        style={{ lineHeight: show ? "2.8" : "1.8" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
