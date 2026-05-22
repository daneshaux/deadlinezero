import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Pricing — DeadlineZero',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex justify-between items-center px-6 py-4 border-b max-w-6xl mx-auto">
        <Link href="/" className="font-bold text-xl text-gray-900">
          DeadlineZero
        </Link>
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple pricing</h1>
          <p className="text-gray-600 text-lg">
            Less than the interest you&apos;ll pay if you miss a single deadline.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Free */}
          <div className="border rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Free</h2>
            <p className="text-4xl font-bold mb-1 text-gray-900">$0</p>
            <p className="text-sm text-gray-500 mb-6">forever</p>
            <ul className="space-y-3 text-sm mb-8">
              {[
                '✓ Track up to 2 active deals',
                '✓ Monthly payment calculator',
                '✓ Retroactive interest shock display',
                '✓ 90/60/30-day email alerts',
                '✗ Unlimited deals',
                '✗ Auto bank sync (Plaid)',
                '✗ Calendar export (iCal)',
              ].map((item) => (
                <li
                  key={item}
                  className={item.startsWith('✗') ? 'text-gray-400' : 'text-gray-700'}
                >
                  {item}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Get started free</Link>
            </Button>
          </div>

          {/* Premium */}
          <div className="border-2 border-blue-600 rounded-xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              Most popular
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Premium</h2>
            <p className="text-4xl font-bold mb-1 text-gray-900">
              $29<span className="text-lg font-normal text-gray-500">/year</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">or $4/month</p>
            <ul className="space-y-3 text-sm mb-8">
              {[
                '✓ Unlimited active deals',
                '✓ Monthly payment calculator',
                '✓ Retroactive interest shock display',
                '✓ 90/60/30-day email alerts',
                '✓ Auto bank sync (Plaid)',
                '✓ Calendar export (iCal)',
                '✓ Priority support',
              ].map((item) => (
                <li key={item} className="text-gray-700">{item}</li>
              ))}
            </ul>
            <Button className="w-full" asChild>
              <Link href="/login">Get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
