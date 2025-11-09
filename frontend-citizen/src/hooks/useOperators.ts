import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { 
  Operator, 
  APIKey,
  IntegrationConfig,
  ComplianceReport,
  AuditLog,
  ApiResponse, 
  SingleApiResponse,
  PaginatedParams, 
  OperatorFormData 
} from '@/types'

// Simple toast replacement until we add react-hot-toast
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
  info: (message: string) => console.log('ℹ️', message),
  warning: (message: string) => console.warn('⚠️', message),
}

export function useOperators(params?: PaginatedParams) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['operators', params],
    queryFn: async () => {
      const { data } = await api.operators.list(params)
      return data as ApiResponse<Operator>
    },
    staleTime: 30000, // 30 seconds
  })

  const registerOperatorMutation = useMutation({
    mutationFn: async (operatorData: OperatorFormData) => {
      const result = await api.operators.register(operatorData)
      return result.data as SingleApiResponse<Operator>
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['operators'] })
      queryClient.invalidateQueries({ queryKey: ['operator-statistics'] })
      toast.success(response.message || 'Operator registered successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to register operator'
      toast.error(message)
    }
  })

  const updateOperatorMutation = useMutation({
    mutationFn: async (data: { id: string } & Partial<OperatorFormData>) => {
      const { id, ...updateData } = data
      const result = await api.patch(`/operators/${id}/`, updateData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['operators'] })
      toast.success('Operator updated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update operator'
      toast.error(message)
    }
  })

  const activateOperatorMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await api.operators.activate(id)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['operators'] })
      toast.success(response.message || 'Operator activated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to activate operator'
      toast.error(message)
    }
  })

  const suspendOperatorMutation = useMutation({
    mutationFn: async (data: {
      id: string
      reason: string
      suspension_period?: number
    }) => {
      const { id, ...suspendData } = data
      const result = await api.operators.suspend(id, suspendData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['operators'] })
      toast.success(response.message || 'Operator suspended successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to suspend operator'
      toast.error(message)
    }
  })

  return {
    // Data
    operators: data?.results || [],
    total: data?.count || 0,
    hasNextPage: !!data?.next,
    hasPreviousPage: !!data?.previous,
    
    // Loading states
    isLoading,
    error,
    
    // Mutations
    registerOperator: registerOperatorMutation.mutate,
    updateOperator: updateOperatorMutation.mutate,
    activateOperator: activateOperatorMutation.mutate,
    suspendOperator: suspendOperatorMutation.mutate,
    
    // Loading states for mutations
    isRegistering: registerOperatorMutation.isPending,
    isUpdating: updateOperatorMutation.isPending,
    isActivating: activateOperatorMutation.isPending,
    isSuspending: suspendOperatorMutation.isPending,
  }
}

// Individual operator hook
export function useOperator(id: string) {
  return useQuery({
    queryKey: ['operator', id],
    queryFn: async () => {
      const { data } = await api.operators.get(id)
      return data as SingleApiResponse<Operator>
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  })
}

// API key management hook
export function useOperatorAPIKeys(operatorId: string) {
  const queryClient = useQueryClient()

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['operator-api-keys', operatorId],
    queryFn: async () => {
      const { data } = await api.get(`/operators/api-keys/?operator_id=${operatorId}`)
      return data as ApiResponse<APIKey>
    },
    enabled: !!operatorId,
    staleTime: 30000,
  })

  const generateAPIKeyMutation = useMutation({
    mutationFn: async (data: {
      operator_id: string
      key_name: string
      scopes: string[]
      can_lookup?: boolean
      can_register?: boolean
      can_screen?: boolean
      rate_limit_per_second?: number
      rate_limit_per_day?: number
      ip_whitelist?: string[]
    }) => {
      const { operator_id, ...keyData } = data
      const result = await api.operators.generateApiKey(operator_id, keyData)
      return result.data as SingleApiResponse<APIKey>
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['operator-api-keys'] })
      toast.success(response.message || 'API key generated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate API key'
      toast.error(message)
    }
  })

  const rotateAPIKeyMutation = useMutation({
    mutationFn: async (data: {
      key_id: string
      reason?: string
    }) => {
      const result = await api.post(`/operators/api-keys/${data.key_id}/rotate/`, {
        reason: data.reason
      })
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['operator-api-keys'] })
      toast.success('API key rotated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to rotate API key'
      toast.error(message)
    }
  })

  const revokeAPIKeyMutation = useMutation({
    mutationFn: async (data: {
      key_id: string
      reason?: string
    }) => {
      const result = await api.post(`/operators/api-keys/${data.key_id}/revoke/`, {
        reason: data.reason
      })
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['operator-api-keys'] })
      toast.success('API key revoked successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to revoke API key'
      toast.error(message)
    }
  })

  const validateAPIKeyMutation = useMutation({
    mutationFn: async (data: {
      api_key: string
      operator_id: string
    }) => {
      const result = await api.operators.validateApiKey(data)
      return result.data
    },
    onSuccess: (response) => {
      const isValid = response.data?.is_valid
      if (isValid) {
        toast.success('✅ API key is valid and active')
      } else {
        toast.warning('⚠️ API key is invalid or inactive')
      }
    },
    onError: (error: any) => {
      toast.error('❌ API key validation failed')
    }
  })

  return {
    apiKeys: apiKeys?.results || [],
    totalKeys: apiKeys?.count || 0,
    isLoading,
    generateAPIKey: generateAPIKeyMutation.mutate,
    rotateAPIKey: rotateAPIKeyMutation.mutate,
    revokeAPIKey: revokeAPIKeyMutation.mutate,
    validateAPIKey: validateAPIKeyMutation.mutate,
    isGeneratingKey: generateAPIKeyMutation.isPending,
    isRotatingKey: rotateAPIKeyMutation.isPending,
    isRevokingKey: revokeAPIKeyMutation.isPending,
    isValidatingKey: validateAPIKeyMutation.isPending,
    generatedKey: generateAPIKeyMutation.data,
    validationResult: validateAPIKeyMutation.data,
  }
}

