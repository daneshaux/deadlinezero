'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-[#0B1020]">
      {/* Main nav bar — max-w matches hero content container so logo and
          nav items align on desktop at any viewport width above 1280px */}
      <nav className="max-w-[1280px] mx-auto flex items-center justify-between px-4 sm:px-8 lg:px-[120px] py-6">
        {/* Wordmark: Noto Sans Regular "Deadline" + Bold "Zero" — 24px */}
        <Link href="/" className="text-[24px] leading-normal text-white whitespace-nowrap">
          Deadline<span className="font-bold">Zero</span>
        </Link>

        {/* Tablet / Desktop nav */}
        <div className="hidden sm:flex items-center gap-8">
          <Link
            href="/calculator"
            className="text-[16px] font-normal text-white hover:text-[#3B82F6] transition-colors"
          >
            Calculator
          </Link>
          <Link
            href="/pricing"
            className="text-[16px] font-normal text-white hover:text-[#3B82F6] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-[16px] font-semibold text-[#3B82F6] border border-[#3B82F6] px-4 py-2 rounded-[10px] hover:bg-[var(--dz-glass-blue-light)] transition-colors whitespace-nowrap"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-white p-1 rounded-md hover:bg-[#223661] transition-colors"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden flex flex-col border-t border-[#223661]">
          <Link
            href="/calculator"
            className="text-[16px] font-normal text-white px-4 py-4 hover:bg-[#223661] transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Calculator
          </Link>
          <Link
            href="/pricing"
            className="text-[16px] font-normal text-white px-4 py-4 hover:bg-[#223661] transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </Link>
          <div className="px-4 py-4">
            <Link
              href="/login"
              className="block text-center text-[16px] font-semibold text-[#3B82F6] border border-[#3B82F6] px-4 py-2 rounded-[10px] hover:bg-[var(--dz-glass-blue-light)] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
