'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function FAQPage() {
  const t = useTranslations()
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const toggleQuestion = (idx: number) => {
    const key = `${idx}`
    setOpenIndex(openIndex === key ? null : key)
  }

  const faqs = t.raw('faq.questions') as Array<{
    id: string
    question: string
    answer: string
  }>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{t('faq.title')}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const key = `${idx}`
            const isOpen = openIndex === key
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => toggleQuestion(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-blue-900 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-blue-900 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 text-gray-700">
                    {item.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
