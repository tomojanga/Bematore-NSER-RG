import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import {
    SelfExclusion,
    OperatorExclusionMapping,
    ExclusionAuditLog,
    ApiResponse,
    SingleApiResponse,
    PaginatedParams,
    ExclusionFormData
} from '@/types'

// Simple toast replacement until we add react-hot-toast
const toast = {
    success: (message: string) => console.log('✅', message),
    error: (message: string) => console.error('❌', message),
    warning: (message: string) => console.warn('⚠️', message),
}

export function useExclusions(params?: PaginatedParams) {
    const queryClient = useQueryClient()

    const { data, isLoading, error } = useQuery({
        queryKey: ['exclusions', params],
        queryFn: async () => {
            const { data } = await api.nser.exclusions(params)
            return data as ApiResponse<SelfExclusion>
        },
        staleTime: 30000, // 30 seconds
    })

    const createExclusionMutation = useMutation({
        mutationFn: async (exclusionData: ExclusionFormData) => {
            console.log('Sending exclusion data:', exclusionData)
            const result = await api.nser.register(exclusionData)
            return result.data as SingleApiResponse<SelfExclusion>
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['exclusions'] })
            queryClient.invalidateQueries({ queryKey: ['exclusion-statistics'] })
            queryClient.invalidateQueries({ queryKey: ['my-exclusions'] })
            queryClient.invalidateQueries({ queryKey: ['my-active-exclusion'] })
            toast.success(response.message || 'Self-exclusion registered successfully')
        },
        onError: (error: any) => {
            console.error('Exclusion error:', error.response?.data)
            const message = error.response?.data?.message || error.response?.data?.reason?.[0] || 'Failed to register exclusion'
            toast.error(message)
        }
    })

    const validateExclusionMutation = useMutation({
        mutationFn: async (data: ExclusionFormData) => {
            const result = await api.nser.validate(data)
            return result.data
        },
        onSuccess: (response) => {
            toast.success(response.message || 'Exclusion data validated')
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Validation failed'
            toast.error(message)
        }
    })

    const activateExclusionMutation = useMutation({
        mutationFn: async (id: string) => {
            const result = await api.nser.activate(id)
            return result.data
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['exclusions'] })
            toast.success(response.message || 'Exclusion activated successfully')
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to activate exclusion'
            toast.error(message)
        }
    })

    const renewExclusionMutation = useMutation({
        mutationFn: async (data: { id: string; renewal_data?: any }) => {
            const result = await api.nser.renew(data.id, data.renewal_data)
            return result.data
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['exclusions'] })
            toast.success(response.message || 'Exclusion renewed successfully')
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to renew exclusion'
            toast.error(message)
        }
    })

    const terminateExclusionMutation = useMutation({
        mutationFn: async (data: {
            id: string
            reason: string
            approved_by?: string
        }) => {
            const { id, ...terminationData } = data
            const result = await api.nser.terminate(id, terminationData)
            return result.data
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['exclusions'] })
            toast.success(response.message || 'Exclusion terminated successfully')
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to terminate exclusion'
            toast.error(message)
        }
    })

    const extendExclusionMutation = useMutation({
        mutationFn: async (data: {
            id: string
            new_period: string
            reason: string
        }) => {
            const { id, ...extensionData } = data
            const result = await api.nser.extend(id, extensionData)
            return result.data
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['exclusions'] })
            toast.success(response.message || 'Exclusion extended successfully')
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to extend exclusion'
            toast.error(message)
        }
    })

    const propagateExclusionMutation = useMutation({
        mutationFn: async (id: string) => {
            const result = await api.nser.propagate(id)
            return result.data
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['exclusions'] })
            toast.success(response.message || 'Exclusion propagated to operators')
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to propagate exclusion'
            toast.error(message)
        }
    })

    return {
        // Data
        exclusions: data?.results || [],
        total: data?.count || 0,
        hasNextPage: !!data?.next,
        hasPreviousPage: !!data?.previous,

        // Loading states
        isLoading,
        error,

        // Mutations
        createExclusion: createExclusionMutation.mutate,
        validateExclusion: validateExclusionMutation.mutate,
        activateExclusion: activateExclusionMutation.mutate,
        renewExclusion: renewExclusionMutation.mutate,
        terminateExclusion: terminateExclusionMutation.mutate,
        extendExclusion: extendExclusionMutation.mutate,
        propagateExclusion: propagateExclusionMutation.mutate,

        // Loading states for mutations
        isCreating: createExclusionMutation.isPending,
        isValidating: validateExclusionMutation.isPending,
        isActivating: activateExclusionMutation.isPending,
        isRenewing: renewExclusionMutation.isPending,
        isTerminating: terminateExclusionMutation.isPending,
        isExtending: extendExclusionMutation.isPending,
        isPropagating: propagateExclusionMutation.isPending,
    }
}

