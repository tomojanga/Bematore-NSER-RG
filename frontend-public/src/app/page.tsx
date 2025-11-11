import Link from 'next/link'
import { Shield, Users, FileText, BarChart3, CheckCircle, AlertTriangle, Phone, Mail } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-full">
                <Shield className="h-16 w-16 text-blue-900" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6">National Self-Exclusion Register</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Take control of your gambling. Protect yourself and your loved ones through the official self-exclusion program.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/self-exclude" className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">
                Self-Exclude Now
              </Link>
              <Link href="/about" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">10,000+</p>
              <p className="text-gray-600">Protected Citizens</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">100%</p>
              <p className="text-gray-600">Operator Coverage</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <CheckCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">&lt;50ms</p>
              <p className="text-gray-600">Lookup Speed</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">24/7</p>
              <p className="text-gray-600">System Availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">How Self-Exclusion Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-900">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Register</h3>
              <p className="text-gray-600">Create an account and complete identity verification</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-900">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose Period</h3>
              <p className="text-gray-600">Select exclusion duration: 6 months to permanent</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-900">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Protected</h3>
              <p className="text-gray-600">Blocked from all licensed operators instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose NSER?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <CheckCircle className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Government Backed</h3>
              <p className="text-gray-600">Official program with legal enforcement</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Shield className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Complete Protection</h3>
              <p className="text-gray-600">Covers all licensed gambling operators</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <FileText className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Confidential</h3>
              <p className="text-gray-600">Your data is encrypted and protected by law</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Users className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Support Services</h3>
              <p className="text-gray-600">Access to counseling and recovery resources</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <BarChart3 className="h-10 w-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Risk Assessment</h3>
              <p className="text-gray-600">Free screening tools to evaluate your gambling</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <AlertTriangle className="h-10 w-10 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Instant Activation</h3>
              <p className="text-gray-600">Protection starts immediately upon registration</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Take Control?</h2>
          <p className="text-xl mb-8">
            Self-exclusion is a powerful tool for responsible gambling. Take the first step today.
          </p>
          <Link href="/self-exclude" className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition inline-block">
            Start Self-Exclusion
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg">
              <Phone className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Call Us</h3>
              <p className="text-gray-600 mb-2">Helpline: +254 800 123 456</p>
              <p className="text-gray-600">Mon-Fri: 8AM - 6PM EAT</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <Mail className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Email Us</h3>
              <p className="text-gray-600 mb-2">support@nser.go.ke</p>
              <p className="text-gray-600">Response within 24 hours</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
