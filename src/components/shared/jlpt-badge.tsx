import { cn, jlptBadgeColor } from "@/lib/utils"

interface JlptBadgeProps {
  level: string
  className?: string
}

export function JlptBadge({ level, className }: JlptBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        jlptBadgeColor(level),
        className
      )}
    >
      {level}
    </span>
  )
}
