import { PrismaClient } from '@prisma/client'
import { addMonths, subMonths } from 'date-fns'

const db = new PrismaClient()

async function main() {
  const user = await db.user.upsert({
    where: { email: 'demo@deadlinezero.dev' },
    update: {},
    create: {
      email: 'demo@deadlinezero.dev',
      name: 'Demo User',
      subscriptionTier: 'FREE',
    },
  })

  const today = new Date()

  await db.promoDeal.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: user.id,
        merchantName: 'Best Buy',
        description: '65-inch OLED TV',
        issuingBank: 'CITIBANK',
        originalPurchaseAmountCents: 179900,
        currentBalanceCents: 126000,
        regularAprBps: 2699,
        promoStartDate: subMonths(today, 6),
        promoDeadline: addMonths(today, 3),
        promoDescription: '18 months no interest if paid in full',
        status: 'ACTIVE',
      },
      {
        userId: user.id,
        merchantName: 'CareCredit',
        description: 'Root canal + crown',
        issuingBank: 'CARECREDIT',
        originalPurchaseAmountCents: 320000,
        currentBalanceCents: 280000,
        regularAprBps: 2699,
        promoStartDate: subMonths(today, 2),
        promoDeadline: addMonths(today, 10),
        promoDescription: '12 months deferred interest',
        status: 'ACTIVE',
      },
    ],
  })

  console.log(`Seeded demo user: ${user.email}`)
  console.log('Seeded 2 demo deals.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
