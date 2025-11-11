'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, CheckCircle, AlertCircle, Loader2, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader'

interface ExclusionDuration {
    label: string
    days: number
    description: string
}

interface ExclusionOption {
    label: string
    value: string
    description: string
}

const EXCLUSION_DURATIONS: ExclusionOption[] = [
    { label: '6 Months', value: '6_months', description: 'Longer-term exclusion' },
    { label: '1 Year', value: '1_year', description: 'Full year exclusion' },
    { label: '3 Years', value: '3_years', description: 'Extended 3-year exclusion' },
    { label: '5 Years', value: '5_years', description: 'Long-term 5-year exclusion' },
    { label: 'Permanent', value: 'permanent', description: 'Permanent self-exclusion' }
]

type Step = 'warning' | 'details' | 'confirmation' | 'success'

export default function SelfExcludePage() {
    const router = useRouter()
    const { toast } = useToast()
    const [currentStep, setCurrentStep] = useState<Step>('warning')
    const [isLoading, setIsLoading] = useState(false)
    const [selectedDuration, setSelectedDuration] = useState<string | null>(null)
    const [reason, setReason] = useState('')
    const [termsAcknowledged, setTermsAcknowledged] = useState(false)
    const [consequencesUnderstood, setConsequencesUnderstood] = useState(false)
    const [exclusionId, setExclusionId] = useState<string>('')

    const handleStartExclusion = async () => {
        if (!selectedDuration) {
            toast({
                title: 'Error',
                description: 'Please select an exclusion duration',
                variant: 'destructive'
            })
            return
        }

        if (!reason || reason.trim().length < 10) {
            toast({
                title: 'Error',
                description: 'Please provide a reason for self-exclusion (at least 10 characters)',
                variant: 'destructive'
            })
            return
        }

        if (!termsAcknowledged || !consequencesUnderstood) {
            toast({
                title: 'Error',
                description: 'Please acknowledge both terms and consequences',
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
                    title: 'Success',
                    description: 'Self-exclusion has been registered successfully',
                    variant: 'default'
                })
            }
        } catch (error: any) {
            let errorMsg = 'Failed to register exclusion'

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
                title: 'Error',
                description: errorMsg,
                variant: 'destructive'
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (currentStep === 'warning') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
                <DashboardHeader title="Self-Exclusion" subtitle="Important notice" />

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
                                    <p className="text-sm text-gray-600">{duration.description}</p>
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
