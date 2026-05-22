'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DealFormProps {
  dealId?: string
  initialValues?: {
    merchantName?: string
    description?: string
    issuingBank?: string
    originalPurchaseAmountCents?: number
    currentBalanceCents?: number
    regularAprBps?: number
    promoStartDate?: string  // ISO string
    promoDeadline?: string   // ISO string
    promoDescription?: string
  }
}

export function DealForm({ dealId, initialValues }: DealFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData(e.currentTarget)

    const originalAmountDollars = parseFloat(fd.get('originalAmount') as string)
    const balanceDollars = parseFloat(fd.get('currentBalance') as string)
    const aprPercent = parseFloat(fd.get('apr') as string)

    const body = {
      merchantName: fd.get('merchantName') as string,
      description: (fd.get('description') as string) || undefined,
      issuingBank: fd.get('issuingBank') as string,
      originalPurchaseAmountCents: Math.round(originalAmountDollars * 100),
      currentBalanceCents: Math.round(balanceDollars * 100),
      regularAprBps: Math.round(aprPercent * 100),
      promoStartDate: new Date(fd.get('promoStartDate') as string).toISOString(),
      promoDeadline: new Date(fd.get('promoDeadline') as string).toISOString(),
      promoDescription: (fd.get('promoDescription') as string) || undefined,
    }

    const res = await fetch(dealId ? `/api/deals/${dealId}` : '/api/deals', {
      method: dealId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (res.status === 403) {
        setError('You\'ve reached the 2-deal limit on the free plan. Upgrade to Premium to add more deals.')
      } else {
        setError(data.error?.message ?? 'Something went wrong. Please try again.')
      }
      setLoading(false)
      return
    }

    const deal = await res.json()
    router.push(`/dashboard/deals/${deal.id}`)
    router.refresh()
  }

  const iv = initialValues ?? {}

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="merchantName">Merchant name *</Label>
        <Input
          id="merchantName" name="merchantName" required
          defaultValue={iv.merchantName}
          placeholder="Best Buy, Ashley Furniture, CareCredit…"
        />
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description" name="description"
          defaultValue={iv.description}
          placeholder="65-inch TV, living room set, root canal…"
        />
      </div>

      <div>
        <Label htmlFor="issuingBank">Issuing bank</Label>
        <Select name="issuingBank" defaultValue={iv.issuingBank ?? 'OTHER'}>
          <SelectTrigger id="issuingBank">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SYNCHRONY">Synchrony</SelectItem>
            <SelectItem value="CARECREDIT">CareCredit</SelectItem>
            <SelectItem value="COMENITY">Comenity</SelectItem>
            <SelectItem value="CITIBANK">Citibank</SelectItem>
            <SelectItem value="TD_RETAIL">TD Retail</SelectItem>
            <SelectItem value="WELLS_FARGO_RETAIL">Wells Fargo Retail</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="originalAmount">Original amount ($) *</Label>
          <Input
            id="originalAmount" name="originalAmount" type="number" step="0.01" min="0.01" required
            defaultValue={iv.originalPurchaseAmountCents != null ? (iv.originalPurchaseAmountCents / 100).toFixed(2) : ''}
            placeholder="1200.00"
          />
        </div>
        <div>
          <Label htmlFor="currentBalance">Current balance ($) *</Label>
          <Input
            id="currentBalance" name="currentBalance" type="number" step="0.01" min="0" required
            defaultValue={iv.currentBalanceCents != null ? (iv.currentBalanceCents / 100).toFixed(2) : ''}
            placeholder="840.00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="apr">APR (%) *</Label>
        <Input
          id="apr" name="apr" type="number" step="0.01" min="0.01" max="100" required
          defaultValue={iv.regularAprBps != null ? (iv.regularAprBps / 100).toFixed(2) : ''}
          placeholder="26.99"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="promoStartDate">Purchase date *</Label>
          <Input
            id="promoStartDate" name="promoStartDate" type="date" required
            defaultValue={iv.promoStartDate ? iv.promoStartDate.slice(0, 10) : ''}
          />
        </div>
        <div>
          <Label htmlFor="promoDeadline">Promo deadline *</Label>
          <Input
            id="promoDeadline" name="promoDeadline" type="date" required
            defaultValue={iv.promoDeadline ? iv.promoDeadline.slice(0, 10) : ''}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="promoDescription">Promo description (optional)</Label>
        <Input
          id="promoDescription" name="promoDescription"
          defaultValue={iv.promoDescription}
          placeholder="18 months no interest if paid in full"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : dealId ? 'Save changes' : 'Start tracking'}
      </Button>
    </form>
  )
}
