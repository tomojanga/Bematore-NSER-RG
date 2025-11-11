'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { Shield, Search, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function BSTPage() {
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [validateToken, setValidateToken] = useState('')
  const [validationResult, setValidationResult] = useState<any>(null)

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      const response = await api.bst.tokens()
      console.log('BST response:', response.data)
      const data = response.data.data || response.data
      const results = data?.results || data || []
      console.log('BST results:', results)
      setTokens(Array.isArray(results) ? results : [])
    } catch (error) {
      console.error('Failed to fetch BST tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    if (!validateToken) return
    
    try {
      const response = await api.bst.validate(validateToken)
      setValidationResult(response.data.data)
      alert(`Token is ${response.data.data.is_valid ? 'VALID' : 'INVALID'}`)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Validation failed')
    }
  }

  const handleRotate = async (id: string) => {
    const reason = prompt('Enter rotation reason:')
    if (!reason) return

    try {
      await api.bst.rotate(id, { reason })
      alert('Token rotated successfully')
      fetchTokens()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to rotate token')
    }
  }

  const handleCompromise = async (id: string) => {
    const reason = prompt('Enter compromise reason:')
    if (!reason) return

    try {
      await api.bst.compromise(id, { reason })
      alert('Token marked as compromised')
      fetchTokens()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to mark as compromised')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">BST Token Management</h1>
        <p className="text-gray-600 mt-1">Bematore Screening Tokens - Pseudonymized cross-operator user tracking</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Validate Token</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter BST token..."
            value={validateToken}
            onChange={(e) => setValidateToken(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleValidate}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Validate
          </button>
        </div>
        {validationResult && (
          <div className={`mt-4 p-4 rounded-lg ${validationResult.is_valid ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`font-medium ${validationResult.is_valid ? 'text-green-800' : 'text-red-800'}`}>
              {validationResult.is_valid ? '✓ Token is VALID' : '✗ Token is INVALID'}
            </p>
            <p className="text-sm text-gray-600 mt-1">Response time: {validationResult.response_time_ms}ms</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tokens.filter(t => 
              !searchTerm || 
              t.token_string?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              t.user_phone?.includes(searchTerm)
            ).map((token) => (
              <tr key={token.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <code className="text-sm font-mono">{(token.token || token.token_string || 'N/A').substring(0, 16)}...</code>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {token.user?.phone_number || token.user_phone || token.user?.email || token.user_email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    token.is_active ? 'bg-green-100 text-green-800' :
                    token.is_compromised ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {token.is_compromised ? 'Compromised' : token.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(token.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    {token.is_active && !token.is_compromised && (
                      <>
                        <button
                          onClick={() => handleRotate(token.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Rotate"
                        >
                          <RefreshCw className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleCompromise(token.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Mark Compromised"
                        >
                          <AlertTriangle className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
