'use client'

import Link from 'next/link'
import { Shield, Users, FileText, BarChart3, CheckCircle, AlertTriangle, Phone, Mail } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

export default function HomePage() {
  const t = useTranslations()
  const locale = useLocale()
  const benefits = t.raw('about.benefits') as string[]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-full">
                <Shield className="h-16 w-16 text-blue-900" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6">{t('home.title')}</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              {t('home.description')}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={`/${locale}/self-exclude`} className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">
                {t('home.cta_primary')}
              </Link>
              <Link href={`/${locale}/about`} className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition">
                {t('home.cta_secondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">10,000+</p>
              <p className="text-gray-600">Protected Citizens</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">100%</p>
              <p className="text-gray-600">Operator Coverage</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <CheckCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">&lt;50ms</p>
              <p className="text-gray-600">Lookup Speed</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">24/7</p>
              <p className="text-gray-600">System Availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">{t('about.how_it_works_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-900">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('self_exclude.step1')}</h3>
              <p className="text-gray-600">{benefits[0]}</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-900">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('self_exclude.step2')}</h3>
              <p className="text-gray-600">{t('self_exclude.duration_lifetime')}</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-900">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('self_exclude.step3')}</h3>
              <p className="text-gray-600">{benefits[1]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">{t('about.benefits_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <CheckCircle className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{t('about.mission_title')}</h3>
              <p className="text-gray-600">{benefits[0]}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Shield className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{benefits[1]}</h3>
              <p className="text-gray-600">{benefits[2]}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <FileText className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{benefits[3]}</h3>
              <p className="text-gray-600">{benefits[4]}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Users className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{t('resources.support_services')}</h3>
              <p className="text-gray-600">{benefits[5]}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <BarChart3 className="h-10 w-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{t('contact.office_hours')}</h3>
              <p className="text-gray-600">{t('resources.guides')}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <AlertTriangle className="h-10 w-10 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{t('common.success')}</h3>
              <p className="text-gray-600">{t('self_exclude.success_message')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">{t('home.title')}</h2>
          <p className="text-xl mb-8">
            {t('home.subtitle')}
          </p>
          <Link href={`/${locale}/self-exclude`} className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition inline-block">
            {t('home.cta_primary')}
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg">
              <Phone className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{t('contact.title')}</h3>
              <p className="text-gray-600 mb-2">{t('contact.support_phone')}</p>
              <p className="text-gray-600">{t('contact.office_hours')}</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <Mail className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{t('contact.title')}</h3>
              <p className="text-gray-600 mb-2">{t('contact.support_email')}</p>
              <p className="text-gray-600">{t('contact.office_hours')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
