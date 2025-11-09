'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Activity, Users, CheckCircle, Clock } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/operators/me/')
      setStats(response.data)
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your operator portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lookups</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <Activity className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Exclusions Found</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <CheckCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900">45ms</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Start</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg">
            <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <h3 className="font-semibold text-gray-900">Generate API Keys</h3>
              <p className="text-sm text-gray-600">Create API keys for production and testing environments</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg">
            <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <h3 className="font-semibold text-gray-900">Test Integration</h3>
              <p className="text-sm text-gray-600">Use the simulator to test exclusion lookups before going live</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg">
            <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <h3 className="font-semibold text-gray-900">Go Live</h3>
              <p className="text-sm text-gray-600">Integrate real-time exclusion checks into your platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
