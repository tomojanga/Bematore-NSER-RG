import { contactData } from '@/data/content'
import { MapPin, Phone, Mail, Clock, AlertCircle } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{contactData.title}</h1>
          <p className="text-xl text-blue-100">{contactData.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">Emergency Contacts</h3>
              <div className="space-y-1">
                {contactData.emergencyContacts.map((contact, idx) => (
                  <div key={idx} className="text-red-800">
                    <span className="font-semibold">{contact.type}:</span> {contact.contact}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Regional Offices</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactData.offices.map((office, idx) => (
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Departments</h2>
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              {contactData.departments.map((dept, idx) => (
                <div key={idx} className="flex items-start justify-between border-b last:border-0 pb-3 last:pb-0">
                  <span className="font-semibold text-gray-900">{dept.name}</span>
                  <span className="text-blue-900 text-sm">{dept.email}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Media</h2>
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              {contactData.socialMedia.map((social, idx) => (
                <div key={idx} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                  <span className="font-semibold text-gray-900">{social.platform}</span>
                  <span className="text-blue-900">{social.handle}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
