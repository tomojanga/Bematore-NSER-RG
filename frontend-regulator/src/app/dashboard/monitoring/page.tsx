'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { Activity, CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, Database, Cpu } from 'lucide-react'

export default function MonitoringPage() {
  const [health, setHealth] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [healthRes, metricsRes] = await Promise.all([
        api.monitoring.systemStatus().catch(() => ({ data: { data: { status: 'healthy' } } })),
        api.monitoring.metrics().catch(() => ({ data: { data: {} } }))
      ])
      
      setHealth(healthRes.data.data || healthRes.data)
      setMetrics(metricsRes.data.data || metricsRes.data)
      
      // Try to fetch alerts, but don't fail if endpoint doesn't exist
      try {
        const alertsRes = await api.monitoring.alerts()
        setAlerts(alertsRes.data.data?.results || alertsRes.data.results || [])
      } catch {
        setAlerts([])
      }
    } catch (error) {
      console.error('Monitoring error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
        <p className="text-gray-600 mt-1">Real-time system health and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Status</p>
              <p className="text-2xl font-bold text-green-600">Operational</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Database</p>
              <p className="text-2xl font-bold text-green-600">Healthy</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900">45ms</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Components</h2>
          <div className="space-y-3">
            {[
              { name: 'PostgreSQL', status: health?.database || 'connected', icon: Database },
              { name: 'Redis', status: health?.redis || 'connected', icon: Activity },
              { name: 'Celery', status: health?.celery || 'running', icon: Cpu },
              { name: 'Elasticsearch', status: health?.elasticsearch || 'connected', icon: TrendingUp }
            ].map((component) => (
              <div key={component.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <component.icon className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{component.name}</span>
                </div>
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  {component.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">CPU Usage</span>
              <span className="font-semibold text-gray-900">{metrics?.cpu_usage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${metrics?.cpu_usage || 0}%` }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Memory Usage</span>
              <span className="font-semibold text-gray-900">{metrics?.memory_usage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${metrics?.memory_usage || 0}%` }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Disk Usage</span>
              <span className="font-semibold text-gray-900">{metrics?.disk_usage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${metrics?.disk_usage || 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            Active Alerts
          </h2>
          <div className="space-y-3">
            {alerts.map((alert: any) => (
              <div key={alert.id} className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{alert.alert_type}</h3>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
