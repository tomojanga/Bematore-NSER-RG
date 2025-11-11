'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import { Play, Copy, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function SimulatorPage() {
  const [loading, setLoading] = useState(false)
  const [testData, setTestData] = useState({
    phone_number: '',
    national_id: '',
    bst_token: '',
  })
  const [response, setResponse] = useState<any>(null)
  const [responseTime, setResponseTime] = useState<number>(0)

  const runTest = async () => {
    setLoading(true)
    const startTime = performance.now()

    try {
      const result = await api.post('/nser/lookup/', testData)
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))
      setResponse(result.data)
      toast.success('Test completed successfully')
    } catch (error: any) {
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))
      setResponse(error.response?.data)
      toast.error('Test failed')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
  }

  const exampleCode = {
    curl: `curl -X POST https://api.nser.go.ke/api/v1/nser/lookup/ \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "${testData.phone_number}",
    "national_id": "${testData.national_id}"
  }'`,
    python: `import requests

response = requests.post(
    'https://api.nser.go.ke/api/v1/nser/lookup/',
    headers={
        'X-API-Key': 'your_api_key_here',
        'Content-Type': 'application/json'
    },
    json={
        'phone_number': '${testData.phone_number}',
        'national_id': '${testData.national_id}'
    }
)

print(response.json())`,
    javascript: `const response = await fetch('https://api.nser.go.ke/api/v1/nser/lookup/', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone_number: '${testData.phone_number}',
    national_id: '${testData.national_id}'
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Test Parameters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={testData.phone_number}
                  onChange={(e) => setTestData({ ...testData, phone_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="+254712345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                <input
                  type="text"
                  value={testData.national_id}
                  onChange={(e) => setTestData({ ...testData, national_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BST Token (Optional)</label>
                <input
                  type="text"
                  value={testData.bst_token}
                  onChange={(e) => setTestData({ ...testData, bst_token: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="BST-XXXX-XXXX-XXXX"
                />
              </div>

              <button
                onClick={runTest}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>Testing...</>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Run Test
                  </>
                )}
              </button>
            </div>
          </div>

          {response && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Response</h2>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className={responseTime < 50 ? 'text-green-600 font-semibold' : 'text-amber-600'}>
                    {responseTime}ms
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {response.data?.is_excluded !== undefined && (
                  <div className={`p-4 rounded-lg flex items-center gap-3 ${
                    response.data.is_excluded 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    {response.data.is_excluded ? (
                      <>
                        <XCircle className="h-6 w-6 text-red-600" />
                        <div>
                          <p className="font-semibold text-red-900">User is Self-Excluded</p>
                          <p className="text-sm text-red-700">Do not allow gambling activities</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900">User is Not Excluded</p>
                          <p className="text-sm text-green-700">Can participate in gambling</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Integration Examples</h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">cURL</h3>
                  <button
                    onClick={() => copyCode(exampleCode.curl)}
                    className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs">{exampleCode.curl}</pre>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Python</h3>
                  <button
                    onClick={() => copyCode(exampleCode.python)}
                    className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs">{exampleCode.python}</pre>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">JavaScript</h3>
                  <button
                    onClick={() => copyCode(exampleCode.javascript)}
                    className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs">{exampleCode.javascript}</pre>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Performance Target</h3>
            <p className="text-sm text-blue-800">
              NSER exclusion lookups are optimized for <span className="font-bold">&lt;50ms</span> response time.
              Test your integration to ensure optimal performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
