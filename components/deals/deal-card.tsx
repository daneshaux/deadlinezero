import Link from 'next/link'

export interface DealSummary {
  id: string
  merchantName: string
  description: string | null
  currentBalanceCents: number
  originalPurchaseAmountCents: number
  cachedMonthlyPaymentNeededCents: number | null
  cachedRetroInterestExposureCents: number | null
  cachedDaysRemaining: number | null
}

function urgencyPill(daysRemaining: number | null) {
  if (daysRemaining === null || daysRemaining === undefined) return null

  let label: string
  let cls: string

  if (daysRemaining <= 0) {
    label = 'Overdue'
    cls = 'bg-[rgba(239,68,68,0.25)] text-red-400'
  } else if (daysRemaining <= 30) {
    label = `${daysRemaining} days left`
    cls = 'bg-[rgba(239,68,68,0.2)] text-red-400'
  } else if (daysRemaining <= 90) {
    label = `${daysRemaining} days left`
    cls = 'bg-[rgba(241,248,107,0.2)] text-white'
  } else {
    label = `${daysRemaining} days left`
    cls = 'bg-[rgba(37,99,235,0.2)] text-white'
  }

  return (
    <span className={`${cls} px-2 py-0.5 rounded-full text-[14px] whitespace-nowrap shrink-0`}>
      {label}
    </span>
  )
}

export function DealCard({ deal }: { deal: DealSummary }) {
  const balance = (deal.currentBalanceCents / 100).toFixed(2)
  const monthly =
    deal.cachedMonthlyPaymentNeededCents != null
      ? `$${(deal.cachedMonthlyPaymentNeededCents / 100).toFixed(2)}/mo`
      : '—'
  const retroInterest =
    deal.cachedRetroInterestExposureCents != null
      ? `$${(deal.cachedRetroInterestExposureCents / 100).toFixed(2)}`
      : '—'
  const progress =
    deal.originalPurchaseAmountCents > 0
      ? Math.round((1 - deal.currentBalanceCents / deal.originalPurchaseAmountCents) * 100)
      : 0
  const progressPct = Math.min(100, Math.max(0, progress))

  return (
    <Link href={`/dashboard/deals/${deal.id}`} className="block">
      <div className="dz-glass-card border border-[#223661] rounded-[10px] px-6 py-4 flex flex-col gap-2 hover:border-[#2563EB]/50 transition-colors cursor-pointer">
        {/* Card body */}
        <div className="flex flex-col gap-4">
          {/* Merchant name + days pill */}
          <div className="flex items-start justify-between gap-4">
            <span className="text-[20px] font-bold text-white leading-normal">
              {deal.merchantName}
            </span>
            {urgencyPill(deal.cachedDaysRemaining)}
          </div>

          {/* Description */}
          {deal.description && (
            <p className="text-[16px] font-normal text-white">{deal.description}</p>
          )}

          {/* Progress section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[16px]">
              <span className="text-[#A1B7E7]">Progress</span>
              <span className="text-white">{progress}% paid off</span>
            </div>
            <div className="w-full bg-[rgba(96,100,113,0.2)] rounded-full h-3">
              <div
                className="bg-[#10B981] h-3 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[16px] text-white">
              <span>
                Balance: <strong>${balance}</strong>
              </span>
              <span>
                Need: <strong>{monthly}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#223661] my-1" />

        {/* Interest if missed */}
        <p className="text-[16px] text-white">
          Interest if missed:{' '}
          <strong className="text-[#F86B6B]">{retroInterest}</strong>
        </p>
      </div>
    </Link>
  )
}
