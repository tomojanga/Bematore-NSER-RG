/**
 * Client-side i18n utilities
 * Use with 'use client' directive
 */
'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/navigation'
import { Locale, locales, localeNames, rtlLanguages } from '@/i18n.config'
import { useCallback } from 'react'

export function useLanguageSwitch() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = useCallback(
    (newLocale: Locale) => {
      if (newLocale === locale) return

      // pathname from usePathname() already excludes the locale prefix
      // Just navigate to the new locale with the current path
      router.push(pathname || '/', { locale: newLocale })
    },
    [locale, pathname, router]
  )

  return {
    currentLocale: locale as Locale,
    switchLanguage,
    availableLocales: locales,
    isRTL: rtlLanguages.has(locale as Locale)
  }
}

export function useI18n() {
  const t = useTranslations()
  const { currentLocale, isRTL } = useLanguageSwitch()

  return {
    t,
    currentLocale,
    isRTL,
    currentLanguageName: localeNames[currentLocale as Locale]
  }
}

export function formatDate(date: Date | string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export function formatPhoneNumber(phoneNumber: string, locale: string) {
  // Basic international phone format
  if (phoneNumber.startsWith('+')) {
    return phoneNumber
  }
  // Add + prefix if missing
  return `+${phoneNumber.replace(/\D/g, '')}`
}
