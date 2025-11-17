/**
 * i18n Configuration for Next-Intl
 * Loads translations for all supported languages
 */
import { getRequestConfig } from 'next-intl/server'
import { locales, Locale, defaultLocale } from '@/i18n.config'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale = (locales.includes(locale as Locale) ? locale : defaultLocale) as Locale

  return {
    messages: (await import(`../public/locales/${validLocale}/common.json`)).default,
    timeZone: 'Africa/Nairobi', // Default to East Africa
    now: new Date()
  }
})
