'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import apiService from '@/lib/api-service'
import { AlertCircle, TrendingUp, Activity, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const t = useTranslations()
  const [operator, setOperator] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch operator info
      const operatorRes = await apiService.operator.getMe()
      setOperator(operatorRes.data.data)

      // Fetch statistics
      const statsRes = await apiService.operator.getStatistics()
      setStats(statsRes.data.data || statsRes.data)

      // Fetch metrics (if available)
      try {
        const metricsRes = await apiService.metrics.getOverview()
        setMetrics(metricsRes.data.data || metricsRes.data)
      } catch (e) {
        console.log('Metrics not available')
      }

      // Fetch recent activity (if available)
      try {
        const activityRes = await apiService.audit.getOperatorLogs({
          limit: 5,
          offset: 0,
        })
        setRecentActivity(activityRes.data.data?.results || [])
      } catch (e) {
        console.log('Activity logs not available')
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError(err.response?.data?.detail || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
          </div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          {operator?.name ? `Welcome, ${operator.name}` : 'Welcome to your operator dashboard'}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        </div>
      )}

      {/* Operator Status Card */}
      {operator && (
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Business Name</p>
              <p className="text-lg font-semibold text-foreground">{operator.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">License Status</p>
              <p className={`text-lg font-semibold ${
                operator.license_status === 'active' ? 'text-primary' :
                operator.license_status === 'pending' ? 'text-yellow-600' :
                'text-destructive'
              }`}>
                {operator.license_status?.charAt(0).toUpperCase() + operator.license_status?.slice(1) || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">API Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${operator.is_api_active ? 'bg-primary' : 'bg-secondary'}`}></div>
                <p className="text-lg font-semibold text-foreground">
                  {operator.is_api_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              label: 'Total Lookups',
              value: stats.total_lookups || 0,
              icon: Activity,
            },
            {
              label: 'API Calls Today',
              value: stats.api_calls_today || 0,
              icon: TrendingUp,
            },
            {
              label: 'Exclusions Found',
              value: stats.exclusions_found || 0,
              icon: CheckCircle,
            },
            {
              label: 'System Uptime',
              value: stats.system_uptime ? `${stats.system_uptime}%` : 'N/A',
              icon: Clock,
            },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-white border border-border rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <Icon className="h-8 w-8 text-primary/20" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/lookup"
            className="block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm text-center"
          >
            Exclusion Lookup
          </Link>
          <Link
            href="/dashboard/api-keys"
            className="block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm text-center"
          >
            Manage API Keys
          </Link>
          <Link
            href="/dashboard/statistics"
            className="block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm text-center"
          >
            View Statistics
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                <div className="flex-1">
                  <p className="text-foreground">{activity.action || activity.event || `Activity ${i + 1}`}</p>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                  {activity.created_at || activity.timestamp ? new Date(activity.created_at || activity.timestamp).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Activity Message */}
      {(!recentActivity || recentActivity.length === 0) && (
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        </div>
      )}
    </div>
  )
}
