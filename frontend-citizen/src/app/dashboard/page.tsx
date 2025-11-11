'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader'
import { StatsCard } from '@/components/Dashboard/StatsCard'
import { ExclusionCard } from '@/components/Dashboard/ExclusionCard'
import { api } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import {
    Shield,
    TrendingDown,
    Activity,
    AlertCircle,
    BarChart3,
    Calendar,
    User,
    Zap,
    Loader2
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
    activeExclusions: number
    totalDuration: number
    daysRemaining: number
    riskLevel: 'low' | 'medium' | 'high' | 'severe'
}

interface Exclusion {
    id: string
    status: 'active' | 'pending' | 'expired' | 'lifted'
    type: 'self' | 'operator' | 'regulatory'
    startDate: string
    endDate: string
    daysRemaining: number
    reason?: string
    duration: number
}

interface RiskProfile {
    current_risk_level: 'low' | 'medium' | 'high' | 'severe'
    score: number
    last_assessment: string
}

interface VerificationStatus {
    is_email_verified: boolean
    is_phone_verified: boolean
    is_id_verified: boolean
}

export default function DashboardPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { toast } = useToast()

    const [exclusions, setExclusions] = useState<Exclusion[]>([])
    const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
        is_email_verified: false,
        is_phone_verified: false,
        is_id_verified: false
    })
    const [stats, setStats] = useState<DashboardStats>({
        activeExclusions: 0,
        totalDuration: 0,
        daysRemaining: 0,
        riskLevel: 'low'
    })

    // Fetch exclusions
    useEffect(() => {
        const fetchExclusions = async () => {
            try {
                const { data } = await api.get('/nser/my-exclusions/')
                if (data.success && data.data?.items) {
                    const mappedExclusions: Exclusion[] = data.data.items.map((e: any) => ({
                        id: e.id,
                        status: e.status,
                        type: e.exclusion_type || 'self',
                        startDate: e.start_date,
                        endDate: e.end_date,
                        daysRemaining: Math.max(0, Math.ceil((new Date(e.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
                        reason: e.reason,
                        duration: Math.ceil((new Date(e.end_date).getTime() - new Date(e.start_date).getTime()) / (1000 * 60 * 60 * 24))
                    }))
                    setExclusions(mappedExclusions)
                }
            } catch (error) {
                console.error('Failed to fetch exclusions:', error)
                toast({
                    title: 'Error',
                    description: 'Failed to load exclusions',
                    variant: 'destructive'
                })
            }
        }

        fetchExclusions()
    }, [toast])

    // Fetch risk profile
    useEffect(() => {
        const fetchRiskProfile = async () => {
            try {
                const { data } = await api.get('/screening/current-risk/')
                if (data.success && data.data) {
                    setRiskProfile(data.data)
                }
            } catch (error) {
                console.error('Failed to fetch risk profile:', error)
            }
        }

        fetchRiskProfile()
    }, [])

    // Fetch verification status
    useEffect(() => {
        const fetchVerificationStatus = async () => {
            try {
                const { data } = await api.get('/users/me/profile/')
                if (data.success && data.data) {
                    setVerificationStatus({
                        is_email_verified: data.data.is_email_verified || false,
                        is_phone_verified: data.data.is_phone_verified || false,
                        is_id_verified: data.data.is_id_verified || false
                    })
                }
            } catch (error) {
                console.error('Failed to fetch verification status:', error)
            }
        }

        fetchVerificationStatus()
    }, [])

    // Update stats based on actual exclusions
    useEffect(() => {
        if (exclusions && exclusions.length > 0) {
            const active = exclusions.filter(e => e.status === 'active')
            setStats({
                activeExclusions: active.length,
                totalDuration: active.reduce((sum, e) => sum + e.duration, 0),
                daysRemaining: active.reduce((sum, e) => sum + e.daysRemaining, 0),
                riskLevel: riskProfile?.current_risk_level || 'low'
            })
        }
        setIsLoading(false)
    }, [exclusions, riskProfile])

    const recentExclusions = exclusions?.slice(0, 3) || []
    const activeExclusion = exclusions?.find(e => e.status === 'active')

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <DashboardHeader
                title="Dashboard"
                subtitle={`Welcome back, ${user?.first_name || 'User'}`}
            />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        icon={Shield}
                        label="Active Exclusions"
                        value={stats.activeExclusions}
                        color={stats.activeExclusions > 0 ? 'red' : 'green'}
                        description="Self-exclusions currently active"
                    />
                    <StatsCard
                        icon={Calendar}
                        label="Total Duration"
                        value={`${stats.totalDuration} days`}
                        color="blue"
                        description="Combined exclusion duration"
                    />
                    <StatsCard
                        icon={TrendingDown}
                        label="Days Remaining"
                        value={stats.daysRemaining}
                        color="yellow"
                        description="Until next exclusion expires"
                    />
                    <StatsCard
                        icon={Activity}
                        label="Risk Level"
                        value={stats.riskLevel.toUpperCase()}
                        color={stats.riskLevel === 'high' || stats.riskLevel === 'severe' ? 'red' : stats.riskLevel === 'medium' ? 'yellow' : 'green'}
                        description="Current assessment status"
                        onClick={() => window.location.href = '/dashboard/assessments'}
                    />
                </div>

                {/* Alert Banner */}
                {activeExclusion && (
                    <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-bold text-red-900 mb-2">Self-Exclusion Active</h3>
                                <p className="text-red-800 mb-4">
                                    You currently have an active self-exclusion. This means you are excluded from all licensed gambling operators during this period.
                                </p>
                                <div className="flex gap-2">
                                    <Link
                                        href="/dashboard/help"
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        Get Support
                                    </Link>
                                    <Link
                                        href="/dashboard/self-exclude"
                                        className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium"
                                    >
                                        Manage Exclusion
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Exclusion History */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Your Exclusions</h2>
                                <Link
                                    href="/dashboard/history"
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                    View All →
                                </Link>
                            </div>

                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            ) : recentExclusions.length > 0 ? (
                                <div className="space-y-4">
                                    {recentExclusions.map(exclusion => (
                                        <ExclusionCard
                                            key={exclusion.id}
                                            exclusion={exclusion}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 font-medium mb-2">No active exclusions</p>
                                    <p className="text-gray-500 text-sm mb-4">You have not registered any self-exclusions</p>
                                    <Link
                                        href="/dashboard/self-exclude"
                                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Register Self-Exclusion
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <Link
                                    href="/dashboard/self-exclude"
                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                                >
                                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Self-Exclude</p>
                                        <p className="text-xs text-gray-500">Register new exclusion</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/dashboard/assessments"
                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                                >
                                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Risk Assessment</p>
                                        <p className="text-xs text-gray-500">Take a screening test</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/dashboard/account"
                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
                                >
                                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                        <User className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Account Settings</p>
                                        <p className="text-xs text-gray-500">Manage your profile</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/dashboard/help"
                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
                                >
                                    <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                                        <Zap className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Get Help</p>
                                        <p className="text-xs text-gray-500">Support & resources</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Account Info Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                            <p className="text-blue-100 text-sm font-medium mb-2">Account Status</p>
                            <p className="text-2xl font-bold mb-4">Active</p>

                            <div className="space-y-3 mb-6 pb-6 border-b border-blue-500">
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${verificationStatus.is_email_verified ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                    <span className="text-sm">
                                        Email {verificationStatus.is_email_verified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${verificationStatus.is_phone_verified ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                    <span className="text-sm">
                                        Phone {verificationStatus.is_phone_verified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${verificationStatus.is_id_verified ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                    <span className="text-sm">
                                        ID {verificationStatus.is_id_verified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            {(!verificationStatus.is_email_verified || !verificationStatus.is_phone_verified || !verificationStatus.is_id_verified) && (
                                <Link
                                    href="/dashboard/account"
                                    className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors text-center"
                                >
                                    Complete Verification
                                </Link>
                            )}
                        </div>

                        {/* Helpful Resources */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Helpful Resources</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/dashboard/help#how-to" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                        → How Self-Exclusion Works
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/dashboard/help#faq" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                        → Frequently Asked Questions
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/dashboard/help#support" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                        → Contact Support
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/dashboard/help#resources" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                        → Gambling Resources
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
