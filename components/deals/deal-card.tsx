import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PromoDeal } from '@prisma/client'

function urgencyBadge(daysRemaining: number | null) {
  if (daysRemaining === null || daysRemaining === undefined) return null
  if (daysRemaining <= 0) return <Badge variant="destructive">Overdue</Badge>
  if (daysRemaining <= 14) return <Badge variant="destructive">{daysRemaining}d left</Badge>
  if (daysRemaining <= 30) return <Badge className="bg-orange-500 text-white">{daysRemaining}d left</Badge>
  if (daysRemaining <= 90) return <Badge className="bg-yellow-500 text-white">{daysRemaining}d left</Badge>
  return <Badge variant="secondary">{daysRemaining}d left</Badge>
}

export function DealCard({ deal }: { deal: PromoDeal }) {
  const balance = (deal.currentBalanceCents / 100).toFixed(2)
  const monthly = deal.cachedMonthlyPaymentNeededCents != null
    ? `$${(deal.cachedMonthlyPaymentNeededCents / 100).toFixed(2)}/mo`
    : '—'
  const retroInterest = deal.cachedRetroInterestExposureCents != null
    ? `$${(deal.cachedRetroInterestExposureCents / 100).toFixed(2)}`
    : '—'
  const progress =
    deal.originalPurchaseAmountCents > 0
      ? Math.round((1 - deal.currentBalanceCents / deal.originalPurchaseAmountCents) * 100)
      : 0

  return (
    <Link href={`/dashboard/deals/${deal.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg truncate">{deal.merchantName}</CardTitle>
          {urgencyBadge(deal.cachedDaysRemaining)}
        </CardHeader>
        <CardContent className="space-y-3">
          {deal.description && (
            <p className="text-sm text-gray-500 truncate">{deal.description}</p>
          )}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress}% paid</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Balance: <strong>${balance}</strong></span>
            <span className="text-gray-600">Need: <strong>{monthly}</strong></span>
          </div>
          <div className="pt-1 border-t">
            <p className="text-sm text-red-600 font-medium">
              Interest if missed: {retroInterest}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
