import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/store/authStore'

// Enhanced request config type with metadata
interface EnhancedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    requestId: number
    startTime: number
  }
  _retry?: boolean
}

// Enhanced API client for NSER-RG system
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
  withCredentials: false,
})

// Request ID for tracing
let requestId = 0

// Request interceptor - Enhanced with logging and device tracking
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Generate unique request ID for tracing
    const currentRequestId = ++requestId
    const enhancedConfig = config as EnhancedAxiosRequestConfig
    enhancedConfig.metadata = { requestId: currentRequestId, startTime: performance.now() }

    // Add authentication token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Add device tracking for security
      const deviceId = localStorage.getItem('device_id')
      if (deviceId && config.headers) {
        config.headers['HTTP_X_DEVICE_ID'] = deviceId // Changed to Django's convention
      }

      // Minimal headers to avoid CORS issues - only essential ones
      // Temporarily remove all custom headers
      // if (config.headers) {
      //   config.headers['X-Client-Platform'] = 'web'
      // }
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request [${currentRequestId}]:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
        headers: config.headers,
      })
    }

    return enhancedConfig
  },
  (error: AxiosError) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Enhanced error handling and logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as EnhancedAxiosRequestConfig
    const requestId = config.metadata?.requestId
    const duration = config.metadata?.startTime
      ? Math.round(performance.now() - config.metadata.startTime)
      : 0

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response [${requestId}] (${duration}ms):`, {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }

    // Log slow requests in production
    if (duration > 5000) {
      console.warn(`🐌 Slow API Request [${requestId}] (${duration}ms):`, response.config.url)
    }

    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as EnhancedAxiosRequestConfig
    const requestId = originalRequest?.metadata?.requestId
    const duration = originalRequest?.metadata?.startTime
      ? Math.round(performance.now() - originalRequest.metadata.startTime)
      : 0

    // Enhanced error logging
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error [${requestId}] (${duration}ms):`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
        message: error.message,
      })
    }

    // Handle specific error cases
    const response = error.response
    const status = response?.status

    // Handle 401 errors (token refresh)
    if (status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          // Use the correct Django endpoint for token refresh
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'}/auth/token/refresh/`,
            { refresh: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          )
          
          // Update token in storage and store
          localStorage.setItem('access_token', data.access)
          
          // Update store if available
          try {
            const { setTokens } = useAuthStore.getState()
            if (setTokens) {
              setTokens(data.access, refreshToken)
            }
          } catch (e) {
            // Store not available, continue
          }
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access}`
          }
          
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh token is invalid, logout user
        console.error('🔒 Token refresh failed, logging out user')
        
        // Clear all auth data
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        
        // Update store
        try {
          const { logout } = useAuthStore.getState()
          if (logout) {
            logout()
          }
        } catch (e) {
          // Store not available, continue
        }
        
        // Redirect to login (avoid infinite redirects)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      }
    }

    // Handle specific HTTP status codes
    switch (status) {
      case 403:
        console.error('🚫 Access forbidden - insufficient permissions')
        break
      case 404:
        console.error('🔍 Resource not found')
        break
      case 429:
        console.error('🚦 Rate limit exceeded')
        break
      case 500:
        console.error('💥 Internal server error')
        break
      case 503:
        console.error('🔧 Service unavailable')
        break
    }

    // Network errors
    if (!response) {
      console.error('🌐 Network error - check connection')
    }

    return Promise.reject(error)
  }
)

// Enhanced API methods with proper error handling
export const api = {
  // Generic methods
  get: <T = any>(url: string, config?: any) => 
    apiClient.get<T>(url, config),
  
  post: <T = any>(url: string, data?: any, config?: any) => 
    apiClient.post<T>(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: any) => 
    apiClient.put<T>(url, data, config),
  
  patch: <T = any>(url: string, data?: any, config?: any) => 
    apiClient.patch<T>(url, data, config),
  
  delete: <T = any>(url: string, config?: any) => 
    apiClient.delete<T>(url, config),

  // File upload with progress
  upload: <T = any>(url: string, formData: FormData, onProgress?: (progress: number) => void) => 
    apiClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }),

  // Citizen-only endpoints

  // Authentication
  auth: {
    login: (credentials: any) => api.post('/auth/login/', credentials),
    logout: (data?: any) => api.post('/auth/logout/', data),
    register: (userData: any) => api.post('/auth/register/', userData),
    refreshToken: (refreshToken: string) => api.post('/auth/token/refresh/', { refresh: refreshToken }),
    changePassword: (data: any) => api.post('/auth/password/change/', data),
    requestPasswordReset: (data: any) => api.post('/auth/password/reset/', data),
    confirmPasswordReset: (data: any) => api.post('/auth/password/reset/confirm/', data),
  },

  // User profile
  users: {
    me: () => api.get('/users/me/'),
    updateProfile: (data: any) => api.patch('/users/me/profile/', data),
    devices: () => api.get('/users/me/devices/'),
    sessions: () => api.get('/users/me/sessions/'),
    verifyPhone: (data: any) => api.post('/users/verify/phone/', data),
    verifyEmail: (data: any) => api.post('/users/verify/email/', data),
    sendVerificationCode: (data: any) => api.post('/users/verify/send-code/', data),
  },

  // Self-exclusion
  nser: {
    register: (data: any) => api.post('/nser/register/', data),
    myExclusions: () => api.get('/nser/my-exclusions/'),
    myActive: () => api.get('/nser/my-exclusions/active/'),
    checkStatus: () => api.get('/nser/check-status/'),
    renew: (id: string, data?: any) => api.post(`/nser/exclusions/${id}/renew/`, data),
    extend: (id: string, data: any) => api.post(`/nser/exclusions/${id}/extend/`, data),
  },

  // Risk assessments
  screening: {
    sessions: (params?: any) => api.get('/screening/sessions/', { params }),
    start: (data: any) => api.post('/screening/start/', data),
    startLiebet: () => api.post('/screening/liebet/start/'),
    startPGSI: () => api.post('/screening/pgsi/start/'),
    startDSM5: () => api.post('/screening/dsm5/start/'),
    submitResponse: (data: any) => api.post('/screening/respond/', data),
    batchResponses: (data: any) => api.post('/screening/responses/batch/', data),
    calculateRisk: (data: any) => api.post('/screening/risk/calculate/', data),
    questionsByType: (type: string) => api.get(`/screening/questions/type/${type}/`),
    myAssessments: () => api.get('/screening/my-assessments/'),
    currentRisk: () => api.get('/screening/risk/current/'),
    riskHistory: () => api.get('/screening/risk/history/'),
    myRiskProfile: () => api.get('/screening/my-risk/'),
    recommendations: () => api.get('/screening/recommendations/'),
    statistics: () => api.get('/screening/statistics/'),
  },

  // Notifications
  notifications: {
    my: (params?: any) => api.get('/notifications/my-notifications/', { params }),
    unread: () => api.get('/notifications/my-notifications/unread/'),
    markRead: (id: string) => api.post(`/notifications/${id}/mark-read/`),
    markAllRead: () => api.post('/notifications/mark-all-read/'),
    preferences: () => api.get('/notifications/preferences/'),
    updatePreferences: (data: any) => api.post('/notifications/preferences/update/', data),
  },

  // Analytics
  analytics: {
    dashboard: () => api.get('/analytics/dashboard/'),
    userGrowth: (params?: any) => api.get('/analytics/user-growth/', { params }),
    exclusionTrends: (params?: any) => api.get('/analytics/exclusion-trends/', { params }),
    riskDistribution: () => api.get('/analytics/risk-distribution/'),
  },
}

export default apiClient
export { apiClient }
