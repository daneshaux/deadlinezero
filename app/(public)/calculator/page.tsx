import { SiteNav } from '@/components/layout/site-nav'
import { CalculatorForm } from '@/components/calculator/calculator-form'

export const metadata = {
  title: 'Deferred Interest Calculator — DeadlineZero',
  description:
    'Calculate your exact monthly payment and retroactive interest exposure on any deferred-interest "no interest if paid in full" deal.',
}

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-[#0B1020]">
      <SiteNav />

      {/*
       * px-[120px] desktop = Figma hero grid (same as landing page).
       * pt-10 (40px) = Figma gap between nav bottom and hero text top.
       * pb-20 (80px) = Figma bottom padding on the desktop frame.
       */}
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-[120px] pt-10 pb-20">
        {/* Hero text — gap-4 (16px) between H2 and body, mb-6 (24px) to first form row */}
        <div className="flex flex-col gap-4 mb-6">
          <h2 className="text-[24px] font-bold text-white">Deferred Interest Calculator</h2>
          <p className="text-[16px] font-normal text-[#A1B7E7]">
            Find out exactly how much you&apos;ll owe if you miss your &quot;no interest if paid in
            full&quot; deadline — and what to pay each month to avoid it.
          </p>
        </div>

        <CalculatorForm />
      </div>
    </div>
  )
}
