type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

const COLORS: Record<JLPTLevel, string> = {
  N5: 'bg-green-100 text-green-700',
  N4: 'bg-blue-100 text-blue-700',
  N3: 'bg-yellow-100 text-yellow-700',
  N2: 'bg-orange-100 text-orange-700',
  N1: 'bg-red-100 text-red-700',
}

interface Props {
  level: string
}

export function JLPTBadge({ level }: Props) {
  const color = COLORS[level as JLPTLevel] ?? 'bg-zinc-100 text-zinc-600'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      {level}
    </span>
  )
}
