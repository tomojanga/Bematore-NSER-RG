'use client'

import { Shield, Users, Zap, Award } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function AboutPage() {
  const t = useTranslations()
  const benefits = t.raw('about.benefits') as string[]

  const stats = [
    { value: '10,000+', label: t('home.description') },
    { value: '100%', label: benefits[0] },
    { value: '<50ms', label: benefits[1] },
    { value: '24/7', label: benefits[2] }
  ]

  const sections = [
    {
      title: t('about.mission_title'),
      content: t('about.mission_text')
    },
    {
      title: t('about.vision_title'),
      content: t('about.vision_text')
    },
    {
      title: t('about.how_it_works_title'),
      content: t('about.how_it_works_text')
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{t('about.title')}</h1>
          <p className="text-xl text-blue-100">{t('about.description')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('about.mission_title')}</h2>
          <p className="text-lg text-gray-700">{t('about.mission_text')}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h3>
              <p className="text-gray-700">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <Award className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('about.benefits_title')}</h3>
            <ul className="space-y-2">
              {benefits.map((benefit: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-gray-700">
                  <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <Users className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('resources.support_services')}</h3>
            <p className="text-gray-700 mb-4">{t('about.description')}</p>
            <p className="text-gray-600 text-sm">{t('contact.office_hours')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
