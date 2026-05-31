import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { KanjiEditForm } from '@/components/admin/kanji-edit-form'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function KanjiEditPage({ params }: Props) {
  const { id } = await params

  const kanji = await db.kanjiCharacter.findUnique({ where: { id } })
  if (!kanji) notFound()

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">
          Edit Kanji:{' '}
          <span style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>{kanji.character}</span>
        </h2>
      </div>
      <KanjiEditForm kanji={kanji} />
    </div>
  )
}
