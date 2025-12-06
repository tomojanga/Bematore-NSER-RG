import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

interface EnhancedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: { requestId: number; startTime: number }
  _retry?: boolean
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  timeout: 30000,
  withCredentials: false,
})

let requestId = 0

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const enhancedConfig = config as EnhancedAxiosRequestConfig
  enhancedConfig.metadata = { requestId: ++requestId, startTime: performance.now() }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('grak_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return enhancedConfig
})

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as EnhancedAxiosRequestConfig
    const status = error.response?.status

    // Skip token refresh for public endpoints
    const publicEndpoints = ['/auth/login/', '/auth/token/', '/auth/password/reset/']
    const isPublicEndpoint = publicEndpoints.some(endpoint => originalRequest.url?.includes(endpoint))

    if (status === 401 && !originalRequest._retry && typeof window !== 'undefined' && !isPublicEndpoint) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('grak_refresh')
      
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'}/auth/token/refresh/`,
            { refresh: refreshToken }
          )
          localStorage.setItem('grak_token', data.access)
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access}`
          }
          return apiClient(originalRequest)
        } catch {
          localStorage.removeItem('grak_token')
          localStorage.removeItem('grak_refresh')
          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login'
          }
        }
      }
    }

    return Promise.reject(error)
  }
)

export const api = {
  get: <T = any>(url: string, config?: any) => apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: any) => apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => apiClient.delete<T>(url, config),

  auth: {
    login: (credentials: any) => api.post('/auth/login/', credentials),
    logout: () => api.post('/auth/logout/'),
    refreshToken: (refreshToken: string) => api.post('/auth/token/refresh/', { refresh: refreshToken }),
  },

  users: {
    me: () => api.get('/users/me/'),
    list: (params?: any) => api.get('/users/', { params }),
    search: (params: any) => api.get('/users/search/', { params }),
    statistics: () => api.get('/users/statistics/'),
  },

  bst: {
    tokens: (params?: any) => api.get('/bst/tokens/', { params }),
    getToken: (id: string) => api.get(`/bst/tokens/${id}/`),
    generate: (data: any) => api.post('/bst/generate/', data),
    bulkGenerate: (data: any) => api.post('/bst/generate/bulk/', data),
    validate: (token: string, operatorId?: string) => api.post('/bst/validate/', { token, operator_id: operatorId }),
    bulkValidate: (tokens: string[], operatorId?: string) => api.post('/bst/validate/bulk/', { tokens, operator_id: operatorId }),
    lookup: (data: any) => api.post('/bst/lookup/', data),
    lookupUser: (token: string) => api.post('/bst/lookup/user/', { token }),
    rotate: (id: string, data: any) => api.post(`/bst/tokens/${id}/rotate/`, data),
    compromise: (id: string, data: any) => api.post(`/bst/tokens/${id}/compromise/`, data),
    deactivate: (id: string) => api.post(`/bst/tokens/${id}/deactivate/`),
    detectDuplicates: (data: any) => api.post('/bst/cross-reference/detect/', data),
    fraudCheck: (data: any) => api.post('/bst/fraud/check/', data),
    statistics: () => api.get('/bst/statistics/'),
  },

  nser: {
    exclusions: (params?: any) => api.get('/nser/exclusions/', { params }),
    getExclusion: (id: string) => api.get(`/nser/exclusions/${id}/`),
    register: (data: any) => api.post('/nser/register/', data),
    lookup: (data: any) => api.post('/nser/lookup/', data),
    bulkLookup: (data: any) => api.post('/nser/lookup/bulk/', data),
    bstLookup: (token: string) => api.post('/nser/lookup/bst/', { token }),
    activate: (id: string) => api.post(`/nser/exclusions/${id}/activate/`),
    terminate: (id: string, data: any) => api.post(`/nser/exclusions/${id}/terminate/`, data),
    extend: (id: string, data: any) => api.post(`/nser/exclusions/${id}/extend/`, data),
    propagate: (id: string) => api.post(`/nser/exclusions/${id}/propagate/`),
    propagationStatus: (id: string) => api.get(`/nser/exclusions/${id}/propagation-status/`),
    statistics: () => api.get('/nser/statistics/'),
  },

  screening: {
    sessions: (params?: any) => api.get('/screening/sessions/', { params }),
    getSession: (id: string) => api.get(`/screening/sessions/${id}/`),
    start: (data: any) => api.post('/screening/start/', data),
    questions: (params?: any) => api.get('/screening/questions/', { params }),
    submitResponse: (data: any) => api.post('/screening/respond/', data),
    calculateRisk: (data: any) => api.post('/screening/risk/calculate/', data),
    statistics: () => api.get('/screening/statistics/'),
  },

  operators: {
    list: (params?: any) => api.get('/operators/', { params }),
    get: (id: string) => api.get(`/operators/${id}/`),
    register: (data: any) => api.post('/operators/register/', data),
    activate: (id: string) => api.post(`/operators/${id}/activate/`),
    suspend: (id: string, data?: any) => api.post(`/operators/${id}/suspend/`, data),
    generateApiKey: (id: string, data: any) => api.post(`/operators/${id}/api-keys/generate/`, data),
    validateApiKey: (data: any) => api.post('/operators/api-keys/validate/', data),
    setupIntegration: (id: string, data: any) => api.post(`/operators/${id}/integration/setup/`, data),
    testIntegration: (id: string) => api.post(`/operators/${id}/integration/test/`),
    complianceCheck: (id: string) => api.post(`/operators/${id}/compliance/check/`),
    statistics: () => api.get('/operators/statistics/'),
  },

  analytics: {
    dashboardOverview: () => api.get('/analytics/dashboard-overview/'),
    realTimeStats: () => api.get('/analytics/real-time-stats/'),
    trends: (params?: any) => api.get('/analytics/trends/', { params }),
    userDemographics: () => api.get('/analytics/user-demographics/'),
    operatorPerformance: () => api.get('/analytics/operator-performance/'),
    userGrowth: (params?: any) => api.get('/analytics/user-growth/', { params }),
    apiPerformance: () => api.get('/analytics/performance/api/'),
    systemPerformance: () => api.get('/analytics/performance/system/'),
    riskDistribution: () => api.get('/analytics/risk/distribution/'),
    exclusionTrends: (params?: any) => api.get('/analytics/trends/exclusions/', { params }),
    riskTrends: (params?: any) => api.get('/analytics/trends/risk/', { params }),
    complianceTrends: (params?: any) => api.get('/analytics/trends/compliance/', { params }),
    generateReport: (data: any) => api.post('/analytics/reports/generate/', data),
    exportData: (data: any) => api.post('/analytics/export/data/', data),
  },

  notifications: {
    my: (params?: any) => api.get('/notifications/my-notifications/', { params }),
    unread: () => api.get('/notifications/my-notifications/unread/'),
    markRead: (id: string) => api.post(`/notifications/${id}/mark-read/`),
    markAllRead: () => api.post('/notifications/mark-all-read/'),
    statistics: () => api.get('/notifications/statistics/'),
  },

  monitoring: {
    health: () => api.get('/monitoring/health/'),
    detailed: () => api.get('/monitoring/health/detailed/'),
    systemStatus: () => api.get('/monitoring/status/'),
    metrics: () => api.get('/monitoring/metrics/system/'),
    apiLogs: (params?: any) => api.get('/monitoring/api-logs/', { params }),
    alerts: (params?: any) => api.get('/monitoring/alerts/', { params }),
    acknowledgeAlert: (id: string) => api.post(`/monitoring/alerts/${id}/acknowledge/`),
  },
}

export default apiClient
export { apiClient }
