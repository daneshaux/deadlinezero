import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateDealCachedFields } from '@/lib/calculations/cache-fields'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const paymentSchema = z.object({
  amountCents: z.number().int().positive(),
  paymentDate: z.string().datetime().optional(),
  note: z.string().max(200).optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await db.promoDeal.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = paymentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const newBalance = Math.max(0, deal.currentBalanceCents - parsed.data.amountCents)
  const paymentDate = parsed.data.paymentDate ? new Date(parsed.data.paymentDate) : new Date()

  await db.$transaction([
    db.paymentRecord.create({
      data: {
        dealId: params.id,
        amountCents: parsed.data.amountCents,
        paymentDate,
        note: parsed.data.note,
      },
    }),
    db.balanceSnapshot.create({
      data: {
        dealId: params.id,
        balanceCents: newBalance,
        snapshotDate: paymentDate,
        source: 'payment_recorded',
      },
    }),
    db.promoDeal.update({
      where: { id: params.id },
      data: { currentBalanceCents: newBalance },
    }),
  ])

  const updated = await updateDealCachedFields(params.id)
  return NextResponse.json(updated, { status: 201 })
}
