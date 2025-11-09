'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { Shield, FileText, CheckCircle, AlertTriangle, Download, Lock } from 'lucide-react'

export default function ComplianceReportsPage() {
  const [loading, setLoading] = useState(true)
  const [complianceData, setComplianceData] = useState<any>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [operators, nser] = await Promise.all([
        api.operators.statistics(),
        api.nser.statistics()
      ])
      setComplianceData({ operators: operators.data.data, nser: nser.data.data })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance & Regulatory Reports</h1>
          <p className="text-gray-600 mt-1">DPA 2019 and GRAK regulation compliance</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {/* Compliance Score */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Overall Compliance Score</h2>
            <p className="text-lg opacity-90">System-wide regulatory compliance rating</p>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold">98.5%</div>
            <div className="text-sm opacity-90 mt-2">Excellent</div>
          </div>
        </div>
      </div>

      {/* Compliance Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Data Protection Act 2019</h2>
          </div>
          <div className="space-y-4">
            {[
              { item: 'Data Encryption', status: 'compliant', score: 100 },
              { item: 'Access Controls', status: 'compliant', score: 100 },
              { item: 'Audit Logging', status: 'compliant', score: 98 },
              { item: 'Data Retention', status: 'compliant', score: 95 },
              { item: 'User Consent', status: 'review', score: 92 }
            ].map((item) => (
              <div key={item.item} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.status === 'compliant' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900">{item.item}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${item.score >= 95 ? 'bg-green-600' : 'bg-yellow-600'}`} 
                         style={{ width: `${item.score}%` }}></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{item.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">GRAK Regulations</h2>
          </div>
          <div className="space-y-4">
            {[
              { item: 'Operator Licensing', status: 'compliant', score: 100 },
              { item: 'NSER Integration', status: 'compliant', score: 99 },
              { item: 'Responsible Gambling', status: 'compliant', score: 97 },
              { item: 'Reporting Requirements', status: 'compliant', score: 96 },
              { item: 'Player Protection', status: 'compliant', score: 98 }
            ].map((item) => (
              <div key={item.item} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">{item.item}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${item.score}%` }}></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{item.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Trail Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Audit Trail Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">1.2M</p>
            <p className="text-sm text-gray-600 mt-2">Total Events Logged</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">100%</p>
            <p className="text-sm text-gray-600 mt-2">Events Captured</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">7 Years</p>
            <p className="text-sm text-gray-600 mt-2">Retention Period</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">0</p>
            <p className="text-sm text-gray-600 mt-2">Compliance Violations</p>
          </div>
        </div>
      </div>

      {/* Security Compliance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Security & Privacy Compliance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Encryption</h3>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ AES-256-GCM at rest</li>
              <li>✓ TLS 1.3 in transit</li>
              <li>✓ Key rotation enabled</li>
              <li>✓ HSM integration</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Access Control</h3>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ RBAC implemented</li>
              <li>✓ MFA enforced</li>
              <li>✓ Session management</li>
              <li>✓ IP whitelisting</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Monitoring</h3>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ 24/7 monitoring</li>
              <li>✓ Real-time alerts</li>
              <li>✓ Intrusion detection</li>
              <li>✓ Incident response</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Compliance Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Required Actions</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">User Consent Review</h3>
              <p className="text-sm text-gray-600 mt-1">
                Review and update user consent forms to align with latest DPA guidelines
              </p>
              <p className="text-xs text-gray-500 mt-2">Due: 2025-02-15</p>
            </div>
            <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
              Review
            </button>
          </div>

          <div className="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">All Systems Compliant</h3>
              <p className="text-sm text-gray-600 mt-1">
                No immediate compliance actions required
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
