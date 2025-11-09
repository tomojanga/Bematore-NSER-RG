import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { 
  AuditLog,
  ExclusionAuditLog,
  ComplianceReport,
  ApiResponse, 
  SingleApiResponse,
  PaginatedParams 
} from '@/types'

// Simple toast replacement until we add react-hot-toast
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
  info: (message: string) => console.log('ℹ️', message),
  warning: (message: string) => console.warn('⚠️', message),
}

// Main audit logs hook
export function useAuditLogs(params?: PaginatedParams & {
  user_id?: string
  action?: string
  resource_type?: string
  date_from?: string
  date_to?: string
}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      const { data } = await api.get('/compliance/audit-logs/', { params })
      return data as ApiResponse<AuditLog>
    },
    staleTime: 60000, // 1 minute
  })
}

// Exclusion audit logs hook
export function useExclusionAuditLogs(params?: PaginatedParams & {
  exclusion_id?: string
  action?: string
  performed_by?: string
  date_from?: string
  date_to?: string
}) {
  return useQuery({
    queryKey: ['exclusion-audit-logs', params],
    queryFn: async () => {
      const { data } = await api.get('/nser/audit-logs/', { params })
      return data as ApiResponse<ExclusionAuditLog>
    },
    staleTime: 60000, // 1 minute
  })
}

// BST audit logs hook (from BST module)
export function useBSTAuditLogs(params?: PaginatedParams & {
  bst_token_id?: string
  action?: string
  operator_id?: string
  date_from?: string
  date_to?: string
}) {
  return useQuery({
    queryKey: ['bst-audit-logs', params],
    queryFn: async () => {
      const { data } = await api.get('/bst/audit-logs/', { params })
      return data
    },
    staleTime: 60000, // 1 minute
  })
}

// Operator audit logs hook
export function useOperatorAuditLogs(params?: PaginatedParams & {
  operator_id?: string
  action?: string
  resource_type?: string
  date_from?: string
  date_to?: string
}) {
  return useQuery({
    queryKey: ['operator-audit-logs', params],
    queryFn: async () => {
      const { data } = await api.get('/operators/audit-logs/', { params })
      return data
    },
    staleTime: 60000, // 1 minute
  })
}

// Main compliance hook
export function useCompliance(params?: PaginatedParams) {
  const { data, isLoading } = useQuery({
    queryKey: ['compliance-reports', params],
    queryFn: async () => {
      const { data } = await api.get('/compliance/reports/', { params }).catch(() => ({ data: { results: [], count: 0 } }))
      return data as ApiResponse<ComplianceReport>
    },
    staleTime: 300000,
    retry: false,
  })

  return {
    data,
    isLoading
  }
}

// Compliance reports hook
export function useComplianceReports(params?: PaginatedParams) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['compliance-reports', params],
    queryFn: async () => {
      const { data } = await api.get('/compliance/reports/', { params })
      return data as ApiResponse<ComplianceReport>
    },
    staleTime: 300000, // 5 minutes
  })

  const generateReportMutation = useMutation({
    mutationFn: async (data: {
      report_type: 'monthly' | 'quarterly' | 'annual' | 'custom'
      period_start: string
      period_end: string
      operator_ids?: string[]
      include_details?: boolean
      format?: 'pdf' | 'excel' | 'csv'
    }) => {
      const result = await api.post('/compliance/reports/', data)
      return result.data as SingleApiResponse<ComplianceReport>
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-reports'] })
      toast.success(response.message || 'Compliance report generated successfully')
      
      // Auto-download if file URL provided
      if (response.data?.file_url) {
        window.open(response.data.file_url, '_blank')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate compliance report'
      toast.error(message)
    }
  })

  return {
    reports: data?.results || [],
    total: data?.count || 0,
    isLoading,
    generateReport: generateReportMutation.mutate,
    isGenerating: generateReportMutation.isPending,
  }
}

