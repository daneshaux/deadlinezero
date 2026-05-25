import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Noto_Sans } from 'next/font/google'
import { DashboardNav } from '@/components/layout/dashboard-nav'

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className={`${notoSans.className} flex min-h-screen bg-[#0B1020]`}>
      <DashboardNav userEmail={session.user.email} />
      {/*
       * pt-[72px] on mobile offsets the fixed top bar height.
       * lg:pt-0 removes it on desktop where the sidebar is in flow.
       */}
      <main className="flex-1 bg-[#0B1020] overflow-auto pt-[72px] lg:pt-0">
        {/*
         * max-w-[1040px] is a subtle guard that has zero effect at the 1280px
         * Figma reference width (content area ≈ 1007px) but prevents awkward
         * stretching on wider monitors (1440px+).
         */}
        <div className="max-w-[1040px]">
          {children}
        </div>
      </main>
    </div>
  )
}
