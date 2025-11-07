import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { 
  DashboardStats,
  ExclusionTrend,
  RiskDistribution,
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

// Main analytics dashboard hook
export function useAnalyticsDashboard(dashboardType: 'main' | 'grak' | 'operator' = 'main') {
  return useQuery({
    queryKey: ['analytics-dashboard', dashboardType],
    queryFn: async () => {
      let endpoint = '/analytics/dashboard/'
      
      if (dashboardType === 'grak') {
        endpoint = '/analytics/dashboard/grak/'
      } else if (dashboardType === 'operator') {
        endpoint = '/analytics/dashboard/operator/'
      }
      
      const { data } = await api.get(endpoint)
      return data as SingleApiResponse<DashboardStats>
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  })
}

// Real-time statistics hook
export function useRealTimeStats() {
  return useQuery({
    queryKey: ['realtime-stats'],
    queryFn: async () => {
      const { data } = await api.analytics.realtime()
      return data
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time
    staleTime: 2000,
  })
}

// Real-time exclusions hook
export function useRealTimeExclusions() {
  return useQuery({
    queryKey: ['realtime-exclusions'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/realtime/exclusions/')
      return data
    },
    refetchInterval: 10000, // 10 seconds
    staleTime: 5000,
  })
}

// Real-time screenings hook
export function useRealTimeScreenings() {
  return useQuery({
    queryKey: ['realtime-screenings'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/realtime/screenings/')
      return data
    },
    refetchInterval: 10000, // 10 seconds
    staleTime: 5000,
  })
}

// Exclusion trends hook
export function useExclusionTrends(period: 'week' | 'month' | 'quarter' = 'month') {
  return useQuery({
    queryKey: ['exclusion-trends', period],
    queryFn: async () => {
      const { data } = await api.analytics.exclusionTrends({ period })
      return data as SingleApiResponse<ExclusionTrend[]>
    },
    staleTime: 300000, // 5 minutes
  })
}

// Risk trends hook
export function useRiskTrends(period: 'week' | 'month' | 'quarter' = 'month') {
  return useQuery({
    queryKey: ['risk-trends', period],
    queryFn: async () => {
      const { data } = await api.analytics.riskTrends({ period })
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// Compliance trends hook
export function useComplianceTrends(period: 'week' | 'month' | 'quarter' = 'month') {
  return useQuery({
    queryKey: ['compliance-trends', period],
    queryFn: async () => {
      const { data } = await api.get('/analytics/trends/compliance/', {
        params: { period }
      })
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// User growth analytics hook
export function useUserGrowthAnalytics(period: string = '90d') {
  return useQuery({
    queryKey: ['user-growth-analytics', period],
    queryFn: async () => {
      const { data } = await api.analytics.userGrowth({ period })
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// Risk distribution hook
export function useRiskDistributionAnalytics() {
  return useQuery({
    queryKey: ['risk-distribution-analytics'],
    queryFn: async () => {
      const { data } = await api.analytics.riskDistribution()
      return data as SingleApiResponse<RiskDistribution>
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 60000,
  })
}

// User demographics hook
export function useUserDemographics() {
  return useQuery({
    queryKey: ['user-demographics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/users/demographics/')
      return data
    },
    staleTime: 600000, // 10 minutes
  })
}

// User engagement hook
export function useUserEngagement(period: string = '30d') {
  return useQuery({
    queryKey: ['user-engagement', period],
    queryFn: async () => {
      const { data } = await api.get('/analytics/users/engagement/', {
        params: { period }
      })
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// Operator performance analytics hook
export function useOperatorPerformanceAnalytics() {
  return useQuery({
    queryKey: ['operator-performance-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/operators/performance/')
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// Operator compliance scores hook
export function useOperatorComplianceScores() {
  return useQuery({
    queryKey: ['operator-compliance-scores'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/operators/compliance-scores/')
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// High-risk users analytics hook
export function useHighRiskUsersAnalytics() {
  return useQuery({
    queryKey: ['high-risk-users-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/risk/high-risk-users/')
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 120000,
  })
}

// Reports management hook
export function useReports(params?: PaginatedParams) {
  const queryClient = useQueryClient()

  const { data: reports, isLoading } = useQuery({
    queryKey: ['analytics-reports', params],
    queryFn: async () => {
      const { data } = await api.get('/analytics/reports/', { params })
      return data
    },
    staleTime: 60000, // 1 minute
  })

  // Generate monthly report
  const generateMonthlyReportMutation = useMutation({
    mutationFn: async (data: {
      year: number
      month: number
      include_charts?: boolean
      operator_id?: string
    }) => {
      const result = await api.post('/analytics/reports/generate/monthly/', data)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports'] })
      toast.success('Monthly report generated successfully')
      
      // Auto-download if file URL provided
      if (response.data?.file_url) {
        window.open(response.data.file_url, '_blank')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate monthly report'
      toast.error(message)
    }
  })

  // Generate quarterly report
  const generateQuarterlyReportMutation = useMutation({
    mutationFn: async (data: {
      year: number
      quarter: number
      include_forecasts?: boolean
      operator_id?: string
    }) => {
      const result = await api.post('/analytics/reports/generate/quarterly/', data)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports'] })
      toast.success('Quarterly report generated successfully')
      
      if (response.data?.file_url) {
        window.open(response.data.file_url, '_blank')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate quarterly report'
      toast.error(message)
    }
  })

  // Generate annual report
  const generateAnnualReportMutation = useMutation({
    mutationFn: async (data: {
      year: number
      include_forecasts?: boolean
      include_benchmarks?: boolean
    }) => {
      const result = await api.post('/analytics/reports/generate/annual/', data)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports'] })
      toast.success('Annual report generated successfully')
      
      if (response.data?.file_url) {
        window.open(response.data.file_url, '_blank')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate annual report'
      toast.error(message)
    }
  })

  // Generate custom report
  const generateCustomReportMutation = useMutation({
    mutationFn: async (data: {
      title: string
      date_from: string
      date_to: string
      metrics: string[]
      filters?: Record<string, any>
      format?: 'pdf' | 'excel' | 'csv'
    }) => {
      const result = await api.post('/analytics/reports/generate/custom/', data)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports'] })
      toast.success('Custom report generated successfully')
      
      if (response.data?.file_url) {
        window.open(response.data.file_url, '_blank')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate custom report'
      toast.error(message)
    }
  })

  return {
    reports: reports?.results || [],
    totalReports: reports?.count || 0,
    isLoading,
    generateMonthlyReport: generateMonthlyReportMutation.mutate,
    generateQuarterlyReport: generateQuarterlyReportMutation.mutate,
    generateAnnualReport: generateAnnualReportMutation.mutate,
    generateCustomReport: generateCustomReportMutation.mutate,
    isGeneratingMonthly: generateMonthlyReportMutation.isPending,
    isGeneratingQuarterly: generateQuarterlyReportMutation.isPending,
    isGeneratingAnnual: generateAnnualReportMutation.isPending,
    isGeneratingCustom: generateCustomReportMutation.isPending,
  }
}

// Data export hook
export function useDataExport() {
  const exportMutation = useMutation({
    mutationFn: async (data: {
      export_type: 'csv' | 'excel' | 'pdf'
      data_source: 'users' | 'exclusions' | 'operators' | 'assessments' | 'transactions'
      filters?: Record<string, any>
      date_from?: string
      date_to?: string
      columns?: string[]
    }) => {
      let endpoint = '/analytics/export/csv/'
      
      if (data.export_type === 'excel') {
        endpoint = '/analytics/export/excel/'
      } else if (data.export_type === 'pdf') {
        endpoint = '/analytics/export/pdf/'
      }
      
      const result = await api.post(endpoint, data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success('Export completed successfully')
      
      // Auto-download file
      if (response.data?.file_url) {
        const link = document.createElement('a')
        link.href = response.data.file_url
        link.download = response.data.filename || `export_${Date.now()}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Export failed'
      toast.error(message)
    }
  })

  return {
    exportData: exportMutation.mutate,
    isExporting: exportMutation.isPending,
    exportResult: exportMutation.data,
  }
}

// Daily statistics hook
export function useDailyStatistics(params?: {
  date_from?: string
  date_to?: string
  operator_id?: string
}) {
  return useQuery({
    queryKey: ['daily-statistics', params],
    queryFn: async () => {
      const { data } = await api.get('/analytics/daily-statistics/', { params })
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// Operator statistics hook
export function useOperatorStatisticsAnalytics(operatorId?: string) {
  return useQuery({
    queryKey: ['operator-statistics-analytics', operatorId],
    queryFn: async () => {
      const params = operatorId ? { operator_id: operatorId } : {}
      const { data } = await api.get('/analytics/operator-statistics/', { params })
      return data
    },
    enabled: true,
    staleTime: 300000, // 5 minutes
  })
}

// Performance metrics hook
export function usePerformanceMetrics() {
  return useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const [api_metrics, system_metrics] = await Promise.all([
        api.get('/analytics/performance/api/'),
        api.get('/analytics/performance/system/')
      ])
      
      return {
        api: api_metrics.data,
        system: system_metrics.data,
      }
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })
}

// Geographic analytics hook
export function useGeographicAnalytics() {
  return useQuery({
    queryKey: ['geographic-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/geographic/distribution/')
      return data
    },
    staleTime: 600000, // 10 minutes
  })
}

// Time-based analytics hook
export function useTimeBasedAnalytics(period: 'hour' | 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: ['time-based-analytics', period],
    queryFn: async () => {
      const { data } = await api.get('/analytics/time-based/', {
        params: { period }
      })
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// Cohort analysis hook
export function useCohortAnalysis(cohortType: 'monthly' | 'quarterly' = 'monthly') {
  return useQuery({
    queryKey: ['cohort-analysis', cohortType],
    queryFn: async () => {
      const { data } = await api.get('/analytics/cohort/', {
        params: { type: cohortType }
      })
      return data
    },
    staleTime: 600000, // 10 minutes
  })
}

// Funnel analysis hook
export function useFunnelAnalysis() {
  return useQuery({
    queryKey: ['funnel-analysis'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/funnel/')
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// Revenue analytics hook
export function useRevenueAnalytics(period: string = '90d') {
  return useQuery({
    queryKey: ['revenue-analytics', period],
    queryFn: async () => {
      const { data } = await api.get('/analytics/revenue/', {
        params: { period }
      })
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// Predictive analytics hook
export function usePredictiveAnalytics() {
  return useQuery({
    queryKey: ['predictive-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/predictions/')
      return data
    },
    staleTime: 900000, // 15 minutes
  })
}

// Custom analytics query hook
export function useCustomAnalytics() {
  return useMutation({
    mutationFn: async (data: {
      query_type: string
      metrics: string[]
      dimensions: string[]
      filters?: Record<string, any>
      date_from: string
      date_to: string
      group_by?: string
    }) => {
      const result = await api.post('/analytics/custom-query/', data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success('Custom analytics query completed')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Custom query failed'
      toast.error(message)
    }
  })
}

// Analytics helpers and formatters
export function useAnalyticsHelpers() {
  const formatTrend = (current: number, previous: number): {
    percentage: number
    direction: 'up' | 'down' | 'neutral'
    color: 'green' | 'red' | 'gray'
  } => {
    if (previous === 0) {
      return { percentage: 0, direction: 'neutral', color: 'gray' }
    }
    
    const percentage = ((current - previous) / previous) * 100
    const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral'
    const color = percentage > 0 ? 'green' : percentage < 0 ? 'red' : 'gray'
    
    return {
      percentage: Math.abs(Math.round(percentage * 10) / 10),
      direction,
      color,
    }
  }

  const formatMetricValue = (value: number, type: 'number' | 'percentage' | 'currency' | 'time'): string => {
    switch (type) {
      case 'number':
        return new Intl.NumberFormat('en-KE').format(value)
      case 'percentage':
        return `${Math.round(value * 10) / 10}%`
      case 'currency':
        return new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES'
        }).format(value)
      case 'time':
        if (value < 1000) return `${Math.round(value)}ms`
        if (value < 60000) return `${Math.round(value / 1000 * 10) / 10}s`
        return `${Math.round(value / 60000)}m`
      default:
        return String(value)
    }
  }

  const calculateGrowthRate = (data: Array<{ date: string; value: number }>): number => {
    if (data.length < 2) return 0
    
    const first = data[0].value
    const last = data[data.length - 1].value
    
    if (first === 0) return 0
    return ((last - first) / first) * 100
  }

  const getHealthStatus = (value: number, thresholds: {
    excellent: number
    good: number
    fair: number
  }): {
    status: 'excellent' | 'good' | 'fair' | 'poor'
    color: 'green' | 'yellow' | 'orange' | 'red'
  } => {
    if (value >= thresholds.excellent) {
      return { status: 'excellent', color: 'green' }
    } else if (value >= thresholds.good) {
      return { status: 'good', color: 'green' }
    } else if (value >= thresholds.fair) {
      return { status: 'fair', color: 'yellow' }
    } else {
      return { status: 'poor', color: 'red' }
    }
  }

  const formatPeriod = (period: string): string => {
    const periodMap: Record<string, string> = {
      'hour': 'Last Hour',
      'day': 'Last 24 Hours',
      'week': 'Last 7 Days',
      'month': 'Last 30 Days',
      'quarter': 'Last 90 Days',
      'year': 'Last 365 Days'
    }
    return periodMap[period] || period
  }

  const generateColors = (count: number): string[] => {
    const baseColors = [
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
      '#6366F1', // Indigo
    ]
    
    // Repeat colors if needed
    const colors = []
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length])
    }
    
    return colors
  }

  const formatDateRange = (from: string, to: string): string => {
    const fromDate = new Date(from)
    const toDate = new Date(to)
    
    const formatter = new Intl.DateTimeFormat('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    
    return `${formatter.format(fromDate)} - ${formatter.format(toDate)}`
  }

  const calculateAverage = (values: number[]): number => {
    if (values.length === 0) return 0
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }

  const findPercentile = (values: number[], percentile: number): number => {
    if (values.length === 0) return 0
    
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    
    return sorted[Math.max(0, index)]
  }

  return {
    formatTrend,
    formatMetricValue,
    calculateGrowthRate,
    getHealthStatus,
    formatPeriod,
    generateColors,
    formatDateRange,
    calculateAverage,
    findPercentile,
  }
}

// Combined analytics dashboard hook for all portals
export function useCombinedAnalytics(dashboardType: 'citizen' | 'operator' | 'grak' | 'bematore' = 'grak') {
  return useQuery({
    queryKey: ['combined-analytics', dashboardType],
    queryFn: async () => {
      const endpoints = {
        dashboard: dashboardType === 'grak' ? '/analytics/dashboard/grak/' : 
                  dashboardType === 'operator' ? '/analytics/dashboard/operator/' :
                  '/analytics/dashboard/',
        realtime: '/analytics/realtime/',
        exclusions: '/analytics/realtime/exclusions/',
        screenings: '/analytics/realtime/screenings/',
      }
      
      const [dashboard, realtime, exclusions, screenings] = await Promise.all([
        api.get(endpoints.dashboard),
        api.get(endpoints.realtime),
        api.get(endpoints.exclusions),
        api.get(endpoints.screenings),
      ])
      
      return {
        dashboard: dashboard.data,
        realtime: realtime.data,
        exclusions: exclusions.data,
        screenings: screenings.data,
      }
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  })
}