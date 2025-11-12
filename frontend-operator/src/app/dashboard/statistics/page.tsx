'use client'

import { useState, useEffect } from 'react'
import apiService from '@/lib/api-service'
import { Activity, TrendingUp, Clock, CheckCircle, Download, AlertCircle, Loader } from 'lucide-react'

interface OperatorMetrics {
  total_lookups: number
  lookups_today: number
  lookups_this_month: number
  average_response_time_ms: number
  success_rate: number
  exclusions_found: number
  p50_response_time: number
  p99_response_time: number
}

interface DailyStats {
  date: string
  lookups: number
  exclusions_found: number
  avg_response_time: number
  success_rate: number
}

export default function StatisticsPage() {
  const [metrics, setMetrics] = useState<OperatorMetrics | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [loading, setLoading] = useState(true)
  const [periodFilter, setPeriodFilter] = useState<'7' | '30' | '90'>('30')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchStatistics()
  }, [periodFilter])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const operatorRes = await apiService.operator.getMe()
      const operatorId = operatorRes.data?.data?.id

      if (!operatorId) {
        setMessage({ type: 'error', text: 'Could not load operator information' })
        setLoading(false)
        return
      }

      // Fetch operator metrics
      try {
        const metricsRes = await apiService.metrics.getOperatorMetrics(operatorId)
        const metricsData = metricsRes.data?.data
        if (metricsData) {
          setMetrics({
            total_lookups: metricsData.total_lookups || 0,
            lookups_today: metricsData.lookups_today || 0,
            lookups_this_month: metricsData.lookups_this_month || 0,
            average_response_time_ms: metricsData.average_response_time_ms || 0,
            success_rate: metricsData.success_rate || 0,
            exclusions_found: metricsData.exclusions_found || 0,
            p50_response_time: metricsData.p50_response_time || 0,
            p99_response_time: metricsData.p99_response_time || 0
          })
        }
      } catch (metricsError) {
        console.error('Failed to fetch metrics:', metricsError)
        // Set default metrics
        setMetrics({
          total_lookups: 0,
          lookups_today: 0,
          lookups_this_month: 0,
          average_response_time_ms: 0,
          success_rate: 0,
          exclusions_found: 0,
          p50_response_time: 0,
          p99_response_time: 0
        })
      }

      // Fetch daily stats
      try {
        const daysRes = await apiService.nser.getDailyStats()
        // Filter by period
        const now = new Date()
        const pastDate = new Date(now.getTime() - parseInt(periodFilter) * 24 * 60 * 60 * 1000)
        const filtered = (daysRes.data?.data || []).filter((stat: DailyStats) => {
          return new Date(stat.date) >= pastDate
        })
        setDailyStats(filtered)
      } catch (daysError) {
        console.error('Failed to fetch daily stats:', daysError)
        setDailyStats([])
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
      setMessage({ type: 'error', text: 'Failed to load statistics' })
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async () => {
    try {
      const operatorRes = await apiService.operator.getMe()
      const operatorId = operatorRes.data.data.id

      const csvContent = [
        ['Date', 'Lookups', 'Exclusions Found', 'Avg Response Time (ms)', 'Success Rate (%)'],
        ...dailyStats.map(stat => [
          stat.date,
          stat.lookups,
          stat.exclusions_found,
          stat.avg_response_time,
          stat.success_rate
        ])
      ]
        .map(row => row.join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `statistics-${periodFilter}d-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentElement?.removeChild(link)

      setMessage({ type: 'success', text: 'Report downloaded successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download report' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-600 mt-1">Your operator performance metrics and analytics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as '7' | '30' | '90')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={downloadReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg p-4 flex gap-3 border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </div>
      )}

      {metrics ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Lookups</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.total_lookups.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-2">{metrics.lookups_today} today</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Avg Response Time</p>
                  <p className="text-3xl font-bold text-gray-900">{Math.round(metrics.average_response_time_ms)}ms</p>
                  <p className="text-xs text-gray-500 mt-2">P99: {metrics.p99_response_time}ms</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.success_rate.toFixed(2)}%</p>
                  <p className="text-xs text-gray-500 mt-2">Uptime</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Exclusions Found</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.exclusions_found}</p>
                  <p className="text-xs text-gray-500 mt-2">This month</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Lookups This Month</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.lookups_this_month.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">P50 Response Time</p>
                <p className="text-2xl font-bold text-green-600">{metrics.p50_response_time}ms</p>
              </div>
            </div>
          </div>

          {/* Daily Stats Table */}
          {dailyStats.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Daily Performance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lookups</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exclusions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Response</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dailyStats.map((stat, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(stat.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {stat.lookups}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {stat.exclusions_found}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {Math.round(stat.avg_response_time)}ms
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  stat.success_rate >= 99 ? 'bg-green-600' :
                                  stat.success_rate >= 95 ? 'bg-yellow-600' :
                                  'bg-red-600'
                                }`}
                                style={{ width: `${stat.success_rate}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {stat.success_rate.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
        ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <p className="text-yellow-800">No metrics available. Please try again later.</p>
        </div>
        )}

        {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Performance Targets</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span><strong>P50 Response Time:</strong> Target &lt;50ms (median)</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span><strong>P99 Response Time:</strong> Target &lt;200ms (99th percentile)</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span><strong>Success Rate:</strong> Target &gt;99.9% uptime</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0">•</span>
            <span><strong>Rate Limits:</strong> 100 requests/second per API key</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
