'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const inputCls =
  'bg-transparent border-[#223661] text-white placeholder:text-[#A1B7E7]/50 ' +
  'focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB] rounded-[10px] ' +
  '[color-scheme:dark] h-10'

const labelCls = 'text-[16px] font-normal text-white'

export default function LogPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const amountCents = Math.round(parseFloat(fd.get('amount') as string) * 100)

    const res = await fetch(`/api/deals/${params.id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountCents,
        paymentDate: new Date().toISOString(),
        note: (fd.get('note') as string) || undefined,
      }),
    })

    if (!res.ok) {
      setError('Failed to log payment. Please try again.')
      setLoading(false)
      return
    }

    router.push(`/dashboard/deals/${params.id}`)
    router.refresh()
  }

  return (
    <div className="p-4 sm:p-8 lg:p-8">
      <div className="max-w-md">
        <h2 className="text-[24px] font-bold text-white mb-6">Log a payment</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="bg-red-900/30 border border-red-500/40 rounded-[10px] px-4 py-3 text-[14px] text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount" className={labelCls}>
              Amount paid ($)
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="105.00"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="note" className={labelCls}>
              Note (optional)
            </Label>
            <Input
              id="note"
              name="note"
              placeholder="Monthly payment, extra payment…"
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-[450px] sm:mx-auto bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-[16px] font-semibold text-white rounded-[10px] transition-colors h-10"
          >
            {loading ? 'Saving…' : 'Log payment'}
          </button>
        </form>
      </div>
    </div>
  )
}
