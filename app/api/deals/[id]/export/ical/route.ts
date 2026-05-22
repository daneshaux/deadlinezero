import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generatePayoffSchedule } from '@/lib/calculations'
import { format } from 'date-fns'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await db.promoDeal.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const schedule = generatePayoffSchedule(deal.currentBalanceCents, deal.promoDeadline)
  const now = format(new Date(), "yyyyMMdd'T'HHmmss'Z'")

  const events = schedule
    .map((entry) => {
      const dateStr = format(entry.month, 'yyyyMMdd')
      const payment = (entry.paymentCents / 100).toFixed(2)
      return [
        'BEGIN:VEVENT',
        `UID:deadlinezero-${deal.id}-${dateStr}`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `SUMMARY:Pay $${payment} on ${deal.merchantName} deal`,
        `DESCRIPTION:DeadlineZero payment reminder. Balance after: $${(entry.balanceCents / 100).toFixed(2)}`,
        'END:VEVENT',
      ].join('\r\n')
    })
    .join('\r\n')

  const ical = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DeadlineZero//EN', events, 'END:VCALENDAR'].join('\r\n')

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="deadlinezero-${deal.id}.ics"`,
    },
  })
}
