interface RadicalBadgeProps {
  radical: string
  meaning: string
}

export function RadicalBadge({ radical, meaning }: RadicalBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5">
      <span className="font-japanese text-lg text-indigo-700">{radical}</span>
      <span className="text-xs text-zinc-500">{meaning}</span>
    </div>
  )
}
