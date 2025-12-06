import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NSER Operator Portal',
  description: 'Real-time exclusion lookup for licensed gambling operators',
}

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  )
}
