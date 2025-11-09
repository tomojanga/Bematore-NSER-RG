'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { 
  Users, Shield, CheckCircle, AlertTriangle, Activity, DollarSign, 
  TrendingUp, Clock, BarChart3, PieChart, MapPin, Zap 
} from 'lucide-react'
import MetricCard from '@/components/MetricCard'
import ProgressBar from '@/components/ProgressBar'
import SimpleChart from '@/components/SimpleChart'
import { useWebSocket } from '@/lib/useWebSocket'

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [realTimeStats, setRealTimeStats] = useState<any>(null)
  const [operators, setOperators] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])

  // WebSocket disabled for now - requires Redis setup
  const isConnected = false
  // const { isConnected, lastMessage } = useWebSocket(
  //   `ws://127.0.0.1:8000/ws/dashboard/`,
  //   {
  //     onMessage: (message) => {
  //       if (message.type === 'statistics_updated') {
  //         setRealTimeStats(message.data)
  //       } else if (message.type === 'exclusion_created') {
  //         setActivities(prev => [{
  //           type: 'exclusion',
  //           message: 'New self-exclusion registered',
  //           timestamp: new Date().toISOString(),
  //           color: 'green'
  //         }, ...prev.slice(0, 4)])
  //       } else if (message.type === 'risk_score_updated') {
  //         setActivities(prev => [{
  //           type: 'risk',
  //           message: 'High-risk user detected',
  //           timestamp: new Date().toISOString(),
  //           color: 'red'
  //         }, ...prev.slice(0, 4)])
  //       }
  //     },
  //     reconnectInterval: 5000
  //   }
  // )

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchRealTimeData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, operatorsRes] = await Promise.all([
        api.analytics.dashboardOverview(),
        api.analytics.operatorPerformance()
      ])
      setDashboard(dashboardRes.data.data)
      setOperators(operatorsRes.data.data)
      await fetchRealTimeData()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRealTimeData = async () => {
    try {
      const res = await api.analytics.realTimeStats()
      setRealTimeStats(res.data.data)
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GRAK Dashboard</h1>
          <p className="text-gray-600 mt-1">National Self-Exclusion Register & Responsible Gambling System</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
          <div className="flex items-center mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-green-600">System Operational</span>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Users"
          value={dashboard?.total_users || 0}
          subtitle="Registered citizens"
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
          subtitle={`+${dashboard?.new_exclusions_today || 0} today`}
          icon={Shield}
          color="red"
        />
        
        <MetricCard
          title="Licensed Operators"
          value={dashboard?.total_operators || 0}
          subtitle="Active licenses"
          icon={CheckCircle}
          color="green"
        />
        
        <MetricCard
          title="High Risk Users"
          value={dashboard?.high_risk_users || 0}
          subtitle="Require monitoring"
          icon={AlertTriangle}
          color="purple"
        />
        
        <MetricCard
          title="Daily Revenue"
          value={`KSh ${(dashboard?.revenue_today_ksh || 0).toLocaleString()}`}
          subtitle={`${dashboard?.transactions_today || 0} transactions`}
          icon={DollarSign}
          color="yellow"
        />
      </div>

      {/* Real-time System Status */}
      {realTimeStats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Live System Performance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{realTimeStats.active_sessions}</div>
              <div className="text-xs text-gray-600">Active Sessions</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-green-600">{realTimeStats.api_calls_per_second}</div>
              <div className="text-xs text-gray-600">API Calls/sec</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-purple-600">{realTimeStats.response_times?.p50}ms</div>
              <div className="text-xs text-gray-600">Response Time</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-orange-600">{realTimeStats.cpu_usage}%</div>
              <div className="text-xs text-gray-600">CPU Usage</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-indigo-600">{realTimeStats.memory_usage}%</div>
              <div className="text-xs text-gray-600">Memory</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-red-600">{realTimeStats.error_rate}%</div>
              <div className="text-xs text-gray-600">Error Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Top Operators Performance
          </h3>
          <div className="space-y-3">
            {operators?.operators?.slice(0, 5).map((operator: any, index: number) => (
              <div key={operator.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{operator.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{operator.api_calls_today.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">API calls</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Compliance Overview
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Compliance</span>
                <span className="font-medium">{dashboard?.compliance_rate || 0}%</span>
              </div>
              <ProgressBar value={dashboard?.compliance_rate || 0} max={100} color="green" size="md" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Response Time SLA</span>
                <span className="font-medium">98.5%</span>
              </div>
              <ProgressBar value={98.5} max={100} color="blue" size="md" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Data Accuracy</span>
                <span className="font-medium">99.2%</span>
              </div>
              <ProgressBar value={99.2} max={100} color="purple" size="md" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Geographic Distribution
          </h3>
          <div className="space-y-3">
            {dashboard?.geographic_distribution && Object.entries(dashboard.geographic_distribution)
              .slice(0, 5)
              .map(([county, count]: [string, any]) => {
                const maxCount = Math.max(...Object.values(dashboard.geographic_distribution))
                return (
                  <div key={county} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{county}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16">
                        <ProgressBar value={count} max={maxCount} color="blue" size="sm" />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count.toLocaleString()}</span>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>

      {/* Recent Activities & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Live System Activities
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <span className="text-xs text-gray-500">
                  WebSocket Disabled
                </span>
              </div>
            </div>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={index} className={`flex items-start space-x-3 p-3 bg-${activity.color}-50 rounded`}>
                  <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full mt-2`}></div>
                  <div>
                    <div className="text-sm font-medium">{activity.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-sm text-gray-500">No recent activities</div>
                <div className="text-xs text-gray-400 mt-1">Monitoring system events</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            System Health & Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">API Gateway</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Database Cluster</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <span className="text-sm text-yellow-600 font-medium">75% - Monitor</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Backup Systems</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
