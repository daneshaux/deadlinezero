import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/layout/dashboard-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <DashboardNav userEmail={session.user.email} />
      <main className="flex-1 p-8 bg-gray-50 overflow-auto">{children}</main>
    </div>
  )
}
