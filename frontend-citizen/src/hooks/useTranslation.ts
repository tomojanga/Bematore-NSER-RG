/**
 * Custom hook for accessing translations in components
 * Wrapper around next-intl's useTranslations hook
 */
import { useTranslations as useNextIntlTranslations } from 'next-intl'

export function useTranslation(namespace?: string) {
  const t = useNextIntlTranslations(namespace)
  return { t }
}

export function useTranslations() {
  return useNextIntlTranslations()
}
