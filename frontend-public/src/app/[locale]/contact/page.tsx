'use client'

import { MapPin, Phone, Mail, Clock, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ContactPage() {
  const t = useTranslations()

  const offices = [
    {
      name: t('contact.office_address'),
      address: t('contact.office_address'),
      phone: t('contact.support_phone'),
      email: t('contact.support_email'),
      hours: t('contact.office_hours')
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-xl text-blue-100">{t('contact.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">{t('contact.title')}</h3>
              <div className="space-y-1">
                <div className="text-red-800">
                  <span className="font-semibold">{t('contact.support_phone')}:</span> {t('contact.support_phone')}
                </div>
                <div className="text-red-800">
                  <span className="font-semibold">{t('contact.support_email')}:</span> {t('contact.support_email')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.form_title')}</h2>
        <div className="grid md:grid-cols-1 gap-6 mb-12">
          {offices.map((office, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{office.name}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-900 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 whitespace-pre-line">{office.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-900" />
                  <span className="text-gray-700">{office.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-900" />
                  <span className="text-gray-700">{office.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-900" />
                  <span className="text-gray-700">{office.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.form_title')}</h2>
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <span className="font-semibold text-gray-900">{t('contact.support_email')}</span>
                <span className="text-blue-900 text-sm">{t('contact.support_email')}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="font-semibold text-gray-900">{t('contact.support_phone')}</span>
                <span className="text-blue-900 text-sm">{t('contact.support_phone')}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.office_hours')}</h2>
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-semibold text-gray-900">{t('contact.support_phone')}</span>
                <span className="text-blue-900">{t('contact.support_phone')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{t('contact.support_email')}</span>
                <span className="text-blue-900">{t('contact.support_email')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
