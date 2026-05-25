import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { db } from '@/lib/db'

type SubscriptionTier = 'FREE' | 'PREMIUM'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      from: process.env.RESEND_FROM_EMAIL!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      session.user.subscriptionTier =
        (user as { subscriptionTier: SubscriptionTier }).subscriptionTier ?? 'FREE'
      return session
    },
  },
})
