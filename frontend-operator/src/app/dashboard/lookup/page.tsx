'use client'

import { useState, useEffect } from 'react'
import apiService from '@/lib/api-service'
import { Search, CheckCircle, XCircle, Clock, AlertCircle, Loader, Trash2, Copy, History } from 'lucide-react'

interface LookupResult {
  is_excluded: boolean
  exclusion_id?: string
  expiry_date?: string
  reason?: string
  created_at?: string
  status?: string
}

interface LookupHistory {
  id: string
  query: string
  result: LookupResult
  timestamp: number
}

export default function LookupPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone_number: '',
    national_id: '',
    bst_token: '',
  })
  const [result, setResult] = useState<LookupResult | null>(null)
  const [responseTime, setResponseTime] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<LookupHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lookup_history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('lookup_history', JSON.stringify(history.slice(0, 20)))
    }
  }, [history])

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)

    const startTime = performance.now()
    const queryStr = formData.phone_number || formData.national_id || formData.bst_token || 'Unknown'

    try {
      const payload: any = {}
      if (formData.phone_number) payload.phone_number = formData.phone_number
      if (formData.national_id) payload.national_id = formData.national_id
      if (formData.bst_token) payload.bst_token = formData.bst_token

      if (!payload.phone_number && !payload.national_id && !payload.bst_token) {
        setError('Please enter at least one search criteria')
        setLoading(false)
        return
      }

      const response = await apiService.nser.lookup(payload)
      const endTime = performance.now()
      const responseTimeMs = Math.round(endTime - startTime)
      setResponseTime(responseTimeMs)

      const lookupResult = response.data?.data || response.data
      setResult(lookupResult)

      // Add to history
      setHistory(prev => [{
        id: `${Date.now()}_${Math.random()}`,
        query: queryStr,
        result: lookupResult,
        timestamp: Date.now()
      }, ...prev.slice(0, 19)])

    } catch (err: any) {
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))

      const errorMessage = err.response?.data?.message || err.message || 'Lookup failed'
      setError(errorMessage)
      console.error('Lookup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    if (confirm('Clear all lookup history?')) {
      setHistory([])
      localStorage.removeItem('lookup_history')
    }
  }

  const loadFromHistory = (item: LookupHistory) => {
    setResult(item.result)
    setShowHistory(false)
  }

  const hasSearchCriteria = formData.phone_number || formData.national_id || formData.bst_token

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exclusion Lookup</h1>
          <p className="text-gray-600 mt-1">Real-time exclusion status check</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <History className="h-5 w-5" />
            History ({history.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Search Parameters</h2>
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+254712345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">E.164 format (e.g., +254712345678)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National ID
              </label>
              <input
                type="text"
                value={formData.national_id}
                onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                placeholder="National identification number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">ID/Passport number</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BST Token
              </label>
              <input
                type="text"
                value={formData.bst_token}
                onChange={(e) => setFormData({ ...formData, bst_token: e.target.value })}
                placeholder="Blockchain Secure Token"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Optional blockchain token</p>
            </div>

            <button
              type="submit"
              disabled={loading || !hasSearchCriteria}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Check Exclusion Status
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              At least one search field is required
            </p>
          </form>
        </div>

        {/* Results Area */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Lookup Result</h2>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className={`font-semibold ${
                    responseTime < 100 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {responseTime}ms
                  </span>
                </div>
              </div>

              <div className={`p-6 rounded-lg flex items-center gap-4 border-2 ${
                result.is_excluded
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                {result.is_excluded ? (
                  <>
                    <XCircle className="h-12 w-12 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-lg font-bold text-red-900">User is Self-Excluded</p>
                      <p className="text-sm text-red-700 mt-1">Do NOT allow gambling activities</p>
                      {result.expiry_date && (
                        <p className="text-xs text-red-600 mt-2">
                          Exclusion valid until: {new Date(result.expiry_date).toLocaleDateString()}
                        </p>
                      )}
                      {result.reason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {result.reason}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-lg font-bold text-green-900">User is NOT Excluded</p>
                      <p className="text-sm text-green-700 mt-1">May participate in gambling activities</p>
                    </div>
                  </>
                )}
              </div>

              {result.exclusion_id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Exclusion Record ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-gray-900 flex-1 break-all">
                      {result.exclusion_id}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.exclusion_id || '')
                        alert('Copied to clipboard!')
                      }}
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Lookup History</h2>
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition"
            >
              <Trash2 className="h-4 w-4" />
              Clear History
            </button>
          </div>
          <div className="space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-purple-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.query}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {item.result.is_excluded ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Documentation */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">How It Works</h3>
        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
          <li>Enter at least one identifier (phone number, national ID, or BST token)</li>
          <li>The system instantly checks against the exclusion register</li>
          <li>Response times are typically under 100ms</li>
          <li>Results are cached for performance and compliance audit trails</li>
          <li>Lookup history is stored locally in your browser (not on our servers)</li>
        </ul>
      </div>
    </div>
  )
}
