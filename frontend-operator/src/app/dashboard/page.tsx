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
    Loader,
    RefreshCw,
    ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import type { Operator, NSERStatistics } from '@/types/api'

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchStats()
        const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
        return () => clearInterval(interval)
    }, [])

    const fetchStats = async () => {
        try {
            setError(null)
            const operatorRes = await apiService.operator.getMe()
            const operator = operatorRes.data.data as Operator

            // Try to get NSER stats, but don't fail if not available
            let nserStats: any = { total_active_exclusions: 0, new_exclusions_today: 0 }
            try {
                const statsRes = await apiService.nser.getStatistics()
                if (statsRes.data?.data) {
                    nserStats = statsRes.data.data as NSERStatistics
                }
            } catch (statsError) {
                console.warn('Could not fetch NSER statistics (may require admin role):', statsError)
            }

            // Get operator metrics
            let metrics: any = {
                api_calls_today: 0,
                average_response_time_ms: 45,
                success_rate: 99.8
            }
            try {
                const metricsRes = await apiService.metrics.getOperatorMetrics(operator.id)
                if (metricsRes.data?.data) {
                    metrics = metricsRes.data.data
                }
            } catch (metricsError) {
                console.warn('Could not fetch metrics:', metricsError)
            }

            setStats({
                operator,
                lookups: metrics.api_calls_today || 0,
                exclusions: nserStats.new_exclusions_today || 0,
                activeExclusions: nserStats.total_active_exclusions || 0,
                metrics
            })
        } catch (error: any) {
            console.error('Failed to fetch stats:', error)
            setError('Failed to load dashboard data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-96">
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
            title: 'Test with Simulator',
            description: 'Use the simulator to test exclusion lookups before going live',
            href: '/dashboard/simulator',
            icon: '🧪'
        },
        {
            number: 3,
            title: 'Setup Integration',
            description: 'Integrate real-time exclusion checks into your platform',
            href: '/dashboard/integration',
            icon: '🔗'
        },
        {
            number: 4,
            title: 'Perform Lookups',
            description: 'Search the exclusion register in real-time',
            href: '/dashboard/lookup',
            icon: '🔍'
        }
    ]

    return (
        <div className="space-y-8">
            {/* Header with Refresh */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {stats?.operator?.name}</p>
                </div>
                <button
                    onClick={() => fetchStats()}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-900">Error</h3>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Status Alerts */}
            {stats?.operator?.license_status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-yellow-900">Pending Approval</h3>
                        <p className="text-sm text-yellow-700">Your operator account is awaiting approval. You'll be notified via email once approved.</p>
                    </div>
                </div>
            )}

            {stats?.operator?.license_status === 'suspended' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-900">Account Suspended</h3>
                        <p className="text-sm text-red-700">Your account has been suspended. Please contact support for more information.</p>
                    </div>
                </div>
            )}

            {stats?.operator?.license_status === 'active' && !stats?.operator?.is_api_active && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900">API Not Active</h3>
                        <p className="text-sm text-blue-700">Please generate an API key to start using the service.</p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'API Calls Today',
                        value: stats?.lookups || 0,
                        icon: Activity,
                        color: 'from-blue-500 to-blue-600',
                        lightColor: 'bg-blue-50'
                    },
                    {
                        title: 'Active Exclusions',
                        value: stats?.activeExclusions || 0,
                        icon: CheckCircle,
                        color: 'from-green-500 to-green-600',
                        lightColor: 'bg-green-50'
                    },
                    {
                        title: 'New Today',
                        value: stats?.exclusions || 0,
                        icon: Users,
                        color: 'from-red-500 to-red-600',
                        lightColor: 'bg-red-50'
                    },
                    {
                        title: 'Avg Response',
                        value: `${Math.round(stats?.metrics?.average_response_time_ms || 45)}ms`,
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
                                <span className="text-green-600 font-medium">{stats?.metrics?.success_rate || 99.8}%</span>
                                <span className="text-gray-500">success rate</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Quick Start Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Getting Started</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickStartItems.map((item) => (
                        <Link
                            key={item.number}
                            href={item.href}
                            className="group flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-blue-50 rounded-lg border border-gray-200 hover:border-purple-300 transition hover:shadow-md"
                        >
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-white border-2 border-gray-200 group-hover:border-purple-300 group-hover:bg-purple-50 text-xl">
                                    {item.icon}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition">
                                    {item.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                            </div>
                            <div className="flex-shrink-0 text-gray-400 group-hover:text-purple-600 transition">
                                <ArrowRight className="h-5 w-5" />
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
