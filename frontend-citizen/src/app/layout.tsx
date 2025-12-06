import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NSER Citizen Portal',
  description: 'Self-Exclusion Registration Portal',
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
