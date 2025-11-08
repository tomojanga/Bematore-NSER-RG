'use client'

import { useSystemHealth, useActiveAlerts } from '@/hooks/useMonitoring'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Activity, AlertCircle, CheckCircle, Server, Database, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function GRAKMonitoringPage() {
  const { data: health } = useSystemHealth()
  const { data: alerts } = useActiveAlerts()

  const systemStatus = health?.data
  const activeAlerts = alerts?.results || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Health Monitoring</h1>
        <p className="text-gray-600 mt-1">Real-time system performance and health metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={cn('h-12 w-12 rounded-full flex items-center justify-center', {
                'bg-green-100': systemStatus?.status === 'healthy',
                'bg-yellow-100': systemStatus?.status === 'degraded',
                'bg-red-100': systemStatus?.status === 'down'
              })}>
                <Activity className={cn('h-6 w-6', {
                  'text-green-600': systemStatus?.status === 'healthy',
                  'text-yellow-600': systemStatus?.status === 'degraded',
                  'text-red-600': systemStatus?.status === 'down'
                })} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 capitalize">{systemStatus?.status || 'Unknown'}</p>
                <p className="text-sm text-gray-600">System Status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{systemStatus?.api_response_time_ms || 0}ms</p>
                <p className="text-sm text-gray-600">API Response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Server className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">99.9%</p>
                <p className="text-sm text-gray-600">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{systemStatus?.active_connections || 0}</p>
                <p className="text-sm text-gray-600">Active Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Active System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <p className="text-gray-600 font-medium">No Active Alerts</p>
              <p className="text-sm text-gray-500">All systems operating normally</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert: any) => (
                <div key={alert.id} className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-red-900">{alert.title}</p>
                      <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">{alert.severity}</span>
                    </div>
                    <p className="text-sm text-red-700">{alert.message}</p>
                    <p className="text-xs text-red-600 mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
