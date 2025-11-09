import { selfExcludeData, portalLinks } from '@/data/content'
import Link from 'next/link'
import { CheckCircle, Clock, Shield, ArrowRight } from 'lucide-react'

export default function SelfExcludePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{selfExcludeData.title}</h1>
          <p className="text-xl text-blue-100">{selfExcludeData.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <p className="text-lg text-gray-700">{selfExcludeData.intro}</p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Exclusion Periods</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {selfExcludeData.periods.map((period, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <Clock className="h-8 w-8 text-blue-900 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{period.duration}</h3>
              <p className="text-gray-600">{period.description}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {selfExcludeData.process.map((step, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="bg-blue-900 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {step.step}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits</h2>
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {selfExcludeData.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-900 text-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Take Control?</h3>
          <p className="text-blue-100 mb-6">Register now to start your self-exclusion journey</p>
          <Link
            href={`${portalLinks.citizen}/auth/register`}
            className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Get Started <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
