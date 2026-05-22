'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CalcResult {
  monthlyPaymentNeededCents: number
  retroInterestExposureCents: number
  daysRemaining: number
}

export function CalculatorForm() {
  const [result, setResult] = useState<CalcResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formValues, setFormValues] = useState({
    originalAmount: '',
    currentBalance: '',
    apr: '',
    promoStartDate: '',
    promoDeadline: '',
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const body = {
      originalPurchaseAmountCents: Math.round(parseFloat(formValues.originalAmount) * 100),
      currentBalanceCents: Math.round(parseFloat(formValues.currentBalance) * 100),
      regularAprBps: Math.round(parseFloat(formValues.apr) * 100),
      promoStartDate: new Date(formValues.promoStartDate).toISOString(),
      promoDeadline: new Date(formValues.promoDeadline).toISOString(),
    }

    const res = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      setError('Calculation failed. Please check your inputs and try again.')
      setLoading(false)
      return
    }

    const data: CalcResult = await res.json()
    setResult(data)

    // Save for pre-populating the new deal form after sign-in
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'pendingDeal',
        JSON.stringify({
          originalPurchaseAmountCents: body.originalPurchaseAmountCents,
          currentBalanceCents: body.currentBalanceCents,
          regularAprBps: body.regularAprBps,
          promoStartDate: formValues.promoStartDate,
          promoDeadline: formValues.promoDeadline,
        })
      )
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="originalAmount">Original financed amount ($)</Label>
            <Input
              id="originalAmount" type="number" step="0.01" min="0.01" required
              value={formValues.originalAmount}
              onChange={(e) => setFormValues((v) => ({ ...v, originalAmount: e.target.value }))}
              placeholder="1200.00"
            />
          </div>
          <div>
            <Label htmlFor="currentBalance">Current balance ($)</Label>
            <Input
              id="currentBalance" type="number" step="0.01" min="0" required
              value={formValues.currentBalance}
              onChange={(e) => setFormValues((v) => ({ ...v, currentBalance: e.target.value }))}
              placeholder="840.00"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="apr">APR (%)</Label>
          <Input
            id="apr" type="number" step="0.01" min="0.01" max="100" required
            value={formValues.apr}
            onChange={(e) => setFormValues((v) => ({ ...v, apr: e.target.value }))}
            placeholder="26.99"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="promoStartDate">Purchase date</Label>
            <Input
              id="promoStartDate" type="date" required
              value={formValues.promoStartDate}
              onChange={(e) => setFormValues((v) => ({ ...v, promoStartDate: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="promoDeadline">Promo deadline</Label>
            <Input
              id="promoDeadline" type="date" required
              value={formValues.promoDeadline}
              onChange={(e) => setFormValues((v) => ({ ...v, promoDeadline: e.target.value }))}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Calculating…' : 'Calculate my exposure'}
        </Button>
      </form>

      {result && (
        <div className="bg-white rounded-xl border p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Monthly payment needed</p>
              <p className="text-3xl font-bold text-blue-600">
                ${(result.monthlyPaymentNeededCents / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-red-500 uppercase tracking-wide mb-1">If you miss the deadline</p>
              <p className="text-3xl font-bold text-red-600">
                ${(result.retroInterestExposureCents / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Days remaining</p>
              <p className={`text-3xl font-bold ${result.daysRemaining <= 30 ? 'text-red-600' : ''}`}>
                {result.daysRemaining > 0 ? result.daysRemaining : 'Overdue'}
              </p>
            </div>
          </div>
          <Button asChild className="w-full" size="lg">
            <Link href="/login">Track this deal and get alerts →</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