// Data export hooks for compliance
export function useComplianceDataExport() {
  const exportAuditLogsMutation = useMutation({
    mutationFn: async (data: {
      format: 'csv' | 'excel' | 'pdf'
      filters?: {
        date_from?: string
        date_to?: string
        user_id?: string
        action?: string
        resource_type?: string
      }
    }) => {
      let endpoint = '/compliance/audit-logs/export/csv/'
      
      if (data.format === 'excel') {
        endpoint = '/compliance/audit-logs/export/excel/'
      } else if (data.format === 'pdf') {
        endpoint = '/compliance/audit-logs/export/pdf/'
      }
      
      const result = await api.post(endpoint, data.filters || {})
      return result.data
    },
    onSuccess: (response) => {
      toast.success('Export completed successfully')
      
      // Auto-download file
      if (response.data?.file_url) {
        const link = document.createElement('a')
        link.href = response.data.file_url
        link.download = response.data.filename || `audit_logs_export_${Date.now()}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Export failed'
      toast.error(message)
    }
  })

  return {
    exportAuditLogs: exportAuditLogsMutation.mutate,
    isExporting: exportAuditLogsMutation.isPending,
  }
}

// Compliance statistics hook
export function useComplianceStatistics() {
  return useQuery({
    queryKey: ['compliance-statistics'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/statistics/')
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 120000,
  })
}

// Data retention policy hook
export function useDataRetentionPolicy() {
  return useQuery({
    queryKey: ['data-retention-policy'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/data-retention/')
      return data
    },
    staleTime: 3600000, // 1 hour
  })
}

// Privacy compliance hook
export function usePrivacyCompliance() {
  const queryClient = useQueryClient()

  const { data: privacySettings } = useQuery({
    queryKey: ['privacy-compliance'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/privacy/')
      return data
    },
    staleTime: 300000, // 5 minutes
  })

  const requestDataDeletionMutation = useMutation({
    mutationFn: async (data: {
      user_id: string
      deletion_reason: string
      retain_for_legal?: boolean
    }) => {
      const result = await api.post('/compliance/privacy/delete-user-data/', data)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
      toast.success('Data deletion request submitted')
    }
  })

  const requestDataExportMutation = useMutation({
    mutationFn: async (data: {
      user_id: string
      data_types?: string[]
      format?: 'json' | 'csv'
    }) => {
      const result = await api.post('/compliance/privacy/export-user-data/', data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success('Data export request submitted')
      
      if (response.data?.file_url) {
        window.open(response.data.file_url, '_blank')
      }
    }
  })

  return {
    privacySettings: privacySettings?.data,
    requestDataDeletion: requestDataDeletionMutation.mutate,
    requestDataExport: requestDataExportMutation.mutate,
    isDeletingData: requestDataDeletionMutation.isPending,
    isExportingData: requestDataExportMutation.isPending,
  }
}

// Incident management hook
export function useIncidentManagement() {
  const queryClient = useQueryClient()

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['security-incidents'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/incidents/')
      return data
    },
    staleTime: 60000, // 1 minute
  })

  const reportIncidentMutation = useMutation({
    mutationFn: async (data: {
      incident_type: 'security_breach' | 'data_leak' | 'unauthorized_access' | 'system_compromise'
      severity: 'low' | 'medium' | 'high' | 'critical'
      description: string
      affected_users?: string[]
      containment_actions?: string[]
      metadata?: Record<string, any>
    }) => {
      const result = await api.post('/compliance/incidents/', data)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-incidents'] })
      toast.success('Security incident reported successfully')
    }
  })

  const updateIncidentMutation = useMutation({
    mutationFn: async (data: {
      id: string
      status?: 'investigating' | 'contained' | 'resolved' | 'closed'
      resolution_notes?: string
      containment_actions?: string[]
    }) => {
      const { id, ...updateData } = data
      const result = await api.patch(`/compliance/incidents/${id}/`, updateData)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-incidents'] })
      toast.success('Incident updated successfully')
    }
  })

  return {
    incidents: incidents?.results || [],
    isLoading,
    reportIncident: reportIncidentMutation.mutate,
    updateIncident: updateIncidentMutation.mutate,
    isReporting: reportIncidentMutation.isPending,
    isUpdating: updateIncidentMutation.isPending,
  }
}

// Regulatory reporting hook
export function useRegulatoryReporting() {
  const generateRegulatoryReportMutation = useMutation({
    mutationFn: async (data: {
      regulator: 'GRAK' | 'NACADA' | 'DCI' | 'CBK'
      report_type: 'monthly' | 'quarterly' | 'annual' | 'incident'
      period_start: string
      period_end: string
      include_sensitive_data?: boolean
    }) => {
      const result = await api.post('/compliance/regulatory-reports/', data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success('Regulatory report generated successfully')
      
      if (response.data?.file_url) {
        window.open(response.data.file_url, '_blank')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate regulatory report'
      toast.error(message)
    }
  })

  return {
    generateRegulatoryReport: generateRegulatoryReportMutation.mutate,
    isGenerating: generateRegulatoryReportMutation.isPending,
  }
}

// Access control audit hook
export function useAccessControlAudit() {
  const { data: accessLogs } = useQuery({
    queryKey: ['access-control-logs'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/access-logs/')
      return data
    },
    staleTime: 60000, // 1 minute
  })

  const { data: privilegedActions } = useQuery({
    queryKey: ['privileged-actions'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/privileged-actions/')
      return data
    },
    staleTime: 60000, // 1 minute
  })

  const { data: failedLogins } = useQuery({
    queryKey: ['failed-logins'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/failed-logins/')
      return data
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
  })

  return {
    accessLogs: accessLogs?.results || [],
    privilegedActions: privilegedActions?.results || [],
    failedLogins: failedLogins?.results || [],
  }
}

// Data integrity monitoring hook
export function useDataIntegrityMonitoring() {
  const { data: checksumValidation } = useQuery({
    queryKey: ['data-integrity-checksums'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/data-integrity/checksums/')
      return data
    },
    refetchInterval: 3600000, // 1 hour
    staleTime: 1800000, // 30 minutes
  })

  const { data: inconsistencies } = useQuery({
    queryKey: ['data-inconsistencies'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/data-integrity/inconsistencies/')
      return data
    },
    refetchInterval: 1800000, // 30 minutes
    staleTime: 600000, // 10 minutes
  })

  return {
    checksumValidation: checksumValidation?.data,
    inconsistencies: inconsistencies?.results || [],
  }
}

// GDPR compliance hook
export function useGDPRCompliance() {
  const queryClient = useQueryClient()

  const { data: gdprRequests } = useQuery({
    queryKey: ['gdpr-requests'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/gdpr/requests/')
      return data
    },
    staleTime: 300000, // 5 minutes
  })

  const processGDPRRequestMutation = useMutation({
    mutationFn: async (data: {
      request_type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction'
      user_id: string
      details: string
      legal_basis?: string
    }) => {
      const result = await api.post('/compliance/gdpr/process/', data)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gdpr-requests'] })
      toast.success('GDPR request processed successfully')
    }
  })

  return {
    gdprRequests: gdprRequests?.results || [],
    processGDPRRequest: processGDPRRequestMutation.mutate,
    isProcessing: processGDPRRequestMutation.isPending,
  }
}

// Risk compliance monitoring hook
export function useRiskCompliance() {
  const { data: riskViolations } = useQuery({
    queryKey: ['risk-compliance-violations'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/risk/violations/')
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 120000,
  })

  const { data: unscreenedUsers } = useQuery({
    queryKey: ['unscreened-users'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/risk/unscreened-users/')
      return data
    },
    refetchInterval: 3600000, // 1 hour
    staleTime: 1800000, // 30 minutes
  })

  const { data: overdueAssessments } = useQuery({
    queryKey: ['overdue-assessments'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/risk/overdue-assessments/')
      return data
    },
    refetchInterval: 3600000, // 1 hour
    staleTime: 1800000, // 30 minutes
  })

  return {
    riskViolations: riskViolations?.results || [],
    unscreenedUsers: unscreenedUsers?.results || [],
    overdueAssessments: overdueAssessments?.results || [],
  }
}

// Fraud detection and compliance hook
export function useFraudCompliance() {
  const { data: fraudAlerts } = useQuery({
    queryKey: ['fraud-alerts'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/fraud/alerts/')
      return data
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  })

  const { data: suspiciousActivities } = useQuery({
    queryKey: ['suspicious-activities'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/fraud/suspicious/')
      return data
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })

  const { data: duplicateAccounts } = useQuery({
    queryKey: ['duplicate-accounts'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/fraud/duplicates/')
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 120000,
  })

  return {
    fraudAlerts: fraudAlerts?.results || [],
    suspiciousActivities: suspiciousActivities?.results || [],
    duplicateAccounts: duplicateAccounts?.results || [],
  }
}

// Compliance dashboard hook
export function useComplianceDashboard() {
  return useQuery({
    queryKey: ['compliance-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/dashboard/')
      return data
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })
}

// Compliance violations hook
export function useComplianceViolations() {
  return useQuery({
    queryKey: ['compliance-violations'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/violations/')
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 120000,
  })
}

// Compliance helpers
export function useComplianceHelpers() {
  const formatAction = (action: string): string => {
    const actionMap: Record<string, string> = {
      'create': 'Created',
      'update': 'Updated',
      'delete': 'Deleted',
      'view': 'Viewed',
      'login': 'Logged In',
      'logout': 'Logged Out',
      'register': 'Registered',
      'exclude': 'Self-Excluded',
      'terminate': 'Terminated',
      'activate': 'Activated',
      'deactivate': 'Deactivated',
      'generate': 'Generated',
      'validate': 'Validated',
      'compromise': 'Compromised',
      'rotate': 'Rotated'
    }
    return actionMap[action] || action
  }

  const formatResourceType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'user': 'User',
      'exclusion': 'Exclusion',
      'assessment': 'Assessment',
      'operator': 'Operator',
      'bst_token': 'BST Token',
      'transaction': 'Transaction',
      'invoice': 'Invoice',
      'notification': 'Notification'
    }
    return typeMap[type] || type
  }

  const getSeverityColor = (severity: string): 'green' | 'yellow' | 'orange' | 'red' => {
    const colorMap: Record<string, 'green' | 'yellow' | 'orange' | 'red'> = {
      'low': 'green',
      'medium': 'yellow',
      'high': 'orange',
      'critical': 'red'
    }
    return colorMap[severity] || 'yellow'
  }

  const formatComplianceScore = (score: number): {
    formatted: string
    label: string
    color: 'green' | 'yellow' | 'orange' | 'red'
  } => {
    const formatted = `${Math.round(score * 10) / 10}%`
    
    let label: string
    let color: 'green' | 'yellow' | 'orange' | 'red'
    
    if (score >= 95) {
      label = 'Excellent'
      color = 'green'
    } else if (score >= 80) {
      label = 'Good'
      color = 'green'
    } else if (score >= 60) {
      label = 'Fair'
      color = 'yellow'
    } else if (score >= 40) {
      label = 'Poor'
      color = 'orange'
    } else {
      label = 'Critical'
      color = 'red'
    }
    
    return { formatted, label, color }
  }

  const formatDataRetentionPeriod = (days: number): string => {
    if (days < 30) return `${days} days`
    if (days < 365) {
      const months = Math.floor(days / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    }
    const years = Math.floor(days / 365)
    return `${years} year${years > 1 ? 's' : ''}`
  }

  const determineViolationSeverity = (violationType: string, impact: string): 'low' | 'medium' | 'high' | 'critical' => {
    // Critical violations
    if (violationType.includes('security') || violationType.includes('breach')) {
      return 'critical'
    }
    
    // High violations
    if (violationType.includes('exclusion') || violationType.includes('fraud')) {
      return 'high'
    }
    
    // Medium violations
    if (violationType.includes('screening') || violationType.includes('assessment')) {
      return 'medium'
    }
    
    // Low violations (everything else)
    return 'low'
  }

  const formatIPAddress = (ip: string): string => {
    // Mask internal IPs for privacy
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      const parts = ip.split('.')
      return `${parts[0]}.${parts[1]}.xxx.xxx`
    }
    return ip
  }

  const parseUserAgent = (userAgent: string): {
    browser: string
    os: string
    device: string
  } => {
    // Simple user agent parsing
    let browser = 'Unknown'
    let os = 'Unknown'
    let device = 'Desktop'
    
    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'
    
    if (userAgent.includes('Windows')) os = 'Windows'
    else if (userAgent.includes('Mac')) os = 'macOS'
    else if (userAgent.includes('Linux')) os = 'Linux'
    else if (userAgent.includes('Android')) os = 'Android'
    else if (userAgent.includes('iOS')) os = 'iOS'
    
    if (userAgent.includes('Mobile') || userAgent.includes('mobile')) device = 'Mobile'
    else if (userAgent.includes('Tablet') || userAgent.includes('tablet')) device = 'Tablet'
    
    return { browser, os, device }
  }

  return {
    formatAction,
    formatResourceType,
    getSeverityColor,
    formatComplianceScore,
    formatDataRetentionPeriod,
    determineViolationSeverity,
    formatIPAddress,
    parseUserAgent,
  }
}

// Audit trail search hook
export function useAuditTrailSearch() {
  return useMutation({
    mutationFn: async (data: {
      user_id?: string
      action?: string
      resource_type?: string
      resource_id?: string
      date_from?: string
      date_to?: string
      ip_address?: string
      success?: boolean
      search_term?: string
    }) => {
      const result = await api.get('/compliance/audit-logs/search/', { params: data })
      return result.data as ApiResponse<AuditLog>
    }
  })
}

// Combined compliance overview hook
export function useComplianceOverview() {
  return useQuery({
    queryKey: ['compliance-overview'],
    queryFn: async () => {
      const [statistics, violations, incidents, auditSummary] = await Promise.all([
        api.get('/compliance/statistics/'),
        api.get('/compliance/violations/'),
        api.get('/compliance/incidents/'),
        api.get('/compliance/audit-summary/')
      ])
      
      return {
        statistics: statistics.data,
        violations: violations.data,
        incidents: incidents.data,
        auditSummary: auditSummary.data,
      }
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 120000,
  })
}

// Real-time compliance monitoring
export function useRealTimeCompliance() {
  return useQuery({
    queryKey: ['realtime-compliance'],
    queryFn: async () => {
      const results = await Promise.allSettled([
        api.get('/monitoring/alerts/active/').catch(() => ({ data: { results: [] } })),
        api.get('/compliance/violations/recent/').catch(() => ({ data: { results: [] } })),
        api.get('/compliance/incidents/active/').catch(() => ({ data: { results: [] } }))
      ])
      
      return {
        activeAlerts: results[0].status === 'fulfilled' ? results[0].value.data?.results || [] : [],
        recentViolations: results[1].status === 'fulfilled' ? results[1].value.data?.results || [] : [],
        activeIncidents: results[2].status === 'fulfilled' ? results[2].value.data?.results || [] : [],
      }
    },
    refetchInterval: 30000,
    staleTime: 15000,
    retry: false,
  })
}
