'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
    Save,
    Play,
    AlertCircle,
    CheckCircle,
    Code,
    Copy,
    Check,
    Search,
    Key,
    BarChart3,
    Webhook,
    Shield,
    Zap,
    RefreshCw,
    Trash2,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    DollarSign,
    TrendingUp,
    AlertTriangle,
} from 'lucide-react'
import api from '@/lib/api'

interface APIKey {
    id: string
    key_name: string
    api_key: string
    api_secret?: string
    can_lookup: boolean
    can_register: boolean
    can_screen: boolean
    is_active: boolean
    created_at: string
}

interface LookupResult {
    phone_number: string
    is_excluded: boolean
    end_date?: string
    reason?: string
    locked?: boolean
    timestamp?: string
}

interface BSTToken {
    id: string
    token: string
    phone_number: string
    operator_id: string
    is_valid: boolean
    is_active: boolean
    created_at: string
}

interface BettingTransaction {
    id: string
    bst_token: string
    operator_id: string
    phone_number: string
    amount: number
    status: 'pending' | 'completed' | 'failed' | 'blocked'
    reason?: string
    timestamp: string
}

interface ExclusionLock {
    id: string
    phone_number: string
    reason: string
    locked_at: string
    expires_at?: string
    status: 'active' | 'expired'
}

