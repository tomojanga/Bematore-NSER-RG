'use client'

import { useState } from 'react'
import { Copy, Check, ChevronDown } from 'lucide-react'

export default function ApiReferencePage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>('lookup')

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const endpoints = [
    {
      id: 'lookup',
      method: 'POST',
      path: '/api/v1/nser/lookup/',
      title: 'Check Single Number',
      description: 'Check if a single phone number is excluded from gambling',
      request: `{
  "phone_number": "+254712345678",
  "operator_id": "operator_123"
}`,
      response: `{
  "success": true,
  "data": {
    "phone_number": "+254712345678",
    "is_excluded": true,
    "exclusion_type": "SELF",
    "start_date": "2024-01-15T10:30:00Z",
    "end_date": "2025-01-15T10:30:00Z",
    "reason": "User requested self-exclusion",
    "operator_id": "operator_123"
  }
}`,
      parameters: [
        {
          name: 'phone_number',
          type: 'string',
          required: true,
          description: 'Phone number in E.164 format (e.g., +254712345678)'
        },
        {
          name: 'operator_id',
          type: 'string',
          required: true,
          description: 'Your operator ID'
        }
      ],
      responses: [
        {
          code: 200,
          description: 'Lookup successful',
          example: '{ "success": true, "data": {...} }'
        },
        {
          code: 400,
          description: 'Invalid request parameters',
          example: '{ "success": false, "error": "Invalid phone number format" }'
        },
        {
          code: 401,
          description: 'Authentication failed',
          example: '{ "success": false, "error": "Invalid API key" }'
        }
      ]
    },
    {
      id: 'bulk',
      method: 'POST',
      path: '/api/v1/nser/lookup/bulk/',
      title: 'Check Multiple Numbers',
      description: 'Check multiple phone numbers at once (max 100 per request)',
      request: `{
  "phone_numbers": [
    "+254712345678",
    "+254712345679",
    "+254712345680"
  ],
  "operator_id": "operator_123"
}`,
      response: `{
  "success": true,
  "data": {
    "results": [
      {
        "phone_number": "+254712345678",
        "is_excluded": true,
        "exclusion_type": "SELF",
        "end_date": "2025-01-15T10:30:00Z"
      },
      {
        "phone_number": "+254712345679",
        "is_excluded": false
      }
    ],
    "total": 2,
    "excluded_count": 1,
    "allowed_count": 1
  }
}`,
      parameters: [
        {
          name: 'phone_numbers',
          type: 'string[]',
          required: true,
          description: 'Array of phone numbers (max 100) in E.164 format'
        },
        {
          name: 'operator_id',
          type: 'string',
          required: true,
          description: 'Your operator ID'
        }
      ],
      responses: [
        {
          code: 200,
          description: 'Bulk lookup successful',
          example: '{ "success": true, "data": {...} }'
        },
        {
          code: 413,
          description: 'Request too large (max 100 numbers)',
          example: '{ "success": false, "error": "Maximum 100 phone numbers allowed" }'
        }
      ]
    },
    {
      id: 'bst',
      method: 'POST',
      path: '/api/v1/nser/lookup/bst/',
      title: 'Check Using BST Token',
      description: 'Check exclusion status using BST (Business Self-exclusion Token)',
      request: `{
  "bst_token": "BST_abc123def456",
  "operator_id": "operator_123"
}`,
      response: `{
  "success": true,
  "data": {
    "bst_token": "BST_abc123def456",
    "is_excluded": true,
    "exclusion_type": "REGULATORY",
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z",
    "operator_id": "operator_123"
  }
}`,
      parameters: [
        {
          name: 'bst_token',
          type: 'string',
          required: true,
          description: 'BST token provided by the regulator'
        },
        {
          name: 'operator_id',
          type: 'string',
          required: true,
          description: 'Your operator ID'
        }
      ],
      responses: [
        {
          code: 200,
          description: 'BST lookup successful',
          example: '{ "success": true, "data": {...} }'
        },
        {
          code: 404,
          description: 'BST token not found',
          example: '{ "success": false, "error": "BST token not found" }'
        }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Reference</h1>
        <p className="text-gray-600 mt-1">Complete documentation for NSER API endpoints</p>
      </div>

      {/* Authentication Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">API Key Authentication</h3>
            <p className="text-sm text-gray-600 mb-3">Include your API key in the X-API-Key header:</p>
            <div className="relative bg-gray-100 p-4 rounded-lg">
              <button
                onClick={() => copyCode('X-API-Key: YOUR_API_KEY', 'auth-header')}
                className="absolute top-2 right-2 p-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
              >
                {copied === 'auth-header' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <code className="text-sm text-gray-800 font-mono">X-API-Key: YOUR_API_KEY</code>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900"><span className="font-semibold">Example (Python):</span></p>
              <code className="text-blue-800 font-mono text-xs mt-2 block">
                headers = {'{'}'X-API-Key': 'your_api_key'{'}'}
              </code>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900"><span className="font-semibold">Example (JavaScript):</span></p>
              <code className="text-blue-800 font-mono text-xs mt-2 block">
                headers: {'{'}'X-API-Key': 'your_api_key'{'}'}
              </code>
            </div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-900">Generate API keys from the <span className="font-semibold">API Keys</span> section in your dashboard</p>
          </div>
        </div>
      </div>

      {/* Base URL Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Base URL</h2>
        <div className="relative bg-gray-100 p-4 rounded-lg">
          <button
            onClick={() => copyCode('https://api.nser.rg/api/v1', 'base-url')}
            className="absolute top-2 right-2 p-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
          >
            {copied === 'base-url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <code className="text-sm text-gray-800 font-mono">https://api.nser.rg/api/v1</code>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Endpoint Header */}
            <button
              onClick={() => setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id)}
              className="w-full p-6 flex items-start justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={`px-3 py-1 rounded text-sm font-bold text-white ${endpoint.method === 'POST' ? 'bg-blue-600' : 'bg-green-600'
                  }`}>
                  {endpoint.method}
                </div>
                <div className="text-left">
                  <p className="font-mono text-sm text-gray-900">{endpoint.path}</p>
                  <p className="text-sm text-gray-600 mt-1">{endpoint.title}</p>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${expandedEndpoint === endpoint.id ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Endpoint Details */}
            {expandedEndpoint === endpoint.id && (
              <div className="border-t border-gray-200 p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{endpoint.description}</p>
                </div>

                {/* Parameters */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Request Parameters</h4>
                  <div className="space-y-3">
                    {endpoint.parameters.map((param) => (
                      <div key={param.name} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono text-gray-900">{param.name}</code>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${param.required ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-800'
                            }`}>
                            {param.required ? 'REQUIRED' : 'OPTIONAL'}
                          </span>
                          <span className="text-xs text-gray-600 font-mono">{param.type}</span>
                        </div>
                        <p className="text-sm text-gray-600">{param.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Request Example */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Request Example</h4>
                  <div className="relative">
                    <button
                      onClick={() => copyCode(endpoint.request, `request-${endpoint.id}`)}
                      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-800 rounded text-white"
                    >
                      {copied === `request-${endpoint.id}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{endpoint.request}</code>
                    </pre>
                  </div>
                </div>

                {/* Response Example */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Response Example</h4>
                  <div className="relative">
                    <button
                      onClick={() => copyCode(endpoint.response, `response-${endpoint.id}`)}
                      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-800 rounded text-white"
                    >
                      {copied === `response-${endpoint.id}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{endpoint.response}</code>
                    </pre>
                  </div>
                </div>

                {/* Response Codes */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Response Codes</h4>
                  <div className="space-y-2">
                    {endpoint.responses.map((resp) => (
                      <div key={resp.code} className="flex gap-4">
                        <div className={`px-3 py-1 rounded font-mono font-bold text-sm ${resp.code === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {resp.code}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{resp.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Best Practices */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Best Practices</h2>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Always implement proper error handling and retry logic</span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Cache lookup results for 5 minutes maximum</span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Target response time: &lt;50ms for optimal UX</span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Use webhooks for real-time exclusion updates</span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Never store exclusion data beyond required retention period</span>
          </li>
          <li className="flex gap-3">
            <span className="text-red-600 font-bold">✗</span>
            <span>Do not expose API keys in client-side code</span>
          </li>
          <li className="flex gap-3">
            <span className="text-red-600 font-bold">✗</span>
            <span>Do not skip exclusion checks or retry limits</span>
          </li>
        </ul>
      </div>

      {/* Rate Limiting */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3">Rate Limiting</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <span className="font-semibold">Standard tier:</span> 1,000 requests/minute</li>
          <li>• <span className="font-semibold">Premium tier:</span> 10,000 requests/minute</li>
          <li>• <span className="font-semibold">Headers:</span> X-RateLimit-Limit, X-RateLimit-Remaining</li>
        </ul>
      </div>
    </div>
  )
}
