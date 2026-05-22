'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Log a payment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="amount">Amount paid ($)</Label>
          <Input
            id="amount" name="amount" type="number" step="0.01" min="0.01" required
            placeholder="105.00"
          />
        </div>
        <div>
          <Label htmlFor="note">Note (optional)</Label>
          <Input id="note" name="note" placeholder="Monthly payment, extra payment…" />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Log payment'}
        </Button>
      </form>
    </div>
  )
}
