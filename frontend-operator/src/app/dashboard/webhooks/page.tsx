'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Webhook, Plus, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    url: '',
    events: ['exclusion.created', 'exclusion.updated'],
    is_active: true
  })

  useEffect(() => {
    fetchWebhooks()
  }, [])

  const fetchWebhooks = async () => {
    try {
      const response = await api.get('/operators/webhooks/')
      setWebhooks(response.data.data?.results || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const createWebhook = async () => {
    try {
      await api.post('/operators/webhooks/', formData)
      setShowForm(false)
      setFormData({ url: '', events: ['exclusion.created'], is_active: true })
      fetchWebhooks()
    } catch (error) {
      console.error(error)
    }
  }

  const deleteWebhook = async (id: string) => {
    if (!confirm('Delete this webhook?')) return
    try {
      await api.delete(`/operators/webhooks/${id}/`)
      fetchWebhooks()
    } catch (error) {
      console.error(error)
    }
  }

  const testWebhook = async (id: string) => {
    try {
      await api.post(`/operators/webhooks/${id}/test/`)
      alert('Test event sent!')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-600 mt-1">Receive real-time exclusion notifications</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Webhook
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Webhook</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://your-domain.com/webhooks/nser"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
              <div className="space-y-2">
                {['exclusion.created', 'exclusion.updated', 'exclusion.expired'].map((event) => (
                  <label key={event} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.events.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, events: [...formData.events, event] })
                        } else {
                          setFormData({ ...formData, events: formData.events.filter(e => e !== event) })
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createWebhook}
                disabled={!formData.url}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Create Webhook
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {webhooks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No webhooks configured. Add one to get started.
                </td>
              </tr>
            ) : (
              webhooks.map((webhook) => (
                <tr key={webhook.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{webhook.url}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {webhook.events?.join(', ') || 'All events'}
                  </td>
                  <td className="px-6 py-4">
                    {webhook.is_active ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 text-sm">
                        <XCircle className="h-4 w-4" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => testWebhook(webhook.id)}
                        className="text-indigo-600 hover:text-indigo-700"
                        title="Test webhook"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteWebhook(webhook.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete webhook"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