export default function DemoIntegrationPage() {
    const t = useTranslations()
    const [activeTab, setActiveTab] = useState<'lookup' | 'betting' | 'bst' | 'locks' | 'api-keys' | 'compliance' | 'metrics'>('lookup')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [copied, setCopied] = useState<string | null>(null)

    // Lookup state
    const [lookupPhoneNumber, setLookupPhoneNumber] = useState('')
    const [lookupResults, setLookupResults] = useState<LookupResult[]>([])
    const [bulkLookupPhones, setBulkLookupPhones] = useState('')
    const [bulkLookupResults, setBulkLookupResults] = useState<LookupResult[]>([])

    // Betting state
    const [bettingPhone, setBettingPhone] = useState('')
    const [bettingAmount, setBettingAmount] = useState('')
    const [bettingTransactions, setBettingTransactions] = useState<BettingTransaction[]>([])
    const [bstToken, setBstToken] = useState('')

    // BST Token state
    const [bstTokens, setBstTokens] = useState<BSTToken[]>([])
    const [generateTokenPhone, setGenerateTokenPhone] = useState('')

    // Locks state
    const [exclusionLocks, setExclusionLocks] = useState<ExclusionLock[]>([])
    const [lockPhone, setLockPhone] = useState('')
    const [lockReason, setLockReason] = useState('Problem Gambling')
    const [lockDays, setLockDays] = useState('30')

    // API Keys state
    const [apiKeys, setApiKeys] = useState<APIKey[]>([])
    const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})

    // Metrics state
    const [operatorStats, setOperatorStats] = useState<any>(null)

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code)
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
    }

    // ==========================================
    // LOOKUP FUNCTIONS
    // ==========================================

    const performLookup = async () => {
        if (!lookupPhoneNumber.trim()) {
            setMessage({ type: 'error', text: t('demo_integration.enter_phone') })
            return
        }

        setLoading(true)
        try {
            const response = await api.post('/nser/lookup/', {
                phone_number: lookupPhoneNumber,
                operator_id: 'demo',
            })

            const result: LookupResult = {
                phone_number: lookupPhoneNumber,
                is_excluded: response.data.is_excluded,
                end_date: response.data.end_date,
                reason: response.data.reason,
                locked: response.data.is_excluded,
                timestamp: new Date().toISOString(),
            }

            setLookupResults([result, ...lookupResults])
             setMessage({ 
                 type: 'success', 
                 text: response.data.is_excluded ? t('demo_integration.user_excluded') : t('demo_integration.user_allowed') 
             })
             setLookupPhoneNumber('')
            } catch (error: any) {
             setMessage({ type: 'error', text: error.response?.data?.detail || t('demo_integration.lookup_failed') })
        } finally {
            setLoading(false)
        }
    }

    const performBulkLookup = async () => {
        if (!bulkLookupPhones.trim()) {
            setMessage({ type: 'error', text: t('demo_integration.enter_phone_numbers') })
            return
        }

        const phones = bulkLookupPhones.split('\n').filter(p => p.trim())
        if (phones.length === 0 || phones.length > 100) {
            setMessage({ type: 'error', text: t('demo_integration.enter_1_to_100') })
            return
        }

        setLoading(true)
        try {
            const response = await api.post('/nser/lookup/bulk/', {
                phone_numbers: phones,
                operator_id: 'demo',
            })

            const results: LookupResult[] = response.data.results.map((item: any) => ({
                phone_number: item.phone_number,
                is_excluded: item.is_excluded,
                end_date: item.end_date,
                reason: item.reason,
                locked: item.is_excluded,
                timestamp: new Date().toISOString(),
            }))

            setBulkLookupResults(results)
            const excludedCount = results.filter(r => r.is_excluded).length
            const allowedCount = results.length - excludedCount
            setMessage({ 
                type: 'success', 
                text: `${excludedCount} ${t('demo_integration.excluded')}, ${allowedCount} ${t('demo_integration.allowed')}` 
            })
            setBulkLookupPhones('')
            } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.detail || t('demo_integration.bulk_lookup_failed') })
        } finally {
            setLoading(false)
        }
    }

    // ==========================================
    // BETTING TRANSACTION FUNCTIONS
    // ==========================================

    const recordBettingTransaction = async () => {
        if (!bettingPhone.trim() || !bettingAmount || !bstToken) {
            setMessage({ type: 'error', text: t('demo_integration.fill_all_fields') })
            return
        }

        // First verify user is not excluded
        setLoading(true)
        try {
            const lookupResponse = await api.post('/nser/lookup/', {
                phone_number: bettingPhone,
                operator_id: 'demo',
            })

            if (lookupResponse.data.is_excluded) {
                setMessage({ type: 'error', text: t('demo_integration.user_excluded_betting') })
                setLoading(false)
                return
            }

            // Validate BST token
            const tokenResponse = await api.post('/bst/validate/', {
                token: bstToken,
            })

            if (!tokenResponse.data.is_valid) {
                setMessage({ type: 'error', text: t('demo_integration.token_invalid') })
                setLoading(false)
                return
            }

            // Record the betting activity
            const activityResponse = await api.post('/bst/mappings/activity/', {
                bst_token: bstToken,
                operator_id: 'demo',
                phone_number: bettingPhone,
                amount: parseFloat(bettingAmount),
                activity_type: 'bet',
            })

            const transaction: BettingTransaction = {
                id: activityResponse.data.id || Math.random().toString(),
                bst_token: bstToken,
                operator_id: 'demo',
                phone_number: bettingPhone,
                amount: parseFloat(bettingAmount),
                status: 'completed',
                timestamp: new Date().toISOString(),
            }

            setBettingTransactions([transaction, ...bettingTransactions])
            setMessage({ type: 'success', text: t('demo_integration.bet_recorded') })
            setBettingPhone('')
            setBettingAmount('')
            setBstToken('')
            } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.detail || t('demo_integration.betting_transaction_failed') })
        } finally {
            setLoading(false)
        }
    }

    // ==========================================
    // BST TOKEN FUNCTIONS
    // ==========================================

    const generateBSTToken = async () => {
        if (!generateTokenPhone.trim()) {
            setMessage({ type: 'error', text: t('demo_integration.enter_phone') })
            return
        }

        setLoading(true)
        try {
            const response = await api.post('/bst/generate/', {
                phone_number: generateTokenPhone,
                operator_id: 'demo',
            })

            const token: BSTToken = {
                id: response.data.id,
                token: response.data.token,
                phone_number: generateTokenPhone,
                operator_id: 'demo',
                is_valid: true,
                is_active: true,
                created_at: new Date().toISOString(),
            }

            setBstTokens([token, ...bstTokens])
            setBstToken(response.data.token)
            setMessage({ type: 'success', text: t('demo_integration.token_generated') })
            setGenerateTokenPhone('')
            } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.detail || t('demo_integration.token_validation_failed') })
        } finally {
            setLoading(false)
        }
    }

    const validateBSTToken = async (token: string) => {
        setLoading(true)
        try {
            const response = await api.post('/bst/validate/', {
                token: token,
            })

            setMessage({
                type: response.data.is_valid ? 'success' : 'error',
                text: response.data.is_valid ? t('demo_integration.token_valid') : t('demo_integration.token_invalid'),
            })
            } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.detail || t('demo_integration.token_validation_failed') })
        } finally {
            setLoading(false)
        }
    }

    // ==========================================
    // EXCLUSION LOCK FUNCTIONS
    // ==========================================

    const createExclusionLock = async () => {
        if (!lockPhone.trim() || !lockReason) {
            setMessage({ type: 'error', text: t('demo_integration.fill_all_fields') })
            return
        }

        setLoading(true)
        try {
            const response = await api.post('/nser/register/', {
                phone_number: lockPhone,
                reason: lockReason,
                exclusion_period_days: parseInt(lockDays),
            })

            const lock: ExclusionLock = {
                id: response.data.id,
                phone_number: lockPhone,
                reason: lockReason,
                locked_at: new Date().toISOString(),
                expires_at: response.data.end_date,
                status: 'active',
            }

            setExclusionLocks([lock, ...exclusionLocks])
            setMessage({ type: 'success', text: `${t('demo_integration.lock_created')} ${lockDays} ${t('demo_integration.days')}` })
            setLockPhone('')
            setLockReason('Problem Gambling')
            setLockDays('30')
            } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.detail || t('demo_integration.failed_to_load_keys') })
        } finally {
            setLoading(false)
        }
    }

    const removeLock = async (phone: string) => {
        if (!confirm(`${t('demo_integration.remove_lock_confirm')} ${phone}?`)) return

        setLoading(true)
        try {
            await api.post('/nser/exclusions/terminate/', {
                phone_number: phone,
            })

            setExclusionLocks(exclusionLocks.filter(l => l.phone_number !== phone))
            setMessage({ type: 'success', text: t('demo_integration.lock_removed') })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.detail || t('demo_integration.failed_to_remove_lock') })
        } finally {
            setLoading(false)
        }
    }

    // ==========================================
    // API KEYS FUNCTIONS
    // ==========================================

    const fetchApiKeys = async () => {
        setLoading(true)
        try {
            const response = await api.get('/operators/my-api-keys/')
            setApiKeys(response.data.data || response.data)
            setMessage({ type: 'success', text: t('demo_integration.keys_loaded') })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.detail || t('demo_integration.failed_to_load_keys') })
        } finally {
            setLoading(false)
        }
    }

    // ==========================================
    // METRICS FUNCTIONS
    // ==========================================

    const fetchMetrics = async () => {
        setLoading(true)
        try {
            // Fetch metrics from the correct backend endpoints
            // Using actual endpoints: /api/v1/operators/<id>/metrics/, /api/v1/analytics/dashboard/operator/
            const [operatorMetricsRes, analyticsRes, exclusionStatsRes] = await Promise.all([
                // Operator metrics endpoint
                api.get('/operators/me/metrics/').catch(() => ({ data: {} })),
                // Analytics dashboard for operator
                api.get('/analytics/dashboard/operator/').catch(() => ({ data: {} })),
                // NSER statistics
                api.get('/nser/statistics/').catch(() => ({ data: {} })),
            ])

            // Combine data from all sources with proper fallbacks
            const aggregatedStats = {
                // User and transaction metrics
                total_users: 
                    operatorMetricsRes.data.total_users || 
                    analyticsRes.data.total_active_users || 
                    0,
                
                total_screenings: 
                    operatorMetricsRes.data.total_screenings || 
                    operatorMetricsRes.data.total_lookups ||
                    analyticsRes.data.total_screenings ||
                    exclusionStatsRes.data.total_lookups ||
                    0,
                
                total_exclusions: 
                    operatorMetricsRes.data.total_exclusions ||
                    analyticsRes.data.active_exclusions ||
                    exclusionStatsRes.data.total_active_exclusions ||
                    0,
                
                total_bets: 
                    operatorMetricsRes.data.total_bets ||
                    operatorMetricsRes.data.total_transactions ||
                    analyticsRes.data.total_transactions ||
                    0,
                
                total_amount_bet: 
                    operatorMetricsRes.data.total_amount_wagered ||
                    operatorMetricsRes.data.total_amount_bet ||
                    analyticsRes.data.total_wagered ||
                    0,
                
                // Performance metrics (in milliseconds)
                avg_response_time: 
                    operatorMetricsRes.data.avg_response_time ||
                    operatorMetricsRes.data.average_response_time_ms ||
                    analyticsRes.data.avg_response_time ||
                    0,
                
                p50_response_time: 
                    operatorMetricsRes.data.p50_response_time ||
                    operatorMetricsRes.data.median_response_time_ms ||
                    analyticsRes.data.p50_response_time ||
                    0,
                
                p99_response_time: 
                    operatorMetricsRes.data.p99_response_time ||
                    operatorMetricsRes.data.p99_response_time_ms ||
                    analyticsRes.data.p99_response_time ||
                    0,
                
                // Success rates and availability (as percentages)
                success_rate: 
                    operatorMetricsRes.data.success_rate ||
                    operatorMetricsRes.data.lookup_success_rate ||
                    analyticsRes.data.success_rate ||
                    0,
                
                uptime: 
                    operatorMetricsRes.data.uptime_percentage ||
                    operatorMetricsRes.data.availability ||
                    analyticsRes.data.uptime ||
                    0,
                
                // Additional metrics
                api_requests_today: 
                    operatorMetricsRes.data.api_requests_today ||
                    operatorMetricsRes.data.requests_24h ||
                    analyticsRes.data.requests_24h ||
                    0,
                
                webhook_deliveries: 
                    operatorMetricsRes.data.webhook_deliveries ||
                    analyticsRes.data.webhook_deliveries ||
                    0,
                
                compliance_score: 
                    operatorMetricsRes.data.compliance_score ||
                    operatorMetricsRes.data.operational_compliance ||
                    analyticsRes.data.compliance_score ||
                    0,
                
                // Timestamp for tracking
                last_updated: new Date().toISOString(),
            }

            setOperatorStats(aggregatedStats)
            setMessage({ type: 'success', text: t('demo_integration.metrics_loaded') })
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || error.message || t('demo_integration.failed_to_load_metrics')
            setMessage({ type: 'error', text: errorMsg })
            setOperatorStats(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Demo Warning Banner */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-yellow-900">🧪 {t('demo_integration.demo_mode')}</h3>
                        <p className="text-sm text-yellow-800 mt-1">{t('demo_integration.demo_warning')}</p>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('demo_integration.title')}</h1>
                <p className="text-gray-600 mt-1">{t('demo_integration.subtitle')}</p>
            </div>

            {/* Messages */}
            {message && (
                <div
                    className={`p-4 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>{message.text}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto flex-wrap">
                {[
                    { id: 'lookup', label: t('demo_integration.lookup_tab'), icon: Search },
                    { id: 'betting', label: t('demo_integration.betting_tab'), icon: DollarSign },
                    { id: 'bst', label: t('demo_integration.bst_tab'), icon: Zap },
                    { id: 'locks', label: t('demo_integration.locks_tab'), icon: Lock },
                    { id: 'api-keys', label: t('demo_integration.api_keys_tab'), icon: Key },
                    { id: 'compliance', label: t('demo_integration.compliance_tab'), icon: Shield },
                    { id: 'metrics', label: t('demo_integration.metrics_tab'), icon: BarChart3 },
                ].map(tab => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* LOOKUP TAB */}
            {activeTab === 'lookup' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Single User Lookup
                        </h2>
                        <div className="flex gap-2">
                            <input
                                type="tel"
                                placeholder="+254712345678"
                                value={lookupPhoneNumber}
                                onChange={e => setLookupPhoneNumber(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && performLookup()}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={performLookup}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>

                        {lookupResults.length > 0 && (
                            <div className="mt-6 space-y-2">
                                {lookupResults.map((r, i) => (
                                    <div
                                        key={i}
                                        className={`p-4 rounded-lg border-l-4 ${r.is_excluded
                                            ? 'bg-red-50 border-red-500'
                                            : 'bg-green-50 border-green-500'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-mono text-sm text-gray-900">{r.phone_number}</p>
                                                <p className={`text-sm font-semibold mt-1 ${r.is_excluded ? 'text-red-700' : 'text-green-700'
                                                    }`}>
                                                    {r.is_excluded ? '🚫 EXCLUDED' : '✅ ALLOWED'}
                                                </p>
                                                {r.is_excluded && r.end_date && (
                                                    <p className="text-xs text-gray-600 mt-1">Locked until: {r.end_date}</p>
                                                )}
                                            </div>
                                            {r.locked && <Lock className="h-5 w-5 text-red-600" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bulk Lookup</h2>
                        <textarea
                            placeholder="+254712345678&#10;+254712345679"
                            value={bulkLookupPhones}
                            onChange={e => setBulkLookupPhones(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                        <button
                            onClick={performBulkLookup}
                            disabled={loading}
                            className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            Bulk Lookup
                        </button>

                        {bulkLookupResults.length > 0 && (
                            <div className="mt-6 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-3 font-semibold">Phone</th>
                                            <th className="text-center py-2 px-3 font-semibold">Status</th>
                                            <th className="text-center py-2 px-3 font-semibold">Locked</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bulkLookupResults.map((r, i) => (
                                            <tr key={i} className="border-b">
                                                <td className="py-2 px-3 font-mono text-xs">{r.phone_number}</td>
                                                <td className="text-center py-2 px-3">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-semibold ${r.is_excluded ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                                                            }`}
                                                    >
                                                        {r.is_excluded ? 'EXCLUDED' : 'ALLOWED'}
                                                    </span>
                                                </td>
                                                <td className="text-center py-2 px-3">
                                                    {r.locked ? <Lock className="h-4 w-4 text-red-600 mx-auto" /> : <Unlock className="h-4 w-4 text-green-600 mx-auto" />}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* BETTING TAB */}
            {activeTab === 'betting' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-orange-600" />
                            Record Betting Transaction
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="+254712345678"
                                    value={bettingPhone}
                                    onChange={e => setBettingPhone(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bet Amount (KES)</label>
                                <input
                                    type="number"
                                    placeholder="100"
                                    value={bettingAmount}
                                    onChange={e => setBettingAmount(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">BST Token</label>
                                <input
                                    type="text"
                                    placeholder="Paste BST token here"
                                    value={bstToken}
                                    onChange={e => setBstToken(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                                />
                            </div>

                            <button
                                onClick={recordBettingTransaction}
                                disabled={loading}
                                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                            >
                                <DollarSign className="inline h-4 w-4 mr-2" />
                                Record Bet
                            </button>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                                <p className="text-blue-900">
                                    <strong>Note:</strong> System will check if user is excluded before recording bet. If excluded, bet will be blocked.
                                </p>
                            </div>
                        </div>
                    </div>

                    {bettingTransactions.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Betting Transactions</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-3 font-semibold">Phone</th>
                                            <th className="text-right py-2 px-3 font-semibold">Amount</th>
                                            <th className="text-center py-2 px-3 font-semibold">Status</th>
                                            <th className="text-left py-2 px-3 font-semibold">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bettingTransactions.map((t, i) => (
                                            <tr key={i} className="border-b">
                                                <td className="py-2 px-3 font-mono text-xs">{t.phone_number}</td>
                                                <td className="text-right py-2 px-3 font-semibold">KES {t.amount}</td>
                                                <td className="text-center py-2 px-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${t.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {t.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 text-gray-600 text-xs">{new Date(t.timestamp).toLocaleTimeString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>Total Bets:</strong> {bettingTransactions.length} | <strong>Total Amount:</strong> KES{' '}
                                    {bettingTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* BST TOKENS TAB */}
            {activeTab === 'bst' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-purple-600" />
                            Generate BST Token
                        </h2>
                        <div className="space-y-4">
                            <input
                                type="tel"
                                placeholder="+254712345678"
                                value={generateTokenPhone}
                                onChange={e => setGenerateTokenPhone(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                                onClick={generateBSTToken}
                                disabled={loading}
                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                <Zap className="inline h-4 w-4 mr-2" />
                                Generate Token
                            </button>
                        </div>
                    </div>

                    {bstTokens.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active BST Tokens</h2>
                            <div className="space-y-3">
                                {bstTokens.map(token => (
                                    <div key={token.id} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-semibold text-gray-900">{token.phone_number}</p>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${token.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {token.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded mb-3 flex items-center gap-2">
                                            <code className="text-sm flex-1 font-mono break-all">{token.token}</code>
                                            <button
                                                onClick={() => copyCode(token.token, token.id)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                {copied === token.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => validateBSTToken(token.token)}
                                            disabled={loading}
                                            className="w-full px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                                        >
                                            Validate Token
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* EXCLUSION LOCKS TAB */}
            {activeTab === 'locks' && (
                <div className="space-y-6">
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Lock className="h-5 w-5 text-red-600" />
                            Create Exclusion Lock
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="+254712345678"
                                    value={lockPhone}
                                    onChange={e => setLockPhone(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lock Reason</label>
                                <select
                                    value={lockReason}
                                    onChange={e => setLockReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option>Problem Gambling</option>
                                    <option>Self-Excluded</option>
                                    <option>Court Order</option>
                                    <option>Regulatory Requirement</option>
                                    <option>Fraud Suspected</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lock Duration (Days)</label>
                                <input
                                    type="number"
                                    value={lockDays}
                                    onChange={e => setLockDays(e.target.value)}
                                    min="1"
                                    max="3650"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <button
                                onClick={createExclusionLock}
                                disabled={loading}
                                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                <Lock className="inline h-4 w-4 mr-2" />
                                Lock User
                            </button>
                        </div>
                    </div>

                    {exclusionLocks.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Exclusion Locks</h2>
                            <div className="space-y-3">
                                {exclusionLocks.map(lock => (
                                    <div key={lock.id} className="p-4 border-l-4 border-red-500 bg-red-50 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-mono text-sm font-semibold text-gray-900">{lock.phone_number}</p>
                                                <p className="text-sm text-gray-600 mt-1">{lock.reason}</p>
                                                {lock.expires_at && (
                                                    <p className="text-xs text-gray-600 mt-1">Locked until: {lock.expires_at}</p>
                                                )}
                                            </div>
                                            <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-semibold">
                                                {lock.status.toUpperCase()}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => removeLock(lock.phone_number)}
                                            disabled={loading}
                                            className="w-full mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                        >
                                            <Unlock className="inline h-3 w-3 mr-1" />
                                            Remove Lock
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-900">
                                    <AlertTriangle className="inline h-4 w-4 mr-2" />
                                    <strong>Total Locks:</strong> {exclusionLocks.length} users are currently blocked from gambling
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* API KEYS TAB */}
            {activeTab === 'api-keys' && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            API Keys
                        </h2>
                        <button onClick={fetchApiKeys} disabled={loading} className="px-3 py-1 bg-gray-100 rounded">
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>

                    {apiKeys.length === 0 ? (
                        <p className="text-gray-600">No API keys generated yet</p>
                    ) : (
                        <div className="space-y-3">
                            {apiKeys.map(key => (
                                <div key={key.id} className="p-4 border border-gray-200 rounded-lg">
                                    <p className="font-semibold text-gray-900">{key.key_name}</p>
                                    <p className="text-xs text-gray-600">{key.created_at}</p>
                                    <div className="bg-gray-50 p-2 rounded mt-2 flex items-center gap-2">
                                        <code className="text-xs flex-1 font-mono">{showSecrets[key.id] ? key.api_key : '••••••••'}</code>
                                        <button
                                            onClick={() => setShowSecrets({ ...showSecrets, [key.id]: !showSecrets[key.id] })}
                                            className="p-1"
                                        >
                                            {showSecrets[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* COMPLIANCE TAB */}
            {activeTab === 'compliance' && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Compliance Status
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="text-2xl font-bold text-green-600">✅ Active</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-600">Score</p>
                            <p className="text-2xl font-bold text-blue-600">95%</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-sm text-gray-600">License</p>
                            <p className="text-2xl font-bold text-purple-600">Valid</p>
                        </div>
                    </div>
                </div>
            )}

            {/* METRICS TAB */}
            {activeTab === 'metrics' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                {t('demo_integration.metrics_section')}
                            </h2>
                            <button
                                onClick={fetchMetrics}
                                disabled={loading}
                                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>

                        {operatorStats ? (
                            <>
                                {/* Primary Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-600 mb-1">Total Users</p>
                                        <p className="text-3xl font-bold text-blue-600">{Number(operatorStats.total_users || 0).toLocaleString()}</p>
                                        <p className="text-xs text-gray-500 mt-2">Active registered users</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                        <p className="text-sm text-gray-600 mb-1">Total Lookups</p>
                                        <p className="text-3xl font-bold text-green-600">{Number(operatorStats.total_screenings || 0).toLocaleString()}</p>
                                        <p className="text-xs text-gray-500 mt-2">Exclusion checks performed</p>
                                    </div>
                                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                        <p className="text-sm text-gray-600 mb-1">Exclusions Found</p>
                                        <p className="text-3xl font-bold text-red-600">{Number(operatorStats.total_exclusions || 0).toLocaleString()}</p>
                                        <p className="text-xs text-gray-500 mt-2">Users blocked from gambling</p>
                                    </div>
                                </div>

                                {/* Betting Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <p className="text-sm text-gray-600 mb-1">Total Bets Processed</p>
                                        <p className="text-3xl font-bold text-purple-600">{Number(operatorStats.total_bets || 0).toLocaleString()}</p>
                                        <p className="text-xs text-gray-500 mt-2">Total betting transactions</p>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                        <p className="text-sm text-gray-600 mb-1">Total Amount Wagered</p>
                                        <p className="text-3xl font-bold text-orange-600">KES {Number(operatorStats.total_amount_bet || 0).toLocaleString()}</p>
                                        <p className="text-xs text-gray-500 mt-2">Total value of all bets</p>
                                    </div>
                                </div>

                                {/* API Performance Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
                                        <p className="text-2xl font-bold text-indigo-600">{Number(operatorStats.avg_response_time || 0).toFixed(2)}ms</p>
                                        <p className="text-xs text-gray-500 mt-2">Target: &lt;100ms</p>
                                    </div>
                                    <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                                        <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                                        <p className="text-2xl font-bold text-cyan-600">{Number(operatorStats.success_rate || 0).toFixed(2)}%</p>
                                        <p className="text-xs text-gray-500 mt-2">API success rate</p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <p className="text-sm text-gray-600 mb-1">System Uptime</p>
                                        <p className="text-2xl font-bold text-emerald-600">{Number(operatorStats.uptime || 0).toFixed(2)}%</p>
                                        <p className="text-xs text-gray-500 mt-2">Overall availability</p>
                                    </div>
                                </div>

                                {/* Additional Performance Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                                        <p className="text-sm text-gray-600 mb-1">P50 Response Time</p>
                                        <p className="text-2xl font-bold text-pink-600">{Number(operatorStats.p50_response_time || 0).toFixed(2)}ms</p>
                                        <p className="text-xs text-gray-500 mt-2">Median response time</p>
                                    </div>
                                    <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
                                        <p className="text-sm text-gray-600 mb-1">P99 Response Time</p>
                                        <p className="text-2xl font-bold text-rose-600">{Number(operatorStats.p99_response_time || 0).toFixed(2)}ms</p>
                                        <p className="text-xs text-gray-500 mt-2">99th percentile</p>
                                    </div>
                                    <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                                        <p className="text-sm text-gray-600 mb-1">API Requests (24h)</p>
                                        <p className="text-2xl font-bold text-teal-600">{Number(operatorStats.api_requests_today || 0).toLocaleString()}</p>
                                        <p className="text-xs text-gray-500 mt-2">Requests in last 24 hours</p>
                                    </div>
                                </div>

                                {/* Additional Stats */}
                                {(operatorStats.webhook_deliveries !== undefined || operatorStats.compliance_score !== undefined) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        {operatorStats.webhook_deliveries !== undefined && (
                                            <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
                                                <p className="text-sm text-gray-600 mb-1">Webhook Deliveries</p>
                                                <p className="text-2xl font-bold text-violet-600">{Number(operatorStats.webhook_deliveries || 0).toLocaleString()}</p>
                                                <p className="text-xs text-gray-500 mt-2">Total webhook events sent</p>
                                            </div>
                                        )}
                                        {operatorStats.compliance_score !== undefined && (
                                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                                <p className="text-sm text-gray-600 mb-1">Compliance Score</p>
                                                <p className="text-2xl font-bold text-amber-600">{Number(operatorStats.compliance_score || 0).toFixed(2)}%</p>
                                                <p className="text-xs text-gray-500 mt-2">Operational compliance rating</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Last Updated */}
                                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs text-gray-600">
                                    Last updated: {new Date(operatorStats.last_updated).toLocaleString()}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 mb-3">No metrics data available. Click refresh to load.</p>
                                <button
                                    onClick={fetchMetrics}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Load Metrics
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
