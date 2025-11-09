'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { TrendingUp, Users, Shield, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [operatorRes, nserRes] = await Promise.all([
        api.get('/operators/statistics/'),
        api.get('/nser/statistics/')
      ])
      setStats({
        operators: operatorRes.data.data,
        nser: nserRes.data.data
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">System performance and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Operators</h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.operators?.total_operators || 0}</p>
          <p className="text-sm text-green-600 mt-2">↑ Active: {stats?.operators?.active_operators || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Active Exclusions</h3>
            <Shield className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.nser?.total_active_exclusions || 0}</p>
          <p className="text-sm text-blue-600 mt-2">Today: {stats?.nser?.new_exclusions_today || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">API Keys</h3>
            <Activity className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.operators?.active_api_keys || 0}</p>
          <p className="text-sm text-gray-600 mt-2">Total: {stats?.operators?.total_api_keys || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Compliance Rate</h3>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">95%</p>
          <p className="text-sm text-green-600 mt-2">↑ 2% from last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Operator Distribution</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active</span>
              <span className="font-medium">{stats?.operators?.active_operators || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-medium">{stats?.operators?.pending_approval || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Suspended</span>
              <span className="font-medium">{stats?.operators?.suspended_operators || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Performance</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg Response Time</span>
              <span className="font-medium text-green-600">45ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium text-green-600">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Calls Today</span>
              <span className="font-medium">12,543</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
