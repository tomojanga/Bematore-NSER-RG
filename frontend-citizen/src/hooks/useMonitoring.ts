import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { 
  SystemHealth,
  APIRequestLog,
  Alert,
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

// System health monitoring hook
export function useSystemHealth() {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const { data } = await api.monitoring.health().catch(() => ({ data: null }))
      return data as SingleApiResponse<SystemHealth>
    },
    refetchInterval: 10000,
    staleTime: 5000,
    retry: false,
  })
}

// Detailed health check hook
export function useDetailedHealthCheck() {
  return useQuery({
    queryKey: ['detailed-health-check'],
    queryFn: async () => {
      const { data } = await api.monitoring.detailed()
      return data
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
  })
}

// System status hook
export function useSystemStatus() {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const { data } = await api.monitoring.systemStatus()
      return data
    },
    refetchInterval: 15000, // 15 seconds
    staleTime: 7500,
  })
}

// Services status hook
export function useServicesStatus() {
  return useQuery({
    queryKey: ['services-status'],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/status/services/')
      return data
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
  })
}

// Dependencies status hook  
export function useDependenciesStatus() {
  return useQuery({
    queryKey: ['dependencies-status'],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/status/dependencies/')
      return data
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  })
}

// System metrics hook
export function useSystemMetrics() {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const { data } = await api.monitoring.metrics()
      return data
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
  })
}

// Application metrics hook
export function useApplicationMetrics() {
  return useQuery({
    queryKey: ['application-metrics'],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/metrics/application/')
      return data
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
  })
}

// Database metrics hook
export function useDatabaseMetrics() {
  return useQuery({
    queryKey: ['database-metrics'],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/metrics/database/')
      return data
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  })
}

// Cache metrics hook
export function useCacheMetrics() {
  return useQuery({
    queryKey: ['cache-metrics'],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/metrics/cache/')
      return data
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
  })
}

// API request logs hook
export function useAPIRequestLogs(params?: PaginatedParams & {
  status_code?: number
  method?: string
  path?: string
  user_id?: string
  operator_id?: string
  error_only?: boolean
}) {
  return useQuery({
    queryKey: ['api-request-logs', params],
    queryFn: async () => {
      const { data } = await api.monitoring.apiLogs(params)
      return data as ApiResponse<APIRequestLog>
    },
    staleTime: 30000,
  })
}

// Search API logs hook
export function useSearchAPILogs() {
  return useMutation({
    mutationFn: async (data: {
      query?: string
      filters?: {
        method?: string
        status_code?: number
        response_time_min?: number
        response_time_max?: number
        date_from?: string
        date_to?: string
      }
    }) => {
      const result = await api.get('/monitoring/api-logs/search/', { params: data })
      return result.data as ApiResponse<APIRequestLog>
    }
  })
}

// Error logs hook
export function useErrorLogs(params?: PaginatedParams) {
  return useQuery({
    queryKey: ['error-logs', params],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/api-logs/errors/', { params })
      return data as ApiResponse<APIRequestLog>
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  })
}

// Slow API requests hook
export function useSlowAPIRequests(params?: PaginatedParams) {
  return useQuery({
    queryKey: ['slow-api-requests', params],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/api-logs/slow/', { params })
      return data as ApiResponse<APIRequestLog>
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })
}

// Performance metrics hook
export function usePerformanceMetrics() {
  return useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const [responseTime, throughput, errorRate, slowQueries] = await Promise.all([
        api.get('/monitoring/performance/response-times/'),
        api.get('/monitoring/performance/throughput/'),
        api.get('/monitoring/performance/errors/'),
        api.get('/monitoring/performance/slow-queries/')
      ])
      
      return {
        responseTime: responseTime.data,
        throughput: throughput.data,
        errorRate: errorRate.data,
        slowQueries: slowQueries.data,
      }
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  })
}

