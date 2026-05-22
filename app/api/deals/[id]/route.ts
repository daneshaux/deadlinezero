import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateDealCachedFields } from '@/lib/calculations/cache-fields'
import { updateDealSchema } from '@/lib/validations/deal'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: { id: string } }

async function ownedDeal(dealId: string, userId: string) {
  return db.promoDeal.findFirst({ where: { id: dealId, userId } })
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await ownedDeal(params.id, session.user.id)
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [alerts, paymentHistory, balanceHistory] = await Promise.all([
    db.alert.findMany({ where: { dealId: deal.id }, orderBy: { scheduledFor: 'desc' } }),
    db.paymentRecord.findMany({ where: { dealId: deal.id }, orderBy: { paymentDate: 'desc' } }),
    db.balanceSnapshot.findMany({ where: { dealId: deal.id }, orderBy: { snapshotDate: 'asc' } }),
  ])

  return NextResponse.json({ ...deal, alerts, paymentHistory, balanceHistory })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await ownedDeal(params.id, session.user.id)
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateDealSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await db.promoDeal.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.promoStartDate ? { promoStartDate: new Date(parsed.data.promoStartDate) } : {}),
      ...(parsed.data.promoDeadline ? { promoDeadline: new Date(parsed.data.promoDeadline) } : {}),
    },
  })

  const updated = await updateDealCachedFields(params.id)
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await ownedDeal(params.id, session.user.id)
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.promoDeal.update({ where: { id: params.id }, data: { status: 'ARCHIVED' } })
  return NextResponse.json({ success: true })
}
