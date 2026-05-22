import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session
    if (checkoutSession.mode === 'subscription' && checkoutSession.customer && checkoutSession.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        checkoutSession.subscription as string
      )
      const periodEnd = subscription.items.data[0]?.current_period_end
      await db.user.update({
        where: { stripeCustomerId: checkoutSession.customer as string },
        data: {
          subscriptionTier: 'PREMIUM',
          stripeSubscriptionId: subscription.id,
          subscriptionExpiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
        },
      })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    await db.user.update({
      where: { stripeCustomerId: subscription.customer as string },
      data: {
        subscriptionTier: 'FREE',
        stripeSubscriptionId: null,
        subscriptionExpiresAt: null,
      },
    })
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const periodEnd = subscription.items.data[0]?.current_period_end
    await db.user.update({
      where: { stripeCustomerId: subscription.customer as string },
      data: {
        subscriptionExpiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    })
  }

  return NextResponse.json({ received: true })
}
