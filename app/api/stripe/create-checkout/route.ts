import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({ plan: z.enum(['monthly', 'annual']) })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id } })

  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
    })
    customerId = customer.id
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } })
  }

  const priceId =
    parsed.data.plan === 'annual'
      ? process.env.STRIPE_ANNUAL_PRICE_ID!
      : process.env.STRIPE_MONTHLY_PRICE_ID!

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?success=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
  })

  return NextResponse.json({ checkoutUrl: checkoutSession.url })
}
