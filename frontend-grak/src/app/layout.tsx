import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GRAK Admin Portal - NSER',
  description: 'Gambling Regulatory Authority of Kenya - Admin Portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
