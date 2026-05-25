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
    <div className="p-4 sm:p-8 lg:p-8">
      <div className="max-w-2xl">
        <h2 className="text-[24px] font-bold text-white mb-2">Edit deal</h2>
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
    </div>
  )
}
