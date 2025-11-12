'use client'

import { useState } from 'react'
import apiService from '@/lib/api-service'
import { Play, Copy, CheckCircle, XCircle, Clock, AlertCircle, Loader } from 'lucide-react'

interface TestResponse {
  is_excluded?: boolean
  exclusion_id?: string
  expiry_date?: string
  error?: string
  message?: string
}

export default function SimulatorPage() {
  const [loading, setLoading] = useState(false)
  const [testData, setTestData] = useState({
    phone_number: '',
    national_id: '',
    bst_token: '',
  })
  const [response, setResponse] = useState<TestResponse | null>(null)
  const [responseTime, setResponseTime] = useState<number>(0)
  const [message, setMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'curl' | 'python' | 'javascript'>('curl')

  const runTest = async () => {
    if (!testData.phone_number && !testData.national_id && !testData.bst_token) {
      setMessage('Please fill in at least one field')
      return
    }

    setLoading(true)
    setMessage(null)
    const startTime = performance.now()

    try {
      const payload: any = {}
      if (testData.phone_number) payload.phone_number = testData.phone_number
      if (testData.national_id) payload.national_id = testData.national_id
      if (testData.bst_token) payload.bst_token = testData.bst_token

      const result = await apiService.nser.lookup(payload)
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))
      setResponse(result.data?.data || result.data)
      setMessage(null)
    } catch (error: any) {
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))
      const errMsg = error.response?.data?.message || error.message || 'Test failed'
      setResponse({ error: errMsg })
      setMessage(`Error: ${errMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setMessage('Code copied to clipboard!')
    setTimeout(() => setMessage(null), 2000)
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://api.nser.local'

  const exampleCode = {
    curl: `curl -X POST https://api.nser.local/api/v1/nser/lookup/ \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "${testData.phone_number || '+254712345678'}",
    "national_id": "${testData.national_id || '12345678'}"
  }'`,
    python: `import requests

api_key = 'YOUR_API_KEY'
endpoint = 'https://api.nser.local/api/v1/nser/lookup/'

response = requests.post(
    endpoint,
    headers={
        'X-API-Key': api_key,
        'Content-Type': 'application/json'
    },
    json={
        'phone_number': '${testData.phone_number || '+254712345678'}',
        'national_id': '${testData.national_id || '12345678'}'
    }
)

print(response.json())`,
    javascript: `const apiKey = 'YOUR_API_KEY';
const endpoint = 'https://api.nser.local/api/v1/nser/lookup/';

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone_number: '${testData.phone_number || '+254712345678'}',
    national_id: '${testData.national_id || '12345678'}'
  })
});

const data = await response.json();
console.log(data);`,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Simulator</h1>
        <p className="text-gray-600 mt-1">Test exclusion lookup integration before going live</p>
      </div>

      {message && (
        <div className={`rounded-lg p-4 flex gap-3 border ${
          message.includes('Error') || message.includes('failed')
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          {message.includes('Error') || message.includes('failed') ? (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={message.includes('Error') || message.includes('failed') ? 'text-red-700' : 'text-blue-700'}>
            {message}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Test Parameters</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={testData.phone_number}
                  onChange={(e) => setTestData({ ...testData, phone_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="+254712345678"
                />
                <p className="text-xs text-gray-500 mt-1">E.164 format</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  National ID
                </label>
                <input
                  type="text"
                  value={testData.national_id}
                  onChange={(e) => setTestData({ ...testData, national_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="12345678"
                />
                <p className="text-xs text-gray-500 mt-1">ID/Passport number</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BST Token (Optional)
                </label>
                <input
                  type="text"
                  value={testData.bst_token}
                  onChange={(e) => setTestData({ ...testData, bst_token: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Blockchain Secure Token"
                />
              </div>

              <button
                onClick={runTest}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Running Test...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Run Test
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response */}
          {response && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Response</h2>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className={`font-semibold ${
                    responseTime < 100 ? 'text-green-600' : responseTime < 500 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {responseTime}ms
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {response.is_excluded !== undefined && (
                  <div className={`p-4 rounded-lg flex items-center gap-3 border-2 ${
                    response.is_excluded
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    {response.is_excluded ? (
                      <>
                        <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-red-900">User is Self-Excluded</p>
                          <p className="text-sm text-red-700">Do NOT allow gambling activities</p>
                          {response.expiry_date && (
                            <p className="text-xs text-red-600 mt-1">
                              Valid until: {new Date(response.expiry_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-green-900">User is NOT Excluded</p>
                          <p className="text-sm text-green-700">May participate in gambling</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {response.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700 font-medium">Error</p>
                    <p className="text-sm text-red-600 mt-1">{response.error}</p>
                  </div>
                )}

                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs font-mono">{JSON.stringify(response, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Code Examples */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Integration Examples</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              {(['curl', 'python', 'javascript'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                    activeTab === tab
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Replace YOUR_API_KEY with your actual key</span>
                <button
                  onClick={() => copyCode(exampleCode[activeTab])}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-purple-50 hover:bg-purple-100 text-purple-600 rounded transition"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs font-mono">{exampleCode[activeTab]}</pre>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3">API Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>Endpoint: <code className="bg-white px-1 rounded text-xs">POST /api/v1/nser/lookup/</code></span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>Response time target: <strong>&lt;100ms</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>Rate limits apply based on your API key</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>All requests are logged for audit purposes</span>
              </li>
            </ul>
          </div>

          {/* Performance Info */}
          {response && (
            <div className={`border rounded-xl p-6 ${
              responseTime < 100
                ? 'bg-green-50 border-green-200'
                : responseTime < 500
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                responseTime < 100
                  ? 'text-green-900'
                  : responseTime < 500
                  ? 'text-yellow-900'
                  : 'text-red-900'
              }`}>
                Performance Analysis
              </h3>
              <p className={`text-sm ${
                responseTime < 100
                  ? 'text-green-800'
                  : responseTime < 500
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                {responseTime < 100
                  ? '✓ Excellent response time! Your integration is optimized.'
                  : responseTime < 500
                  ? '⚠ Good response time, but there may be room for optimization.'
                  : '✗ Slower than expected. Check your network and API configuration.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
