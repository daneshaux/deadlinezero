import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generatePayoffSchedule } from '@/lib/calculations'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await db.promoDeal.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const schedule = generatePayoffSchedule(deal.currentBalanceCents, deal.promoDeadline)
  return NextResponse.json(schedule)
}
