'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { AlertCircle, CheckCircle, Clock, Calendar, Shield } from 'lucide-react'
import Link from 'next/link'

interface ExclusionStatus {
    id: string
    status: 'active' | 'pending' | 'expired' | 'lifted'
    type: 'self' | 'operator' | 'regulatory'
    startDate: string
    endDate: string
    daysRemaining: number
    reason?: string
    duration: number // in days
}

interface ExclusionCardProps {
    exclusion: ExclusionStatus
    onManage?: (id: string) => void
    onExtend?: (id: string) => void
    onGetSupport?: () => void
}

export const ExclusionCard: React.FC<ExclusionCardProps> = ({
    exclusion,
    onManage,
    onExtend,
    onGetSupport
}) => {
    const t = useTranslations()

    const statusConfig = {
        active: {
            icon: AlertCircle,
            labelKey: 'dashboard.active_exclusions',
            color: 'bg-red-50 border-red-200 text-red-700',
            badge: 'bg-red-100 text-red-700'
        },
        pending: {
            icon: Clock,
            labelKey: 'assessment.pending',
            color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
            badge: 'bg-yellow-100 text-yellow-700'
        },
        expired: {
            icon: Calendar,
            labelKey: 'history.expired',
            color: 'bg-gray-50 border-gray-200 text-gray-600',
            badge: 'bg-gray-100 text-gray-600'
        },
        lifted: {
            icon: CheckCircle,
            labelKey: 'history.lifted',
            color: 'bg-green-50 border-green-200 text-green-700',
            badge: 'bg-green-100 text-green-700'
        }
    }

    const config = statusConfig[exclusion.status]
    const StatusIcon = config.icon

    return (
        <div className={`rounded-lg sm:rounded-xl border-2 p-4 sm:p-6 ${config.color}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-4">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <StatusIcon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg">{t(config.labelKey)}</h3>
                        <p className="text-xs sm:text-sm opacity-75 truncate">{t('sidebar.self_exclusion')} #{exclusion.id.slice(0, 8)}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${config.badge}`}>
                    {exclusion.type}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
                <div>
                    <p className="text-xs opacity-75">{t('dashboard.start_date')}</p>
                    <p className="font-semibold text-sm sm:text-base">{new Date(exclusion.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="text-xs opacity-75">{t('dashboard.end_date')}</p>
                    <p className="font-semibold text-sm sm:text-base">{new Date(exclusion.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="text-xs opacity-75">{t('dashboard.duration')}</p>
                    <p className="font-semibold text-sm sm:text-base">{exclusion.duration} days</p>
                </div>
                <div>
                    <p className="text-xs opacity-75">{t('dashboard.days_remaining')}</p>
                    <p className="font-semibold text-base sm:text-lg">{exclusion.daysRemaining}</p>
                </div>
            </div>

            {exclusion.reason && (
                <div className="mb-4 p-2 sm:p-3 bg-white bg-opacity-50 rounded-lg">
                    <p className="text-xs font-medium opacity-75 mb-1">{t('dashboard.reason')}</p>
                    <p className="text-xs sm:text-sm">{exclusion.reason}</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4 border-t border-current border-opacity-20">
                {exclusion.status === 'active' && (
                    <>
                        <button
                            onClick={() => onExtend?.(exclusion.id)}
                            className="flex-1 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-medium text-xs sm:text-sm transition-all"
                        >
                            {t('dashboard.extend_exclusion_period')}
                        </button>
                        <button
                            onClick={() => onGetSupport?.()}
                            className="flex-1 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-medium text-xs sm:text-sm transition-all"
                        >
                            {t('dashboard.get_support')}
                        </button>
                    </>
                )}
                {exclusion.status === 'expired' && (
                    <button
                        onClick={() => onManage?.(exclusion.id)}
                        className="flex-1 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-medium text-xs sm:text-sm transition-all"
                    >
                        {t('dashboard.view_details')}
                    </button>
                )}
                {exclusion.status === 'pending' && (
                    <button disabled className="flex-1 px-3 py-2 bg-white bg-opacity-20 rounded-lg font-medium text-xs sm:text-sm opacity-50 cursor-not-allowed">
                        {t('common.loading')}
                    </button>
                )}
            </div>
        </div>
    )
}

export default ExclusionCard
