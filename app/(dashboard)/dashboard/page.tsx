import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DealCard } from '@/components/deals/deal-card'

export default async function DashboardPage() {
  const session = await auth()
  const deals = await db.promoDeal.findMany({
    where: { userId: session!.user.id, status: 'ACTIVE' },
    orderBy: { promoDeadline: 'asc' },
  })

  const totalRetroExposure = deals.reduce(
    (sum, d) => sum + (d.cachedRetroInterestExposureCents ?? 0),
    0
  )

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Deals</h1>
          {totalRetroExposure > 0 && (
            <p className="text-red-600 text-sm mt-1">
              Total retroactive interest exposure:{' '}
              <strong>${(totalRetroExposure / 100).toFixed(2)}</strong>
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/dashboard/deals/new">+ Add Deal</Link>
        </Button>
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <p className="text-lg mb-4">No active deals yet.</p>
          <Button asChild>
            <Link href="/dashboard/deals/new">Add your first deal</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  )
}
