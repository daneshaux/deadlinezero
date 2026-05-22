import { CalculatorForm } from '@/components/calculator/calculator-form'

export const metadata = {
  title: 'Deferred Interest Calculator — DeadlineZero',
  description:
    'Calculate your exact monthly payment and retroactive interest exposure on any deferred-interest "no interest if paid in full" deal.',
}

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Deferred Interest Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Find out exactly how much you&apos;ll owe if you miss your &quot;no interest if paid in full&quot;
            deadline — and what to pay each month to avoid it.
          </p>
        </div>
        <CalculatorForm />
      </div>
    </div>
  )
}
