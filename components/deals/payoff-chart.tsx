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
  snapshotDate: string
  balanceCents: number
}

export function PayoffChart({ history }: { history: BalancePoint[] }) {
  const data = history.map((p) => ({
    date: format(new Date(p.snapshotDate), 'MMM d'),
    balance: parseFloat((p.balanceCents / 100).toFixed(2)),
  }))

  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-[14px] text-[#A1B7E7]">
        No payment history yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(161,183,231,0.15)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#A1B7E7' }}
          axisLine={{ stroke: '#223661' }}
          tickLine={{ stroke: '#223661' }}
        />
        <YAxis
          tickFormatter={(v: number) => `$${v}`}
          tick={{ fontSize: 11, fill: '#A1B7E7' }}
          axisLine={{ stroke: '#223661' }}
          tickLine={{ stroke: '#223661' }}
          width={70}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0B1020',
            border: '1px solid #223661',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: 13,
          }}
          labelStyle={{ color: '#A1B7E7', marginBottom: 4 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => {
            const num = typeof v === 'number' ? v : parseFloat(String(v ?? 0))
            return [`$${isNaN(num) ? '0.00' : num.toFixed(2)}`, 'Balance']
          }}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 3, fill: '#3B82F6' }}
          activeDot={{ r: 5, fill: '#3B82F6' }}
        />
        <ReferenceLine y={0} stroke="#10B981" strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  )
}
