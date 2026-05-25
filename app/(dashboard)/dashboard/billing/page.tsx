import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id } })
  const isPremium = user.subscriptionTier === 'PREMIUM'

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-[24px] font-bold text-white mb-6">Billing</h2>

      {/* ── Current plan card ── */}
      <div className="dz-glass-card rounded-[10px] p-4 flex flex-col gap-4 mb-6">
        <span className="text-[14px] text-[#A1B7E7]">Current Plan</span>
        <span className="text-[40px] font-normal text-white leading-none">
          {isPremium ? 'Premium' : 'Free'}
        </span>
        {isPremium && user.subscriptionExpiresAt && (
          <span className="text-[14px] text-[#A1B7E7]">
            Renews {format(user.subscriptionExpiresAt, 'MMMM d, yyyy')}
          </span>
        )}
        {!isPremium && (
          <span className="text-[14px] text-[#A1B7E7]">
            Track up to 2 active deals. Upgrade for unlimited.
          </span>
        )}
      </div>

      {isPremium ? (
        <div className="flex flex-col gap-4">
          <p className="text-[16px] text-[#A1B7E7]">
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
            <button
              type="submit"
              className="border border-[#3B82F6] text-[#3B82F6] bg-transparent hover:bg-[rgba(59,130,246,0.15)] hover:text-white text-[16px] font-semibold px-4 py-2 rounded-[10px] transition-colors"
            >
              Manage subscription
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-[16px] text-[#A1B7E7]">
            Upgrade to Premium to track unlimited deals and connect your bank account.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
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
              <button
                type="submit"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-[16px] font-semibold text-white px-4 py-2 rounded-[10px] transition-colors w-full sm:w-auto"
              >
                Upgrade to premium — $29/year
              </button>
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
              <button
                type="submit"
                className="border border-[#3B82F6] text-[#3B82F6] bg-transparent hover:bg-[rgba(59,130,246,0.15)] hover:text-white text-[16px] font-semibold px-4 py-2 rounded-[10px] transition-colors w-full sm:w-auto"
              >
                Upgrade to premium — $4/month
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
