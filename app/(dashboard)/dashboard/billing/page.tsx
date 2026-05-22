import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id } })
  const isPremium = user.subscriptionTier === 'PREMIUM'

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Billing</h1>

      <div className="bg-white border rounded-xl p-6 mb-6">
        <p className="text-sm text-gray-500 mb-1 uppercase tracking-wide text-xs">Current plan</p>
        <p className="text-2xl font-bold text-gray-900">{isPremium ? 'Premium' : 'Free'}</p>
        {isPremium && user.subscriptionExpiresAt && (
          <p className="text-sm text-gray-500 mt-1">
            Renews {format(user.subscriptionExpiresAt, 'MMMM d, yyyy')}
          </p>
        )}
        {!isPremium && (
          <p className="text-sm text-gray-500 mt-1">
            Track up to 2 active deals. Upgrade for unlimited.
          </p>
        )}
      </div>

      {isPremium ? (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Manage your subscription, update payment method, or cancel anytime.
          </p>
          <form
            action={async () => {
              'use server'
              const { auth: getAuth } = await import('@/lib/auth')
              const { stripe: stripeClient } = await import('@/lib/stripe')
              const { db: database } = await import('@/lib/db')
              const { redirect: nav } = await import('next/navigation')
              const serverSession = await getAuth()
              if (!serverSession?.user?.id) nav('/login')
              const dbUser = await database.user.findUniqueOrThrow({ where: { id: serverSession!.user.id } })
              const portalSession = await stripeClient.billingPortal.sessions.create({
                customer: dbUser.stripeCustomerId!,
                return_url: `${process.env.NEXTAUTH_URL}/dashboard/billing`,
              })
              nav(portalSession.url)
            }}
          >
            <Button type="submit" variant="outline">
              Manage subscription
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-600 text-sm">
            Upgrade to Premium to track unlimited deals and connect your bank account.
          </p>
          <div className="flex gap-3">
            <form
              action={async () => {
                'use server'
                const { auth: getAuth } = await import('@/lib/auth')
                const { stripe: stripeClient } = await import('@/lib/stripe')
                const { db: database } = await import('@/lib/db')
                const { redirect: nav } = await import('next/navigation')
                const serverSession = await getAuth()
                if (!serverSession?.user?.id) nav('/login')
                const dbUser = await database.user.findUniqueOrThrow({ where: { id: serverSession!.user.id } })
                let customerId = dbUser.stripeCustomerId
                if (!customerId) {
                  const customer = await stripeClient.customers.create({
                    email: dbUser.email,
                    name: dbUser.name ?? undefined,
                  })
                  customerId = customer.id
                  await database.user.update({ where: { id: dbUser.id }, data: { stripeCustomerId: customerId } })
                }
                const checkoutSession = await stripeClient.checkout.sessions.create({
                  customer: customerId,
                  mode: 'subscription',
                  line_items: [{ price: process.env.STRIPE_ANNUAL_PRICE_ID!, quantity: 1 }],
                  success_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?success=1`,
                  cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
                })
                nav(checkoutSession.url!)
              }}
            >
              <Button type="submit">Upgrade — $29/year</Button>
            </form>
            <form
              action={async () => {
                'use server'
                const { auth: getAuth } = await import('@/lib/auth')
                const { stripe: stripeClient } = await import('@/lib/stripe')
                const { db: database } = await import('@/lib/db')
                const { redirect: nav } = await import('next/navigation')
                const serverSession = await getAuth()
                if (!serverSession?.user?.id) nav('/login')
                const dbUser = await database.user.findUniqueOrThrow({ where: { id: serverSession!.user.id } })
                let customerId = dbUser.stripeCustomerId
                if (!customerId) {
                  const customer = await stripeClient.customers.create({
                    email: dbUser.email,
                    name: dbUser.name ?? undefined,
                  })
                  customerId = customer.id
                  await database.user.update({ where: { id: dbUser.id }, data: { stripeCustomerId: customerId } })
                }
                const checkoutSession = await stripeClient.checkout.sessions.create({
                  customer: customerId,
                  mode: 'subscription',
                  line_items: [{ price: process.env.STRIPE_MONTHLY_PRICE_ID!, quantity: 1 }],
                  success_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?success=1`,
                  cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
                })
                nav(checkoutSession.url!)
              }}
            >
              <Button type="submit" variant="outline">
                $4/month
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
