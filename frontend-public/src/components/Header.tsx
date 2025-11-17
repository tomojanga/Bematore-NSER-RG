'use client'

import Link from 'next/link'
import { Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'
import { portalLinks } from '@/data/content'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations()
  const locale = useLocale()

  const navigation = [
    { name: t('nav.home'), href: `/${locale}/` },
    { name: t('nav.about'), href: `/${locale}/about` },
    { name: t('nav.self_exclude'), href: `/${locale}/self-exclude` },
    { name: t('nav.resources'), href: `/${locale}/resources` },
    { name: t('nav.faq'), href: `/${locale}/faq` },
    { name: t('nav.contact'), href: `/${locale}/contact` },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-blue-900 p-2 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">NSER</div>
              <div className="text-xs text-gray-600">National Self-Exclusion Register</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-900 font-medium transition text-sm"
              >
                {item.name}
              </Link>
            ))}
            
            <div className="h-6 border-l border-gray-300"></div>
            
            <LanguageSwitcher />
            
            <Link
              href={portalLinks.citizen}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition text-sm"
            >
              Citizen Portal
            </Link>
            <Link
              href={portalLinks.operator}
              className="bg-green-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition text-sm"
            >
              Operator Portal
            </Link>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-2 text-gray-700 hover:text-blue-900 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="py-2 border-t">
              <div className="text-xs text-gray-600 font-semibold px-2 py-2">{t('common.language')}</div>
              <LanguageSwitcher />
            </div>
            <Link
              href={portalLinks.citizen}
              className="block bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold text-center"
            >
              Citizen Portal
            </Link>
            <Link
              href={portalLinks.operator}
              className="block bg-green-700 text-white px-6 py-2 rounded-lg font-semibold text-center mt-2"
            >
              Operator Portal
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