// Hook for individual exclusion
export function useExclusion(id: string) {
    return useQuery({
        queryKey: ['exclusion', id],
        queryFn: async () => {
            const { data } = await api.get(`/nser/exclusions/${id}/`)
            return data as SingleApiResponse<SelfExclusion>
        },
        enabled: !!id,
        staleTime: 60000, // 1 minute
    })
}

// Hook for exclusion lookup (operators use this)
export function useExclusionLookup() {
    return useMutation({
        mutationFn: async (data: {
            phone_number?: string
            national_id?: string
            bst_token?: string
            email?: string
        }) => {
            const result = await api.nser.lookup(data)
            return result.data
        },
        onSuccess: (response) => {
            const isExcluded = response.data?.is_excluded || false
            if (isExcluded) {
                toast.warning('⚠️ User is currently excluded from gambling')
            } else {
                toast.success('✅ User is not excluded')
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Lookup failed'
            toast.error(message)
        }
    })
}

// Hook for bulk exclusion lookup
export function useBulkExclusionLookup() {
    return useMutation({
        mutationFn: async (data: {
            users: Array<{
                phone_number?: string
                national_id?: string
                email?: string
            }>
        }) => {
            const result = await api.nser.bulkLookup(data)
            return result.data
        },
        onSuccess: (response) => {
            const results = response.data?.results || []
            const excludedCount = results.filter((r: any) => r.is_excluded).length

            if (excludedCount > 0) {
                toast.warning(`⚠️ ${excludedCount} out of ${results.length} users are excluded`)
            } else {
                toast.success(`✅ All ${results.length} users are not excluded`)
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Bulk lookup failed'
            toast.error(message)
        }
    })
}

// Hook for BST-based exclusion lookup
export function useBSTExclusionLookup() {
    return useMutation({
        mutationFn: async (token: string) => {
            const result = await api.nser.bstLookup(token)
            return result.data
        },
        onSuccess: (response) => {
            const isExcluded = response.data?.is_excluded || false
            if (isExcluded) {
                toast.warning('⚠️ BST token is associated with excluded user')
            } else {
                toast.success('✅ BST token is not associated with excluded user')
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'BST lookup failed'
            toast.error(message)
        }
    })
}

// Hook for propagation status
export function usePropagationStatus(exclusionId: string) {
    return useQuery({
        queryKey: ['propagation-status', exclusionId],
        queryFn: async () => {
            const { data } = await api.nser.propagationStatus(exclusionId)
            return data
        },
        enabled: !!exclusionId,
        refetchInterval: 5000, // Check every 5 seconds during propagation
        staleTime: 2000,
    })
}

// Hook for user's exclusions
export function useMyExclusions() {
    return useQuery({
        queryKey: ['my-exclusions'],
        queryFn: async () => {
            const { data } = await api.nser.myExclusions()
            return data as ApiResponse<SelfExclusion>
        },
        staleTime: 30000,
    })
}

// Hook for user's active exclusion
export function useMyActiveExclusion() {
    return useQuery({
        queryKey: ['my-active-exclusion'],
        queryFn: async () => {
            const { data } = await api.nser.myActive()
            // Backend returns: { success, data: { has_active_exclusion, exclusion? } }
            // Transform to: { success, data: SelfExclusion | null }
            return {
                success: data.success,
                data: data.data?.exclusion || null,
                message: data.message
            } as SingleApiResponse<SelfExclusion>
        },
        staleTime: 30000,
    })
}

// Hook for checking user's exclusion status
export function useExclusionStatus() {
    return useQuery({
        queryKey: ['exclusion-status'],
        queryFn: async () => {
            const { data } = await api.nser.checkStatus()
            return data
        },
        staleTime: 60000, // 1 minute
        refetchOnWindowFocus: true,
    })
}

// Hook for exclusion statistics
export function useExclusionStatistics() {
    return useQuery({
        queryKey: ['exclusion-statistics'],
        queryFn: async () => {
            const { data } = await api.nser.statistics()
            return data
        },
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 15000,
    })
}

// Hook for operator exclusion mappings
export function useOperatorExclusionMappings(params?: PaginatedParams) {
    return useQuery({
        queryKey: ['operator-exclusion-mappings', params],
        queryFn: async () => {
            const { data } = await api.get('/nser/operator-mappings/', { params })
            return data as ApiResponse<OperatorExclusionMapping>
        },
        staleTime: 30000,
    })
}

// Hook for exclusion audit logs
export function useExclusionAuditLogs(exclusionId?: string, params?: PaginatedParams) {
    const queryParams = exclusionId ? { ...params, exclusion: exclusionId } : params

    return useQuery({
        queryKey: ['exclusion-audit-logs', exclusionId, params],
        queryFn: async () => {
            const { data } = await api.get('/nser/audit-logs/', { params: queryParams })
            return data as ApiResponse<ExclusionAuditLog>
        },
        staleTime: 30000,
    })
}

// Hook for checking if user can self-exclude
export function useCanSelfExclude() {
    const { data: activeExclusionResponse } = useMyActiveExclusion()

    // activeExclusionResponse.data is the actual exclusion object or null
    const hasActiveExclusion = activeExclusionResponse?.success === true && activeExclusionResponse?.data !== null
    const canExclude = !hasActiveExclusion
    const reason = hasActiveExclusion ? 'Already excluded' : ''

    return {
        canSelfExclude: canExclude,
        reason,
        activeExclusion: activeExclusionResponse?.data || null,
        status: null,
    }
}

// Hook for exclusion extension requests
export function useExclusionExtensions(params?: PaginatedParams) {
    return useQuery({
        queryKey: ['exclusion-extensions', params],
        queryFn: async () => {
            const { data } = await api.get('/nser/extension-requests/', { params })
            return data
        },
        staleTime: 30000,
    })
}

// Hook for extending exclusion period
export function useExtendExclusion() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: {
            id: string
            new_period: string
            reason?: string
        }) => {
            const { id, ...extensionData } = data
            const result = await api.post(`/nser/${id}/extend/`, extensionData)
            return result.data as SingleApiResponse<SelfExclusion>
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['exclusions'] })
            queryClient.invalidateQueries({ queryKey: ['my-active-exclusion'] })
            toast.success(response.message || 'Exclusion extended successfully')
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to extend exclusion'
            toast.error(message)
        }
    })
}

