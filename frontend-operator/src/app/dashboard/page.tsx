'use client'

import { useEffect, useState } from 'react'
import apiService from '@/lib/api-service'
import { 
  Activity, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  AlertCircle,
  Loader
} from 'lucide-react'
import Link from 'next/link'
import type { Operator, NSERStatistics } from '@/types/api'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [operatorRes, statsRes] = await Promise.all([
        apiService.operator.getMe(),
        apiService.nser.getStatistics()
      ])
      setStats({
        operator: operatorRes.data.data as Operator,
        lookups: (statsRes.data.data as NSERStatistics)?.total_active_exclusions || 0,
        exclusions: (statsRes.data.data as NSERStatistics)?.new_exclusions_today || 0
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const quickStartItems = [
    {
      number: 1,
      title: 'Generate API Keys',
      description: 'Create API keys for production and testing environments',
      href: '/dashboard/api-keys',
      icon: '🔑'
    },
    {
      number: 2,
      title: 'Test Integration',
      description: 'Use the simulator to test exclusion lookups before going live',
      href: '/dashboard/simulator',
      icon: '🧪'
    },
    {
      number: 3,
      title: 'Go Live',
      description: 'Integrate real-time exclusion checks into your platform',
      href: '/dashboard/integration',
      icon: '🚀'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back to your operator portal</p>
      </div>

      {/* Status Alert */}
      {stats?.operator?.license_status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Pending Approval</h3>
            <p className="text-sm text-yellow-700">Your operator account is awaiting approval. You'll be notified via email once approved.</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Lookups',
            value: stats?.lookups || 0,
            icon: Activity,
            color: 'from-blue-500 to-blue-600',
            lightColor: 'bg-blue-50'
          },
          {
            title: 'Active Operators',
            value: '0',
            icon: Users,
            color: 'from-green-500 to-green-600',
            lightColor: 'bg-green-50'
          },
          {
            title: 'Exclusions Found',
            value: stats?.exclusions || 0,
            icon: CheckCircle,
            color: 'from-red-500 to-red-600',
            lightColor: 'bg-red-50'
          },
          {
            title: 'Avg Response',
            value: '45ms',
            icon: Clock,
            color: 'from-purple-500 to-purple-600',
            lightColor: 'bg-purple-50'
          }
        ].map((stat, idx) => {
          const IconComponent = stat.icon
          return (
            <div 
              key={idx}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.lightColor}`}>
                  <IconComponent className={`h-6 w-6 text-white`} style={{
                    color: stat.color.split(' ')[1].replace('to-', '')
                  }} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">+12.5%</span>
                <span className="text-gray-500">from last week</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Start Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Getting Started</h2>
        <div className="space-y-4">
          {quickStartItems.map((item) => (
            <Link 
              key={item.number}
              href={item.href}
              className="group flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-blue-50 rounded-lg border border-gray-200 hover:border-purple-200 transition"
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white border-2 border-gray-200 group-hover:border-purple-300 group-hover:bg-purple-50">
                  <span className="text-lg">{item.icon}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition">
                  Step {item.number}: {item.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
              <div className="flex-shrink-0 text-gray-400 group-hover:text-purple-600 transition">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Real-time Lookups',
            description: 'Check exclusion status instantly with our API',
            features: ['< 100ms response', 'High availability', '99.9% uptime']
          },
          {
            title: 'Compliance Tracking',
            description: 'Monitor your compliance score and metrics',
            features: ['Real-time metrics', 'Detailed reports', 'Compliance alerts']
          },
          {
            title: 'Integration Support',
            description: 'Easy integration with your existing systems',
            features: ['REST API', 'Webhooks', 'SDKs available']
          }
        ].map((feature, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
            <ul className="space-y-2">
              {feature.features.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
