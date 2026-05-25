import { Noto_Sans } from 'next/font/google'

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // Wrap in a div so Noto Sans cascades to all public pages without
  // touching the root layout or dashboard pages.
  return <div className={notoSans.className}>{children}</div>
}
