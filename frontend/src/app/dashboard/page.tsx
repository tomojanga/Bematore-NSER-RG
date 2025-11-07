'use client'

import { useDashboard, useGRAKDashboard, useOperatorDashboard, useCitizenDashboard } from '@/hooks/useDashboard'
import { useAuth } from '@/hooks/useAuth'
import { useRealTimeNotifications } from '@/hooks/useNotifications'
import { Card, CardContent, CardHeader, CardTitle, StatCard, StatusBadge, RiskBadge } from '@/components/ui/Card'
import { Users, Shield, Building2, AlertCircle, TrendingUp, TrendingDown, Activity, CheckCircle } from 'lucide-react'

export default function DashboardPage() {
  const { user, hasRole } = useAuth()
  const { data: dashboardData, isLoading } = useDashboard()
  const { realtimeData } = useRealTimeNotifications()

  // Role-based dashboard content
  const renderGRAKDashboard = () => {
    const { data: grakData } = useGRAKDashboard()
    
    if (!grakData) return <DashboardSkeleton />

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GRAK Regulatory Dashboard</h1>
          <p className="text-gray-600 mt-1">National gambling oversight and compliance monitoring</p>
        </div>

        {/* National Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Registered Users"
            value={grakData.overview?.total_users || 0}
            icon={<Users className="h-6 w-6" />}
            color="blue"
            change={{
              value: '+12.5%',
              direction: 'up'
            }}
          />
          <StatCard
            title="Active Exclusions"
            value={grakData.overview?.active_exclusions || 0}
            icon={<Shield className="h-6 w-6" />}
            color="green"
            change={{
              value: '+8.3%',
              direction: 'up'
            }}
          />
          <StatCard
            title="Licensed Operators"
            value={grakData.overview?.total_operators || 0}
            icon={<Building2 className="h-6 w-6" />}
            color="purple"
            change={{
              value: '2',
              direction: 'up'
            }}
          />
          <StatCard
            title="Compliance Rate"
            value={`${Math.round(grakData.overview?.compliance_rate || 0)}%`}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
            change={{
              value: '2.1%',
              direction: 'up'
            }}
          />
        </div>

        {/* Real-time Activity and Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {grakData.realtime?.recent_activities?.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">Reference: {activity.reference}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time_ago}</span>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Real-time activity will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operator Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {grakData.operatorCompliance?.top_performers?.slice(0, 5).map((operator: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{operator.name}</p>
                      <p className="text-xs text-gray-500">License: {operator.license_number}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={operator.compliance_score >= 80 ? 'compliant' : 'non_compliant'} />
                      <p className="text-xs text-gray-500 mt-1">{operator.compliance_score}%</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Operator compliance data will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>National Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(grakData.riskDistribution?.data || {}).map(([level, count]) => (
                <div key={level} className="text-center">
                  <div className="h-20 w-20 mx-auto rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-blue-100 to-indigo-100">
                    <span className="text-xl font-bold text-blue-600">{count as number}</span>
                  </div>
                  <RiskBadge riskLevel={level} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderOperatorDashboard = () => {
    const { data: operatorData } = useOperatorDashboard()
    
    if (!operatorData) return <DashboardSkeleton />

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operator Dashboard</h1>
          <p className="text-gray-600 mt-1">Your compliance and integration overview</p>
        </div>

        {/* Operator Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Your Users"
            value={operatorData.overview?.total_users || 0}
            icon={<Users className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="API Requests Today"
            value={operatorData.apiUsage?.requests_today || 0}
            icon={<Activity className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Exclusions Enforced"
            value={operatorData.overview?.exclusions_enforced || 0}
            icon={<Shield className="h-6 w-6" />}
            color="red"
          />
          <StatCard
            title="Compliance Score"
            value={`${operatorData.complianceStatus?.score || 0}%`}
            icon={<CheckCircle className="h-6 w-6" />}
            color={operatorData.complianceStatus?.score >= 80 ? 'green' : 'yellow'}
          />
        </div>

        {/* API Usage and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent API Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {operatorData.metrics?.recent_api_calls?.slice(0, 5).map((call: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <span className={`text-sm font-mono px-2 py-1 rounded ${
                        call.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                        call.method === 'POST' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {call.method}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">{call.endpoint}</span>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={call.status_code < 400 ? 'success' : 'failed'} />
                      <p className="text-xs text-gray-500">{call.response_time}ms</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>API activity will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {operatorData.recentTransactions?.results?.slice(0, 5).map((transaction: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.transaction_type?.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500">Ref: {transaction.transaction_reference}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">KES {transaction.amount?.toLocaleString()}</p>
                      <StatusBadge status={transaction.status} />
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Transaction history will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderCitizenDashboard = () => {
    const { data: citizenData } = useCitizenDashboard()
    
    if (!citizenData) return <DashboardSkeleton />

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Self-Exclusion Portal</h1>
          <p className="text-gray-600 mt-1">Manage your responsible gambling settings</p>
        </div>

        {/* Quick Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Exclusion Status"
            value={citizenData.exclusions?.results?.[0]?.status || 'Not Excluded'}
            icon={<Shield className="h-6 w-6" />}
            color={citizenData.exclusions?.results?.[0]?.is_active ? 'red' : 'green'}
          />
          <StatCard
            title="Current Risk Level"
            value={citizenData.riskProfile?.data?.risk_level || 'Unknown'}
            icon={<AlertCircle className="h-6 w-6" />}
            color="yellow"
          />
          <StatCard
            title="Next Assessment"
            value={citizenData.assessments?.results?.[0]?.next_assessment_due || 'None Scheduled'}
            icon={<Activity className="h-6 w-6" />}
            color="blue"
          />
        </div>

        {/* Active Exclusion Details */}
        {citizenData.exclusions?.results?.[0]?.is_active && (
          <Card>
            <CardHeader>
              <CardTitle>Your Current Self-Exclusion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">Period</p>
                  <p className="text-lg font-semibold mt-1">
                    {citizenData.exclusions.results[0].exclusion_period?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Days Remaining</p>
                  <p className="text-lg font-semibold mt-1">
                    {citizenData.exclusions.results[0].days_remaining || 'Calculating...'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <StatusBadge status={citizenData.exclusions.results[0].status} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Assessment History */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assessment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {citizenData.assessments?.results?.slice(0, 5).map((assessment: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {assessment.assessment_type?.toUpperCase()} Assessment
                    </p>
                    <p className="text-xs text-gray-500">
                      Completed: {new Date(assessment.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <RiskBadge riskLevel={assessment.risk_level} />
                    <p className="text-xs text-gray-500 mt-1">
                      Score: {assessment.raw_score}/{assessment.max_score || 10}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No assessments completed yet</p>
                  <button className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Take Your First Assessment
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderBemoraDashboard = () => {
    const { data: bemoraData } = useDashboard()
    
    if (!bemoraData) return <DashboardSkeleton />

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bematore Executive Dashboard</h1>
          <p className="text-gray-600 mt-1">National compliance and technology oversight</p>
        </div>

        {/* Executive KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="System Uptime"
            value={`${bemoraData.system_uptime || 99.9}%`}
            icon={<Activity className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`KES ${((bemoraData.total_revenue || 0) / 1000000).toFixed(1)}M`}
            icon={<TrendingUp className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="API Response Time"
            value={`${bemoraData.avg_response_time || 0}ms`}
            icon={<Activity className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Compliance Rate"
            value={`${Math.round(bemoraData.compliance_rate || 0)}%`}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
          />
        </div>
      </div>
    )
  }

  // Loading skeleton
  const DashboardSkeleton = () => (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-96 bg-gray-200 rounded"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  if (isLoading) {
    return <DashboardSkeleton />
  }

  // Render appropriate dashboard based on user role
  if (hasRole(['grak_admin', 'grak_officer', 'grak_auditor'])) {
    return renderGRAKDashboard()
  } else if (hasRole(['operator_admin', 'operator_user'])) {
    return renderOperatorDashboard()
  } else if (hasRole(['bematore_admin', 'bematore_analyst', 'super_admin'])) {
    return renderBemoraDashboard()
  } else {
    return renderCitizenDashboard()
  }
}
