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
    Loader2,
    ChevronRight
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
    risk_level: 'none' | 'low' | 'mild' | 'moderate' | 'high' | 'severe' | 'critical'
    risk_score: number
    score_date: string
    days_ago?: number
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
    const [isLoadingExclusions, setIsLoadingExclusions] = useState(false)
    const [isLoadingRisk, setIsLoadingRisk] = useState(false)
    const [isLoadingVerification, setIsLoadingVerification] = useState(false)
    const [isExtending, setIsExtending] = useState<string | null>(null)
    const [showExtendModal, setShowExtendModal] = useState<string | null>(null)
    const [extendPeriod, setExtendPeriod] = useState<string>('3_months')
    const [extendReason, setExtendReason] = useState('')
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
            setIsLoadingExclusions(true)
            try {
                const { data } = await api.nser.myExclusions()
                // API returns paginated response with 'results' key
                const exclusionsList = data.results || data.data?.results || data.data?.items || data || []
                if (exclusionsList && Array.isArray(exclusionsList)) {
                    const mappedExclusions: Exclusion[] = exclusionsList
                        .filter((e: any) => e.status !== 'pending') // Exclude pending exclusions
                        .map((e: any) => {
                            const startDate = e.effective_date || e.start_date
                            const endDate = e.expiry_date || e.end_date
                            const isActive = e.is_active || (endDate && new Date(endDate) > new Date())

                            return {
                                id: e.id,
                                status: isActive ? 'active' : (endDate && new Date(endDate) <= new Date() ? 'expired' : 'pending'),
                                type: 'self', // From backend, all are self-exclusions via citizen dashboard
                                startDate: startDate,
                                endDate: endDate,
                                daysRemaining: endDate ? Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0,
                                reason: e.reason || 'Self-exclusion',
                                duration: endDate && startDate ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
                            }
                        })

                    // Sort: active first, then expired
                    const sorted = [
                        ...mappedExclusions.filter(e => e.status === 'active'),
                        ...mappedExclusions.filter(e => e.status === 'expired')
                    ]
                    setExclusions(sorted)
                }
            } catch (error) {
                console.error('Failed to fetch exclusions:', error)
                toast({
                    title: 'Error',
                    description: 'Failed to load exclusions',
                    variant: 'destructive'
                })
            } finally {
                setIsLoadingExclusions(false)
            }
        }

        fetchExclusions()
    }, [toast])

    // Fetch risk profile
    useEffect(() => {
        const fetchRiskProfile = async () => {
            setIsLoadingRisk(true)
            try {
                const { data } = await api.screening.currentRisk()
                // API returns RiskScoreSerializer response
                const riskData = data.data || data.results?.[0] || data
                if (riskData && riskData.risk_level) {
                    setRiskProfile({
                        risk_level: riskData.risk_level || 'low',
                        risk_score: riskData.risk_score || 0,
                        score_date: riskData.score_date || new Date().toISOString(),
                        days_ago: riskData.days_ago
                    })
                }
            } catch (error) {
                console.error('Failed to fetch risk profile:', error)
                // Set default if endpoint fails
                setRiskProfile({
                    risk_level: 'none',
                    risk_score: 0,
                    score_date: new Date().toISOString()
                })
            } finally {
                setIsLoadingRisk(false)
            }
        }

        fetchRiskProfile()
    }, [])

    // Fetch verification status
    useEffect(() => {
        const fetchVerificationStatus = async () => {
            setIsLoadingVerification(true)
            try {
                const { data } = await api.users.me()
                const userData = data.data || data
                if (userData) {
                    setVerificationStatus({
                        is_email_verified: userData.is_email_verified || false,
                        is_phone_verified: userData.is_phone_verified || false,
                        is_id_verified: userData.is_id_verified || false
                    })
                }
            } catch (error) {
                console.error('Failed to fetch verification status:', error)
            } finally {
                setIsLoadingVerification(false)
            }
        }

        fetchVerificationStatus()
    }, [])

    // Update stats based on actual exclusions
    useEffect(() => {
        if (exclusions && exclusions.length > 0) {
            const active = exclusions.filter(e => e.status === 'active')
            const riskLevel = riskProfile?.risk_level || 'low'
            // Map backend risk levels to component risk levels
            const mappedRiskLevel = riskLevel === 'none' ? 'low' :
                riskLevel === 'mild' ? 'medium' :
                    riskLevel === 'moderate' ? 'medium' :
                        riskLevel as 'low' | 'medium' | 'high' | 'severe'

            setStats({
                activeExclusions: active.length,
                totalDuration: active.reduce((sum, e) => sum + e.duration, 0),
                daysRemaining: active.reduce((sum, e) => sum + e.daysRemaining, 0),
                riskLevel: mappedRiskLevel
            })
        }
        setIsLoading(false)
    }, [exclusions, riskProfile])

    const handleExtendExclusion = async (exclusionId: string) => {
        if (!extendPeriod) {
            toast({
                title: 'Error',
                description: 'Please select an extension period',
                variant: 'destructive'
            })
            return
        }

        setIsExtending(exclusionId)
        try {
            await api.nser.extend(exclusionId, {
                new_period: extendPeriod,
                reason: extendReason || 'User requested extension'
            })

            toast({
                title: 'Success',
                description: 'Exclusion extended successfully',
                variant: 'default'
            })

            // Refresh exclusions
            const { data } = await api.nser.myExclusions()
            const exclusionsList = data.results || data.data?.results || data.data?.items || data || []
            if (exclusionsList && Array.isArray(exclusionsList)) {
                const mappedExclusions: Exclusion[] = exclusionsList
                    .filter((e: any) => e.status !== 'pending')
                    .map((e: any) => {
                        const startDate = e.effective_date || e.start_date
                        const endDate = e.expiry_date || e.end_date
                        const isActive = e.is_active || (endDate && new Date(endDate) > new Date())

                        return {
                            id: e.id,
                            status: isActive ? 'active' : (endDate && new Date(endDate) <= new Date() ? 'expired' : 'pending'),
                            type: 'self',
                            startDate: startDate,
                            endDate: endDate,
                            daysRemaining: endDate ? Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0,
                            reason: e.reason || 'Self-exclusion',
                            duration: endDate && startDate ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
                        }
                    })

                const sorted = [
                    ...mappedExclusions.filter(e => e.status === 'active'),
                    ...mappedExclusions.filter(e => e.status === 'expired')
                ]
                setExclusions(sorted)
            }

            setShowExtendModal(null)
            setExtendPeriod('3_months')
            setExtendReason('')
        } catch (error: any) {
            console.error('Failed to extend exclusion:', error)
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to extend exclusion',
                variant: 'destructive'
            })
        } finally {
            setIsExtending(null)
        }
    }

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
                                <h3 className="font-bold text-red-900 mb-2">⚠️ Self-Exclusion Active</h3>
                                <p className="text-red-800 mb-3 text-sm">
                                    You currently have an active self-exclusion. You are excluded from all licensed gambling operators during this period.
                                </p>
                                <div className="bg-white rounded p-3 mb-4 border border-red-200">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-red-700 font-medium">Start Date:</span>
                                            <p className="text-red-900">{new Date(activeExclusion.startDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-red-700 font-medium">End Date:</span>
                                            <p className="text-red-900">{new Date(activeExclusion.endDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-red-700 font-medium">Days Remaining:</span>
                                            <p className="text-red-900 font-bold">{activeExclusion.daysRemaining} days</p>
                                        </div>
                                        <div>
                                            <span className="text-red-700 font-medium">Duration:</span>
                                            <p className="text-red-900">{activeExclusion.duration} days</p>
                                        </div>
                                    </div>
                                    {activeExclusion.reason && (
                                        <div className="mt-3 pt-3 border-t border-red-200">
                                            <span className="text-red-700 font-medium text-sm">Reason:</span>
                                            <p className="text-red-900 text-sm mt-1">{activeExclusion.reason}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <Link
                                        href="/dashboard/help"
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                                    >
                                        Get Support
                                    </Link>
                                    <Link
                                        href="/dashboard/history"
                                        className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                                    >
                                        View Details
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

                            {isLoadingExclusions ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
                                    <p className="text-gray-600 text-sm">Loading exclusions...</p>
                                </div>
                            ) : recentExclusions.length > 0 ? (
                                <div className="space-y-4">
                                    {recentExclusions.map(exclusion => (
                                        <ExclusionCard
                                            key={exclusion.id}
                                            exclusion={exclusion}
                                            onExtend={() => setShowExtendModal(exclusion.id)}
                                            onGetSupport={() => router.push('/dashboard/help')}
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
                                {activeExclusion ? (
                                    <div
                                        className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed opacity-50"
                                        title="Cannot register new exclusion while one is active"
                                    >
                                        <div className="p-3 bg-gray-200 rounded-lg">
                                            <Shield className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600">Self-Exclude</p>
                                            <p className="text-xs text-gray-400">Already excluded</p>
                                        </div>
                                    </div>
                                ) : (
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
                                )}

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

            {/* Extend Modal */}
            {showExtendModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Extend Exclusion Period</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select New Period
                            </label>
                            <select
                                value={extendPeriod}
                                onChange={(e) => setExtendPeriod(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="3_months">3 Months</option>
                                <option value="6_months">6 Months</option>
                                <option value="1_year">1 Year</option>
                                <option value="3_years">3 Years</option>
                                <option value="5_years">5 Years</option>
                                <option value="permanent">Permanent</option>
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason (Optional)
                            </label>
                            <textarea
                                value={extendReason}
                                onChange={(e) => setExtendReason(e.target.value)}
                                placeholder="Why are you extending your exclusion?"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>Important:</strong> Extending your exclusion will add the selected period to your current exclusion end date.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowExtendModal(null)
                                    setExtendPeriod('3_months')
                                    setExtendReason('')
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleExtendExclusion(showExtendModal)}
                                disabled={isExtending === showExtendModal}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {isExtending === showExtendModal ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Extending...
                                    </>
                                ) : (
                                    <>
                                        Extend <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