// Alerts management hook
export function useAlerts(params?: PaginatedParams & {
  severity?: string
  status?: string
  alert_type?: string
}) {
  const queryClient = useQueryClient()

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', params],
    queryFn: async () => {
      const { data } = await api.monitoring.alerts(params)
      return data as ApiResponse<Alert>
    },
    staleTime: 30000,
  })

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (data: {
      id: string
      acknowledgment_note?: string
    }) => {
      const { id, ...ackData } = data
      const result = await api.monitoring.acknowledgeAlert(id)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert acknowledged')
    }
  })

  const resolveAlertMutation = useMutation({
    mutationFn: async (data: {
      id: string
      resolution_note?: string
    }) => {
      const { id, ...resolveData } = data
      const result = await api.post(`/monitoring/alerts/${id}/resolve/`, resolveData)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert resolved')
    }
  })

  const triggerAlertMutation = useMutation({
    mutationFn: async (data: {
      alert_type: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      title: string
      message: string
      source?: string
      metadata?: Record<string, any>
    }) => {
      const result = await api.post('/monitoring/alerts/trigger/', data)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.info('Alert triggered')
    }
  })

  return {
    alerts: alerts?.results || [],
    totalAlerts: alerts?.count || 0,
    isLoading,
    acknowledgeAlert: acknowledgeAlertMutation.mutate,
    resolveAlert: resolveAlertMutation.mutate,
    triggerAlert: triggerAlertMutation.mutate,
    isAcknowledging: acknowledgeAlertMutation.isPending,
    isResolving: resolveAlertMutation.isPending,
    isTriggering: triggerAlertMutation.isPending,
  }
}

// Active alerts hook
export function useActiveAlerts() {
  return useQuery({
    queryKey: ['active-alerts'],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/alerts/active/').catch(() => ({ data: { results: [] } }))
      return data as ApiResponse<Alert>
    },
    refetchInterval: 15000,
    staleTime: 7500,
    retry: false,
  })
}

// Resource usage hook
export function useResourceUsage() {
  return useQuery({
    queryKey: ['resource-usage'],
    queryFn: async () => {
      const [cpu, memory, disk, network] = await Promise.all([
        api.get('/monitoring/resources/cpu/'),
        api.get('/monitoring/resources/memory/'),
        api.get('/monitoring/resources/disk/'),
        api.get('/monitoring/resources/network/')
      ])
      
      return {
        cpu: cpu.data,
        memory: memory.data,
        disk: disk.data,
        network: network.data,
      }
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
  })
}

// Uptime and availability hook
export function useUptimeMetrics() {
  return useQuery({
    queryKey: ['uptime-metrics'],
    queryFn: async () => {
      const [uptime, availability, sla] = await Promise.all([
        api.get('/monitoring/uptime/'),
        api.get('/monitoring/availability/'),
        api.get('/monitoring/sla/')
      ])
      
      return {
        uptime: uptime.data,
        availability: availability.data,
        sla: sla.data,
      }
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 120000,
  })
}

// API log statistics hook
export function useAPILogStatistics(period: string = '24h') {
  return useQuery({
    queryKey: ['api-log-statistics', period],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/api-logs/statistics/', {
        params: { period }
      })
      return data
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })
}

