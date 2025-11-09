'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '@/components/ui/Card'
import { BarChart3, TrendingUp, Users, Shield, Activity, DollarSign } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics()

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
    </div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Comprehensive insights and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={data?.overview?.total_users || 0}
          icon={<Users className="h-6 w-6" />}
          color="blue"
          change={{ value: '+12.5%', direction: 'up' }}
        />
        <StatCard
          title="Active Exclusions"
          value={data?.overview?.active_exclusions || 0}
          icon={<Shield className="h-6 w-6" />}
          color="red"
          change={{ value: '+8.3%', direction: 'up' }}
        />
        <StatCard
          title="Assessments"
          value={data?.overview?.total_assessments || 0}
          icon={<Activity className="h-6 w-6" />}
          color="green"
          change={{ value: '+15.2%', direction: 'up' }}
        />
        <StatCard
          title="Revenue"
          value={`KES ${((data?.overview?.total_revenue || 0) / 1000000).toFixed(1)}M`}
          icon={<DollarSign className="h-6 w-6" />}
          color="purple"
          change={{ value: '+22.1%', direction: 'up' }}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exclusion Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.exclusionTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="exclusions" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.riskDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(data?.riskDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operator Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.operatorPerformance || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="compliance" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.topRiskFactors || []).map((factor: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{factor.name}</span>
                  <span className="font-bold">{factor.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exclusion Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.exclusionPeriods || []).map((period: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{period.period?.replace('_', ' ')}</span>
                  <span className="font-bold">{period.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.assessmentTypes || []).map((type: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm uppercase">{type.type}</span>
                  <span className="font-bold">{type.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
