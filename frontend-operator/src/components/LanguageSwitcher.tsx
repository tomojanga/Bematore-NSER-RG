'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/navigation'
import { locales, localeNames, type Locale } from '@/i18n.config'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (newLocale: Locale) => {
    router.push(pathname, { locale: newLocale })
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
      >
        <span className="font-medium">{localeNames[locale as Locale]?.nativeName}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {locales.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  locale === lang
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="font-medium">{localeNames[lang]?.name}</div>
                <div className="text-xs text-gray-500">{localeNames[lang]?.nativeName}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
