'use client'

import Link from 'next/link'
import { Shield, Users, Building2, BarChart3, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <span className="text-xl font-bold">NSER-RG</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-blue-600 hover:bg-gray-100">Register</Button>
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">
            National Self-Exclusion Register
          </h1>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Kenya's official platform for responsible gambling. Protect yourself and your loved ones through voluntary self-exclusion.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Self-Exclude Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/portals/operator/lookup">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Operator Lookup
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Citizens</h3>
            <p className="text-gray-600">
              Register for self-exclusion in minutes. Choose your period: 6 months, 1 year, 5 years, or permanent.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Operators</h3>
            <p className="text-gray-600">
              Real-time exclusion lookup API. Ensure compliance with GRAK regulations automatically.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-red-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For GRAK</h3>
            <p className="text-gray-600">
              National oversight dashboard. Monitor compliance, track trends, and enforce regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10M+</div>
              <div className="text-gray-600">Registered Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Licensed Operators</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">&lt;50ms</div>
              <div className="text-gray-600">Lookup Speed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime SLA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Self-Exclude?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            'Take control of your gambling habits',
            'Protect your finances and family',
            'Automatic blocking across all operators',
            'Confidential and secure process',
            'Free risk assessments included',
            'Support and resources available'
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8" />
            <span className="text-xl font-bold">NSER-RG</span>
          </div>
          <p className="text-gray-400 mb-4">
            National Self-Exclusion Register & Responsible Gambling System
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 GRAK (Gambling Regulatory Authority of Kenya). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
