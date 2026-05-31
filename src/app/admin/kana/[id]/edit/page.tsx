import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { KanaEditForm } from '@/components/admin/kana-edit-form'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function KanaEditPage({ params }: Props) {
  const { id } = await params

  const set = await db.kanaSet.findUnique({ where: { id } })
  if (!set) notFound()

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">
          Edit Kana Set:{' '}
          <span style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>{set.row}</span>
        </h2>
      </div>
      <KanaEditForm set={set} />
    </div>
  )
}
