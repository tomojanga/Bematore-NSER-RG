import { aboutData } from '@/data/content'
import { Shield, Users, Zap, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{aboutData.title}</h1>
          <p className="text-xl text-blue-100">{aboutData.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700">{aboutData.mission}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {aboutData.stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {aboutData.sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h3>
              <p className="text-gray-700">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
