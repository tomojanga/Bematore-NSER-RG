/**
 * Internationalization Configuration
 * Supports 10 languages across Africa
 */

export type Locale = 'en' | 'sw' | 'fr' | 'ar' | 'pt' | 'zu' | 'xh' | 'ig' | 'am' | 'ha'

export const locales: Locale[] = ['en', 'sw', 'fr', 'ar', 'pt', 'zu', 'xh', 'ig', 'am', 'ha']

export const localeNames: Record<Locale, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  sw: { name: 'Swahili', nativeName: 'Kiswahili' },
  fr: { name: 'French', nativeName: 'Français' },
  ar: { name: 'Arabic', nativeName: 'العربية' },
  pt: { name: 'Portuguese', nativeName: 'Português' },
  zu: { name: 'Zulu', nativeName: 'isiZulu' },
  xh: { name: 'Xhosa', nativeName: 'isiXhosa' },
  ig: { name: 'Igbo', nativeName: 'Igbo' },
  am: { name: 'Amharic', nativeName: 'አማርኛ' },
  ha: { name: 'Hausa', nativeName: 'Hausa' },
}

export const defaultLocale: Locale = 'en'

// RTL languages
export const rtlLanguages = new Set(['ar'])
