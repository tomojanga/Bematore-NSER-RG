'use client'

import { useI18n, useLanguageSwitch } from '@/lib/i18n-client'
import { Globe, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { localeNames } from '@/i18n.config'

export default function LanguageSwitcher() {
  const { currentLocale, isRTL } = useI18n()
  const { switchLanguage, availableLocales } = useLanguageSwitch()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLanguage = localeNames[currentLocale as keyof typeof localeNames]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm font-medium text-gray-700"
        title="Select Language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <span className="sm:hidden">{currentLocale.toUpperCase()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${isRTL ? 'right-0' : 'left-0'} mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto`}
        >
          <div className="py-1">
            {availableLocales.map((locale) => {
              const language = localeNames[locale as keyof typeof localeNames]
              const isCurrentLocale = locale === currentLocale
              
              return (
                <button
                  key={locale}
                  onClick={() => {
                    switchLanguage(locale)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition ${
                    isCurrentLocale
                      ? 'bg-blue-50 border-l-4 border-blue-900'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <span
                    className={`inline-block w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrentLocale
                        ? 'bg-blue-900 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {locale.toUpperCase()}
                  </span>
                  <div>
                    <div className={`font-medium ${isCurrentLocale ? 'text-blue-900' : 'text-gray-900'}`}>
                      {language.nativeName}
                    </div>
                    <div className="text-xs text-gray-500">{language.name}</div>
                  </div>
                  {isCurrentLocale && (
                    <span className="ml-auto text-blue-900 font-bold">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
