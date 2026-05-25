'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DealFormProps {
  dealId?: string
  initialValues?: {
    merchantName?: string
    description?: string
    issuingBank?: string
    originalPurchaseAmountCents?: number
    currentBalanceCents?: number
    regularAprBps?: number
    promoStartDate?: string
    promoDeadline?: string
    promoDescription?: string
  }
}

const inputCls =
  'bg-transparent border-[#223661] text-white placeholder:text-[#A1B7E7]/50 ' +
  'focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB] rounded-[10px] ' +
  '[color-scheme:dark] h-10'

const labelCls = 'text-[16px] font-normal text-white'

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
        setError(
          "You've reached the 2-deal limit on the free plan. Upgrade to Premium to add more deals."
        )
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-900/30 border border-red-500/40 rounded-[10px] px-4 py-3 text-[14px] text-red-300">
          {error}
        </div>
      )}

      {/* Merchant name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="merchantName" className={labelCls}>
          Merchant name *
        </Label>
        <Input
          id="merchantName"
          name="merchantName"
          required
          defaultValue={iv.merchantName}
          placeholder="Best Buy, Ashley Furniture, CareCredit…"
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="description" className={labelCls}>
          Description (optional)
        </Label>
        <Input
          id="description"
          name="description"
          defaultValue={iv.description}
          placeholder="65-inch TV, living room set, root canal…"
          className={inputCls}
        />
      </div>

      {/* Issuing bank */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="issuingBank" className={labelCls}>
          Issuing bank
        </Label>
        <Select name="issuingBank" defaultValue={iv.issuingBank ?? 'OTHER'}>
          <SelectTrigger
            id="issuingBank"
            className="h-10 bg-transparent border-[#223661] text-white focus:ring-[#2563EB] focus:border-[#2563EB] rounded-[10px] text-[16px] [&>svg]:text-[#A1B7E7]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0B1020] border-[#223661]">
            {[
              ['SYNCHRONY', 'Synchrony'],
              ['CARECREDIT', 'CareCredit'],
              ['COMENITY', 'Comenity'],
              ['CITIBANK', 'Citibank'],
              ['TD_RETAIL', 'TD Retail'],
              ['WELLS_FARGO_RETAIL', 'Wells Fargo Retail'],
              ['OTHER', 'Other'],
            ].map(([value, label]) => (
              <SelectItem
                key={value}
                value={value}
                className="text-white focus:bg-[#223661] focus:text-white cursor-pointer"
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Original amount + Current balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="originalAmount" className={labelCls}>
            Original amount ($) *
          </Label>
          <Input
            id="originalAmount"
            name="originalAmount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={
              iv.originalPurchaseAmountCents != null
                ? (iv.originalPurchaseAmountCents / 100).toFixed(2)
                : ''
            }
            placeholder="1200.00"
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="currentBalance" className={labelCls}>
            Current balance ($) *
          </Label>
          <Input
            id="currentBalance"
            name="currentBalance"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={
              iv.currentBalanceCents != null
                ? (iv.currentBalanceCents / 100).toFixed(2)
                : ''
            }
            placeholder="840.00"
            className={inputCls}
          />
        </div>
      </div>

      {/* APR */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="apr" className={labelCls}>
          APR (%) *
        </Label>
        <Input
          id="apr"
          name="apr"
          type="number"
          step="0.01"
          min="0.01"
          max="100"
          required
          defaultValue={
            iv.regularAprBps != null ? (iv.regularAprBps / 100).toFixed(2) : ''
          }
          placeholder="26.99"
          className={inputCls}
        />
      </div>

      {/* Purchase date + Promo deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="promoStartDate" className={labelCls}>
            Purchase date *
          </Label>
          <Input
            id="promoStartDate"
            name="promoStartDate"
            type="date"
            required
            defaultValue={iv.promoStartDate ? iv.promoStartDate.slice(0, 10) : ''}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="promoDeadline" className={labelCls}>
            Promo deadline *
          </Label>
          <Input
            id="promoDeadline"
            name="promoDeadline"
            type="date"
            required
            defaultValue={iv.promoDeadline ? iv.promoDeadline.slice(0, 10) : ''}
            className={inputCls}
          />
        </div>
      </div>

      {/* Promo description */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="promoDescription" className={labelCls}>
          Promo description (optional)
        </Label>
        <Input
          id="promoDescription"
          name="promoDescription"
          defaultValue={iv.promoDescription}
          placeholder="18 months no interest if paid in full"
          className={inputCls}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-[450px] sm:mx-auto bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-[16px] font-semibold text-white rounded-[10px] transition-colors h-10"
      >
        {loading ? 'Saving…' : dealId ? 'Save changes' : 'Start tracking'}
      </button>
    </form>
  )
}
