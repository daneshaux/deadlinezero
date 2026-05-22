import { z } from 'zod'

export const createDealSchema = z.object({
  merchantName: z.string().min(1).max(100),
  description: z.string().max(200).optional(),
  issuingBank: z.enum([
    'SYNCHRONY', 'CARECREDIT', 'COMENITY', 'CITIBANK',
    'TD_RETAIL', 'WELLS_FARGO_RETAIL', 'OTHER',
  ]).default('OTHER'),
  originalPurchaseAmountCents: z.number().int().positive(),
  currentBalanceCents: z.number().int().nonnegative(),
  minimumPaymentCents: z.number().int().nonnegative().optional(),
  regularAprBps: z.number().int().positive().max(10000),
  promoStartDate: z.string().datetime(),
  promoDeadline: z.string().datetime(),
  promoDescription: z.string().max(200).optional(),
})

export const updateDealSchema = createDealSchema.partial()
