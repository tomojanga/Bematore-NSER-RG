/**
 * i18n Configuration for Next-Intl
 * Loads translations for all supported languages
 * Note: timeZone is configured globally in middleware.ts
 */
import { getRequestConfig } from 'next-intl/server'
import { locales, Locale, defaultLocale } from '@/i18n.config'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale = (locales.includes(locale as Locale) ? locale : defaultLocale) as Locale

  try {
    const messages = (await import(`../../public/locales/${validLocale}/common.json`)).default
    return {
      messages,
    }
  } catch (error) {
    console.error(`Failed to load messages for locale: ${validLocale}`, error)
    // Fallback to default locale
    const fallbackMessages = (await import(`../../public/locales/${defaultLocale}/common.json`)).default
    return {
      messages: fallbackMessages,
    }
  }
})
