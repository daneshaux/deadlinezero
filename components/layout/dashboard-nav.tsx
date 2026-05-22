'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Deals' },
  { href: '/dashboard/settings', label: 'Settings' },
  { href: '/dashboard/billing', label: 'Billing' },
]

export function DashboardNav({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col w-64 min-h-screen bg-gray-900 text-white p-4 gap-1">
      <div className="text-xl font-bold mb-8 text-white">DeadlineZero</div>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            pathname === link.href
              ? 'bg-gray-700 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          )}
        >
          {link.label}
        </Link>
      ))}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate mb-2">{userEmail}</p>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="text-sm text-gray-300 hover:text-white">
            Sign out
          </button>
        </form>
      </div>
    </nav>
  )
}
