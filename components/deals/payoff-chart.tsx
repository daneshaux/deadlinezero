'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { format } from 'date-fns'

interface BalancePoint {
  snapshotDate: string  // ISO string
  balanceCents: number
}

export function PayoffChart({
  history,
}: {
  history: BalancePoint[]
}) {
  const data = history.map((p) => ({
    date: format(new Date(p.snapshotDate), 'MMM d'),
    balance: parseFloat((p.balanceCents / 100).toFixed(2)),
  }))

  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
        No payment history yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v: number) => `$${v}`} tick={{ fontSize: 11 }} width={70} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => {
            const num = typeof v === 'number' ? v : parseFloat(String(v ?? 0))
            return [`$${isNaN(num) ? '0.00' : num.toFixed(2)}`, 'Balance']
          }}
          labelStyle={{ fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <ReferenceLine y={0} stroke="#16a34a" strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  )
}
