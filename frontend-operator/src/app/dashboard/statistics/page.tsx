'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Activity, Users, CheckCircle, TrendingUp } from 'lucide-react'

export default function StatisticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/operators/statistics/')
      setStats(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600 mt-1">Your operator performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lookups</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <Activity className="h-10 w-10 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Exclusions Found</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <CheckCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900">42ms</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Compliance Rate</p>
              <p className="text-3xl font-bold text-gray-900">100%</p>
            </div>
            <Users className="h-10 w-10 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-600">No recent activity</p>
      </div>
    </div>
  )
}
