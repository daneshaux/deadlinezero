import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-[#0B1020] border-t border-[#223661] mt-auto">
      <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-8 lg:px-[120px] py-6">
        <Link href="/" className="text-[16px] leading-normal text-white whitespace-nowrap">
          Deadline<span className="font-bold">Zero</span>
        </Link>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <Link
            href="/privacy"
            className="text-[14px] font-normal text-[#A1B7E7] hover:text-[#3B82F6] transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-[14px] font-normal text-[#A1B7E7] hover:text-[#3B82F6] transition-colors"
          >
            Terms of Service
          </Link>
          <span className="text-[14px] font-normal text-[#A1B7E7]/50">
            &copy; {new Date().getFullYear()} DeadlineZero
          </span>
        </div>
      </div>
    </footer>
  )
}
