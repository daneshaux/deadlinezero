import { DealForm } from '@/components/deals/deal-form'

export default function NewDealPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-8">
      <div className="max-w-2xl">
        <h2 className="text-[24px] font-bold text-white mb-2">Add a promotional deal</h2>
        <p className="text-[16px] font-normal text-[#A1B7E7] mb-6">
          Enter your deal details to track your payoff progress and get deadline alerts.
        </p>
        <DealForm />
      </div>
    </div>
  )
}
