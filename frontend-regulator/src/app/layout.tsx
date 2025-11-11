import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Portal - National Self-Exclusion Register',
  description: 'Admin Portal for National Self-Exclusion Register',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