// License management hook
export function useOperatorLicenses(operatorId: string) {
  const queryClient = useQueryClient()

  const { data: licenses, isLoading } = useQuery({
    queryKey: ['operator-licenses', operatorId],
    queryFn: async () => {
      const { data } = await api.get(`/operators/licenses/?operator_id=${operatorId}`)
      return data
    },
    enabled: !!operatorId,
    staleTime: 60000, // 1 minute
  })

  const issueLicenseMutation = useMutation({
    mutationFn: async (data: {
      operator_id: string
      license_type: string
      conditions?: string[]
      expiry_date: string
    }) => {
      const { operator_id, ...licenseData } = data
      const result = await api.post(`/operators/${operator_id}/licenses/issue/`, licenseData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['operator-licenses'] })
      queryClient.invalidateQueries({ queryKey: ['operators'] })
      toast.success('License issued successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to issue license'
      toast.error(message)
    }
  })

  const renewLicenseMutation = useMutation({
    mutationFn: async (data: {
      operator_id: string
      license_id: string
      new_expiry_date: string
      conditions?: string[]
    }) => {
      const { operator_id, ...renewData } = data
      const result = await api.post(`/operators/${operator_id}/licenses/renew/`, renewData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['operator-licenses'] })
      toast.success('License renewed successfully')
    }
  })

  const revokeLicenseMutation = useMutation({
    mutationFn: async (data: {
      operator_id: string
      license_id: string
      reason: string
    }) => {
      const { operator_id, ...revokeData } = data
      const result = await api.post(`/operators/${operator_id}/licenses/revoke/`, revokeData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['operator-licenses'] })
      toast.success('License revoked successfully')
    }
  })

  return {
    licenses: licenses?.results || [],
    isLoading,
    issueLicense: issueLicenseMutation.mutate,
    renewLicense: renewLicenseMutation.mutate,
    revokeLicense: revokeLicenseMutation.mutate,
    isIssuing: issueLicenseMutation.isPending,
    isRenewing: renewLicenseMutation.isPending,
    isRevoking: revokeLicenseMutation.isPending,
  }
}

