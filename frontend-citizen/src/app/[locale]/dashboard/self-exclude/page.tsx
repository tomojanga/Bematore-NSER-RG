'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Shield, CheckCircle, AlertCircle, Loader2, ChevronRight, XCircle } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader'
import { useCanSelfExclude } from '@/hooks/useExclusions'

interface ExclusionDuration {
    label: string
    days: number
    description: string
}

interface ExclusionOption {
    label: string
    value: string
    descriptionKey: string
}

type Step = 'warning' | 'details' | 'confirmation' | 'success' | 'blocked'

export default function SelfExcludePage() {
    const t = useTranslations()
    const router = useRouter()
    const { toast } = useToast()
    
    const EXCLUSION_DURATIONS: ExclusionOption[] = [
        { label: t('dashboard.6_months'), value: '6_months', descriptionKey: 'self_exclude.duration_6months' },
        { label: t('dashboard.1_year'), value: '1_year', descriptionKey: 'self_exclude.duration_1year' },
        { label: t('dashboard.3_years'), value: '3_years', descriptionKey: 'self_exclude.duration_2years' },
        { label: t('dashboard.5_years'), value: '5_years', descriptionKey: 'help.available_assessments' },
        { label: t('dashboard.permanent'), value: 'permanent', descriptionKey: 'self_exclude.duration_lifetime' }
    ]
    const [currentStep, setCurrentStep] = useState<Step>('warning')
    const [isLoading, setIsLoading] = useState(false)
    const [selectedDuration, setSelectedDuration] = useState<string | null>(null)
    const [reason, setReason] = useState('')
    const [termsAcknowledged, setTermsAcknowledged] = useState(false)
    const [consequencesUnderstood, setConsequencesUnderstood] = useState(false)
    const [exclusionId, setExclusionId] = useState<string>('')
    const [isCheckingStatus, setIsCheckingStatus] = useState(true)

    const { canSelfExclude, reason: blockedReason, activeExclusion } = useCanSelfExclude()

    // Check if user can self-exclude on mount
    useEffect(() => {
        setIsCheckingStatus(false)
        if (!canSelfExclude) {
            setCurrentStep('blocked')
        }
    }, [canSelfExclude])

    const handleStartExclusion = async () => {
        if (!selectedDuration) {
            toast({
                title: t('common.error'),
                description: t('dashboard.please_select_period'),
                variant: 'destructive'
            })
            return
        }

        if (!reason || reason.trim().length < 10) {
            toast({
                title: t('common.error'),
                description: t('errors.required_field'),
                variant: 'destructive'
            })
            return
        }

        if (!termsAcknowledged || !consequencesUnderstood) {
            toast({
                title: t('common.error'),
                description: t('errors.required_field'),
                variant: 'destructive'
            })
            return
        }

        setIsLoading(true)
        try {
            const { data } = await api.post('/nser/register/', {
                exclusion_period: selectedDuration,
                reason: reason.trim(),
                motivation_type: 'other',
                terms_acknowledged: termsAcknowledged,
                consequences_understood: consequencesUnderstood
            })

            if (data.success && data.data) {
                setExclusionId(data.data.id)
                setCurrentStep('success')
                toast({
                    title: t('common.success'),
                    description: t('self_exclude.success_message'),
                    variant: 'default'
                })
            }
        } catch (error: any) {
            let errorMsg = t('errors.something_went_wrong')

            const responseData = error.response?.data

            if (responseData?.error) {
                const errorObj = responseData.error

                // First, check for details (field-specific validation errors)
                if (errorObj.details) {
                    if (typeof errorObj.details === 'object') {
                        // details is a dict of field errors: {field: [error1, error2], ...}
                        const errorMessages: string[] = []
                        for (const field in errorObj.details) {
                            const msgs = errorObj.details[field]
                            if (Array.isArray(msgs)) {
                                errorMessages.push(...msgs)
                            } else if (typeof msgs === 'string') {
                                errorMessages.push(msgs)
                            }
                        }
                        if (errorMessages.length > 0) {
                            errorMsg = errorMessages[0]
                        }
                    } else if (typeof errorObj.details === 'string') {
                        errorMsg = errorObj.details
                    }
                }
                // Fall back to main error message
                else if (errorObj.message) {
                    errorMsg = errorObj.message
                }
            }

            toast({
                title: t('common.error'),
                description: errorMsg,
                variant: 'destructive'
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Show blocked state if user already has active exclusion
    if (currentStep === 'blocked') {
        // Safely parse exclusion dates
        const exclusionStart = activeExclusion?.effective_date 
            ? new Date(activeExclusion.effective_date) 
            : null
        const exclusionEnd = activeExclusion?.expiry_date 
            ? new Date(activeExclusion.expiry_date) 
            : null
        
        const daysRemaining = exclusionEnd && exclusionEnd.getTime() > Date.now()
            ? Math.ceil((exclusionEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : 0

        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
                <DashboardHeader title={t('sidebar.self_exclusion')} subtitle={t('help.contact_us')} />

                <main className="max-w-2xl mx-auto px-6 py-8">
                    <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <XCircle className="h-8 w-8 text-orange-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.cannot_register')}</h1>
                            </div>

                            <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded mb-8">
                             <h3 className="font-bold text-orange-900 mb-2">{t('dashboard.warning_active')}</h3>
                             <p className="text-orange-800 text-sm">
                                  {t('dashboard.warning_excluded')}
                              </p>
                             </div>

                             {activeExclusion && exclusionStart && exclusionEnd && (
                              <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
                                  <h3 className="font-bold text-gray-900 mb-4">{t('dashboard.your_exclusions')}</h3>
                                  <div className="space-y-3">
                                      <div className="flex justify-between items-center">
                                          <span className="text-gray-600">{t('common.status')}</span>
                                          <span className="font-medium text-orange-600">{t('dashboard.active_exclusions')}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                           <span className="text-gray-600">{t('dashboard.start_date')}</span>
                                          <span className="font-medium text-gray-900">
                                              {exclusionStart.toLocaleDateString()}
                                          </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                          <span className="text-gray-600">{t('dashboard.end_date')}</span>
                                          <span className="font-medium text-gray-900">
                                              {exclusionEnd.toLocaleDateString()}
                                          </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                         <span className="text-gray-600">{t('dashboard.days_remaining')}</span>
                                         <span className="font-medium text-gray-900">{Math.max(0, daysRemaining)} days</span>
                                      </div>
                                      {activeExclusion.reason && (
                                         <div className="pt-2 border-t border-gray-200">
                                             <span className="text-gray-600 text-sm block mb-1">{t('dashboard.reason')}</span>
                                             <p className="text-gray-900 text-sm">{activeExclusion.reason}</p>
                                         </div>
                                     )}
                                 </div>
                             </div>
                         )}

                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
                            <h3 className="font-bold text-blue-900 mb-2">What You Can Do</h3>
                            <ul className="text-sm text-blue-800 space-y-2">
                                <li>✓ View your exclusion details in the History page</li>
                                <li>✓ Contact support if you need to terminate early (in exceptional cases)</li>
                                <li>✓ Once your exclusion expires, you can register a new one if needed</li>
                                <li>✓ Get support resources at any time</li>
                            </ul>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                {t('common.back')}
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/history')}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                {t('history.title')}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (currentStep === 'warning') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
                <DashboardHeader title={t('sidebar.self_exclusion')} subtitle={t('self_exclude.step2')} />

                <main className="max-w-2xl mx-auto px-6 py-8">
                    <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Important Warning</h1>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                                <h3 className="font-bold text-red-900 mb-2">What Self-Exclusion Means</h3>
                                <p className="text-red-800 text-sm">
                                    Self-exclusion is a legally binding agreement. Once activated, you will be completely
                                    excluded from all licensed gambling operators during the exclusion period. This cannot
                                    be reversed during the duration you select.
                                </p>
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg">Key Points:</h3>
                            <ul className="space-y-3">
                                {[
                                    'Your account will be blocked from all licensed operators',
                                    'You cannot place any bets or wagers during the exclusion period',
                                    'This cannot be reversed or lifted early except in exceptional circumstances',
                                    'Your exclusion is recorded in the national database',
                                    'You may be reported to other operators you may have accounts with',
                                    'If you attempt to self-exclude again while active, the new period begins after the current one ends'
                                ].map((point, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
                            <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
                            <p className="text-blue-800 text-sm mb-3">
                                If you're struggling with gambling, support is available:
                            </p>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Call our helpline: 1-800-GAMBLING</li>
                                <li>• Visit: www.gamblingtherapy.org</li>
                                <li>• Live chat available 24/7</li>
                            </ul>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setCurrentStep('details')}
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                I Understand, Continue <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (currentStep === 'details') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <DashboardHeader title="Self-Exclusion Details" subtitle="Choose your exclusion period" />

                <main className="max-w-2xl mx-auto px-6 py-8">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Select Exclusion Duration</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {EXCLUSION_DURATIONS.map((duration) => (
                                <button
                                    key={duration.value}
                                    onClick={() => setSelectedDuration(duration.value)}
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${selectedDuration === duration.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <h3 className="font-bold text-gray-900 mb-1">{duration.label}</h3>
                                    <p className="text-sm text-gray-600">{t(duration.descriptionKey)}</p>
                                </button>
                            ))}
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                Reason for Self-Exclusion <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Tell us why you're self-excluding (minimum 10 characters)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={4}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Minimum 10 characters required
                            </p>
                        </div>

                        <div className="mb-8 space-y-4">
                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={termsAcknowledged}
                                    onChange={(e) => setTermsAcknowledged(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">
                                    I acknowledge the terms and conditions of self-exclusion
                                </span>
                            </label>

                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={consequencesUnderstood}
                                    onChange={(e) => setConsequencesUnderstood(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">
                                    I understand that self-exclusion is binding and cannot be reversed during
                                    the selected period. My account will be completely blocked from gambling.
                                </span>
                            </label>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setCurrentStep('warning')}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setCurrentStep('confirmation')}
                                disabled={!selectedDuration || !termsAcknowledged || !consequencesUnderstood || !reason || reason.trim().length < 10}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Review & Confirm
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (currentStep === 'confirmation') {
        const selected = EXCLUSION_DURATIONS.find(d => d.value === selectedDuration)
        const getDaysFromPeriod = (period: string | null): number => {
            switch (period) {
                case '6_months': return 180
                case '1_year': return 365
                case '3_years': return 1095
                case '5_years': return 1825
                case 'permanent': return 99999
                default: return 0
            }
        }
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + getDaysFromPeriod(selectedDuration))

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <DashboardHeader title="Confirm Self-Exclusion" subtitle="Review your details" />

                <main className="max-w-2xl mx-auto px-6 py-8">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="h-6 w-6 text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-900">Review Your Exclusion</h2>
                        </div>

                        <div className="space-y-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Exclusion Duration</p>
                                <p className="text-lg font-bold text-gray-900">{selected?.label}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Start Date</p>
                                    <p className="text-lg font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">End Date</p>
                                    <p className="text-lg font-bold text-gray-900">{endDate.toLocaleDateString()}</p>
                                </div>
                            </div>

                            {reason && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Reason</p>
                                    <p className="text-gray-900">{reason}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-8">
                            <h3 className="font-bold text-red-900 mb-2">⚠️ Final Confirmation</h3>
                            <p className="text-red-800 text-sm">
                                By clicking "Confirm Exclusion" below, you are confirming that you want to activate
                                a self-exclusion for the selected period. This action cannot be undone during the
                                exclusion period.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setCurrentStep('details')}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleStartExclusion}
                                disabled={isLoading}
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm Exclusion'
                                )}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    // Success
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <DashboardHeader title="Exclusion Activated" subtitle="Self-exclusion successful" />

            <main className="max-w-2xl mx-auto px-6 py-8">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-green-100 rounded-full">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Self-Exclusion Activated Successfully
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Your self-exclusion is now active across all licensed gambling operators.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8 text-left">
                        <h3 className="font-bold text-blue-900 mb-4">What Happens Next</h3>
                        <ul className="space-y-3 text-sm text-blue-800">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span>Your account has been disabled immediately</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span>Your details are registered in the national database</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span>All operators will check this database when you attempt to access them</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span>You will receive a confirmation email with your exclusion details</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg mb-8 text-left">
                        <h3 className="font-bold text-amber-900 mb-3">If You Need Support</h3>
                        <p className="text-amber-800 text-sm mb-4">
                            If you're struggling with gambling or need to talk to someone, professional help is available:
                        </p>
                        <ul className="space-y-2 text-sm text-amber-800">
                            <li>📞 <strong>Helpline:</strong> 1-800-GAMBLING (24/7)</li>
                            <li>🌐 <strong>Counseling:</strong> www.gamblingtherapy.org</li>
                            <li>💬 <strong>Live Chat:</strong> Available on this portal</li>
                        </ul>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Return to Dashboard
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/history')}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            View My Exclusions
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
