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

        // Enhanced error logging - only log meaningful errors
        if (process.env.NODE_ENV === 'development' && (error.response?.status || error.message)) {
            const errorData = error.response?.data || error.message || 'Unknown error'
            if (errorData !== 'Unknown error' || error.response?.status) {
                console.error(`❌ API Error [${requestId}] (${duration}ms):`, {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    url: error.config?.url,
                    method: error.config?.method,
                    data: errorData,
                    message: error.message,
                })
            }
        }

        // Handle specific error cases
        const response = error.response
        const status = response?.status

        // Handle 401 errors (token refresh) - only on auth endpoints
        const isAuthEndpoint = originalRequest?.url?.includes('/auth/') || originalRequest?.url?.includes('/token/')
        
        if (status === 401 && !originalRequest._retry && typeof window !== 'undefined' && isAuthEndpoint) {
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
                // Refresh token is invalid, only logout on token endpoint failure
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
            case 401:
                // Only logout if not already handled above
                if (!isAuthEndpoint) {
                    console.warn('⚠️ Unauthorized access on non-auth endpoint')
                }
                break
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
        list: (params?: any) => api.get('/users/', { params }),
        me: () => api.get('/users/me/'),
        updateProfile: (data: any) => api.patch('/users/me/profile/', data),
        devices: () => api.get('/users/me/devices/'),
        sessions: () => api.get('/users/me/sessions/'),
        verifyPhone: (data: any) => api.post('/users/verify/phone/', data),
        verifyEmail: (data: any) => api.post('/users/verify/email/', data),
        sendVerificationCode: (data: any) => api.post('/users/verify/send-code/', data),
        statistics: () => api.get('/users/statistics/'),
    },

    // Self-exclusion
    nser: {
        // Registration & Validation
        register: (data: any) => api.post('/nser/register/', data),
        validate: (data: any) => api.post('/nser/register/validate/', data),

        // User Exclusions
        myExclusions: (params?: any) => api.get('/nser/my-exclusions/', { params }),
        myActive: () => api.get('/nser/my-exclusions/active/'),
        checkStatus: () => api.get('/nser/check-status/',),

        // Exclusion Management
        exclusions: (params?: any) => api.get('/nser/exclusions/', { params }),
        getExclusion: (id: string) => api.get(`/nser/exclusions/${id}/`),
        updateExclusion: (id: string, data: any) => api.put(`/nser/exclusions/${id}/`, data),
        deleteExclusion: (id: string) => api.delete(`/nser/exclusions/${id}/`),

        // Exclusion Actions
        activate: (id: string) => api.post(`/nser/exclusions/${id}/activate/`),
        renew: (id: string, data?: any) => api.post(`/nser/exclusions/${id}/renew/`, data || {}),
        extend: (id: string, data: any) => api.post(`/nser/exclusions/${id}/extend/`, data),
        terminate: (id: string, data: any) => api.post(`/nser/exclusions/${id}/terminate/`, data),

        // Propagation
        propagate: (id: string) => api.post(`/nser/exclusions/${id}/propagate/`),
        propagationStatus: (id: string) => api.get(`/nser/exclusions/${id}/propagation-status/`),
        retryPropagation: () => api.post('/nser/propagation/retry/', {}),

        // Lookup (for operators & public)
        lookup: (data: any) => api.post('/nser/lookup/', data),
        bulkLookup: (data: any) => api.post('/nser/lookup/bulk/', data),
        bstLookup: (token: string) => api.post('/nser/lookup/bst/', { bst_token: token }),

        // Statistics & Analytics
        statistics: () => api.get('/nser/statistics/'),
        dailyStats: (params?: any) => api.get('/nser/statistics/daily/', { params }),
        trends: (params?: any) => api.get('/nser/statistics/trends/', { params }),

        // Reporting
        complianceReport: (params?: any) => api.get('/nser/reports/compliance/', { params }),
        exportExclusions: (params?: any) => api.get('/nser/reports/export/', { params }),

        // Audit & Logs
        auditLogs: (exclusionId?: string, params?: any) => {
            const queryParams = exclusionId ? { ...params, exclusion: exclusionId } : params
            return api.get('/nser/audit-logs/', { params: queryParams })
        },

        // Extension Requests
        extensionRequests: (params?: any) => api.get('/nser/extension-requests/', { params }),
        createExtensionRequest: (id: string, data: any) => api.post(`/nser/extension-requests/`, { ...data, exclusion_id: id }),

        // Operator Mappings
        operatorMappings: (params?: any) => api.get('/nser/operator-mappings/', { params }),

        // Admin Functions
        checkExpiry: () => api.post('/nser/check-expiry/', {}),
        autoRenew: () => api.post('/nser/auto-renew/', {}),
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
        grakDashboard: () => api.get('/analytics/grak-dashboard/'),
        operatorDashboard: () => api.get('/analytics/operator-dashboard/'),
        realtime: () => api.get('/analytics/realtime/'),
        userGrowth: (params?: any) => api.get('/analytics/user-growth/', { params }),
        exclusionTrends: (params?: any) => api.get('/analytics/exclusion-trends/', { params }),
        riskDistribution: () => api.get('/analytics/risk-distribution/'),
    },

    // Monitoring
    monitoring: {
        health: () => api.get('/monitoring/health/'),
        detailed: () => api.get('/monitoring/health/detailed/'),
        systemStatus: () => api.get('/monitoring/status/'),
        metrics: () => api.get('/monitoring/metrics/'),
        logs: (params?: any) => api.get('/monitoring/logs/', { params }),
        apiLogs: (params?: any) => api.get('/monitoring/api-logs/', { params }),
        alerts: (params?: any) => api.get('/monitoring/alerts/', { params }),
        acknowledgeAlert: (id: string) => api.post(`/monitoring/alerts/${id}/acknowledge/`, {}),
    },

    // Dashboards
    dashboards: {
        widgets: () => api.get('/dashboards/widgets/'),
        myDashboard: () => api.get('/dashboards/my-dashboard/'),
        saveLayout: (data: any) => api.post('/dashboards/layouts/', data),
    },

    // Operators
    operators: {
        list: (params?: any) => api.get('/operators/', { params }),
        get: (id: string) => api.get(`/operators/${id}/`),
        register: (data: any) => api.post('/operators/register/', data),
        activate: (id: string) => api.post(`/operators/${id}/activate/`, {}),
        suspend: (id: string, data: any) => api.post(`/operators/${id}/suspend/`, data),
        statistics: () => api.get('/operators/statistics/'),
        generateApiKey: (operator_id: string, data: any) => api.post(`/operators/${operator_id}/api-keys/generate/`, data),
        validateApiKey: (data: any) => api.post('/operators/api-keys/validate/', data),
        setupIntegration: (operator_id: string, data: any) => api.post(`/operators/${operator_id}/integrations/setup/`, data),
        testIntegration: (operator_id: string) => api.post(`/operators/${operator_id}/integrations/test/`, {}),
        complianceCheck: (operator_id: string) => api.get(`/operators/${operator_id}/compliance/`),
    },

    // Settlements
    settlements: {
        statistics: () => api.get('/settlements/statistics/'),
        transactions: (params?: any) => api.get('/settlements/transactions/', { params }),
        getTransaction: (id: string) => api.get(`/settlements/transactions/${id}/`),
        initiate: (data: any) => api.post('/settlements/transactions/initiate/', data),
        invoices: (params?: any) => api.get('/settlements/invoices/', { params }),
        generateInvoice: (data: any) => api.post('/settlements/invoices/generate/', data),
        mpesaSTK: (data: any) => api.post('/settlements/mpesa/stk/', data),
        mpesaB2B: (data: any) => api.post('/settlements/mpesa/b2b/', data),
        reconcile: (data: any) => api.post('/settlements/reconciliations/reconcile/', data),
    },

    // BST Token Management
    bst: {
        tokens: (params?: any) => api.get('/bst/tokens/', { params }),
        getToken: (id: string) => api.get(`/bst/tokens/${id}/`),
        generate: (data: any) => api.post('/bst/tokens/generate/', data),
        bulkGenerate: (data: any) => api.post('/bst/tokens/bulk-generate/', data),
        validate: (token: string, operatorId?: string) => api.post('/bst/tokens/validate/', { token, operator_id: operatorId }),
        bulkValidate: (tokens: string[], operatorId?: string) => api.post('/bst/tokens/bulk-validate/', { tokens, operator_id: operatorId }),
        rotate: (id: string, data: any) => api.post(`/bst/tokens/${id}/rotate/`, data),
        compromise: (id: string, data: any) => api.post(`/bst/tokens/${id}/compromise/`, data),
        deactivate: (id: string) => api.post(`/bst/tokens/${id}/deactivate/`, {}),
        lookup: (data: any) => api.post('/bst/tokens/lookup/', data),
        lookupUser: (token: string) => api.post('/bst/tokens/lookup-user/', { token }),
        fraudCheck: (data: any) => api.post('/bst/tokens/fraud-check/', data),
        detectDuplicates: (data: any) => api.post('/bst/tokens/detect-duplicates/', data),
        statistics: () => api.get('/bst/statistics/'),
    },
}

export default apiClient
export { apiClient }
