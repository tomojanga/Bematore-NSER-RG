'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { TrendingUp, Users, Shield, Activity, DollarSign, AlertTriangle, BarChart3, PieChart, MapPin, Clock } from 'lucide-react'
import MetricCard from '@/components/MetricCard'
import ProgressBar from '@/components/ProgressBar'
import SimpleChart from '@/components/SimpleChart'

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [realTimeStats, setRealTimeStats] = useState<any>(null)
  const [trends, setTrends] = useState<any>(null)
  const [demographics, setDemographics] = useState<any>(null)
  const [operators, setOperators] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchRealTimeStats, 30000) // Update every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [dashboardRes, trendsRes, demographicsRes, operatorsRes] = await Promise.all([
        api.analytics.dashboardOverview(),
        api.analytics.trends(),
        api.analytics.userDemographics(),
        api.analytics.operatorPerformance()
      ])
      
      setDashboard(dashboardRes.data.data)
      setTrends(trendsRes.data.data)
      setDemographics(demographicsRes.data.data)
      setOperators(operatorsRes.data.data)
      
      await fetchRealTimeStats()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRealTimeStats = async () => {
    try {
      const res = await api.analytics.realTimeStats()
      setRealTimeStats(res.data.data)
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GRAK Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive system insights and performance metrics</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Users"
          value={dashboard?.total_users || 0}
          subtitle={`Today: +${dashboard?.new_exclusions_today || 0}`}
          icon={Users}
          color="blue"
          trend={{
            value: dashboard?.growth_metrics?.users_growth_7d || 0,
            direction: 'up',
            period: '7d'
          }}
        />
        
        <MetricCard
          title="Active Exclusions"
          value={dashboard?.active_exclusions || 0}
          subtitle={`Today: +${dashboard?.new_exclusions_today || 0}`}
          icon={Shield}
          color="red"
        />
        
        <MetricCard
          title="Revenue Today"
          value={`KSh ${dashboard?.revenue_today_ksh?.toLocaleString() || '0'}`}
          subtitle={`${dashboard?.transactions_today || 0} transactions`}
          icon={DollarSign}
          color="green"
        />
        
        <MetricCard
          title="High Risk Users"
          value={dashboard?.high_risk_users || 0}
          subtitle="Requires attention"
          icon={AlertTriangle}
          color="purple"
        />
        
        <MetricCard
          title="API Calls"
          value={dashboard?.api_calls_today || 0}
          subtitle={`${dashboard?.avg_response_time || 0}ms avg`}
          icon={Activity}
          color="indigo"
        />
        
        <MetricCard
          title="Compliance"
          value={`${dashboard?.compliance_rate || 0}%`}
          subtitle="System wide"
          icon={TrendingUp}
          color="yellow"
          trend={{
            value: 2,
            direction: 'up',
            period: 'month'
          }}
        />
      </div>

      {/* Real-time System Health */}
      {realTimeStats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Real-time System Health
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{realTimeStats.active_sessions}</p>
              <p className="text-xs text-gray-600">Active Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{realTimeStats.api_calls_per_second}</p>
              <p className="text-xs text-gray-600">API Calls/sec</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{realTimeStats.cpu_usage}%</p>
              <p className="text-xs text-gray-600">CPU Usage</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{realTimeStats.memory_usage}%</p>
              <p className="text-xs text-gray-600">Memory</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{realTimeStats.response_times?.p50}ms</p>
              <p className="text-xs text-gray-600">Response P50</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{realTimeStats.error_rate}%</p>
              <p className="text-xs text-gray-600">Error Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{realTimeStats.throughput_rpm}</p>
              <p className="text-xs text-gray-600">Requests/min</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{realTimeStats.database_connections}</p>
              <p className="text-xs text-gray-600">DB Connections</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Geographic Distribution
          </h2>
          <div className="space-y-3">
            {dashboard?.geographic_distribution && Object.entries(dashboard.geographic_distribution).map(([county, count]: [string, any]) => {
              const maxCount = Math.max(...Object.values(dashboard.geographic_distribution))
              return (
                <div key={county} className="flex items-center justify-between">
                  <span className="text-gray-600 min-w-0 flex-shrink-0">{county}</span>
                  <div className="flex-1 mx-3">
                    <ProgressBar 
                      value={count} 
                      max={maxCount} 
                      color="blue" 
                      size="sm" 
                      showValue 
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Risk Level Distribution
          </h2>
          <div className="space-y-3">
            {demographics?.risk_distribution && Object.entries(demographics.risk_distribution).map(([level, count]: [string, any]) => {
              const colors = { low: 'green', medium: 'yellow', high: 'yellow', severe: 'red', critical: 'purple' }
              const color = colors[level as keyof typeof colors] || 'blue'
              const maxCount = Math.max(...Object.values(demographics.risk_distribution))
              return (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize min-w-0 flex-shrink-0">{level} Risk</span>
                  <div className="flex-1 mx-3">
                    <ProgressBar 
                      value={count} 
                      max={maxCount} 
                      color={color as any} 
                      size="sm" 
                      showValue 
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Operator Performance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Top Operator Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Calls</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue (KSh)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {operators?.operators?.slice(0, 8).map((operator: any) => (
                <tr key={operator.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{operator.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{operator.api_calls_today.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`${operator.avg_response_time < 50 ? 'text-green-600' : operator.avg_response_time < 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {operator.avg_response_time}ms
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`${operator.compliance_score >= 95 ? 'text-green-600' : operator.compliance_score >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {operator.compliance_score}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{operator.revenue_ksh.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      operator.uptime_percent >= 99 ? 'bg-green-100 text-green-800' : 
                      operator.uptime_percent >= 95 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {operator.uptime_percent}% uptime
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trends Charts */}
      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <SimpleChart
              type="line"
              title="User Growth Trend (Last 30 Days)"
              data={trends.user_growth?.slice(-30).map((item: any) => ({
                label: new Date(item.date).toLocaleDateString(),
                value: item.value
              })) || []}
              height={200}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <SimpleChart
              type="bar"
              title="Revenue Trend (Last 7 Days)"
              data={trends.revenue_trends?.slice(-7).map((item: any) => ({
                label: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
                value: item.revenue_ksh,
                color: 'bg-green-500'
              })) || []}
              height={200}
            />
          </div>
        </div>
      )}

      {/* Demographics and Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <SimpleChart
            type="bar"
            title="Age Distribution"
            data={demographics?.by_age ? Object.entries(demographics.by_age).map(([age, count]: [string, any]) => ({
              label: age,
              value: count,
              color: 'bg-blue-500'
            })) : []}
            height={180}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <SimpleChart
            type="pie"
            title="Gender Distribution"
            data={demographics?.by_gender ? Object.entries(demographics.by_gender).map(([gender, count]: [string, any]) => ({
              label: gender.charAt(0).toUpperCase() + gender.slice(1),
              value: count
            })) : []}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">System Uptime</span>
              <span className="font-medium text-green-600">{dashboard?.system_uptime}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Operators</span>
              <span className="font-medium">{dashboard?.total_operators}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Assessments Today</span>
              <span className="font-medium">{dashboard?.assessments_today}</span>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Performance Score</div>
              <ProgressBar 
                value={dashboard?.compliance_rate || 0} 
                max={100} 
                color="green" 
                size="lg" 
                showValue 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
