'use client'

import { useDashboardStats, useExclusionTrends } from '@/hooks/useDashboard'
import { Users, Shield, Building2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const { data: stats, isLoading: loadingStats } = useDashboardStats()
  const { data: trends } = useExclusionTrends(30)

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Active Exclusions',
      value: stats?.active_exclusions || 0,
      icon: Shield,
      color: 'bg-green-500',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Total Operators',
      value: stats?.total_operators || 0,
      icon: Building2,
      color: 'bg-purple-500',
      change: '+3%',
      trend: 'up'
    },
    {
      title: 'Pending Assessments',
      value: stats?.pending_assessments || 0,
      icon: AlertCircle,
      color: 'bg-orange-500',
      change: '-5%',
      trend: 'down'
    },
  ]

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of system metrics and activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exclusion Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exclusion Trends (30 Days)</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            {trends && trends.length > 0 ? (
              <div className="w-full">
                <div className="space-y-2">
                  {trends.slice(-7).map((trend, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{formatDate(trend.date)}</span>
                      <div className="flex gap-4">
                        <span className="text-green-600">+{trend.new}</span>
                        <span className="text-gray-900 font-medium">{trend.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              'Chart visualization will be displayed here'
            )}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="h-20 w-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-green-600">45%</span>
                  </div>
                  <p className="text-sm text-gray-600">Low Risk</p>
                </div>
                <div className="text-center">
                  <div className="h-20 w-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-yellow-600">35%</span>
                  </div>
                  <p className="text-sm text-gray-600">Moderate</p>
                </div>
                <div className="text-center">
                  <div className="h-20 w-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-red-600">20%</span>
                  </div>
                  <p className="text-sm text-gray-600">High Risk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New self-exclusion registered</p>
                <p className="text-xs text-gray-500">User ID: USR{item.toString().padStart(6, '0')}</p>
              </div>
              <span className="text-xs text-gray-500">{item}m ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
