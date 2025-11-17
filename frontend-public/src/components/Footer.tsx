'use client'

import Link from 'next/link'
import { Shield, Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

export default function Footer() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-8 w-8" />
              <div>
                <div className="font-bold text-lg">NSER</div>
                <div className="text-xs text-gray-400">{t('home.title')}</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              {t('home.subtitle')} - {t('home.description').substring(0, 80)}...
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footer.about')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/about`} className="text-gray-400 hover:text-white">{t('nav.about')}</Link></li>
              <li><Link href={`/${locale}/self-exclude`} className="text-gray-400 hover:text-white">{t('nav.self_exclude')}</Link></li>
              <li><Link href={`/${locale}/resources`} className="text-gray-400 hover:text-white">{t('nav.resources')}</Link></li>
              <li><Link href={`/${locale}/faq`} className="text-gray-400 hover:text-white">{t('nav.faq')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footer.support')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/privacy`} className="text-gray-400 hover:text-white">{t('footer.privacy')}</Link></li>
              <li><Link href={`/${locale}/terms`} className="text-gray-400 hover:text-white">{t('footer.terms')}</Link></li>
              <li><Link href={`/${locale}/contact`} className="text-gray-400 hover:text-white">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('contact.title')}</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>{t('contact.office_address')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{t('contact.support_phone')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>{t('contact.support_email')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            {t('footer.copyright')}
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white"><Facebook className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white"><Twitter className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white"><Linkedin className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
