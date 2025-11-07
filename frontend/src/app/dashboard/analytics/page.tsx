'use client'

import { useDashboardKPIs } from '@/hooks/useDashboard'
import { useExclusionTrends, useDataExport } from '@/hooks/useAnalytics'
import { TrendingUp, Users, Shield, Activity, Download } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: kpis } = useDashboardKPIs()
  const { data: trends } = useExclusionTrends()
  const { exportData, isExporting } = useDataExport()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive data insights and trends</p>
        </div>
        <button
          onClick={() => exportData({
            export_type: 'excel',
            data_source: 'exclusions',
            date_from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            date_to: new Date().toISOString()
          })}
          disabled={isExporting}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-5 w-5" />
          {isExporting ? 'Exporting...' : 'Export Report'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <Users className="h-8 w-8 mb-4 opacity-80" />
          <p className="text-sm opacity-90">Total Users</p>
          <p className="text-3xl font-bold mt-2">{kpis?.users?.total_users?.toLocaleString() || 0}</p>
          <div className="flex items-center gap-1 mt-2 text-sm opacity-90">
            <TrendingUp className="h-4 w-4" />
            <span>12% from last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <Shield className="h-8 w-8 mb-4 opacity-80" />
          <p className="text-sm opacity-90">Active Exclusions</p>
          <p className="text-3xl font-bold mt-2">{kpis?.exclusions?.active_exclusions?.toLocaleString() || 0}</p>
          <div className="flex items-center gap-1 mt-2 text-sm opacity-90">
            <TrendingUp className="h-4 w-4" />
            <span>8% from last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <Activity className="h-8 w-8 mb-4 opacity-80" />
          <p className="text-sm opacity-90">Operators</p>
          <p className="text-3xl font-bold mt-2">{kpis?.operators?.total_operators?.toLocaleString() || 0}</p>
          <div className="flex items-center gap-1 mt-2 text-sm opacity-90">
            <TrendingUp className="h-4 w-4" />
            <span>3% from last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <Shield className="h-8 w-8 mb-4 opacity-80" />
          <p className="text-sm opacity-90">Compliance Rate</p>
          <p className="text-3xl font-bold mt-2">{kpis?.compliance?.compliance_rate?.toFixed(1) || 0}%</p>
          <div className="flex items-center gap-1 mt-2 text-sm opacity-90">
            <TrendingUp className="h-4 w-4" />
            <span>5% from last month</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exclusion Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exclusion Trends (90 Days)</h3>
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Activity className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p>Chart visualization</p>
              <p className="text-sm">Total: {trends?.data?.length || 0} data points</p>
            </div>
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p>Chart visualization</p>
              <p className="text-sm">Monthly growth rate: 12%</p>
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="space-y-4">
            {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'].map((county, idx) => (
              <div key={county} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{county}</span>
                <div className="flex items-center gap-3 flex-1 ml-4">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${90 - idx * 15}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {90 - idx * 15}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Level Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-24 w-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-green-600">45%</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Low Risk</p>
                <p className="text-xs text-gray-500">2,340 users</p>
              </div>
              <div className="text-center">
                <div className="h-24 w-24 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-yellow-600">35%</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Moderate</p>
                <p className="text-xs text-gray-500">1,820 users</p>
              </div>
              <div className="text-center">
                <div className="h-24 w-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-red-600">20%</span>
                </div>
                <p className="text-sm font-medium text-gray-700">High Risk</p>
                <p className="text-xs text-gray-500">1,040 users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm text-gray-600">Avg Response Time</p>
            <p className="text-2xl font-bold text-gray-900">{kpis?.users?.avg_response_time || 87}ms</p>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-sm text-gray-600">System Uptime</p>
            <p className="text-2xl font-bold text-gray-900">99.9%</p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <p className="text-sm text-gray-600">API Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">98.5%</p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>
        </div>
      </div>
    </div>
  )
}