// Service discovery hook
export function useRegisteredServices() {
  return useQuery({
    queryKey: ['registered-services'],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/services/')
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// Individual service health hook
export function useServiceHealth(serviceName: string) {
  return useQuery({
    queryKey: ['service-health', serviceName],
    queryFn: async () => {
      const { data } = await api.get(`/monitoring/services/${serviceName}/health/`)
      return data
    },
    enabled: !!serviceName,
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
  })
}

// Monitoring helpers
export function useMonitoringHelpers() {
  const formatHealthStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'healthy': 'Healthy',
      'degraded': 'Degraded',
      'down': 'Down',
      'unknown': 'Unknown'
    }
    return statusMap[status] || status
  }

  const getHealthStatusColor = (status: string): 'green' | 'yellow' | 'red' | 'gray' => {
    const colorMap: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
      'healthy': 'green',
      'degraded': 'yellow',
      'down': 'red',
      'unknown': 'gray'
    }
    return colorMap[status] || 'gray'
  }

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 3600))
    const hours = Math.floor((seconds % (24 * 3600)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatResponseTime = (timeMs: number): string => {
    if (timeMs < 1) return '<1ms'
    if (timeMs < 1000) return `${Math.round(timeMs)}ms`
    if (timeMs < 60000) return `${Math.round(timeMs / 1000 * 10) / 10}s`
    return `${Math.round(timeMs / 60000)}m`
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 10) / 10} ${sizes[i]}`
  }

  const formatUsagePercentage = (percentage: number): {
    formatted: string
    color: 'green' | 'yellow' | 'orange' | 'red'
    level: 'low' | 'medium' | 'high' | 'critical'
  } => {
    const formatted = `${Math.round(percentage * 10) / 10}%`
    
    let color: 'green' | 'yellow' | 'orange' | 'red'
    let level: 'low' | 'medium' | 'high' | 'critical'
    
    if (percentage >= 90) {
      color = 'red'
      level = 'critical'
    } else if (percentage >= 75) {
      color = 'orange'
      level = 'high'
    } else if (percentage >= 50) {
      color = 'yellow'
      level = 'medium'
    } else {
      color = 'green'
      level = 'low'
    }
    
    return { formatted, color, level }
  }

  const formatHTTPMethod = (method: string): string => {
    const methodColors: Record<string, string> = {
      'GET': 'text-blue-600',
      'POST': 'text-green-600',
      'PUT': 'text-yellow-600',
      'PATCH': 'text-orange-600',
      'DELETE': 'text-red-600'
    }
    return methodColors[method] || 'text-gray-600'
  }

  const formatStatusCode = (code: number): {
    formatted: string
    color: 'green' | 'blue' | 'yellow' | 'red'
    category: 'success' | 'redirect' | 'client_error' | 'server_error'
  } => {
    let color: 'green' | 'blue' | 'yellow' | 'red'
    let category: 'success' | 'redirect' | 'client_error' | 'server_error'
    
    if (code >= 200 && code < 300) {
      color = 'green'
      category = 'success'
    } else if (code >= 300 && code < 400) {
      color = 'blue'
      category = 'redirect'
    } else if (code >= 400 && code < 500) {
      color = 'yellow'
      category = 'client_error'
    } else {
      color = 'red'
      category = 'server_error'
    }
    
    return {
      formatted: String(code),
      color,
      category,
    }
  }

  const calculateErrorRate = (totalRequests: number, errorCount: number): number => {
    if (totalRequests === 0) return 0
    return (errorCount / totalRequests) * 100
  }

  const calculateAvailability = (uptime: number, totalTime: number): number => {
    if (totalTime === 0) return 100
    return (uptime / totalTime) * 100
  }

  const formatAlertSeverity = (severity: string): string => {
    const severityMap: Record<string, string> = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'critical': 'Critical'
    }
    return severityMap[severity] || severity
  }

  const getAlertSeverityColor = (severity: string): 'gray' | 'blue' | 'yellow' | 'red' => {
    const colorMap: Record<string, 'gray' | 'blue' | 'yellow' | 'red'> = {
      'low': 'gray',
      'medium': 'blue',
      'high': 'yellow',
      'critical': 'red'
    }
    return colorMap[severity] || 'gray'
  }

  return {
    formatHealthStatus,
    getHealthStatusColor,
    formatUptime,
    formatResponseTime,
    formatFileSize,
    formatUsagePercentage,
    formatHTTPMethod,
    formatStatusCode,
    calculateErrorRate,
    calculateAvailability,
    formatAlertSeverity,
    getAlertSeverityColor,
  }
}

// Real-time monitoring dashboard hook
export function useRealTimeMonitoring() {
  return useQuery({
    queryKey: ['realtime-monitoring'],
    queryFn: async () => {
      const [health, metrics, alerts] = await Promise.all([
        api.monitoring.health(),
        api.monitoring.metrics(),
        api.get('/monitoring/alerts/active/')
      ])
      
      return {
        health: health.data,
        metrics: metrics.data,
        alerts: alerts.data,
      }
    },
    refetchInterval: 5000, // 5 seconds for real-time
    staleTime: 2500,
  })
}

// Prometheus metrics hook (if exposed)
export function usePrometheusMetrics() {
  return useQuery({
    queryKey: ['prometheus-metrics'],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/metrics/prometheus/')
      return data
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
  })
}

// Log analysis hook
export function useLogAnalysis(period: string = '1h') {
  return useQuery({
    queryKey: ['log-analysis', period],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/logs/analysis/', {
        params: { period }
      })
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

// System notifications hook (different from user notifications)
export function useSystemNotifications() {
  const queryClient = useQueryClient()

  const { data: systemNotifications } = useQuery({
    queryKey: ['system-notifications'],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/notifications/system/')
      return data
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  })

  const dismissSystemNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await api.post(`/monitoring/notifications/system/${id}/dismiss/`)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-notifications'] })
    }
  })

  return {
    systemNotifications: systemNotifications?.results || [],
    dismissSystemNotification: dismissSystemNotificationMutation.mutate,
    isDismissing: dismissSystemNotificationMutation.isPending,
  }
}
