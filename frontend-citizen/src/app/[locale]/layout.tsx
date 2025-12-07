import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/i18n.config'
import Providers from './providers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NSER Citizen Portal',
  description: 'Self-Exclusion Registration Portal',
}

export const generateStaticParams = () => {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Load messages for the locale
  const messages = (await import(`../../../public/locales/${locale as Locale}/common.json`)).default

  return (
    <Providers locale={locale} messages={messages}>{children}</Providers>
  )
}
