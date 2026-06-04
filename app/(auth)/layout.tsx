import { Noto_Sans } from 'next/font/google'
import { SiteFooter } from '@/components/layout/site-footer'

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${notoSans.className} flex flex-col min-h-screen`}>
      {children}
      <SiteFooter />
    </div>
  )
}
