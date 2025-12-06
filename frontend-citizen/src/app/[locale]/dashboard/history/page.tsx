'use client'

import { useTranslations } from 'next-intl'
import { useMyExclusions } from '@/hooks/useExclusions'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@/components/ui/Card'
import { Shield, Calendar, Clock, Loader2, AlertCircle, Info, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader'

export default function HistoryPage() {
    const t = useTranslations()
    const { data: exclusions, isLoading } = useMyExclusions()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <DashboardHeader title={t('history.title')} subtitle={t('history.subtitle')} />
                <main className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <DashboardHeader title={t('history.title')} subtitle={t('history.subtitle')} />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="space-y-6">

                    {exclusions?.results && exclusions.results.length > 0 ? (
                        <div className="space-y-4">
                            {exclusions.results.map((exclusion: any) => {
                            const daysRemaining = exclusion.status === 'active' && (exclusion.expiry_date || exclusion.end_date)
                            ? Math.ceil((new Date(exclusion.expiry_date || exclusion.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                            : 0
                            const totalDays = (exclusion.effective_date || exclusion.start_date) && (exclusion.expiry_date || exclusion.end_date)
                            ? Math.ceil((new Date(exclusion.expiry_date || exclusion.end_date).getTime() - new Date(exclusion.effective_date || exclusion.start_date).getTime()) / (1000 * 60 * 60 * 24))
                            : 0
                                const progress = exclusion.status === 'active' && totalDays > 0
                                    ? Math.min(100, Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100))
                                    : exclusion.status === 'expired' ? 100 : 0

                                return (
                                    <div key={exclusion.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0 ${exclusion.status === 'active' ? 'bg-red-100' : exclusion.status === 'expired' ? 'bg-gray-100' : 'bg-blue-100'
                                                        }`}>
                                                        <Shield className={`h-7 w-7 ${exclusion.status === 'active' ? 'text-red-600' : exclusion.status === 'expired' ? 'text-gray-400' : 'text-blue-600'
                                                            }`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-lg text-gray-900">
                                                                {t('sidebar.self_exclusion')}
                                                            </h3>
                                                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${exclusion.status === 'active'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : exclusion.status === 'expired'
                                                                        ? 'bg-gray-100 text-gray-700'
                                                                        : 'bg-green-100 text-green-700'
                                                                }`}>
                                                                {exclusion.status.charAt(0).toUpperCase() + exclusion.status.slice(1)}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                                                             <div>
                                                                 <p className="text-gray-500 text-xs mb-0.5">{t('assessment.pending')}</p>
                                                                 <p className="font-semibold text-gray-900">{exclusion.exclusion_period?.replace(/_/g, ' ').toUpperCase()}</p>
                                                             </div>
                                                             <div>
                                                             <p className="text-gray-500 text-xs mb-0.5">{t('dashboard.start_date')}</p>
                                                             <p className="font-semibold text-gray-900">{new Date(exclusion.effective_date || exclusion.start_date || exclusion.created_at).toLocaleDateString()}</p>
                                                             </div>
                                                             <div>
                                                             <p className="text-gray-500 text-xs mb-0.5">{t('dashboard.end_date')}</p>
                                                             <p className="font-semibold text-gray-900">{exclusion.expiry_date || exclusion.end_date ? new Date(exclusion.expiry_date || exclusion.end_date).toLocaleDateString() : 'N/A'}</p>
                                                             </div>
                                                             <div>
                                                                 <p className="text-gray-500 text-xs mb-0.5">{t('dashboard.duration')}</p>
                                                                 <p className="font-semibold text-gray-900">{totalDays} {t('dashboard.duration')}</p>
                                                             </div>
                                                         </div>

                                                        {exclusion.status === 'active' && (
                                                             <div className="mt-4 pt-4 border-t border-gray-200">
                                                                 <div className="flex items-center justify-between mb-2">
                                                                     <p className="text-sm font-medium text-gray-700">{t('dashboard.your_exclusions')}</p>
                                                                     <p className="text-sm font-bold text-red-600">{daysRemaining} {t('dashboard.days_remaining')}</p>
                                                                 </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                                                        style={{ width: `${progress}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {exclusion.reason && (
                                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                                <p className="text-sm text-gray-600"><span className="font-medium">Reason:</span> {exclusion.reason}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium mb-1">No Exclusion History</p>
                            <p className="text-gray-500 text-sm mb-6">You haven't registered any self-exclusions yet.</p>
                            <Link
                                href="/dashboard/self-exclude"
                                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Register Self-Exclusion
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
