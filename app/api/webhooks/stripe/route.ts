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
    if (checkoutSession.mode === 'subscription' && checkoutSession.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        checkoutSession.subscription as string
      )
      const periodEnd = subscription.items.data[0]?.current_period_end

      const updateData = {
        subscriptionTier: 'PREMIUM' as const,
        stripeSubscriptionId: subscription.id,
        subscriptionExpiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
      }

      // Primary: look up by stripeCustomerId (set before checkout creation)
      if (checkoutSession.customer) {
        const result = await db.user.updateMany({
          where: { stripeCustomerId: checkoutSession.customer as string },
          data: updateData,
        })
        // Fallback: if no row matched, use metadata.userId embedded at session creation
        if (result.count === 0 && checkoutSession.metadata?.userId) {
          await db.user.update({
            where: { id: checkoutSession.metadata.userId },
            data: { ...updateData, stripeCustomerId: checkoutSession.customer as string },
          })
        }
      } else if (checkoutSession.metadata?.userId) {
        await db.user.update({
          where: { id: checkoutSession.metadata.userId },
          data: updateData,
        })
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    await db.user.updateMany({
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
    await db.user.updateMany({
      where: { stripeCustomerId: subscription.customer as string },
      data: {
        subscriptionExpiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    })
  }

  return NextResponse.json({ received: true })
}
