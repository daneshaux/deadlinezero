import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { DealForm } from '@/components/deals/deal-form'

export default async function EditDealPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const deal = await db.promoDeal.findFirst({
    where: { id: params.id, userId: session!.user.id },
  })
  if (!deal) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit deal</h1>
      <DealForm
        dealId={deal.id}
        initialValues={{
          merchantName: deal.merchantName,
          description: deal.description ?? undefined,
          issuingBank: deal.issuingBank,
          originalPurchaseAmountCents: deal.originalPurchaseAmountCents,
          currentBalanceCents: deal.currentBalanceCents,
          regularAprBps: deal.regularAprBps,
          promoStartDate: deal.promoStartDate.toISOString(),
          promoDeadline: deal.promoDeadline.toISOString(),
          promoDescription: deal.promoDescription ?? undefined,
        }}
      />
    </div>
  )
}
