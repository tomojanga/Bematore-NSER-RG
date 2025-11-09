'use client'

import { useState, useEffect } from 'react'
import apiService from '@/lib/api-service'
import { Plus, Copy, Eye, EyeOff, Trash2, RefreshCw } from 'lucide-react'
import type { APIKey } from '@/types/api'

export default function APIKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showKey, setShowKey] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    try {
      const response = await apiService.apiKey.getAll()
      setKeys(response.data.data?.results || response.data.results || [])
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const createKey = async () => {
    setCreating(true)
    try {
      // Get operator ID first
      const operatorRes = await apiService.operator.getMe()
      const operatorId = operatorRes.data.data.id
      
      await apiService.apiKey.generate(operatorId, {
        key_name: `API Key ${new Date().toLocaleDateString()}`,
        can_lookup: true,
        can_register: false,
        can_screen: false,
        expires_in_days: 365,
        rate_limit_per_second: 100,
        rate_limit_per_day: 100000
      })
      alert('API key created successfully!')
      fetchKeys()
    } catch (error: any) {
      alert('Failed to create API key')
      console.error(error)
    } finally {
      setCreating(false)
    }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    alert('Copied to clipboard!')
  }

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600 mt-1">Manage your API keys for NSER integration</p>
        </div>
        <button
          onClick={createKey}
          disabled={creating}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          {creating ? 'Creating...' : 'Create API Key'}
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">No API keys yet</p>
          <button
            onClick={createKey}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700"
          >
            Create Your First API Key
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => (
            <div key={key.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{key.key_name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                      {showKey === key.id ? key.api_key : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <button onClick={() => setShowKey(showKey === key.id ? null : key.id)} className="text-gray-600">
                      {showKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button onClick={() => copyKey(key.api_key)} className="text-indigo-600">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">Created: {new Date(key.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
