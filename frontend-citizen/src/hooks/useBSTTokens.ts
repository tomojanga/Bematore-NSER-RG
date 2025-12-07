import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { 
  BSTToken, 
  BSTMapping, 
  BSTCrossReference,
  ApiResponse, 
  SingleApiResponse,
  PaginatedParams 
} from '@/types'

// Simple toast replacement until we add react-hot-toast
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
  loading: (message: string) => console.log('⏳', message),
}

export function useBSTTokens(params?: PaginatedParams) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['bst-tokens', params],
    queryFn: async () => {
      const { data } = await api.bst.tokens(params)
      return data as ApiResponse<BSTToken>
    },
    staleTime: 30000, // 30 seconds
  })

  const generateTokenMutation = useMutation({
    mutationFn: async (data: { 
      user_id: string
      force_regenerate?: boolean 
    }) => {
      const result = await api.bst.generate(data)
      return result.data as SingleApiResponse<BSTToken>
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bst-tokens'] })
      toast.success(response.message || 'BST token generated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate token'
      toast.error(message)
    }
  })

  const bulkGenerateTokenMutation = useMutation({
    mutationFn: async (data: { 
      user_ids: string[]
      force_regenerate?: boolean 
    }) => {
      const result = await api.bst.bulkGenerate(data)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bst-tokens'] })
      toast.success(`Generated ${response.data?.total || 0} tokens`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Bulk generation failed'
      toast.error(message)
    }
  })

  const validateTokenMutation = useMutation({
    mutationFn: async (data: { 
      token: string
      operator_id?: string 
    }) => {
      const result = await api.bst.validate(data.token, data.operator_id)
      return result.data
    },
    onSuccess: (response) => {
      toast.success(`Token validation: ${response.validation_message}`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Token validation failed'
      toast.error(message)
    }
  })

  const bulkValidateTokenMutation = useMutation({
    mutationFn: async (data: { 
      tokens: string[]
      operator_id?: string 
    }) => {
      const result = await api.bst.bulkValidate(data.tokens, data.operator_id)
      return result.data
    },
    onSuccess: (response) => {
      toast.success(`Validated ${response.data?.total || 0} tokens`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Bulk validation failed'
      toast.error(message)
    }
  })

  const rotateTokenMutation = useMutation({
    mutationFn: async (data: { 
      id: string
      reason: string
      notify_user?: boolean 
    }) => {
      const { id, ...rotateData } = data
      const result = await api.bst.rotate(id, rotateData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bst-tokens'] })
      toast.success(response.message || 'Token rotated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Token rotation failed'
      toast.error(message)
    }
  })

  const compromiseTokenMutation = useMutation({
    mutationFn: async (data: { 
      id: string
      reason: string
      incident_reference?: string
      notify_user?: boolean
      auto_rotate?: boolean 
    }) => {
      const { id, ...compromiseData } = data
      const result = await api.bst.compromise(id, compromiseData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bst-tokens'] })
      toast.success(response.message || 'Token marked as compromised')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to compromise token'
      toast.error(message)
    }
  })

  const deactivateTokenMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await api.bst.deactivate(id)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bst-tokens'] })
      toast.success(response.message || 'Token deactivated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to deactivate token'
      toast.error(message)
    }
  })

  const lookupTokenMutation = useMutation({
    mutationFn: async (data: { 
      phone_number?: string
      national_id?: string
      email?: string
      user_id?: string 
    }) => {
      const result = await api.bst.lookup(data)
      return result.data as SingleApiResponse<BSTToken>
    },
    onSuccess: (response) => {
      toast.success('Token lookup successful')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Token lookup failed'
      toast.error(message)
    }
  })

  const fraudCheckMutation = useMutation({
    mutationFn: async (data: { 
      token_id?: string
      user_id?: string
      check_type?: 'duplicate_accounts' | 'compromised_token' | 'suspicious_activity' | 'all'
    }) => {
      const result = await api.bst.fraudCheck(data)
      return result.data
    },
    onSuccess: (response) => {
      const riskLevel = response.data?.risk_level || 'unknown'
      toast.success(`Fraud check completed - Risk: ${riskLevel}`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Fraud check failed'
      toast.error(message)
    }
  })

  const detectDuplicatesMutation = useMutation({
    mutationFn: async (data: { 
      user_id?: string
      phone_number?: string
      national_id?: string
      email?: string
      device_id?: string
    }) => {
      const result = await api.bst.detectDuplicates(data)
      return result.data
    },
    onSuccess: (response) => {
      const duplicateCount = response.data?.duplicate_count || 0
      if (duplicateCount > 0) {
        toast.error(`⚠️ ${duplicateCount} potential duplicate accounts detected`)
      } else {
        toast.success('No duplicates detected')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Duplicate detection failed'
      toast.error(message)
    }
  })

  return {
    // Data
    tokens: data?.results || [],
    total: data?.count || 0,
    hasNextPage: !!data?.next,
    hasPreviousPage: !!data?.previous,
    
    // Loading states
    isLoading,
    error,
    
    // Mutations
    generateToken: generateTokenMutation.mutate,
    bulkGenerateToken: bulkGenerateTokenMutation.mutate,
    validateToken: validateTokenMutation.mutate,
    bulkValidateToken: bulkValidateTokenMutation.mutate,
    rotateToken: rotateTokenMutation.mutate,
    compromiseToken: compromiseTokenMutation.mutate,
    deactivateToken: deactivateTokenMutation.mutate,
    lookupToken: lookupTokenMutation.mutate,
    fraudCheck: fraudCheckMutation.mutate,
    detectDuplicates: detectDuplicatesMutation.mutate,
    
    // Loading states for mutations
    isGenerating: generateTokenMutation.isPending,
    isBulkGenerating: bulkGenerateTokenMutation.isPending,
    isValidating: validateTokenMutation.isPending,
    isBulkValidating: bulkValidateTokenMutation.isPending,
    isRotating: rotateTokenMutation.isPending,
    isCompromising: compromiseTokenMutation.isPending,
    isDeactivating: deactivateTokenMutation.isPending,
    isLookingUp: lookupTokenMutation.isPending,
    isFraudChecking: fraudCheckMutation.isPending,
    isDetectingDuplicates: detectDuplicatesMutation.isPending,
    
    // Mutation data
    validateResult: validateTokenMutation.data,
    fraudCheckResult: fraudCheckMutation.data,
    duplicatesResult: detectDuplicatesMutation.data,
  }
}

// Hook for individual BST token
export function useBSTToken(id: string) {
  return useQuery({
    queryKey: ['bst-token', id],
    queryFn: async () => {
      const { data } = await api.bst.getToken(id)
      return data as SingleApiResponse<BSTToken>
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  })
}

// Hook for BST token lookup by user
export function useBSTTokenLookup() {
  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await api.bst.lookupUser(token)
      return data
    },
    onSuccess: (response) => {
      toast.success('User lookup successful')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'User lookup failed'
      toast.error(message)
    }
  })
}

// Hook for BST mappings
export function useBSTMappings(params?: PaginatedParams) {
  return useQuery({
    queryKey: ['bst-mappings', params],
    queryFn: async () => {
      const { data } = await api.get('/bst/mappings/', { params })
      return data as ApiResponse<BSTMapping>
    },
    staleTime: 30000,
  })
}

// Hook for BST cross references
export function useBSTCrossReferences(params?: PaginatedParams) {
  return useQuery({
    queryKey: ['bst-cross-references', params],
    queryFn: async () => {
      const { data } = await api.get('/bst/cross-references/', { params })
      return data as ApiResponse<BSTCrossReference>
    },
    staleTime: 30000,
  })
}

// Hook for BST statistics
export function useBSTStats() {
  return useQuery({
    queryKey: ['bst-statistics'],
    queryFn: async () => {
      const { data } = await api.bst.statistics()
      return data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000,
  })
}

// Hook for daily BST statistics
export function useBSTDailyStats(period: 'today' | 'week' | 'month' = 'today') {
  return useQuery({
    queryKey: ['bst-daily-stats', period],
    queryFn: async () => {
      const { data } = await api.get('/bst/statistics/usage/', {
        params: { period }
      })
      return data
    },
    staleTime: 60000, // 1 minute
  })
}

// Hook for BST audit logs
export function useBSTAuditLogs(params?: PaginatedParams) {
  return useQuery({
    queryKey: ['bst-audit-logs', params],
    queryFn: async () => {
      const { data } = await api.get('/bst/audit-logs/', { params })
      return data
    },
    staleTime: 30000,
  })
}

// Real-time token validation with performance tracking
export function useTokenValidationPerformance() {
  const validateWithPerfMutation = useMutation({
    mutationFn: async (token: string) => {
      const startTime = performance.now()
      
      try {
        const result = await api.bst.validate(token)
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
      const serverTime = response.response_time_ms
      
      if (responseTime > 100) {
        console.warn(`⚠️ Slow client validation: ${responseTime}ms (server: ${serverTime}ms)`)
      }
      
      // Performance target: <20ms server, <100ms total
      const isPerformant = serverTime < 20 && responseTime < 100
      toast.success(
        isPerformant 
          ? `✅ Fast validation (${serverTime}ms)` 
          : `⚠️ Slow validation (${responseTime}ms total)`
      )
    }
  })

  return {
    validateWithPerf: validateWithPerfMutation.mutate,
    isValidating: validateWithPerfMutation.isPending,
    validationResult: validateWithPerfMutation.data,
  }
}
