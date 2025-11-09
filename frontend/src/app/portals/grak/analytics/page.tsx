'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '@/components/ui/Card'
import { BarChart3, TrendingUp, Users, Shield, DollarSign } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function GRAKAnalyticsPage() {
  const { data: analytics } = useAnalytics()

  const monthlyData = analytics?.monthly_trends || []
  const revenueData = analytics?.revenue_trends || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Comprehensive insights and regulatory reporting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics?.total_users || 0}
          icon={<Users className="h-6 w-6" />}
          color="blue"
          change={{ value: '+12.5%', direction: 'up' }}
        />
        <StatCard
          title="Active Exclusions"
          value={analytics?.active_exclusions || 0}
          icon={<Shield className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          title="Monthly Revenue"
          value={`KES ${((analytics?.monthly_revenue || 0) / 1000000).toFixed(1)}M`}
          icon={<DollarSign className="h-6 w-6" />}
          color="green"
          change={{ value: '+8.3%', direction: 'up' }}
        />
        <StatCard
          title="Compliance Rate"
          value={`${analytics?.compliance_rate || 0}%`}
          icon={<BarChart3 className="h-6 w-6" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Collection (5% Levy)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
