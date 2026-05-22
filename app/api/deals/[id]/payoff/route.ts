import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await db.promoDeal.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await db.promoDeal.update({
    where: { id: params.id },
    data: { status: 'PAID_OFF', paidOffAt: new Date(), currentBalanceCents: 0 },
  })
  return NextResponse.json(updated)
}
