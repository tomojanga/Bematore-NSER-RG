'use client'

import { faqData } from '@/data/content'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const toggleQuestion = (categoryIdx: number, questionIdx: number) => {
    const key = `${categoryIdx}-${questionIdx}`
    setOpenIndex(openIndex === key ? null : key)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{faqData.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {faqData.categories.map((category, catIdx) => (
          <div key={catIdx} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.name}</h2>
            <div className="space-y-3">
              {category.questions.map((item, qIdx) => {
                const key = `${catIdx}-${qIdx}`
                const isOpen = openIndex === key
                return (
                  <div key={qIdx} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <button
                      onClick={() => toggleQuestion(catIdx, qIdx)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-gray-900">{item.q}</span>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-blue-900 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-blue-900 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4 text-gray-700">
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