// Integration management hook
export function useOperatorIntegration(operatorId: string) {
  const queryClient = useQueryClient()

  const { data: integrationConfig } = useQuery({
    queryKey: ['operator-integration-config', operatorId],
    queryFn: async () => {
      const { data } = await api.get(`/operators/${operatorId}/integration-config/`)
      return data as SingleApiResponse<IntegrationConfig>
    },
    enabled: !!operatorId,
    staleTime: 60000, // 1 minute
  })

  const setupIntegrationMutation = useMutation({
    mutationFn: async (data: {
      operator_id: string
      webhook_url_exclusion?: string
      webhook_url_screening?: string
      webhook_url_compliance?: string
      webhook_secret?: string
      callback_success_url?: string
      callback_failure_url?: string
      auto_propagate_exclusions?: boolean
      require_screening_on_register?: boolean
      screening_frequency_days?: number
    }) => {
      const { operator_id, ...configData } = data
      const result = await api.operators.setupIntegration(operator_id, configData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['operator-integration-config'] })
      queryClient.invalidateQueries({ queryKey: ['operators'] })
      toast.success('Integration setup completed successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Integration setup failed'
      toast.error(message)
    }
  })

  const testIntegrationMutation = useMutation({
    mutationFn: async (operator_id: string) => {
      const result = await api.operators.testIntegration(operator_id)
      return result.data
    },
    onSuccess: (response) => {
      const testResults = response.data?.test_results || {}
      const overallSuccess = response.data?.overall_success || false
      
      if (overallSuccess) {
        toast.success('✅ All integration tests passed')
      } else {
        toast.warning('⚠️ Some integration tests failed - check details')
      }
    },
    onError: (error: any) => {
      toast.error('❌ Integration test failed')
    }
  })

  const testWebhookMutation = useMutation({
    mutationFn: async (data: {
      operator_id: string
      webhook_type: 'exclusion' | 'screening' | 'compliance'
      test_payload?: Record<string, any>
    }) => {
      const { operator_id, ...webhookData } = data
      const result = await api.post(`/operators/${operator_id}/webhooks/test/`, webhookData)
      return result.data
    },
    onSuccess: (response) => {
      const responseCode = response.data?.response_code
      const responseTime = response.data?.response_time_ms
      
      if (responseCode >= 200 && responseCode < 300) {
        toast.success(`✅ Webhook test successful (${responseTime}ms)`)
      } else {
        toast.warning(`⚠️ Webhook returned ${responseCode}`)
      }
    },
    onError: (error: any) => {
      toast.error('❌ Webhook test failed')
    }
  })

  return {
    integrationConfig: integrationConfig?.data,
    setupIntegration: setupIntegrationMutation.mutate,
    testIntegration: testIntegrationMutation.mutate,
    testWebhook: testWebhookMutation.mutate,
    isSetting: setupIntegrationMutation.isPending,
    isTesting: testIntegrationMutation.isPending,
    isTestingWebhook: testWebhookMutation.isPending,
    testResult: testIntegrationMutation.data,
    webhookTestResult: testWebhookMutation.data,
  }
}

// Operator compliance hook
export function useOperatorCompliance(operatorId?: string) {
  const queryClient = useQueryClient()

  const { data: complianceReports, isLoading } = useQuery({
    queryKey: ['operator-compliance-reports', operatorId],
    queryFn: async () => {
      const params = operatorId ? { operator_id: operatorId } : {}
      const { data } = await api.get('/operators/compliance-reports/', { params })
      return data as ApiResponse<ComplianceReport>
    },
    staleTime: 300000, // 5 minutes
  })

  const runComplianceCheckMutation = useMutation({
    mutationFn: async (operator_id: string) => {
      const result = await api.operators.complianceCheck(operator_id)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['operator-compliance-reports'] })
      queryClient.invalidateQueries({ queryKey: ['operators'] })
      
      const score = response.data?.compliance_score || 0
      const isCompliant = score >= 80
      
      if (isCompliant) {
        toast.success(`✅ Compliance check passed (Score: ${score}/100)`)
      } else {
        toast.warning(`⚠️ Compliance issues found (Score: ${score}/100)`)
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Compliance check failed'
      toast.error(message)
    }
  })

  const generateComplianceReportMutation = useMutation({
    mutationFn: async (data: {
      operator_id: string
      period_start: string
      period_end: string
      include_details?: boolean
    }) => {
      const { operator_id, ...reportData } = data
      const result = await api.post(`/operators/${operator_id}/compliance/report/`, reportData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['operator-compliance-reports'] })
      toast.success('Compliance report generated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate compliance report'
      toast.error(message)
    }
  })

  return {
    complianceReports: complianceReports?.results || [],
    isLoading,
    runComplianceCheck: runComplianceCheckMutation.mutate,
    generateComplianceReport: generateComplianceReportMutation.mutate,
    isRunningCheck: runComplianceCheckMutation.isPending,
    isGeneratingReport: generateComplianceReportMutation.isPending,
    checkResult: runComplianceCheckMutation.data,
  }
}

