import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { DashboardStats, UserRole } from '@/types'
import { useAuthStore } from '@/store/authStore'

// Simple toast replacement until we add react-hot-toast
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
  info: (message: string) => console.log('ℹ️', message),
  warning: (message: string) => console.warn('⚠️', message),
}

// Main dashboard hook - adapts based on user role
export function useDashboard() {
  const { user } = useAuthStore()
  const userRole = user?.role || 'citizen'

  // Determine dashboard type based on user role
  const getDashboardType = (role: UserRole): 'grak' | 'operator' | 'bematore' | 'citizen' => {
    if (['grak_admin', 'grak_officer', 'grak_auditor'].includes(role)) {
      return 'grak'
    } else if (['operator_admin', 'operator_user'].includes(role)) {
      return 'operator'
    } else if (['bematore_admin', 'bematore_analyst'].includes(role)) {
      return 'bematore'
    } else {
      return 'citizen'
    }
  }

  const dashboardType = getDashboardType(userRole)

  return useQuery({
    queryKey: ['dashboard-overview', dashboardType, user?.id],
    queryFn: async () => {
      // Get appropriate dashboard based on user role
      let endpoint = '/analytics/dashboard/'
      
      if (dashboardType === 'grak') {
        endpoint = '/analytics/dashboard/grak/'
      } else if (dashboardType === 'operator') {
        endpoint = '/analytics/dashboard/operator/'
      }
      
      const { data } = await api.get(endpoint)
      return {
        ...data,
        dashboardType,
        userRole,
      }
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
    retry: 3,
  })
}

// GRAK Dashboard - For regulatory authority staff
export function useGRAKDashboard() {
  return useQuery({
    queryKey: ['grak-dashboard'],
    queryFn: async () => {
      const results = await Promise.allSettled([
        api.analytics.grakDashboard().catch(() => ({ data: null })),
        api.analytics.realtime().catch(() => ({ data: null })),
        api.get('/operators/compliance/overview/').catch(() => ({ data: null })),
        api.get('/analytics/operators/compliance-scores/').catch(() => ({ data: null })),
        api.analytics.riskDistribution().catch(() => ({ data: null })),
        api.analytics.exclusionTrends({ period: 'month' }).catch(() => ({ data: null })),
        api.monitoring.health().catch(() => ({ data: null }))
      ])

      return {
        overview: results[0].status === 'fulfilled' ? results[0].value.data : null,
        realtime: results[1].status === 'fulfilled' ? results[1].value.data : null,
        compliance: results[2].status === 'fulfilled' ? results[2].value.data : null,
        operatorCompliance: results[3].status === 'fulfilled' ? results[3].value.data : null,
        riskDistribution: results[4].status === 'fulfilled' ? results[4].value.data : null,
        exclusionTrends: results[5].status === 'fulfilled' ? results[5].value.data : null,
        systemHealth: results[6].status === 'fulfilled' ? results[6].value.data : null,
      }
    },
    refetchInterval: 60000,
    staleTime: 30000,
    retry: false,
  })
}

// Operator Dashboard - For licensed operators
export function useOperatorDashboard(operatorId?: string) {
  return useQuery({
    queryKey: ['operator-dashboard', operatorId],
    queryFn: async () => {
      const [
        overview,
        metrics,
        apiUsage,
        complianceStatus,
        exclusionMappings,
        recentTransactions
      ] = await Promise.all([
        api.analytics.operatorDashboard(),
        operatorId ? api.get(`/operators/${operatorId}/metrics/`) : Promise.resolve({ data: null }),
        operatorId ? api.get(`/operators/${operatorId}/api-usage/`) : Promise.resolve({ data: null }),
        operatorId ? api.get(`/operators/${operatorId}/compliance/score/`) : Promise.resolve({ data: null }),
        operatorId ? api.get(`/nser/operator-mappings/?operator=${operatorId}`) : Promise.resolve({ data: null }),
        api.get('/settlements/transactions/', { params: { operator_id: operatorId, page_size: 10 } })
      ])

      return {
        overview: overview.data,
        metrics: metrics.data,
        apiUsage: apiUsage.data,
        complianceStatus: complianceStatus.data,
        exclusionMappings: exclusionMappings.data,
        recentTransactions: recentTransactions.data,
      }
    },
    enabled: true,
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })
}

// Bematore Dashboard - For Bematore management
export function useBematoreDashboard() {
  return useQuery({
    queryKey: ['bematore-dashboard'],
    queryFn: async () => {
      const [
        nationalStats,
        financialOverview,
        systemPerformance,
        mlModelStats,
        operatorMetrics,
        userGrowth
      ] = await Promise.all([
        api.analytics.dashboard(),
        api.get('/settlements/statistics/'),
        api.get('/monitoring/metrics/system/'),
        api.get('/screening/ml/statistics/'),
        api.get('/analytics/operators/performance/'),
        api.analytics.userGrowth({ period: '90d' })
      ])

      return {
        nationalStats: nationalStats.data,
        financialOverview: financialOverview.data,
        systemPerformance: systemPerformance.data,
        mlModelStats: mlModelStats.data,
        operatorMetrics: operatorMetrics.data,
        userGrowth: userGrowth.data,
      }
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })
}

// Citizen Dashboard - For end users
export function useCitizenDashboard() {
  return useQuery({
    queryKey: ['citizen-dashboard'],
    queryFn: async () => {
      const [
        myExclusions,
        myRiskProfile,
        myAssessments,
        myNotifications
      ] = await Promise.all([
        api.nser.myExclusions(),
        api.screening.myRiskProfile(),
        api.screening.myAssessments(),
        api.notifications.unread()
      ])

      return {
        exclusions: myExclusions.data,
        riskProfile: myRiskProfile.data,
        assessments: myAssessments.data,
        notifications: myNotifications.data,
      }
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 120000,
  })
}

// Dashboard widgets hook
export function useDashboardWidgets() {
  const queryClient = useQueryClient()

  const { data: widgets, isLoading } = useQuery({
    queryKey: ['dashboard-widgets'],
    queryFn: async () => {
      const { data } = await api.dashboards.widgets()
      return data
    },
    staleTime: 300000, // 5 minutes
  })

  const { data: myDashboard } = useQuery({
    queryKey: ['my-dashboard'],
    queryFn: async () => {
      const { data } = await api.dashboards.myDashboard()
      return data
    },
    staleTime: 60000, // 1 minute
  })

  return {
    widgets: widgets?.results || [],
    myDashboard: myDashboard?.data,
    isLoading,
  }
}

// Real-time dashboard updates hook
export function useRealTimeDashboard() {
  return useQuery({
    queryKey: ['realtime-dashboard'],
    queryFn: async () => {
      const results = await Promise.allSettled([
        api.analytics.realtime().catch(() => ({ data: null })),
        api.get('/monitoring/alerts/active/').catch(() => ({ data: { results: [] } })),
        api.get('/nser/statistics/recent-activities/').catch(() => ({ data: { results: [] } })),
        api.monitoring.health().catch(() => ({ data: null }))
      ])

      return {
        stats: results[0].status === 'fulfilled' ? results[0].value.data : null,
        alerts: results[1].status === 'fulfilled' ? results[1].value.data?.results || [] : [],
        activities: results[2].status === 'fulfilled' ? results[2].value.data?.results || [] : [],
        health: results[3].status === 'fulfilled' ? results[3].value.data : null,
      }
    },
    refetchInterval: 10000,
    staleTime: 5000,
    retry: false,
  })
}

// Dashboard KPIs hook
export function useDashboardKPIs() {
  return useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const [
        userStats,
        exclusionStats,
        operatorStats,
        assessmentStats,
        complianceStats,
        financialStats
      ] = await Promise.all([
        api.users.statistics(),
        api.nser.statistics(),
        api.operators.statistics(),
        api.screening.statistics(),
        api.get('/compliance/statistics/'),
        api.settlements.statistics()
      ])

      return {
        users: userStats.data,
        exclusions: exclusionStats.data,
        operators: operatorStats.data,
        assessments: assessmentStats.data,
        compliance: complianceStats.data,
        financial: financialStats.data,
      }
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })
}

// Performance dashboard hook
export function usePerformanceDashboard() {
  return useQuery({
    queryKey: ['performance-dashboard'],
    queryFn: async () => {
      const [
        apiPerformance,
        systemMetrics,
        errorRates,
        responseTimeDistribution
      ] = await Promise.all([
        api.get('/analytics/performance/api/'),
        api.get('/analytics/performance/system/'),
        api.get('/monitoring/performance/errors/'),
        api.get('/monitoring/performance/response-times/')
      ])

      return {
        api: apiPerformance.data,
        system: systemMetrics.data,
        errors: errorRates.data,
        responseTimes: responseTimeDistribution.data,
      }
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  })
}

// Dashboard helpers
export function useDashboardHelpers() {
  const formatKPIValue = (value: number, type: 'number' | 'percentage' | 'currency' | 'time'): string => {
    switch (type) {
      case 'number':
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M`
        } else if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K`
        }
        return value.toString()
        
      case 'percentage':
        return `${Math.round(value * 10) / 10}%`
        
      case 'currency':
        if (value >= 1000000) {
          return `KES ${(value / 1000000).toFixed(1)}M`
        } else if (value >= 1000) {
          return `KES ${(value / 1000).toFixed(1)}K`
        }
        return `KES ${value.toLocaleString()}`
        
      case 'time':
        if (value < 1000) return `${Math.round(value)}ms`
        if (value < 60000) return `${Math.round(value / 1000 * 10) / 10}s`
        return `${Math.round(value / 60000)}m`
        
      default:
        return value.toString()
    }
  }

  const calculateTrendPercentage = (current: number, previous: number): {
    percentage: number
    direction: 'up' | 'down' | 'neutral'
    formatted: string
  } => {
    if (previous === 0) {
      return { percentage: 0, direction: 'neutral', formatted: '0%' }
    }
    
    const percentage = ((current - previous) / previous) * 100
    const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral'
    const formatted = `${Math.abs(Math.round(percentage * 10) / 10)}%`
    
    return { percentage: Math.abs(percentage), direction, formatted }
  }

  const getKPIColor = (value: number, thresholds: {
    excellent: number
    good: number
    warning: number
  }): 'green' | 'blue' | 'yellow' | 'red' => {
    if (value >= thresholds.excellent) return 'green'
    if (value >= thresholds.good) return 'blue'
    if (value >= thresholds.warning) return 'yellow'
    return 'red'
  }

  const formatLastUpdate = (timestamp: string): string => {
    const now = new Date()
    const updateTime = new Date(timestamp)
    const diffMs = now.getTime() - updateTime.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes === 1) return '1 minute ago'
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    
    return updateTime.toLocaleDateString()
  }

  const generateDashboardTitle = (role: UserRole): string => {
    const titleMap: Record<UserRole, string> = {
      'super_admin': 'System Administrator Dashboard',
      'grak_admin': 'GRAK Regulatory Dashboard',
      'grak_officer': 'GRAK Operations Dashboard',
      'grak_auditor': 'GRAK Audit Dashboard',
      'operator_admin': 'Operator Management Dashboard',
      'operator_user': 'Operator Dashboard',
      'bematore_admin': 'Bematore Executive Dashboard',
      'bematore_analyst': 'Bematore Analytics Dashboard',
      'citizen': 'My Self-Exclusion Portal',
      'api_user': 'API Integration Dashboard'
    }
    return titleMap[role] || 'Dashboard'
  }

  const getQuickActions = (role: UserRole): Array<{
    label: string
    action: string
    icon: string
    color: string
  }> => {
    const baseActions = [
      { label: 'View Profile', action: 'profile', icon: 'user', color: 'blue' },
      { label: 'Settings', action: 'settings', icon: 'settings', color: 'gray' },
    ]

    const roleSpecificActions: Record<UserRole, Array<{
      label: string
      action: string
      icon: string
      color: string
    }>> = {
      'super_admin': [
        { label: 'System Health', action: 'monitoring', icon: 'activity', color: 'green' },
        { label: 'User Management', action: 'users', icon: 'users', color: 'blue' },
        { label: 'Compliance', action: 'compliance', icon: 'shield', color: 'red' },
      ],
      'grak_admin': [
        { label: 'Exclusions', action: 'exclusions', icon: 'ban', color: 'red' },
        { label: 'Operators', action: 'operators', icon: 'building', color: 'blue' },
        { label: 'Analytics', action: 'analytics', icon: 'chart', color: 'green' },
      ],
      'grak_officer': [
        { label: 'Exclusions', action: 'exclusions', icon: 'ban', color: 'red' },
        { label: 'Assessments', action: 'assessments', icon: 'clipboard', color: 'yellow' },
      ],
      'grak_auditor': [
        { label: 'Audit Logs', action: 'compliance', icon: 'shield', color: 'red' },
        { label: 'Reports', action: 'reports', icon: 'file', color: 'blue' },
      ],
      'operator_admin': [
        { label: 'API Keys', action: 'api-keys', icon: 'key', color: 'yellow' },
        { label: 'Compliance', action: 'compliance', icon: 'shield', color: 'green' },
        { label: 'Integration', action: 'integration', icon: 'link', color: 'blue' },
      ],
      'operator_user': [
        { label: 'Lookup User', action: 'lookup', icon: 'search', color: 'blue' },
        { label: 'Assessments', action: 'assessments', icon: 'clipboard', color: 'yellow' },
      ],
      'bematore_admin': [
        { label: 'Analytics', action: 'analytics', icon: 'chart', color: 'green' },
        { label: 'Monitoring', action: 'monitoring', icon: 'activity', color: 'blue' },
        { label: 'Financial', action: 'settlements', icon: 'dollar', color: 'yellow' },
      ],
      'bematore_analyst': [
        { label: 'Analytics', action: 'analytics', icon: 'chart', color: 'green' },
        { label: 'Reports', action: 'reports', icon: 'file', color: 'blue' },
      ],
      'citizen': [
        { label: 'Self-Exclude', action: 'self-exclude', icon: 'ban', color: 'red' },
        { label: 'Take Assessment', action: 'assessment', icon: 'clipboard', color: 'yellow' },
        { label: 'Check Status', action: 'status', icon: 'search', color: 'blue' },
      ],
      'api_user': [
        { label: 'API Docs', action: 'api-docs', icon: 'book', color: 'blue' },
        { label: 'Usage Stats', action: 'usage', icon: 'chart', color: 'green' },
      ],
    }

    return [...(roleSpecificActions[role] || []), ...baseActions]
  }

  const getPriorityAlerts = (role: UserRole): string[] => {
    const alertTypes: Record<UserRole, string[]> = {
      'super_admin': ['system_down', 'security_breach', 'data_corruption', 'performance_degraded'],
      'grak_admin': ['compliance_violation', 'exclusion_breach', 'operator_non_compliance'],
      'grak_officer': ['exclusion_expired', 'assessment_overdue', 'propagation_failed'],
      'grak_auditor': ['unauthorized_access', 'data_modification', 'policy_violation'],
      'operator_admin': ['api_key_compromised', 'integration_failure', 'webhook_timeout'],
      'operator_user': ['rate_limit_exceeded', 'authentication_failure'],
      'bematore_admin': ['revenue_anomaly', 'system_performance', 'ml_model_drift'],
      'bematore_analyst': ['data_quality_issue', 'report_generation_failed'],
      'citizen': ['exclusion_reminder', 'assessment_due', 'security_alert'],
      'api_user': ['api_quota_exceeded', 'authentication_failure'],
    }
    
    return alertTypes[role] || []
  }

  return {
    formatKPIValue,
    calculateTrendPercentage,
    getKPIColor,
    formatLastUpdate,
    generateDashboardTitle,
    getQuickActions,
    getPriorityAlerts,
  }
}

