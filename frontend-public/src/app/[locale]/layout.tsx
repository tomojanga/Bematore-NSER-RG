import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { rtlLanguages } from '@/i18n.config'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'NSER - National Self-Exclusion Register',
  description: 'Official National Self-Exclusion Register for responsible gambling. Protect yourself and your loved ones.',
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isRTL = rtlLanguages.has(locale as any)
  const messages = await getMessages()

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages} timeZone="Africa/Nairobi">
          <Header />
          <main className={isRTL ? 'direction-rtl' : ''}>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
