import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
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
    <div className="p-4 sm:p-8 lg:p-8">

      {/* ── Header: title + CTAs ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          {/* H2 — deal title */}
          <h2 className="text-[24px] font-bold text-white">{deal.merchantName}</h2>
          {/* H3 — description */}
          {deal.description && (
            <p className="text-[20px] font-normal text-white mt-1">{deal.description}</p>
          )}
          {/* Body secondary — promo description */}
          {deal.promoDescription && (
            <p className="text-[14px] font-normal text-[#A1B7E7] mt-1">{deal.promoDescription}</p>
          )}
        </div>

        {/* CTA row: Log payment (primary) + Edit (secondary) */}
        <div className="flex gap-3 shrink-0">
          <Link
            href={`/dashboard/deals/${deal.id}/edit`}
            className="inline-flex items-center justify-center border border-[#3B82F6] text-[#3B82F6] hover:bg-[rgba(59,130,246,0.15)] hover:text-white text-[16px] font-semibold px-4 py-2 rounded-[10px] transition-colors"
          >
            Edit
          </Link>
          <Link
            href={`/dashboard/deals/${deal.id}/payment`}
            className="inline-flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-[16px] font-semibold text-white px-4 py-2 rounded-[10px] transition-colors"
          >
            Log payment
          </Link>
        </div>
      </div>

      {/* ── Key metric cards (3-col, responsive text) ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="dz-glass-card rounded-[10px] p-3 sm:p-4 flex flex-col gap-2">
          <span className="text-[11px] sm:text-[12px] text-[#A1B7E7] uppercase tracking-wide leading-tight">
            Balance
          </span>
          <span className="text-[20px] sm:text-[28px] font-bold text-white leading-none">
            ${balance}
          </span>
        </div>
        <div className="dz-glass-card rounded-[10px] p-3 sm:p-4 flex flex-col gap-2">
          <span className="text-[11px] sm:text-[12px] text-[#A1B7E7] uppercase tracking-wide leading-tight">
            Pay / month
          </span>
          <span className="text-[20px] sm:text-[28px] font-bold text-[#3B82F6] leading-none">
            {monthly}
          </span>
        </div>
        <div className="dz-glass-card rounded-[10px] p-3 sm:p-4 flex flex-col gap-2">
          <span className="text-[11px] sm:text-[12px] text-[#F86B6B] uppercase tracking-wide leading-tight">
            If you miss
          </span>
          <span className="text-[20px] sm:text-[28px] font-bold text-[#F86B6B] leading-none">
            {retro}
          </span>
        </div>
      </div>

      {/* ── Payoff progress card ── */}
      <div className="dz-glass-card rounded-[10px] p-4 mb-4 flex flex-col gap-3">
        <div className="flex justify-between text-[16px]">
          <span className="text-[#A1B7E7]">Payoff progress</span>
          <span className="text-white">{progress}% paid off</span>
        </div>
        <div className="w-full bg-[rgba(96,100,113,0.2)] rounded-full h-3">
          <div
            className="bg-[#10B981] h-3 rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        <div className="flex justify-between text-[14px] text-[#A1B7E7]">
          <span>Deadline: {format(deal.promoDeadline, 'MMMM d, yyyy')}</span>
          {daysLeft !== null && (
            <span className={daysLeft <= 30 ? 'text-[#F86B6B] font-semibold' : ''}>
              {daysLeft > 0 ? `${daysLeft} days remaining` : 'Deadline passed'}
            </span>
          )}
        </div>
      </div>

      {/* ── Balance history card ── */}
      <div className="dz-glass-card rounded-[10px] p-4 mb-4">
        <h3 className="text-[16px] font-semibold text-white mb-3">Balance history</h3>
        <PayoffChart
          history={deal.balanceHistory.map((b: { snapshotDate: Date; balanceCents: number }) => ({
            snapshotDate: b.snapshotDate.toISOString(),
            balanceCents: b.balanceCents,
          }))}
        />
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 mb-6">
        <a
          href={`/api/deals/${deal.id}/export/ical`}
          className="inline-flex items-center justify-center border border-[#3B82F6] text-[#3B82F6] hover:bg-[rgba(59,130,246,0.15)] hover:text-white text-[16px] font-semibold px-4 py-2 rounded-[10px] transition-colors"
        >
          Add to Calendar
        </a>
      </div>

      {/* ── Payment history card ── */}
      {deal.paymentHistory.length > 0 && (
        <div className="dz-glass-card rounded-[10px] p-4">
          <h3 className="text-[16px] font-semibold text-white mb-3">Payment history</h3>
          <div className="divide-y divide-[#223661]">
            {deal.paymentHistory.map((p: { id: string; amountCents: number; paymentDate: Date; note: string | null }) => (
              <div key={p.id} className="py-3 flex justify-between items-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-[16px] font-semibold text-white">
                    ${(p.amountCents / 100).toFixed(2)}
                  </span>
                  {p.note && (
                    <span className="text-[14px] text-[#A1B7E7]">{p.note}</span>
                  )}
                </div>
                <span className="text-[14px] text-[#A1B7E7]">
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
