import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'DeadlineZero',
  description: 'Track your deferred-interest deals and never miss a payoff deadline.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DeadlineZero',
  },
}

export const viewport: Viewport = {
  themeColor: '#0B1020',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" style={{ backgroundColor: '#0B1020' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#0B1020' }}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
