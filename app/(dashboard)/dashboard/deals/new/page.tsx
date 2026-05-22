import { DealForm } from '@/components/deals/deal-form'

export default function NewDealPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add a promotional deal</h1>
      <p className="text-gray-600 mb-6">
        Enter your deal details to track your payoff progress and get deadline alerts.
      </p>
      <DealForm />
    </div>
  )
}
