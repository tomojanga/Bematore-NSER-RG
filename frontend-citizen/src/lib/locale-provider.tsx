/**
 * Locale Provider for next-intl
 * Wraps the application with internationalization support
 */
import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { Locale } from '@/i18n.config'

interface LocaleProviderProps {
  children: ReactNode
  locale: Locale
  messages: any
}

export function LocaleProvider({ children, locale, messages }: LocaleProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
