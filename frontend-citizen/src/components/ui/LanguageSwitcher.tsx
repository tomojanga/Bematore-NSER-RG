'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/navigation'
import { localeNames, locales, Locale } from '@/i18n.config'
import { Globe } from 'lucide-react'
import { useState } from 'react'

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (newLocale: Locale) => {
    router.push(pathname, { locale: newLocale })
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{localeNames[locale].nativeName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {locales.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                locale === lang
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="block font-medium">{localeNames[lang].name}</span>
              <span className="text-xs text-gray-500">{localeNames[lang].nativeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
