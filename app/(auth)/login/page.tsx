import Link from 'next/link'
import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SiteNav } from '@/components/layout/site-nav'

export const metadata = {
  title: 'Sign In — DeadlineZero',
  description: 'Sign in to track your deferred interest deals and never miss a deadline.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0B1020]">
      <SiteNav />

      {/*
       * Outer container: px-[120px] on desktop matches the Figma layout grid.
       * gap-10 (40px) = Figma gap between form area (x=120, w=500) and
       * placeholder panel (x=660, w=500): 660 - (120+500) = 40px.
       */}
      <div className="w-full max-w-[1280px] mx-auto flex items-stretch gap-10 px-4 sm:px-8 lg:px-[120px] min-h-[calc(100vh-86px)] py-8 lg:py-0">

        {/* ── Form panel ──
         * Mobile/tablet: full width, capped at 500px, centered via mx-auto.
         * Desktop: fixed 500px, left-aligned (mx-0).
         */}
        <div className="flex flex-col justify-center w-full max-w-[500px] mx-auto lg:mx-0 lg:w-[500px] shrink-0 py-10 lg:py-[80px]">
          {/* Heading block */}
          <div className="flex flex-col gap-2 mb-10">
            <h2 className="text-[24px] font-bold text-white">Sign In</h2>
            <p className="text-[16px] font-normal text-[#A1B7E7]">
              Get a magic link sent to your email — no password needed.
            </p>
          </div>

          {/* Magic link form */}
          <form
            action={async (formData: FormData) => {
              'use server'
              await signIn('resend', { email: formData.get('email') as string, redirectTo: '/dashboard' })
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-[14px] font-normal text-white">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="bg-transparent border-[#223661] text-white placeholder:text-[#A1B7E7]/50 focus-visible:ring-[#3B82F6] focus-visible:border-[#3B82F6] rounded-[10px]"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-[16px] font-semibold text-white rounded-[10px] transition-colors h-10"
            >
              Send magic link
            </Button>
          </form>

          {/* OR divider — white lines + white label for legibility on dark bg */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#0B1020] text-[14px] font-normal text-white">
                OR
              </span>
            </div>
          </div>

          {/* Google form — hover turns text white, bg gets subtle blue tint */}
          <form
            action={async () => {
              'use server'
              await signIn('google', { redirectTo: '/dashboard' })
            }}
          >
            <Button
              type="submit"
              variant="outline"
              className="w-full border-[#3B82F6] text-[#3B82F6] bg-transparent hover:bg-[rgba(37,99,235,0.18)] hover:text-white text-[16px] font-semibold rounded-[10px] transition-colors h-10 flex items-center gap-3"
            >
              {/* Google "G" icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M15.68 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.31a3.68 3.68 0 0 1-1.6 2.42v2h2.6c1.52-1.4 2.4-3.46 2.4-5.88Z"
                  fill="#4285F4"
                />
                <path
                  d="M8 16c2.16 0 3.97-.71 5.3-1.94l-2.6-2a4.77 4.77 0 0 1-2.7.74 4.76 4.76 0 0 1-4.48-3.29H.84v2.07A8 8 0 0 0 8 16Z"
                  fill="#34A853"
                />
                <path
                  d="M3.52 9.51a4.8 4.8 0 0 1 0-3.02V4.42H.84a8 8 0 0 0 0 7.16l2.68-2.07Z"
                  fill="#FBBC05"
                />
                <path
                  d="M8 3.18c1.23 0 2.33.42 3.2 1.25l2.4-2.4A8 8 0 0 0 .84 4.42l2.68 2.07A4.76 4.76 0 0 1 8 3.18Z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </form>

          <p className="mt-8 text-center text-[14px] font-normal text-[#A1B7E7]/60">
            Don&apos;t have an account?{' '}
            <Link href="/calculator" className="text-[#3B82F6] hover:underline">
              Try the free calculator
            </Link>
          </p>
        </div>

        {/* ── Decorative panel (desktop only) ──
         * w-[500px] matches Figma placeholder (x=660, w=500).
         * my-6 gives vertical breathing room without touching the nav.
         */}
        <div
          aria-hidden="true"
          className="hidden lg:flex flex-col justify-center items-center w-[500px] shrink-0 bg-[#223661] rounded-[20px] my-6"
        >
          <div className="flex flex-col items-center gap-6 px-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#2563EB]/20 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path
                  d="M16 3a13 13 0 1 0 0 26A13 13 0 0 0 16 3Zm0 23.4A10.4 10.4 0 1 1 16 5.6a10.4 10.4 0 0 1 0 20.8Z"
                  fill="#3B82F6"
                />
                <path d="M17.3 9.3h-2.6v8.45l5.08 5.07 1.84-1.84-4.32-4.32V9.3Z" fill="#10B981" />
              </svg>
            </div>
            <h3 className="text-[20px] font-bold text-white leading-snug">
              Never miss a deadline again
            </h3>
            <p className="text-[16px] font-normal text-[#A1B7E7] leading-relaxed max-w-[300px]">
              Track every deferred interest deal. Get alerts at 90, 60, and 30 days. See exactly
              what you owe before retroactive interest hits.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
