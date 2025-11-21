import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n.config'

export const metadata: Metadata = {
  title: 'NSER Citizen Portal',
  description: 'Self-Exclusion Registration Portal',
}

export default function RootLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(params.locale as any)) {
    notFound()
  }

  return (
    <html lang={params.locale} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
