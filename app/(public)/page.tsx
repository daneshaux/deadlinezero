import Link from 'next/link'
import { SiteNav } from '@/components/layout/site-nav'
import { HeroLottie } from '@/components/layout/hero-lottie'

export const metadata = {
  title: 'DeadlineZero — Never Miss a Deferred Interest Deadline',
  description:
    'Track your "no interest if paid in full" deals. Get 90/60/30-day alerts. See exactly what you owe if you miss.',
}

const steps = [
  {
    number: '1',
    title: 'Add your deal',
    desc: 'Enter your original amount, current balance, APR, and deadline. Takes 30 seconds.',
  },
  {
    number: '2',
    title: 'See your exposure',
    desc: 'Instantly see the exact retroactive interest you risk and the monthly payment needed to avoid it.',
  },
  {
    number: '3',
    title: 'Get alerts',
    desc: '90, 60, and 30-day email alerts with exact payoff amounts. Never miss a deadline again.',
  },
]

export default function HomePage() {
  return (
    // Full page uses bg-primary so there are no white flash gaps between sections
    <div className="min-h-screen bg-[#0B1020]">
      <SiteNav />

      {/* ── Hero ──
       * Layout matches Figma desktop frame (1280×450):
       *   flex-col + justify-center → content sits at ~94px from top (verified by Figma y coords)
       *   gap-10 (40px) = Figma gap between text block and CTA button
       *   px-[120px] desktop = Figma hero horizontal padding
       */}
      <section className="overflow-hidden">
        <div className="relative max-w-[1280px] mx-auto min-h-[400px] lg:min-h-[450px] flex flex-col items-start justify-center gap-10 px-4 sm:px-8 lg:px-[120px] py-16 lg:py-0">
          {/* Heading + subtitle: gap-8 (32px) = Figma text block inner gap */}
          <div className="flex flex-col gap-8 lg:w-[597px]">
            {/* H1: Noto Sans Regular 40px */}
            <h1 className="text-[40px] font-normal text-white leading-snug">
              One missed payment can cost{' '}
              <span className="font-bold">hundreds</span>.
            </h1>
            {/* Body: Noto Sans Regular 16px, text-secondary */}
            <p className="text-[16px] font-normal text-[#A1B7E7] leading-relaxed">
              Track deferred interest deals, payoff deadlines, and monthly targets before
              retroactive interest hits.
            </p>
          </div>

          {/* CTA: Button — Noto Sans SemiBold 16px, accent-blue fill */}
          <Link
            href="/calculator"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-[16px] font-semibold text-white px-4 py-2 rounded-[10px] transition-colors"
          >
            Calculate my exposure
          </Link>

          {/* Lottie animation — desktop only, matches Figma lottie-placeholder:
               absolute right-0, 672×447px, fills exactly the right half of the hero */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute right-0 top-0 w-[672px] h-[447px] pointer-events-none overflow-hidden"
          >
            <HeroLottie />
          </div>
        </div>
      </section>

      {/* ── How it works ──
       * mt-10 (40px) = Figma section gap: hero ends at y=576, HIW starts at y=616.
       * No py — section height is determined by content, matching the Figma frame.
       */}
      <section className="mt-10">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-4 px-4 sm:px-8 lg:px-[120px]">
          {/* H2: Noto Sans Bold 24px */}
          <h2 className="text-[24px] font-bold text-white">How it works</h2>

          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-5">
            {steps.map((step) => (
              <div
                key={step.number}
                className="dz-glass-card flex flex-col gap-4 rounded-[10px] p-6 w-full lg:w-[331px]"
              >
                {/* Step header: number + title, gap-4 (16px) from Figma */}
                <div className="flex items-center gap-4">
                  {/* Step number: success-green, 40px Bold */}
                  <span className="text-[40px] font-bold text-[#10B981] leading-none w-[30px] shrink-0">
                    {step.number}
                  </span>
                  {/* H3: Noto Sans Bold 20px */}
                  <span className="text-[20px] font-bold text-white leading-snug">
                    {step.title}
                  </span>
                </div>
                {/* Body: Noto Sans Regular 16px, text-secondary for lower visual weight */}
                <p className="text-[16px] font-normal text-[#A1B7E7] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──
       * mt-10 (40px) = Figma section gap: HIW ends at y=825, CTA starts at y=865.
       * pb-10 adds breathing room at the very bottom of the page.
       * Internal gap-4 (16px) matches the Figma 16px gap between heading, body, button.
       */}
      <section className="mt-10 pb-10">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col items-center justify-center gap-4 px-4 sm:px-8 lg:px-[120px]">
          <h2 className="text-[24px] font-bold text-white text-center">
            Find out what you&apos;re really paying
          </h2>
          <p className="text-[16px] font-normal text-[#A1B7E7] text-center">
            The free calculator takes 30 seconds. No signup required.
          </p>
          <Link
            href="/calculator"
            className="inline-flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-[16px] font-semibold text-white px-6 py-2.5 rounded-[10px] transition-colors"
          >
            Try the calculator
          </Link>
        </div>
      </section>
    </div>
  )
}