// Operator metrics hook
export function useOperatorMetrics(operatorId: string) {
  return useQuery({
    queryKey: ['operator-metrics', operatorId],
    queryFn: async () => {
      const { data } = await api.get(`/operators/${operatorId}/metrics/`)
      return data
    },
    enabled: !!operatorId,
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })
}

// API usage statistics hook
export function useOperatorAPIUsage(operatorId: string, period: string = '24h') {
  return useQuery({
    queryKey: ['operator-api-usage', operatorId, period],
    queryFn: async () => {
      const { data } = await api.get(`/operators/${operatorId}/api-usage/`, {
        params: { period }
      })
      return data
    },
    enabled: !!operatorId,
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })
}

// Response time metrics hook
export function useOperatorResponseTimes(operatorId: string) {
  return useQuery({
    queryKey: ['operator-response-times', operatorId],
    queryFn: async () => {
      const { data } = await api.get(`/operators/${operatorId}/response-times/`)
      return data
    },
    enabled: !!operatorId,
    refetchInterval: 300000, // 5 minutes
    staleTime: 120000,
  })
}

// Webhook logs hook
export function useWebhookLogs(operatorId: string, params?: PaginatedParams) {
  return useQuery({
    queryKey: ['webhook-logs', operatorId, params],
    queryFn: async () => {
      const { data } = await api.get(`/operators/${operatorId}/webhooks/logs/`, { params })
      return data
    },
    enabled: !!operatorId,
    staleTime: 30000,
  })
}

// Operator search hook
export function useOperatorSearch() {
  return useMutation({
    mutationFn: async (data: {
      query: string
      filters?: {
        license_status?: string
        integration_status?: string
        is_compliant?: boolean
        license_type?: string
      }
    }) => {
      const result = await api.get('/operators/search/', { params: data })
      return result.data as ApiResponse<Operator>
    }
  })
}

// Compliant operators hook
export function useCompliantOperators() {
  return useQuery({
    queryKey: ['compliant-operators'],
    queryFn: async () => {
      const { data } = await api.get('/operators/filter/compliant/')
      return data as ApiResponse<Operator>
    },
    staleTime: 300000, // 5 minutes
  })
}

// Non-compliant operators hook
export function useNonCompliantOperators() {
  return useQuery({
    queryKey: ['non-compliant-operators'],
    queryFn: async () => {
      const { data } = await api.get('/operators/filter/non-compliant/')
      return data as ApiResponse<Operator>
    },
    staleTime: 300000, // 5 minutes
  })
}

// Expiring licenses hook
export function useExpiringLicenses(daysAhead: number = 30) {
  return useQuery({
    queryKey: ['expiring-licenses', daysAhead],
    queryFn: async () => {
      const { data } = await api.get('/operators/licenses/expiring/', {
        params: { days_ahead: daysAhead }
      })
      return data
    },
    refetchInterval: 86400000, // 24 hours
    staleTime: 3600000, // 1 hour
  })
}