// Hook for terminating exclusion early
export function useTerminateExclusion() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: {
            id: string
            reason?: string
        }) => {
            const { id, ...terminationData } = data
            const result = await api.post(`/nser/${id}/terminate/`, {
                ...terminationData,
                confirmation: true
            })
            return result.data as SingleApiResponse<SelfExclusion>
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['exclusions'] })
            queryClient.invalidateQueries({ queryKey: ['my-active-exclusion'] })
            toast.success(response.message || 'Exclusion terminated successfully')
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to terminate exclusion'
            toast.error(message)
        }
    })
}

// Real-time exclusion lookup with performance monitoring
export function useRealTimeExclusionLookup() {
    const lookupMutation = useMutation({
        mutationFn: async (data: {
            phone_number?: string
            national_id?: string
            bst_token?: string
            email?: string
        }) => {
            const startTime = performance.now()

            try {
                const result = await api.nser.lookup(data)
                const endTime = performance.now()
                const responseTime = Math.round(endTime - startTime)

                return {
                    ...(result.data && typeof result.data === 'object' ? result.data : {}),
                    client_response_time_ms: responseTime
                }
            } catch (error: any) {
                const endTime = performance.now()
                const responseTime = Math.round(endTime - startTime)

                // Attach performance data to error
                const enrichedError = error
                enrichedError.client_response_time_ms = responseTime
                throw enrichedError
            }
        },
        onSuccess: (response) => {
            const responseTime = response.client_response_time_ms
            const serverTime = response.response_time_ms || 0

            if (responseTime > 200) {
                console.warn(`⚠️ Slow exclusion lookup: ${responseTime}ms (server: ${serverTime}ms)`)
            }

            // Performance target: <50ms server, <200ms total
            const isPerformant = serverTime < 50 && responseTime < 200
            const isExcluded = response.is_excluded

            if (isExcluded) {
                toast.warning(`🚫 User is EXCLUDED (${isPerformant ? 'fast' : 'slow'} lookup: ${responseTime}ms)`)
            } else {
                toast.success(`✅ User not excluded (${responseTime}ms lookup)`)
            }
        },
        onError: (error: any) => {
            const responseTime = error.client_response_time_ms || 0
            toast.error(`❌ Lookup failed (${responseTime}ms)`)
        }
    })

    return {
        lookup: lookupMutation.mutate,
        isLookingUp: lookupMutation.isPending,
        lookupResult: lookupMutation.data,
        lookupError: lookupMutation.error,
    }
}