// Dashboard layout management hook
export function useDashboardLayout() {
  const queryClient = useQueryClient()

  const saveDashboardLayoutMutation = useMutation({
    mutationFn: async (layoutData: {
      layout_name?: string
      widgets: Array<{
        widget_type: string
        position: { x: number; y: number }
        size: { width: number; height: number }
        config?: Record<string, any>
      }>
    }) => {
      const result = await api.dashboards.saveLayout(layoutData)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-dashboard'] })
      toast.success('Dashboard layout saved successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to save dashboard layout'
      toast.error(message)
    }
  })

  const resetDashboardLayoutMutation = useMutation({
    mutationFn: async () => {
      const result = await api.post('/dashboards/layouts/reset/')
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-dashboard'] })
      toast.success('Dashboard layout reset to default')
    }
  })

  return {
    saveDashboardLayout: saveDashboardLayoutMutation.mutate,
    resetDashboardLayout: resetDashboardLayoutMutation.mutate,
    isSaving: saveDashboardLayoutMutation.isPending,
    isResetting: resetDashboardLayoutMutation.isPending,
  }
}

// Combined dashboard data hook for comprehensive overview
export function useCombinedDashboardData() {
  const { user } = useAuthStore()
  const dashboardType = user?.role?.includes('grak') ? 'grak' : 
                       user?.role?.includes('operator') ? 'operator' : 
                       user?.role?.includes('bematore') ? 'bematore' : 'citizen'

  return useQuery({
    queryKey: ['combined-dashboard-data', dashboardType],
    queryFn: async () => {
      // Get role-appropriate data
      const basePromises = [
        api.analytics.realtime(),
        api.monitoring.health(),
      ]

      let specificPromises: Promise<any>[] = []

      switch (dashboardType) {
        case 'grak':
          specificPromises = [
            api.analytics.grakDashboard(),
            api.get('/operators/compliance/overview/'),
            api.nser.statistics(),
          ]
          break
          
        case 'operator':
          specificPromises = [
            api.analytics.operatorDashboard(),
            api.get('/operators/statistics/'),
            api.get('/settlements/statistics/'),
          ]
          break
          
        case 'bematore':
          specificPromises = [
            api.analytics.dashboard(),
            api.get('/analytics/performance/system/'),
            api.settlements.statistics(),
          ]
          break
          
        case 'citizen':
          specificPromises = [
            api.nser.myExclusions(),
            api.screening.myRiskProfile(),
            api.screening.myAssessments(),
          ]
          break
      }

      const [realtime, health, ...specific] = await Promise.all([
        ...basePromises,
        ...specificPromises
      ])

      return {
        dashboardType,
        realtime: realtime.data,
        health: health.data,
        specific: specific.map(p => p.data),
      }
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  })
}
