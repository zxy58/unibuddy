import './globals.css'
import type { Metadata } from 'next'
import { Urbanist } from 'next/font/google'

const urbanist = Urbanist({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

export const metadata: Metadata = {
  title: 'UniBuddy — Navigate College Like You Already Belong',
  description: 'Personalized AI guidance for first-generation and international students navigating U.S. higher education.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={urbanist.className}>{children}</body>
    </html>
  )
}