// Hook for exclusion trends data
export function useExclusionTrends(period: 'week' | 'month' | 'quarter' = 'month') {
    return useQuery({
        queryKey: ['exclusion-trends', period],
        queryFn: async () => {
            const { data } = await api.get('/nser/statistics/trends/', {
                params: { period }
            })
            return data
        },
        staleTime: 300000, // 5 minutes
    })
}

// Hook for exclusion compliance report
export function useExclusionComplianceReport(params?: {
    start_date?: string
    end_date?: string
    operator_id?: string
}) {
    return useQuery({
        queryKey: ['exclusion-compliance-report', params],
        queryFn: async () => {
            const { data } = await api.get('/nser/reports/compliance/', { params })
            return data
        },
        enabled: !!(params?.start_date && params?.end_date),
        staleTime: 300000, // 5 minutes
    })
}

// Hook for daily exclusion statistics
export function useDailyExclusionStats(period: number = 30) {
    return useQuery({
        queryKey: ['daily-exclusion-stats', period],
        queryFn: async () => {
            const { data } = await api.get('/nser/statistics/daily/', {
                params: { days: period }
            })
            return data
        },
        refetchInterval: 60000, // Refetch every minute
        staleTime: 30000,
    })
}

// Helper hook to check exclusion period formatting
export function useExclusionFormatters() {
    const formatPeriod = (period: string): string => {
        const periodMap: Record<string, string> = {
            '6_months': '6 Months',
            '1_year': '1 Year',
            '5_years': '5 Years',
            'permanent': 'Permanent',
            'custom': 'Custom Period'
        }
        return periodMap[period] || period
    }

    const formatDaysRemaining = (days: number): string => {
        if (days <= 0) return 'Expired'
        if (days === 1) return '1 day remaining'
        if (days < 30) return `${days} days remaining`

        const months = Math.floor(days / 30)
        const remainingDays = days % 30

        if (months === 1 && remainingDays === 0) return '1 month remaining'
        if (remainingDays === 0) return `${months} months remaining`

        return `${months} months, ${remainingDays} days remaining`
    }

    const formatStatus = (status: string): string => {
        const statusMap: Record<string, string> = {
            'pending': 'Pending Activation',
            'active': 'Active',
            'expired': 'Expired',
            'terminated': 'Terminated Early',
            'suspended': 'Suspended',
            'revoked': 'Revoked'
        }
        return statusMap[status] || status
    }

    const getStatusColor = (status: string): 'green' | 'yellow' | 'red' | 'gray' => {
        const colorMap: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
            'active': 'green',
            'pending': 'yellow',
            'expired': 'gray',
            'terminated': 'red',
            'suspended': 'red',
            'revoked': 'red'
        }
        return colorMap[status] || 'gray'
    }

    const calculateProgress = (effectiveDate: string, expiryDate: string): number => {
        const now = new Date()
        const effective = new Date(effectiveDate)
        const expiry = new Date(expiryDate)

        if (now < effective) return 0
        if (now >= expiry) return 100

        const total = expiry.getTime() - effective.getTime()
        const elapsed = now.getTime() - effective.getTime()

        return Math.round((elapsed / total) * 100)
    }

    return {
        formatPeriod,
        formatDaysRemaining,
        formatStatus,
        getStatusColor,
        calculateProgress,
    }
}
