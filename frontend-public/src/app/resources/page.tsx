import { resourcesData } from '@/data/content'
import { Phone, MapPin, FileText, Activity } from 'lucide-react'

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{resourcesData.title}</h1>
          <p className="text-xl text-blue-100">{resourcesData.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">24/7 Helplines</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {resourcesData.helplines.map((helpline, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6">
              <Phone className="h-8 w-8 text-blue-900 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{helpline.name}</h3>
              <p className="text-2xl font-bold text-blue-900 mb-2">{helpline.phone}</p>
              <p className="text-sm text-gray-600 mb-1">{helpline.hours}</p>
              <p className="text-gray-700">{helpline.description}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Counseling Centers</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {resourcesData.counseling.map((center, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6">
              <MapPin className="h-8 w-8 text-blue-900 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{center.name}</h3>
              <p className="text-gray-600 mb-2">{center.location}</p>
              <p className="text-blue-900 font-semibold">{center.contact}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Online Resources</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {resourcesData.onlineResources.map((resource, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <FileText className="h-8 w-8 text-blue-900 mb-3" />
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{resource.title}</h3>
                  <span className="inline-block bg-blue-100 text-blue-900 text-xs px-2 py-1 rounded">{resource.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Assessment Tools</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {resourcesData.assessmentTools.map((tool, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6">
              <Activity className="h-8 w-8 text-blue-900 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.name}</h3>
              <p className="text-gray-600 mb-2">{tool.description}</p>
              <p className="text-sm text-blue-900 font-semibold">Duration: {tool.duration}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
