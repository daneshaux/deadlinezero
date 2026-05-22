import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'DeadlineZero — Never Miss a Deferred Interest Deadline',
  description:
    'Track your "no interest if paid in full" deals. Get 90/60/30-day alerts. See exactly what you owe if you miss.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex justify-between items-center px-6 py-4 border-b max-w-6xl mx-auto">
        <span className="font-bold text-xl text-gray-900">DeadlineZero</span>
        <div className="flex gap-3 items-center">
          <Button variant="ghost" asChild>
            <Link href="/calculator">Calculator</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
          Miss your "no interest" deadline by one day.
          <br />
          <span className="text-red-600">Pay 27% interest on every dollar.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          DeadlineZero tracks your deferred-interest deals and tells you exactly what to pay each
          month — so you never trigger the retroactive interest trap.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" asChild>
            <Link href="/calculator">Calculate my exposure — free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Track my deals</Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Add your deal',
                desc: 'Enter your original amount, current balance, APR, and deadline. Takes 30 seconds.',
              },
              {
                step: '2',
                title: 'See your exposure',
                desc: 'Instantly see the exact retroactive interest you risk and the monthly payment needed to avoid it.',
              },
              {
                step: '3',
                title: 'Get alerts',
                desc: '90, 60, and 30-day email alerts with exact payoff amounts. Never miss a deadline again.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Find out what you're really risking
          </h2>
          <p className="text-gray-600 mb-8">
            The free calculator takes 30 seconds. No signup required.
          </p>
          <Button size="lg" asChild>
            <Link href="/calculator">Try the calculator →</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
