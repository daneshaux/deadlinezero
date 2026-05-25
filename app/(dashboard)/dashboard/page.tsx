import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { DealCard } from '@/components/deals/deal-card'

export default async function DashboardPage() {
  const session = await auth()
  const [deals, paidOffCount] = await Promise.all([
    db.promoDeal.findMany({
      where: { userId: session!.user.id, status: 'ACTIVE' },
      orderBy: { promoDeadline: 'asc' },
    }),
    db.promoDeal.count({
      where: { userId: session!.user.id, status: 'PAID_OFF' },
    }),
  ])

  const totalRetroExposure = deals.reduce(
    (sum, d) => sum + (d.cachedRetroInterestExposureCents ?? 0),
    0
  )

  return (
    <div className="min-h-full flex flex-col gap-6 p-4 sm:p-8 lg:p-8">

      {/* ── Header bar — glass card with Add deal CTA ── */}
      <div className="dz-glass-card rounded-[10px] p-4 flex items-center justify-end">
        <Link
          href="/dashboard/deals/new"
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-[16px] font-semibold text-white px-4 py-2 rounded-[10px] transition-colors"
        >
          Add deal
        </Link>
      </div>

      {/* ── Your Deals section ── */}
      <div className="flex flex-col gap-10">

        {/* Heading + summary metric cards */}
        <div className="flex flex-col gap-6">
          <h2 className="text-[24px] font-bold text-white">Your Deals</h2>

          {/*
           * grid-cols-3 on all breakpoints keeps the 3 cards side-by-side on mobile.
           * gap-3 on mobile narrows the gutter; gap-6 on sm+ restores Figma 24px gap.
           * Text/padding scales down on mobile via responsive classes.
           */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <div className="dz-glass-card rounded-[10px] p-3 sm:p-4 flex flex-col gap-2 sm:gap-4">
              <span className="text-[11px] sm:text-[14px] text-[#A1B7E7] leading-tight">
                Total Deals
              </span>
              <span className="text-[28px] sm:text-[40px] font-normal text-white leading-none">
                {deals.length}
              </span>
            </div>
            <div className="dz-glass-card rounded-[10px] p-3 sm:p-4 flex flex-col gap-2 sm:gap-4">
              <span className="text-[11px] sm:text-[14px] text-[#A1B7E7] leading-tight">
                Total Retro Interest
              </span>
              <span className="text-[20px] sm:text-[40px] font-bold text-[#F86B6B] leading-none">
                ${(totalRetroExposure / 100).toFixed(2)}
              </span>
            </div>
            <div className="dz-glass-card rounded-[10px] p-3 sm:p-4 flex flex-col gap-2 sm:gap-4">
              <span className="text-[11px] sm:text-[14px] text-[#A1B7E7] leading-tight">
                Paid-off Deals
              </span>
              <span className="text-[28px] sm:text-[40px] font-normal text-white leading-none">
                {paidOffCount}
              </span>
            </div>
          </div>
        </div>

        {/* Deal cards */}
        {deals.length === 0 ? (
          <div className="dz-glass-card rounded-[10px] p-12 flex flex-col items-center gap-4 text-center">
            <p className="text-[16px] text-[#A1B7E7]">No active deals yet.</p>
            <Link
              href="/dashboard/deals/new"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-[16px] font-semibold text-white px-6 py-2 rounded-[10px] transition-colors"
            >
              Add your first deal
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