// Operator statistics hook
export function useOperatorStatistics() {
  return useQuery({
    queryKey: ['operator-statistics'],
    queryFn: async () => {
      const { data } = await api.operators.statistics()
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 60000,
  })
}

// Active operators stats hook
export function useActiveOperatorsStats() {
  return useQuery({
    queryKey: ['active-operators-stats'],
    queryFn: async () => {
      const { data } = await api.get('/operators/statistics/active/')
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 60000,
  })
}

// Integration status statistics hook
export function useIntegrationStatusStats() {
  return useQuery({
    queryKey: ['integration-status-stats'],
    queryFn: async () => {
      const { data } = await api.get('/operators/statistics/integration-status/')
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 60000,
  })
}

// Compliance overview hook
export function useComplianceOverview() {
  return useQuery({
    queryKey: ['compliance-overview'],
    queryFn: async () => {
      const { data } = await api.get('/operators/compliance/overview/')
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 60000,
  })
}

// Operator audit logs hook
export function useOperatorAuditLogs(operatorId?: string, params?: PaginatedParams) {
  const queryParams = operatorId ? { ...params, operator: operatorId } : params
  
  return useQuery({
    queryKey: ['operator-audit-logs', operatorId, params],
    queryFn: async () => {
      const { data } = await api.get('/operators/audit-logs/', { params: queryParams })
      return data as ApiResponse<AuditLog>
    },
    staleTime: 30000,
  })
}

// Operator helpers and formatters
export function useOperatorHelpers() {
  const formatLicenseType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'online_betting': 'Online Betting',
      'land_based_casino': 'Land-Based Casino',
      'lottery': 'Lottery',
      'sports_betting': 'Sports Betting',
      'online_casino': 'Online Casino'
    }
    return typeMap[type] || type
  }

  const formatLicenseStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'active': 'Active',
      'suspended': 'Suspended',
      'expired': 'Expired',
      'revoked': 'Revoked',
      'pending': 'Pending'
    }
    return statusMap[status] || status
  }

  const getLicenseStatusColor = (status: string): 'green' | 'yellow' | 'red' | 'gray' | 'blue' => {
    const colorMap: Record<string, 'green' | 'yellow' | 'red' | 'gray' | 'blue'> = {
      'active': 'green',
      'pending': 'blue',
      'suspended': 'yellow',
      'expired': 'red',
      'revoked': 'red'
    }
    return colorMap[status] || 'gray'
  }

  const formatIntegrationStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending Setup',
      'configured': 'Configured',
      'testing': 'Testing',
      'active': 'Active',
      'failed': 'Failed',
      'suspended': 'Suspended'
    }
    return statusMap[status] || status
  }

  const getIntegrationStatusColor = (status: string): 'blue' | 'yellow' | 'green' | 'red' | 'gray' => {
    const colorMap: Record<string, 'blue' | 'yellow' | 'green' | 'red' | 'gray'> = {
      'pending': 'blue',
      'configured': 'yellow',
      'testing': 'yellow',
      'active': 'green',
      'failed': 'red',
      'suspended': 'gray'
    }
    return colorMap[status] || 'gray'
  }

  const formatComplianceScore = (score: number): string => {
    if (score >= 95) return `${score}% (Excellent)`
    if (score >= 80) return `${score}% (Good)`
    if (score >= 60) return `${score}% (Fair)`
    return `${score}% (Poor)`
  }

  const getComplianceScoreColor = (score: number): 'green' | 'yellow' | 'orange' | 'red' => {
    if (score >= 95) return 'green'
    if (score >= 80) return 'green'
    if (score >= 60) return 'yellow'
    return 'red'
  }

  const formatDaysUntilExpiry = (expiryDate: string): string => {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Expired'
    if (diffDays === 0) return 'Expires today'
    if (diffDays === 1) return 'Expires tomorrow'
    if (diffDays <= 30) return `Expires in ${diffDays} days`
    
    const months = Math.floor(diffDays / 30)
    return `Expires in ${months} month${months > 1 ? 's' : ''}`
  }

  const isLicenseExpiringSoon = (expiryDate: string, daysThreshold: number = 30): boolean => {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays <= daysThreshold && diffDays > 0
  }

  const formatAPIKeyScopes = (scopes: string[]): string => {
    const scopeMap: Record<string, string> = {
      'lookup': 'Exclusion Lookup',
      'register': 'User Registration',
      'screen': 'Risk Screening',
      'compliance': 'Compliance Reporting',
      'admin': 'Admin Access'
    }
    
    return scopes.map(scope => scopeMap[scope] || scope).join(', ')
  }

  const maskAPIKey = (key: string, visibleChars: number = 8): string => {
    if (key.length <= visibleChars) return key
    return `${key.substring(0, visibleChars)}${'*'.repeat(key.length - visibleChars)}`
  }

  return {
    formatLicenseType,
    formatLicenseStatus,
    getLicenseStatusColor,
    formatIntegrationStatus,
    getIntegrationStatusColor,
    formatComplianceScore,
    getComplianceScoreColor,
    formatDaysUntilExpiry,
    isLicenseExpiringSoon,
    formatAPIKeyScopes,
    maskAPIKey,
  }
}

// Operator dashboard hook (for operator-specific dashboard)
export function useOperatorDashboard(operatorId?: string) {
  return useQuery({
    queryKey: ['operator-dashboard', operatorId],
    queryFn: async () => {
      const endpoint = operatorId 
        ? `/analytics/dashboard/operator/?operator_id=${operatorId}`
        : '/analytics/dashboard/operator/'
      const { data } = await api.get(endpoint)
      return data
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })
}

// Operator performance analytics
export function useOperatorPerformanceAnalytics(operatorId: string) {
  return useQuery({
    queryKey: ['operator-performance', operatorId],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/operators/performance/?operator_id=${operatorId}`)
      return data
    },
    enabled: !!operatorId,
    refetchInterval: 300000, // 5 minutes
    staleTime: 120000,
  })
}
