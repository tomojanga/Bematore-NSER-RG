'use client'

import { useOperatorDashboard } from '@/hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle, StatCard, StatusBadge } from '@/components/ui/Card'
import { Building2, Shield, CheckCircle, AlertCircle, Key, TrendingUp } from 'lucide-react'

export default function OperatorDashboardPage() {
  const { data, isLoading } = useOperatorDashboard()

  if (isLoading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Operator Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor compliance and API integration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="API Requests Today"
          value={data?.apiUsage?.today || 0}
          icon={<Key className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Exclusion Checks"
          value={data?.metrics?.exclusion_checks || 0}
          icon={<Shield className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          title="Compliance Score"
          value={`${data?.complianceStatus?.score || 0}%`}
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Active Users"
          value={data?.metrics?.active_users || 0}
          icon={<TrendingUp className="h-6 w-6" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Health</span>
                <StatusBadge status="active" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium">{data?.apiUsage?.avg_response_time || 0}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium">{data?.apiUsage?.success_rate || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Score</span>
                <span className="text-sm font-medium">{data?.complianceStatus?.score || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Audit</span>
                <span className="text-sm font-medium">
                  {data?.complianceStatus?.last_audit ? new Date(data.complianceStatus.last_audit).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Issues</span>
                <span className="text-sm font-medium">{data?.complianceStatus?.issues_count || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
