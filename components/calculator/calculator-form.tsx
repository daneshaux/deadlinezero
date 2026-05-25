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

// Shared input/label classes matching the DZ dark design system
const inputCls =
  'bg-transparent border-[#223661] text-white placeholder:text-[#A1B7E7]/50 ' +
  'focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB] rounded-[10px] ' +
  '[color-scheme:dark]'
const labelCls = 'text-[16px] font-normal text-white'

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

  // ── All calculation logic preserved verbatim ──────────────────────────────
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
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Row 1 — Original amount + Current balance (2-col on sm+) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="originalAmount" className={labelCls}>
              Original financed amount ($)
            </Label>
            <Input
              id="originalAmount"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={formValues.originalAmount}
              onChange={(e) => setFormValues((v) => ({ ...v, originalAmount: e.target.value }))}
              placeholder="1200.00"
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentBalance" className={labelCls}>
              Current balance ($)
            </Label>
            <Input
              id="currentBalance"
              type="number"
              step="0.01"
              min="0"
              required
              value={formValues.currentBalance}
              onChange={(e) => setFormValues((v) => ({ ...v, currentBalance: e.target.value }))}
              placeholder="840.00"
              className={inputCls}
            />
          </div>
        </div>

        {/* Row 2 — APR (full width) */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="apr" className={labelCls}>
            APR (%)
          </Label>
          <Input
            id="apr"
            type="number"
            step="0.01"
            min="0.01"
            max="100"
            required
            value={formValues.apr}
            onChange={(e) => setFormValues((v) => ({ ...v, apr: e.target.value }))}
            placeholder="26.99"
            className={inputCls}
          />
        </div>

        {/* Row 3 — Purchase date + Promo deadline (2-col on sm+) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="promoStartDate" className={labelCls}>
              Purchase date
            </Label>
            <Input
              id="promoStartDate"
              type="date"
              required
              value={formValues.promoStartDate}
              onChange={(e) => setFormValues((v) => ({ ...v, promoStartDate: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="promoDeadline" className={labelCls}>
              Promo deadline
            </Label>
            <Input
              id="promoDeadline"
              type="date"
              required
              value={formValues.promoDeadline}
              onChange={(e) => setFormValues((v) => ({ ...v, promoDeadline: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/40 rounded-[10px] px-4 py-3 text-[14px] text-red-300">
            {error}
          </div>
        )}

        {/*
         * Button: full-width on mobile, 450px centered on sm+.
         * 450px matches Figma button width on tablet/desktop frames.
         */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-[450px] sm:mx-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-[16px] font-semibold text-white rounded-[10px] transition-colors h-10 disabled:opacity-60"
        >
          {loading ? 'Calculating…' : 'Calculate my exposure'}
        </Button>
      </form>

      {/* Results box — existing structure preserved, dark-system styling applied */}
      {result && (
        <div className="dz-glass-card rounded-[10px] p-6 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-normal text-[#A1B7E7] uppercase tracking-wide">
                Monthly payment needed
              </p>
              <p className="text-[28px] font-bold text-[#3B82F6]">
                ${(result.monthlyPaymentNeededCents / 100).toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-normal text-red-400 uppercase tracking-wide">
                If you miss the deadline
              </p>
              <p className="text-[28px] font-bold text-red-400">
                ${(result.retroInterestExposureCents / 100).toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-normal text-[#A1B7E7] uppercase tracking-wide">
                Days remaining
              </p>
              <p
                className={`text-[28px] font-bold ${
                  result.daysRemaining <= 30 ? 'text-red-400' : 'text-white'
                }`}
              >
                {result.daysRemaining > 0 ? result.daysRemaining : 'Overdue'}
              </p>
            </div>
          </div>
          <Button
            asChild
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-[16px] font-semibold text-white rounded-[10px] transition-colors h-10"
          >
            <Link href="/login">Track this deal and get alerts →</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
