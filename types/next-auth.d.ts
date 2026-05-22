import { SubscriptionTier } from '@prisma/client'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      subscriptionTier: SubscriptionTier
    } & DefaultSession['user']
  }

  interface User {
    subscriptionTier: SubscriptionTier
  }
}
