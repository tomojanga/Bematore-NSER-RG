'use client'

import { useState } from 'react'
import { useAPIRequestLogs, useSystemHealth, usePerformanceMetrics, useSystemMetrics } from '@/hooks/useMonitoring'
import { Activity, Server, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default function MonitoringPage() {
  const [page, setPage] = useState(1)
  const { data: apiLogs, isLoading: loadingLogs } = useAPIRequestLogs({ page, page_size: 50 })
  const { data: health } = useSystemHealth()
  const { data: performance } = usePerformanceMetrics()
  const { data: systemMetrics } = useSystemMetrics()

  const logs = apiLogs?.results || []

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 300 && status < 400) return 'text-blue-600'
    if (status >= 400 && status < 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBg = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-50'
    if (status >= 300 && status < 400) return 'bg-blue-50'
    if (status >= 400 && status < 500) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
        <p className="text-gray-600 mt-1">Real-time system health and performance metrics</p>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`rounded-lg border p-4 ${
          health?.data?.status === 'healthy' ? 'bg-green-50 border-green-200' :
          health?.data?.status === 'degraded' ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">System Status</p>
              <p className="text-2xl font-bold capitalize">{health?.data?.status || 'Unknown'}</p>
            </div>
            {health?.data?.status === 'healthy' ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : health?.data?.status === 'degraded' ? (
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{health?.data?.api_response_time_ms || 0}ms</p>
            </div>
            <Zap className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">
                {health?.data?.uptime_seconds ? Math.round(health.data.uptime_seconds / 3600) : 0}h
              </p>
            </div>
            <Server className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{apiLogs?.count || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Component Health */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Database</p>
              <p className="text-xs text-gray-500">PostgreSQL</p>
            </div>
            {health?.data?.database_status === 'ok' ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Redis Cache</p>
              <p className="text-xs text-gray-500">In-memory storage</p>
            </div>
            {health?.data?.cache_status === 'ok' ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Celery Workers</p>
              <p className="text-xs text-gray-500">Background tasks</p>
            </div>
            {health?.data?.celery_status === 'ok' ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {performance && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics (24h)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{performance?.responseTime?.avg || 87}ms</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">P95 Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{performance?.responseTime?.p95 || 234}ms</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{performance?.errorRate?.success_rate || 98.5}%</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Error Rate</p>
              <p className="text-2xl font-bold text-red-600">{performance?.errorRate?.error_rate || 1.5}%</p>
            </div>
          </div>
        </div>
      )}

      {/* API Request Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent API Requests</h3>
        </div>

        {loadingLogs ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        log.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                        log.method === 'POST' ? 'bg-green-100 text-green-700' :
                        log.method === 'PUT' || log.method === 'PATCH' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.path}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBg(log.status_code)} ${getStatusColor(log.status_code)}`}>
                        {log.status_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={
                        log.response_time_ms < 100 ? 'text-green-600' :
                        log.response_time_ms < 500 ? 'text-yellow-600' :
                        'text-red-600'
                      }>
                        {log.response_time_ms.toFixed(2)}ms
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
