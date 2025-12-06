'use client'

import { useState, useEffect } from 'react'
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
    const [operatorId, setOperatorId] = useState<string>('')
    const [apiKey, setApiKey] = useState<string>('')
    const [apiKeyLoaded, setApiKeyLoaded] = useState(false)
    const [showManualApiKey, setShowManualApiKey] = useState(false)
    const [testData, setTestData] = useState({
        phone_number: '',
        national_id: '',
        bst_token: '',
    })
    const [response, setResponse] = useState<TestResponse | null>(null)
    const [responseTime, setResponseTime] = useState<number>(0)
    const [message, setMessage] = useState<string | null>(null)
    const [errorDetails, setErrorDetails] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'curl' | 'python' | 'javascript'>('curl')

    useEffect(() => {
        fetchOperatorData()
    }, [])

    const fetchOperatorData = async () => {
        try {
            console.log('[Simulator] Fetching operator data...')
            const operatorRes = await apiService.operator.getMe()
            const opId = operatorRes.data.data.id
            setOperatorId(opId)
            console.log('[Simulator] Operator ID loaded:', opId)

            // Fetch API keys for this operator
            console.log('[Simulator] Fetching API keys...')
            const keysRes = await apiService.apiKey.getMyKeys()
            console.log('[Simulator] API keys response:', keysRes.data.data)

            if (keysRes.data.data && keysRes.data.data.length > 0) {
                // Use the first active key
                const activeKey = keysRes.data.data.find((k: any) => k.is_active)
                if (activeKey) {
                    setApiKey(activeKey.api_key)
                    setApiKeyLoaded(true)
                    console.log('[Simulator] Active API key loaded:', activeKey.api_key.substring(0, 10) + '...')
                } else {
                    console.warn('[Simulator] No active API key found')
                    setApiKeyLoaded(false)
                }
            } else {
                console.warn('[Simulator] No API keys found for operator')
                setApiKeyLoaded(false)
            }
        } catch (error: any) {
            console.error('[Simulator] Failed to fetch operator data:', error)
            console.error('[Simulator] Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            })
            setApiKeyLoaded(false)
        }
    }

    const runTest = async () => {
        if (!testData.phone_number && !testData.national_id && !testData.bst_token) {
            setMessage('Please fill in at least one field')
            return
        }

        if (!apiKey) {
            setMessage('Error: No API key available. Please check your API keys.')
            return
        }

        setLoading(true)
        setMessage(null)
        setErrorDetails(null)
        const startTime = performance.now()

        try {
            const payload: any = {
                operator_id: operatorId
            }
            if (testData.phone_number) payload.phone_number = testData.phone_number
            if (testData.national_id) payload.national_id = testData.national_id
            if (testData.bst_token) payload.bst_token = testData.bst_token

            // Make direct request with API key
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-bematore.onrender.com/api/v1'
            const endpoint = `${apiUrl}/nser/lookup/`

            console.log('[Simulator] Making request to:', endpoint)
            console.log('[Simulator] Payload:', payload)
            console.log('[Simulator] Using API Key:', apiKey.substring(0, 10) + '...')

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const endTime = performance.now()
            setResponseTime(Math.round(endTime - startTime))

            const result = await response.json()

            console.log('[Simulator] Response status:', response.status)
            console.log('[Simulator] Response data:', result)

            if (!response.ok) {
                const errorMsg = result.error?.message || result.message || 'Request failed'
                console.error('[Simulator] API Error:', {
                    status: response.status,
                    message: errorMsg,
                    fullResponse: result,
                })
                setErrorDetails(JSON.stringify(result, null, 2))
                setResponse({ error: errorMsg })
                setMessage(`Error: ${errorMsg}`)
            } else {
                setResponse(result.data || result)
                setMessage(null)
            }
        } catch (error: any) {
            const endTime = performance.now()
            setResponseTime(Math.round(endTime - startTime))
            console.error('[Simulator] Network/Fetch error:', error)
            console.error('[Simulator] Error stack:', error.stack)

            const errMsg = error.message || 'Test failed'
            const fullError = {
                message: error.message,
                name: error.name,
                stack: error.stack,
            }
            setErrorDetails(JSON.stringify(fullError, null, 2))
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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-bematore.onrender.com/api/v1'

    const exampleCode = {
        curl: `# Get your API key from: Dashboard → API Keys
# Operator ID: ${operatorId || 'YOUR_OPERATOR_ID'}

curl -X POST ${apiUrl}/nser/lookup/ \\
  -H "X-API-Key: $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "operator_id": "${operatorId || 'YOUR_OPERATOR_ID'}",
    "phone_number": "${testData.phone_number || '+254712345678'}",
    "national_id": "${testData.national_id || '12345678'}"
  }'`,
        python: `import os
import requests

# Get API key from environment variable (recommended)
# Or set: export NSER_API_KEY="your_api_key"
api_key = os.getenv('NSER_API_KEY') or 'YOUR_API_KEY'
operator_id = '${operatorId || 'YOUR_OPERATOR_ID'}'
endpoint = '${apiUrl}/nser/lookup/'

try:
    response = requests.post(
        endpoint,
        headers={
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        },
        json={
            'operator_id': operator_id,
            'phone_number': '${testData.phone_number || '+254712345678'}',
            'national_id': '${testData.national_id || '12345678'}'
        },
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        is_excluded = data.get('data', {}).get('is_excluded')
        print(f"User excluded: {is_excluded}")
    else:
        print(f"Error: {response.status_code}")
        print(response.json())
        
except Exception as e:
    print(f"Request failed: {str(e)}")`,
        javascript: `// Best practice: Load API key from environment variable
// In Node.js: const apiKey = process.env.NSER_API_KEY;
// In browser: Use backend proxy or secure token endpoint

const apiKey = process.env.REACT_APP_NSER_API_KEY || 'YOUR_API_KEY';
const operatorId = '${operatorId || 'YOUR_OPERATOR_ID'}';
const endpoint = '${apiUrl}/nser/lookup/';

async function checkExclusion(phoneNumber, nationalId) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operator_id: operatorId,
        phone_number: phoneNumber,
        national_id: nationalId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    const data = await response.json();
    const isExcluded = data.data?.is_excluded;
    console.log('User excluded:', isExcluded);
    return data;
    
  } catch (error) {
    console.error('Lookup failed:', error.message);
    throw error;
  }
}

// Usage
checkExclusion('${testData.phone_number || '+254712345678'}', '${testData.national_id || '12345678'}')
  .then(result => console.log(result))
  .catch(err => console.error(err));`,
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">API Simulator</h1>
                <p className="text-gray-600 mt-1">Test exclusion lookup integration before going live</p>
            </div>

            {message && (
                <div className={`rounded-lg p-4 flex gap-3 border ${message.includes('Error') || message.includes('failed')
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
                    {/* API Key Status */}
                    <div className={`rounded-lg p-4 border-2 flex items-start gap-3 ${apiKeyLoaded
                            ? 'bg-green-50 border-green-200'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}>
                        <div className="flex-1">
                            <p className={`font-semibold ${apiKeyLoaded ? 'text-green-900' : 'text-yellow-900'}`}>
                                {apiKeyLoaded ? '✓ API Key Loaded' : '⚠ No API Key Loaded'}
                            </p>
                            <p className={`text-sm ${apiKeyLoaded ? 'text-green-700' : 'text-yellow-700'}`}>
                                {apiKeyLoaded
                                    ? `Using: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`
                                    : 'No API key found. Enter one manually or check API key settings.'}
                            </p>
                        </div>
                        {!apiKeyLoaded && (
                            <button
                                onClick={() => setShowManualApiKey(!showManualApiKey)}
                                className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-900 px-3 py-1 rounded font-medium transition"
                            >
                                {showManualApiKey ? 'Cancel' : 'Add Key'}
                            </button>
                        )}
                    </div>

                    {/* Manual API Key Entry */}
                    {showManualApiKey && (
                        <div className="bg-white rounded-xl shadow-sm border border-yellow-300 p-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Enter API Key Manually</h3>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value)
                                    if (e.target.value.length > 0) {
                                        setApiKeyLoaded(true)
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Paste your API key here"
                            />
                            <p className="text-xs text-gray-500 mt-2">Your API key is never stored or shared</p>
                        </div>
                    )}

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
                                    <span className={`font-semibold ${responseTime < 100 ? 'text-green-600' : responseTime < 500 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                        {responseTime}ms
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {response.is_excluded !== undefined && (
                                    <div className={`p-4 rounded-lg flex items-center gap-3 border-2 ${response.is_excluded
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

                                <div>
                                    <p className="text-xs font-medium text-gray-600 mb-2">Full Response:</p>
                                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                        <pre className="text-xs font-mono">{JSON.stringify(response, null, 2)}</pre>
                                    </div>
                                </div>

                                {errorDetails && (
                                    <div>
                                        <p className="text-xs font-medium text-red-600 mb-2">Error Details:</p>
                                        <div className="bg-red-900 text-red-100 p-4 rounded-lg overflow-x-auto">
                                            <pre className="text-xs font-mono">{errorDetails}</pre>
                                        </div>
                                    </div>
                                )}
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
                                    className={`px-4 py-2 font-medium text-sm border-b-2 transition ${activeTab === tab
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
                                <span className="text-xs text-gray-500">
                                    {apiKeyLoaded
                                        ? 'Showing your actual operator_id'
                                        : 'Replace YOUR_API_KEY with your actual key'}
                                </span>
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
                                <span>Endpoint: <code className="bg-white px-1 rounded text-xs">{apiUrl}/nser/lookup/</code></span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0">•</span>
                                <span>Authentication: Use <code className="bg-white px-1 rounded text-xs">X-API-Key</code> header</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0">•</span>
                                <span>Your Operator ID: <code className="bg-white px-1 rounded text-xs font-medium">{operatorId || 'Loading...'}</code></span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0">•</span>
                                <span>Required fields: <code className="bg-white px-1 rounded text-xs">operator_id</code>, and at least one of: phone_number, national_id, or bst_token</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0">•</span>
                                <span>Response time target: <strong>&lt;100ms</strong></span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0">•</span>
                                <span>Rate limits apply based on your plan</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0">•</span>
                                <span>All requests are logged for audit purposes</span>
                            </li>
                        </ul>
                    </div>

                    {/* Security Best Practices */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <h3 className="font-semibold text-amber-900 mb-3">🔒 Security Best Practices</h3>
                        <ul className="text-sm text-amber-800 space-y-2">
                            <li className="flex gap-2">
                                <span className="flex-shrink-0">✓</span>
                                <span>Store API keys in <strong>environment variables</strong>, never in code</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0">✓</span>
                                <span>Use <strong>backend proxy</strong> for browser-based integrations (never expose keys to frontend)</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0">✓</span>
                                <span>Rotate API keys regularly via API Keys dashboard</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0">✓</span>
                                <span>Use HTTPS only for all API requests</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0">✓</span>
                                <span>Implement request timeouts (10-30 seconds recommended)</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0">✓</span>
                                <span>Log and monitor API responses for errors</span>
                            </li>
                        </ul>
                    </div>

                    {/* Performance Info */}
                    {response && (
                        <div className={`border rounded-xl p-6 ${responseTime < 100
                                ? 'bg-green-50 border-green-200'
                                : responseTime < 500
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : 'bg-red-50 border-red-200'
                            }`}>
                            <h3 className={`font-semibold mb-2 ${responseTime < 100
                                    ? 'text-green-900'
                                    : responseTime < 500
                                        ? 'text-yellow-900'
                                        : 'text-red-900'
                                }`}>
                                Performance Analysis
                            </h3>
                            <p className={`text-sm ${responseTime < 100
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
