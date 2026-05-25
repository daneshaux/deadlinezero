import { Noto_Sans } from 'next/font/google'

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className={notoSans.className}>{children}</div>
}
