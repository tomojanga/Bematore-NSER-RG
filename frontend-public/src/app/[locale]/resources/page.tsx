'use client'

import { useTranslations } from 'next-intl'
import { Phone, MapPin, FileText, Activity } from 'lucide-react'

export default function ResourcesPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{t('resources.title')}</h1>
          <p className="text-xl text-blue-100">{t('resources.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('resources.help_lines')}</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <Phone className="h-8 w-8 text-blue-900 mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact.title')}</h3>
            <p className="text-2xl font-bold text-blue-900 mb-2">{t('contact.support_phone')}</p>
            <p className="text-sm text-gray-600 mb-1">{t('contact.office_hours')}</p>
            <p className="text-gray-700">{t('resources.support_services')}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('resources.support_services')}</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <MapPin className="h-8 w-8 text-blue-900 mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact.office_address')}</h3>
            <p className="text-gray-600 mb-2">{t('contact.office_address')}</p>
            <p className="text-blue-900 font-semibold">{t('contact.support_email')}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('resources.guides')}</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
            <FileText className="h-8 w-8 text-blue-900 mb-3" />
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{t('resources.responsible_gambling')}</h3>
                <span className="inline-block bg-blue-100 text-blue-900 text-xs px-2 py-1 rounded">{t('resources.guides')}</span>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('resources.toolkits')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <Activity className="h-8 w-8 text-blue-900 mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('resources.support_services')}</h3>
            <p className="text-gray-600 mb-2">{t('resources.responsible_gambling')}</p>
            <p className="text-sm text-blue-900 font-semibold">{t('resources.download')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
