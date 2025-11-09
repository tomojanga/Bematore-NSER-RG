'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function LookupPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone_number: '',
    national_id: '',
    bst_token: '',
  })
  const [result, setResult] = useState<any>(null)
  const [responseTime, setResponseTime] = useState<number>(0)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const startTime = performance.now()

    try {
      const response = await api.post('/nser/lookup/', formData)
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))
      setResult(response.data)
      toast.success('Lookup completed')
    } catch (error: any) {
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))
      toast.error('Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exclusion Lookup</h1>
        <p className="text-gray-600 mt-1">Real-time exclusion check (&lt;50ms)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Lookup Parameters</h2>
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="+254712345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
              <input
                type="text"
                value={formData.national_id}
                onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">BST Token</label>
              <input
                type="text"
                value={formData.bst_token}
                onChange={(e) => setFormData({ ...formData, bst_token: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="BST-XXXX-XXXX-XXXX"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Checking...' : (
                <>
                  <Search className="h-5 w-5" />
                  Check Exclusion
                </>
              )}
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Result</h2>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={responseTime < 50 ? 'text-green-600 font-semibold' : 'text-amber-600'}>
                  {responseTime}ms
                </span>
              </div>
            </div>

            {result.data?.is_excluded !== undefined && (
              <div className={`p-6 rounded-lg flex items-center gap-4 ${
                result.data.is_excluded 
                  ? 'bg-red-50 border-2 border-red-200' 
                  : 'bg-green-50 border-2 border-green-200'
              }`}>
                {result.data.is_excluded ? (
                  <>
                    <XCircle className="h-12 w-12 text-red-600" />
                    <div>
                      <p className="text-xl font-bold text-red-900">User is Self-Excluded</p>
                      <p className="text-sm text-red-700 mt-1">Do not allow gambling activities</p>
                      {result.data.expiry_date && (
                        <p className="text-xs text-red-600 mt-2">
                          Until: {new Date(result.data.expiry_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-600" />
                    <div>
                      <p className="text-xl font-bold text-green-900">User is Not Excluded</p>
                      <p className="text-sm text-green-700 mt-1">Can participate in gambling</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
