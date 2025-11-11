'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { AlertTriangle, CheckCircle } from 'lucide-react'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await api.monitoring.alerts()
      const data = response.data.data || response.data
      setAlerts(data?.results || data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async (id: string) => {
    try {
      await api.monitoring.acknowledgeAlert(id)
      fetchAlerts()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Alerts</h1>
        <p className="text-gray-600 mt-1">Monitor and manage system alerts</p>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">No active alerts</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`bg-white p-6 rounded-lg shadow border-l-4 ${
              alert.severity === 'critical' ? 'border-red-600' :
              alert.severity === 'high' ? 'border-orange-600' :
              alert.severity === 'medium' ? 'border-yellow-600' :
              'border-blue-600'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <AlertTriangle className={`h-6 w-6 ${
                    alert.severity === 'critical' ? 'text-red-600' :
                    alert.severity === 'high' ? 'text-orange-600' :
                    alert.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
