import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { PayoffChart } from '@/components/deals/payoff-chart'

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const deal = await db.promoDeal.findFirst({
    where: { id: params.id, userId: session!.user.id },
    include: {
      balanceHistory: { orderBy: { snapshotDate: 'asc' } },
      paymentHistory: { orderBy: { paymentDate: 'desc' } },
    },
  })
  if (!deal) notFound()

  const balance = (deal.currentBalanceCents / 100).toFixed(2)
  const monthly =
    deal.cachedMonthlyPaymentNeededCents != null
      ? `$${(deal.cachedMonthlyPaymentNeededCents / 100).toFixed(2)}`
      : '—'
  const retro =
    deal.cachedRetroInterestExposureCents != null
      ? `$${(deal.cachedRetroInterestExposureCents / 100).toFixed(2)}`
      : '—'
  const progress =
    deal.originalPurchaseAmountCents > 0
      ? Math.round(
          (1 - deal.currentBalanceCents / deal.originalPurchaseAmountCents) * 100
        )
      : 0
  const daysLeft = deal.cachedDaysRemaining

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{deal.merchantName}</h1>
          {deal.description && <p className="text-gray-500 mt-1">{deal.description}</p>}
          {deal.promoDescription && (
            <p className="text-sm text-blue-600 mt-1">{deal.promoDescription}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/deals/${deal.id}/edit`}>Edit</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/deals/${deal.id}/payment`}>Log payment</Link>
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Balance</p>
          <p className="text-2xl font-bold mt-1">${balance}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pay / month</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{monthly}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
          <p className="text-xs text-red-600 uppercase tracking-wide">If you miss deadline</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{retro}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Payoff progress</span>
          <span className="text-gray-500">{progress}% paid off</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Deadline: {format(deal.promoDeadline, 'MMMM d, yyyy')}</span>
          {daysLeft !== null && (
            <span className={daysLeft <= 30 ? 'text-red-600 font-medium' : ''}>
              {daysLeft > 0 ? `${daysLeft} days remaining` : 'Deadline passed'}
            </span>
          )}
        </div>
      </div>

      {/* Balance history chart */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
        <h2 className="font-semibold mb-3">Balance history</h2>
        <PayoffChart
          history={deal.balanceHistory.map((b) => ({
            snapshotDate: b.snapshotDate.toISOString(),
            balanceCents: b.balanceCents,
          }))}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <Button variant="outline" asChild>
          <a href={`/api/deals/${deal.id}/export/ical`}>
            Add to Calendar
          </a>
        </Button>
      </div>

      {/* Payment history */}
      {deal.paymentHistory.length > 0 && (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-3">Payment history</h2>
          <div className="divide-y">
            {deal.paymentHistory.map((p) => (
              <div key={p.id} className="py-2 flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">
                    ${(p.amountCents / 100).toFixed(2)}
                  </span>
                  {p.note && (
                    <span className="text-xs text-gray-500 ml-2">{p.note}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {format(p.paymentDate, 'MMM d, yyyy')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
