import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateDealCachedFields } from '@/lib/calculations/cache-fields'
import { createDealSchema } from '@/lib/validations/deal'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deals = await db.promoDeal.findMany({
    where: { userId: session.user.id, status: 'ACTIVE' },
    orderBy: { promoDeadline: 'asc' },
  })
  return NextResponse.json(deals)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Free tier: max 2 active deals
  if (session.user.subscriptionTier === 'FREE') {
    const count = await db.promoDeal.count({
      where: { userId: session.user.id, status: 'ACTIVE' },
    })
    if (count >= 2) {
      return NextResponse.json(
        { error: 'Free plan limit: 2 active deals. Upgrade to Premium for unlimited.' },
        { status: 403 }
      )
    }
  }

  const body = await req.json()
  const parsed = createDealSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const deal = await db.promoDeal.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      promoStartDate: new Date(parsed.data.promoStartDate),
      promoDeadline: new Date(parsed.data.promoDeadline),
    },
  })

  const updated = await updateDealCachedFields(deal.id)
  return NextResponse.json(updated, { status: 201 })
}
