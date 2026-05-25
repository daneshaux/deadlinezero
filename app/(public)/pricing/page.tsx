import Link from 'next/link'
import { SiteNav } from '@/components/layout/site-nav'

export const metadata = {
  title: 'Pricing — DeadlineZero',
  description:
    'Simple, transparent pricing. Less than the interest you\'ll pay if you miss a single deadline.',
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M3 8l3.5 3.5 6.5-7"
        stroke="#10B981"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const freeFeatures = [
  { text: 'Track up to 2 active deals', included: true },
  { text: 'Monthly payment calculator', included: true },
  { text: 'Retroactive interest shock display', included: true },
  { text: '90/60/30-day email alerts', included: true },
  { text: 'Unlimited deal tracking', included: false },
  { text: 'Auto bank sync (Plaid)', included: false },
  { text: 'Calendar export (iCal)', included: false },
]

const premiumFeatures = [
  { text: 'Unlimited active deals', included: true },
  { text: 'Monthly payment calculator', included: true },
  { text: 'Retroactive interest shock display', included: true },
  { text: '90/60/30-day email alerts', included: true },
  { text: 'Auto bank sync (Plaid)', included: true },
  { text: 'Calendar export (iCal)', included: true },
  { text: 'Priority support', included: true },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0B1020]">
      <SiteNav />

      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-[120px] pt-10 pb-20 flex flex-col gap-10 items-center">

        {/* ── Hero text — centered, H2 + subtitle ── */}
        <div className="flex flex-col gap-4 items-center text-center">
          <h2 className="text-[24px] font-bold text-white">Simple Pricing</h2>
          <p className="text-[16px] font-normal text-[#A1B7E7]">
            Less than the interest you&apos;ll pay if you miss a single deadline.
          </p>
        </div>

        {/*
         * Cards container — max-w-[654px] matches Figma: two 307px cards + 40px gap.
         * pt-3 gives the "Most Popular" pill (top-[-12px]) room to overflow above
         * the Premium card without being clipped.
         */}
        <div className="w-full max-w-[654px] mx-auto flex flex-col sm:flex-row gap-10 pt-3">

          {/* ── Free card ── */}
          <div className="dz-glass-card relative flex flex-col gap-6 p-4 rounded-[10px] w-full sm:flex-1">

            {/* Price block — gap-1 (4px) between tier name, price, subtitle */}
            <div className="flex flex-col gap-1">
              <span className="text-[16px] font-bold text-white">Free</span>
              <span className="text-[40px] font-bold text-white leading-none">$0</span>
              <span className="text-[14px] font-normal text-[#A1B7E7]">forever</span>
            </div>

            {/* Feature list — gap-2 (8px) between items */}
            <ul className="flex flex-col gap-2 flex-1">
              {freeFeatures.map((f) => (
                <li key={f.text} className="flex items-center gap-2">
                  {f.included ? <CheckIcon /> : <XIcon />}
                  <span
                    className={`text-[16px] font-normal ${
                      f.included ? 'text-white' : 'text-white/50'
                    }`}
                  >
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA — outlined accent-blue-light (#3B82F6) button */}
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center border border-[#3B82F6] text-[16px] font-semibold text-[#3B82F6] hover:bg-[rgba(59,130,246,0.15)] hover:text-white px-4 py-2 rounded-[10px] transition-colors"
            >
              Get started free
            </Link>
          </div>

          {/*
           * ── Premium card ──
           * border-[#2563EB] overrides the dz-glass-card border via Tailwind utility
           * layer precedence (utilities beat components in CSS cascade).
           */}
          <div className="dz-glass-card relative flex flex-col gap-6 p-4 rounded-[10px] w-full sm:flex-1 border border-[#2563EB]">

            {/*
             * Most Popular pill — floats above the card top edge.
             * bg-[#223661] is a solid opaque dark-blue (--dz-border-blue) so the
             * premium card's accent border never bleeds through the badge.
             */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#223661] border border-[#3B82F6]/40 px-2 py-0.5 rounded-full whitespace-nowrap">
              <span className="text-[14px] font-normal text-white">Most Popular</span>
            </div>

            {/* Price block */}
            <div className="flex flex-col gap-1">
              <span className="text-[16px] font-bold text-white">Premium</span>
              <p className="leading-none">
                <span className="text-[40px] font-bold text-[#10B981]">$29</span>
                <span className="text-[20px] font-normal text-[#10B981]">/year</span>
              </p>
              <span className="text-[14px] font-normal text-[#A1B7E7]">or $4/month</span>
            </div>

            {/* Feature list */}
            <ul className="flex flex-col gap-2 flex-1">
              {premiumFeatures.map((f) => (
                <li key={f.text} className="flex items-center gap-2">
                  <CheckIcon />
                  <span className="text-[16px] font-normal text-white">{f.text}</span>
                </li>
              ))}
            </ul>

            {/* CTA — filled accent-blue button */}
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-[16px] font-semibold text-white px-4 py-2 rounded-[10px] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
