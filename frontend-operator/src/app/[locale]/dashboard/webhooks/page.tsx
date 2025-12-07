'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import apiService from '@/lib/api-service'
import { Plus, Trash2, Eye, CheckCircle, XCircle, RefreshCw, AlertCircle, Loader, Copy } from 'lucide-react'

interface WebhookEvent {
  event_type: string
  status: 'delivered' | 'failed' | 'pending'
  timestamp: string
  response_status?: number
}

interface Webhook {
  id: string
  url: string
  events: string[]
  is_active: boolean
  created_at: string
  last_triggered_at?: string
  success_count: number
  failure_count: number
}

export default function WebhooksPage() {
  const t = useTranslations()
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [webhookLogs, setWebhookLogs] = useState<WebhookEvent[]>([])
  const [creating, setCreating] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    url: '',
    events: ['exclusion.created'],
    is_active: true
  })

  const eventTypes = [
    'exclusion.created',
    'exclusion.updated',
    'exclusion.terminated',
    'exclusion.extended',
    'operator.status_changed',
    'api_key.rotated'
  ]

  useEffect(() => {
    fetchWebhooks()
  }, [])

  const fetchWebhooks = async () => {
    try {
      setLoading(true)
      const operatorRes = await apiService.operator.getMe()
      const operatorId = operatorRes?.data?.data?.id
      
      if (!operatorId) {
        setMessage({ type: 'error', text: 'Could not retrieve operator information' })
        setLoading(false)
        return
      }
      
      const response = await apiService.integration.getWebhookLogs(operatorId)
      setWebhooks(response?.data?.data?.results || [])
    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
      setMessage({ type: 'error', text: 'Failed to load webhooks' })
      setWebhooks([])
    } finally {
      setLoading(false)
    }
  }

  const createWebhook = async () => {
    if (!formData.url.trim()) {
      setMessage({ type: 'error', text: 'Please enter a webhook URL' })
      return
    }

    if (formData.events.length === 0) {
      setMessage({ type: 'error', text: 'Select at least one event type' })
      return
    }

    setCreating(true)
    try {
      const operatorRes = await apiService.operator.getMe()
      const operatorId = operatorRes?.data?.data?.id

      if (!operatorId) {
        setMessage({ type: 'error', text: 'Could not retrieve operator information' })
        setCreating(false)
        return
      }

      await apiService.integration.configureWebhooks(operatorId, {
        url: formData.url,
        events: formData.events,
        is_active: formData.is_active
      })

      setMessage({ type: 'success', text: 'Webhook created successfully!' })
      setShowForm(false)
      setFormData({ url: '', events: ['exclusion.created'], is_active: true })
      fetchWebhooks()
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      console.error('Create webhook error:', error)
      setMessage({ type: 'error', text: error?.response?.data?.error || error?.response?.data?.message || 'Failed to create webhook' })
    } finally {
      setCreating(false)
    }
  }

  const deleteWebhook = async (id: string) => {
    if (!confirm('Delete this webhook? This action cannot be undone.')) return

    try {
      const operatorRes = await apiService.operator.getMe()
      const operatorId = operatorRes?.data?.data?.id

      if (!operatorId) {
        setMessage({ type: 'error', text: 'Could not retrieve operator information' })
        return
      }
      
      await apiService.integration.testWebhook(operatorId, { webhook_id: id, action: 'delete' })
      setMessage({ type: 'success', text: 'Webhook deleted successfully!' })
      fetchWebhooks()
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      console.error('Delete webhook error:', error)
      setMessage({ type: 'error', text: error?.response?.data?.error || error?.response?.data?.message || 'Failed to delete webhook' })
    }
  }

  const testWebhook = async (id: string) => {
    setTesting(id)
    try {
      const operatorRes = await apiService.operator.getMe()
      const operatorId = operatorRes?.data?.data?.id

      if (!operatorId) {
        setMessage({ type: 'error', text: 'Could not retrieve operator information' })
        setTesting(null)
        return
      }
      
      await apiService.integration.testWebhook(operatorId, { webhook_id: id })
      setMessage({ type: 'success', text: 'Test event sent! Check your webhook logs.' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      console.error('Test webhook error:', error)
      setMessage({ type: 'error', text: error?.response?.data?.error || error?.response?.data?.message || 'Failed to test webhook' })
    } finally {
      setTesting(null)
    }
  }

  const viewLogs = async (id: string) => {
    setShowDetails(id)
    try {
      const operatorRes = await apiService.operator.getMe()
      const operatorId = operatorRes?.data?.data?.id

      if (!operatorId) {
        setMessage({ type: 'error', text: 'Could not retrieve operator information' })
        setShowDetails(null)
        return
      }
      
      const response = await apiService.integration.getWebhookLogs(operatorId)
      setWebhookLogs(response?.data?.data?.results || [])
    } catch (error) {
      console.error('Failed to load webhook logs:', error)
      setMessage({ type: 'error', text: 'Failed to load webhook logs' })
      setShowDetails(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('webhooks.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('webhooks.title')}</h1>
          <p className="text-gray-600 mt-1">{t('webhooks.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2 transition"
        >
          <Plus className="h-5 w-5" />
          {t('webhooks.add_webhook')}
        </button>
      </div>

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

      {/* Create Webhook Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t('webhooks.create_new')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('webhooks.webhook_url')}
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder={t('webhooks.webhook_url_placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={creating}
              />
              <p className="text-xs text-gray-500 mt-1">{t('webhooks.https_required')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('webhooks.event_types')}
              </label>
              <div className="space-y-2">
                {eventTypes.map((event) => (
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
                      disabled={creating}
                    />
                    <span className="text-sm text-gray-700">{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={createWebhook}
                disabled={creating || !formData.url.trim() || formData.events.length === 0}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    {t('webhooks.creating')}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {t('webhooks.create_webhook')}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowForm(false)
                  setFormData({ url: '', events: ['exclusion.created'], is_active: true })
                }}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition disabled:opacity-50"
              >
                {t('webhooks.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-600 mb-4">{t('webhooks.no_webhooks')}</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {t('webhooks.create_first')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{webhook.url}</h3>
                    {webhook.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          {t('webhooks.active')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          {t('webhooks.inactive')}
                        </span>
                      )}
                  </div>
                  <p className="text-xs text-gray-500">ID: {webhook.id?.substring(0, 8)}...</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">{t('webhooks.events_subscribed')}:</p>
                <div className="flex flex-wrap gap-2">
                  {webhook.events.map((event) => (
                    <span key={event} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('webhooks.created')}</p>
                  <p className="font-medium text-gray-900">
                    {new Date(webhook.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('webhooks.deliveries')}</p>
                  <p className="font-medium">
                    <span className="text-green-600">{webhook.success_count}</span>
                    <span className="text-gray-400"> / </span>
                    <span className="text-red-600">{webhook.failure_count}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('webhooks.last_triggered')}</p>
                  <p className="font-medium text-gray-900">
                    {webhook.last_triggered_at ? new Date(webhook.last_triggered_at).toLocaleDateString() : t('webhooks.never')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => viewLogs(webhook.id)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  title={t('webhooks.view_logs_title')}
                >
                  <Eye className="h-4 w-4" />
                  {t('webhooks.view_logs')}
                </button>
                <button
                  onClick={() => testWebhook(webhook.id)}
                  disabled={testing === webhook.id}
                  className="flex-1 px-3 py-2 text-sm bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border border-yellow-200 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                  title={t('webhooks.test_event_title')}
                >
                  <RefreshCw className={`h-4 w-4 ${testing === webhook.id ? 'animate-spin' : ''}`} />
                  {t('webhooks.test')}
                </button>
                <button
                  onClick={() => deleteWebhook(webhook.id)}
                  className="flex-1 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  title={t('webhooks.delete_webhook_title')}
                >
                  <Trash2 className="h-4 w-4" />
                  {t('webhooks.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Webhook Logs Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{t('webhooks.logs_title')}</h2>
              <button
                onClick={() => setShowDetails(null)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              {webhookLogs.length === 0 ? (
                <div className="p-6 text-center text-gray-600">
                  <p>{t('webhooks.no_events')}</p>
                </div>
              ) : (
                <div className="space-y-2 p-6">
                  {webhookLogs.map((log, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{log.event_type}</span>
                        {log.status === 'delivered' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {log.status === 'failed' && (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      {log.response_status && (
                        <p className="text-xs text-gray-500 mt-1">
                          Status: {log.response_status}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">{t('webhooks.documentation_title')}</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>{t('webhooks.doc_1')}</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>{t('webhooks.doc_2')}</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>{t('webhooks.doc_3')}</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>{t('webhooks.doc_4')}</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span>{t('webhooks.doc_5')}</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
