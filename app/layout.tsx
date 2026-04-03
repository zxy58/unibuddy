import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UniBuddy — Navigate College Like You Already Belong',
  description: 'Personalized AI guidance for first-generation and international students navigating U.S. higher education.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
