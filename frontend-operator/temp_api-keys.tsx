'use client'

import { useState, useEffect } from 'react'
import apiService from '@/lib/api-service'
import { Plus, Copy, Eye, EyeOff, Trash2, RotateCw, AlertCircle, CheckCircle, Loader, Calendar } from 'lucide-react'
import type { APIKey } from '@/types/api'

export default function APIKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showKey, setShowKey] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [expiresInDays, setExpiresInDays] = useState(365)
  const [operatingKey, setOperatingKey] = useState<string | null>(null)
  const [operatorId, setOperatorId] = useState<string>('')

  useEffect(() => {
    fetchOperatorId()
    fetchKeys()
  }, [])

  const fetchOperatorId = async () => {
    try {
      const response = await apiService.operator.getMe()
      setOperatorId(response.data.data.id)
    } catch (error) {
      console.error('Failed to fetch operator ID:', error)
    }
  }

  const fetchKeys = async () => {
    try {
      // Use the new  endpoint for operators to get their own API keys
      const response = await apiService.apiKey.getMyKeys()
      setKeys(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
      setMessage({ type: 'error', text: 'Failed to fetch API keys' })
    } finally {
      setLoading(false)
    }
  }

  const createKey = async () => {
    if (!keyName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a key name' })
      return
    }

    setCreating(true)
    try {
      const operatorRes = await apiService.operator.getMe()
      const operatorId = operatorRes.data.data.id

      const response = await apiService.apiKey.generate(operatorId, {
        key_name: keyName,
        can_lookup: true,
        can_register: false,
        can_screen: false,
        expires_in_days: expiresInDays,
        rate_limit_per_second: 100,
        rate_limit_per_day: 100000
      })

      setMessage({ type: 'success', text: 'API key created successfully!' })
      setShowCreateModal(false)
      setKeyName('')
      setExpiresInDays(365)
      fetchKeys()
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create API key' })
      console.error(error)
    } finally {
      setCreating(false)
    }
  }

  const rotateKey = async (keyId: string) => {
    if (!confirm('Are you sure? The old API key will no longer work.')) return

    setOperatingKey(keyId)
    try {
      await apiService.apiKey.rotate(keyId)
      setMessage({ type: 'success', text: 'API key rotated successfully!' })
      fetchKeys()
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to rotate key' })
    } finally {
      setOperatingKey(null)
    }
  }

  const revokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this key? This action cannot be undone.')) return

    setOperatingKey(keyId)
    try {
      await apiService.apiKey.revoke(keyId)
      setMessage({ type: 'success', text: 'API key revoked successfully!' })
      fetchKeys()
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to revoke key' })
    } finally {
      setOperatingKey(null)
    }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setMessage({ type: 'success', text: 'API key copied to clipboard!' })
    setTimeout(() => setMessage(null), 2000)
  }

  const isKeyExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const getDaysUntilExpiry = (expiresAt: string) => {
    const days = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading API keys...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600 mt-1">Manage your API keys for NSER integration</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2 transition"
        >
          <Plus className="h-5 w-5" />
          Create API Key
        </button>
      </div>

      {/* Operator ID Info */}
      {operatorId && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Your Operator ID</h3>
          <p className="text-sm text-gray-600 mb-3">Required when making API requests to the lookup endpoint</p>
          <div className="flex items-center gap-2">
            <code className="bg-white px-3 py-2 rounded text-sm font-mono flex-1 border border-purple-200 text-gray-900">
              {operatorId}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(operatorId)
                setMessage({ type: 'success', text: 'Operator ID copied!' })
                setTimeout(() => setMessage(null), 2000)
              }}
              className="p-2 hover:bg-purple-100 rounded transition"
              title="Copy Operator ID"
            >
              <Copy className="h-4 w-4 text-purple-600" />
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className={`rounded-lg p-4 flex gap-3 border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create API Key</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g., Production Key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={creating}
                />
                <p className="text-xs text-gray-500 mt-1">Give this key a descriptive name</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires In
                </label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={creating}
                >
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                  <option value={365}>1 year</option>
                  <option value={730}>2 years</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setKeyName('')
                  setExpiresInDays(365)
                }}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={createKey}
                disabled={creating || !keyName.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {keys.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-600 mb-4">No API keys yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Your First API Key
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => {
            const expired = isKeyExpired(key.expires_at || '')
            const daysLeft = getDaysUntilExpiry(key.expires_at || '')

            return (
              <div key={key.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{key.key_name}</h3>
                    <p className="text-xs text-gray-500">ID: {key.id?.substring(0, 8)}...</p>
                  </div>
                  <div className="flex gap-2">
                    {expired ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        Expired
                      </span>
                    ) : daysLeft < 30 ? (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        Expiring Soon
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="bg-white px-3 py-2 rounded text-sm font-mono flex-1 border border-gray-200">
                      {showKey === key.id ? key.api_key : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <button
                      onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                      className="p-2 hover:bg-gray-200 rounded transition"
                      title={showKey === key.id ? 'Hide key' : 'Show key'}
                    >
                      {showKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => copyKey(key.api_key)}
                      className="p-2 hover:bg-gray-200 rounded transition"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Created</p>
                    <p className="font-medium text-gray-900">
                      {new Date(key.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Expires</p>
                    <p className="font-medium text-gray-900">
                      {new Date(key.expires_at || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Days Left</p>
                    <p className={`font-medium ${
                      expired ? 'text-red-600' : daysLeft < 30 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Used</p>
                    <p className="font-medium text-gray-900">
                      {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => rotateKey(key.id)}
                    disabled={operatingKey === key.id || expired}
                    className="flex-1 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                    title="Rotate key (issue new key)"
                  >
                    <RotateCw className={`h-4 w-4 ${operatingKey === key.id ? 'animate-spin' : ''}`} />
                    Rotate
                  </button>
                  <button
                    onClick={() => revokeKey(key.id)}
                    disabled={operatingKey === key.id}
                    className="flex-1 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                    title="Revoke key"
                  >
                    <Trash2 className={`h-4 w-4 ${operatingKey === key.id ? 'animate-spin' : ''}`} />
                    Revoke
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Usage Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">API Key Usage Guide</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Use your API key in the Authorization header: <code className="bg-white px-1 rounded">Authorization: Bearer YOUR_API_KEY</code></li>
          <li>Keep your API keys secure and never commit them to version control</li>
          <li>Rotate keys periodically for enhanced security</li>
          <li>Each key has rate limits to protect the service</li>
          <li>Monitor the "Last Used" timestamp to identify unused keys</li>
        </ul>
      </div>
    </div>
  )
}
