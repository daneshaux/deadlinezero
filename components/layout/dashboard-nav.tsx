'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function DashboardNav({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function navLink(href: string, label: string) {
    const active = pathname === href
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setMobileOpen(false)}
        className={`block text-[16px] transition-colors ${
          active
            ? 'font-semibold text-[#3B82F6]'
            : 'font-normal text-white hover:text-[#A1B7E7]'
        }`}
      >
        {label}
      </Link>
    )
  }

  const NavLinks = () => (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-[14px] text-[#A1B7E7]">Menu</span>
        {navLink('/dashboard', 'Deals')}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[14px] text-[#A1B7E7]">General</span>
        <div className="flex flex-col gap-2">
          {navLink('/dashboard/settings', 'Settings')}
          {navLink('/dashboard/billing', 'Billing')}
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-[273px] shrink-0 min-h-screen bg-[#0B1020] border-r border-[#223661] px-8 py-8 justify-between">
        <div className="flex flex-col gap-6">
          <Link href="/dashboard" className="text-[24px] text-white whitespace-nowrap">
            Deadline<span className="font-bold">Zero</span>
          </Link>
          <NavLinks />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[14px] text-[#A1B7E7] truncate">{userEmail}</span>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="text-[16px] font-normal text-white hover:text-[#A1B7E7] transition-colors text-left"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0B1020] border-b border-[#223661] h-[72px] flex items-center justify-between px-4">
        <Link href="/dashboard" className="text-[24px] text-white whitespace-nowrap">
          Deadline<span className="font-bold">Zero</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 flex items-center justify-center text-white rounded-lg hover:bg-[#223661] transition-colors"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-[280px] bg-[#0B1020] border-l border-[#223661] px-8 py-8 h-full justify-between">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="text-[24px] text-white whitespace-nowrap"
                >
                  Deadline<span className="font-bold">Zero</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-white rounded-lg hover:bg-[#223661] transition-colors"
                  aria-label="Close menu"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="4" y1="4" x2="16" y2="16" />
                    <line x1="16" y1="4" x2="4" y2="16" />
                  </svg>
                </button>
              </div>
              <NavLinks />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[14px] text-[#A1B7E7] truncate">{userEmail}</span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-[16px] font-normal text-white hover:text-[#A1B7E7] transition-colors text-left"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
