'use client'

import React, { useState } from 'react'
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader'
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  ChevronUp,
  Search,
  AlertCircle,
  Shield,
  Calendar,
  Lock,
  FileText
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'exclusion' | 'account' | 'security' | 'general'
}

const faqs: FAQItem[] = [
  {
    id: '1',
    category: 'exclusion',
    question: 'What is self-exclusion?',
    answer: 'Self-exclusion is a tool that allows you to request to be excluded from all licensed gambling operators for a period you choose. During this time, operators are legally required to deny you access to their services.'
  },
  {
    id: '2',
    category: 'exclusion',
    question: 'Can I cancel my self-exclusion early?',
    answer: 'No, self-exclusion is binding and cannot be cancelled during the exclusion period. This is by design to protect you. Only in exceptional circumstances may an early lift be considered - contact support for more information.'
  },
  {
    id: '3',
    category: 'exclusion',
    question: 'Will my exclusion carry over between operators?',
    answer: 'Yes! Your self-exclusion is registered in the national database and all licensed operators must check this database when you attempt to access their services.'
  },
  {
    id: '4',
    category: 'account',
    question: 'How do I update my profile?',
    answer: 'You can update your profile by going to Account Settings in your dashboard. You can change your contact information, preferences, and other account details.'
  },
  {
    id: '5',
    category: 'account',
    question: 'How do I verify my identity?',
    answer: 'You can complete ID verification through Account Settings. Upload a clear copy of your government-issued ID and we\'ll verify it within 24-48 hours.'
  },
  {
    id: '6',
    category: 'security',
    question: 'How do I enable two-factor authentication?',
    answer: 'Go to Security Settings and enable 2FA. You\'ll receive codes via SMS or an authenticator app for additional account protection.'
  },
  {
    id: '7',
    category: 'security',
    question: 'What should I do if my account is compromised?',
    answer: 'Immediately change your password and enable 2FA if not already enabled. If you suspect unauthorized access, contact support right away with your account details.'
  },
  {
    id: '8',
    category: 'general',
    question: 'What gambling assessments are available?',
    answer: 'We offer three evidence-based assessments: LIEBET (brief screening), PGSI (comprehensive), and DSM-5 (clinical criteria). These help evaluate your gambling risk level.'
  }
]

const supportResources = [
  {
    title: 'Live Chat',
    icon: MessageSquare,
    description: 'Chat with our support team',
    details: '24/7 availability',
    action: () => window.location.href = '#'
  },
  {
    title: 'Phone Support',
    icon: Phone,
    description: 'Call our helpline',
    details: '1-800-GAMBLING',
    action: () => window.location.href = 'tel:1-800-4224526'
  },
  {
    title: 'Email Support',
    icon: Mail,
    description: 'Email our support team',
    details: 'support@nser.go.ke',
    action: () => window.location.href = 'mailto:support@nser.go.ke'
  },
  {
    title: 'Gambling Resources',
    icon: Globe,
    description: 'External support services',
    details: 'www.gamblingtherapy.org',
    action: () => window.open('https://www.gamblingtherapy.org', '_blank')
  }
]

export default function HelpPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'exclusion' | 'account' | 'security' | 'general'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'exclusion', label: 'Self-Exclusion', icon: Shield },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'general', label: 'General', icon: HelpCircle }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardHeader 
        title="Help & Support"
        subtitle="Get answers and assistance"
      />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Quick Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {supportResources.map((resource) => {
            const Icon = resource.icon
            return (
              <button
                key={resource.title}
                onClick={resource.action}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group text-left"
              >
                <Icon className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-gray-900 mb-1">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                <p className="text-xs text-blue-600 font-medium">{resource.details}</p>
              </button>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          {/* Search Bar */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No results found</p>
                <p className="text-gray-500 text-sm">Try searching with different keywords</p>
              </div>
            ) : (
              filteredFaqs.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex-1">{faq.question}</h3>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                    )}
                  </div>

                  {expandedFAQ === faq.id && (
                    <p className="mt-4 text-gray-700 text-sm border-t border-gray-200 pt-4">
                      {faq.answer}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Urgent Help */}
        <div className="mt-8 bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-2">Need Urgent Help?</h3>
              <p className="text-red-800 mb-4">
                If you or someone you know is struggling with gambling, please reach out to a mental health professional or crisis support service.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-red-800">
                  <strong>National Gambling Helpline:</strong> 1-800-GAMBLING (call or text, 24/7)
                </p>
                <p className="text-sm text-red-800">
                  <strong>Crisis Support:</strong> Visit www.gamblingtherapy.org for immediate assistance
                </p>
                <p className="text-sm text-red-800">
                  <strong>Emergency Services:</strong> Call 911 if you're in crisis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'How Self-Exclusion Works', href: '#' },
              { title: 'Understanding Risk Assessments', href: '#' },
              { title: 'Privacy & Data Protection', href: '#' },
              { title: 'Terms & Conditions', href: '#' }
            ].map((resource) => (
              <a
                key={resource.title}
                href={resource.href}
                className="p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all font-medium text-blue-700"
              >
                → {resource.title}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
