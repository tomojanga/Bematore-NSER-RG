import api from './api'

// ============================================
// AUTHENTICATION APIs
// ============================================
export const authAPI = {
  login: (phone_number: string, password: string) =>
    api.post('/auth/login/', { phone_number, password }),
  
  register: (data: any) =>
    api.post('/auth/register/', data),
  
  logout: () =>
    api.post('/auth/logout/'),
  
  refreshToken: (refresh: string) =>
    api.post('/auth/token/refresh/', { refresh }),
  
  verifyToken: (token: string) =>
    api.post('/auth/token/verify/', { token }),
}

// ============================================
// OPERATOR APIs
// ============================================
export const operatorAPI = {
  // Registration
  publicRegister: (data: any) =>
    api.post('/operators/public/register/', data),
  
  // Current Operator
  getMe: () =>
    api.get('/operators/me/'),
  
  // Operator Management
  getAll: (params?: any) =>
    api.get('/operators/', { params }),
  
  getById: (id: string) =>
    api.get(`/operators/${id}/`),
  
  update: (id: string, data: any) =>
    api.put(`/operators/${id}/`, data),
  
  activate: (id: string) =>
    api.post(`/operators/${id}/activate/`),
  
  suspend: (id: string) =>
    api.post(`/operators/${id}/suspend/`),
  
  // Statistics
  getStatistics: () =>
    api.get('/operators/statistics/'),
  
  search: (query: string) =>
    api.get('/operators/search/', { params: { q: query } }),
}

// ============================================
// API KEY APIs
// ============================================
export const apiKeyAPI = {
  getAll: () =>
    api.get('/operators/api-keys/'),
  
  getById: (id: string) =>
    api.get(`/operators/api-keys/${id}/`),
  
  generate: (operatorId: string, data: any) =>
    api.post(`/operators/${operatorId}/api-keys/generate/`, data),
  
  rotate: (keyId: string) =>
    api.post(`/operators/api-keys/${keyId}/rotate/`),
  
  revoke: (keyId: string) =>
    api.post(`/operators/api-keys/${keyId}/revoke/`),
  
  validate: (apiKey: string) =>
    api.post('/operators/api-keys/validate/', { api_key: apiKey }),
}

// ============================================
// LICENSE APIs
// ============================================
export const licenseAPI = {
  getAll: () =>
    api.get('/operators/licenses/'),
  
  issue: (operatorId: string, data: any) =>
    api.post(`/operators/${operatorId}/licenses/issue/`, data),
  
  renew: (operatorId: string) =>
    api.post(`/operators/${operatorId}/licenses/renew/`),
  
  revoke: (operatorId: string) =>
    api.post(`/operators/${operatorId}/licenses/revoke/`),
  
  getExpiring: () =>
    api.get('/operators/licenses/expiring/'),
}

// ============================================
// INTEGRATION APIs
// ============================================
export const integrationAPI = {
  setup: (operatorId: string, data: any) =>
    api.post(`/operators/${operatorId}/integration/setup/`, data),
  
  test: (operatorId: string) =>
    api.post(`/operators/${operatorId}/integration/test/`),
  
  configureWebhooks: (operatorId: string, data: any) =>
    api.post(`/operators/${operatorId}/integration/webhooks/`, data),
  
  testWebhook: (operatorId: string, data: any) =>
    api.post(`/operators/${operatorId}/webhooks/test/`, data),
  
  getWebhookLogs: (operatorId: string) =>
    api.get(`/operators/${operatorId}/webhooks/logs/`),
}

// ============================================
// COMPLIANCE APIs
// ============================================
export const complianceAPI = {
  runCheck: (operatorId: string) =>
    api.post(`/operators/${operatorId}/compliance/check/`),
  
  getScore: (operatorId: string) =>
    api.get(`/operators/${operatorId}/compliance/score/`),
  
  generateReport: (operatorId: string) =>
    api.post(`/operators/${operatorId}/compliance/report/`),
  
  getOverview: () =>
    api.get('/operators/compliance/overview/'),
  
  getReports: () =>
    api.get('/operators/compliance-reports/'),
}

// ============================================
// METRICS APIs
// ============================================
export const metricsAPI = {
  getOperatorMetrics: (operatorId: string) =>
    api.get(`/operators/${operatorId}/metrics/`),
  
  getResponseTimes: (operatorId: string) =>
    api.get(`/operators/${operatorId}/response-times/`),
  
  getAPIUsage: (operatorId: string) =>
    api.get(`/operators/${operatorId}/api-usage/`),
}

// ============================================
// NSER (Self-Exclusion) APIs
// ============================================
export const nserAPI = {
  // Exclusion Management
  getAll: (params?: any) =>
    api.get('/nser/exclusions/', { params }),
  
  getById: (id: string) =>
    api.get(`/nser/exclusions/${id}/`),
  
  register: (data: any) =>
    api.post('/nser/register/', data),
  
  activate: (id: string) =>
    api.post(`/nser/exclusions/${id}/activate/`),
  
  terminate: (id: string, data: any) =>
    api.post(`/nser/exclusions/${id}/terminate/`, data),
  
  extend: (id: string, data: any) =>
    api.post(`/nser/exclusions/${id}/extend/`, data),
  
  // Lookup
  lookup: (data: any) =>
    api.post('/nser/lookup/', data),
  
  bulkLookup: (data: any) =>
    api.post('/nser/lookup/bulk/', data),
  
  bstLookup: (data: any) =>
    api.post('/nser/lookup/bst/', data),
  
  // Propagation
  propagate: (id: string) =>
    api.post(`/nser/exclusions/${id}/propagate/`),
  
  getPropagationStatus: (id: string) =>
    api.get(`/nser/exclusions/${id}/propagation-status/`),
  
  // Statistics
  getStatistics: () =>
    api.get('/nser/statistics/'),
  
  getTrends: (period?: string) =>
    api.get('/nser/trends/', { params: { period } }),
  
  getDailyStats: () =>
    api.get('/nser/daily-stats/'),
  
  // My Exclusions
  getMyExclusions: () =>
    api.get('/nser/my-exclusions/'),
  
  getMyActiveExclusion: () =>
    api.get('/nser/my-exclusions/active/'),
  
  checkStatus: () =>
    api.get('/nser/check-status/'),
}

// ============================================
// SCREENING APIs
// ============================================
export const screeningAPI = {
  screen: (data: any) =>
    api.post('/screening/screen/', data),
  
  getHistory: (userId: string) =>
    api.get(`/screening/history/${userId}/`),
  
  getAll: (params?: any) =>
    api.get('/screening/', { params }),
}

// ============================================
// BST (Blockchain Secure Token) APIs
// ============================================
export const bstAPI = {
  generate: (data: any) =>
    api.post('/bst/generate/', data),
  
  validate: (token: string) =>
    api.post('/bst/validate/', { token }),
  
  revoke: (token: string) =>
    api.post('/bst/revoke/', { token }),
  
  getByUser: (userId: string) =>
    api.get(`/bst/user/${userId}/`),
}

// ============================================
// NOTIFICATIONS APIs
// ============================================
export const notificationAPI = {
  getAll: (params?: any) =>
    api.get('/notifications/', { params }),
  
  markAsRead: (id: string) =>
    api.post(`/notifications/${id}/read/`),
  
  markAllAsRead: () =>
    api.post('/notifications/read-all/'),
  
  getUnreadCount: () =>
    api.get('/notifications/unread-count/'),
}

// ============================================
// AUDIT LOG APIs
// ============================================
export const auditAPI = {
  getOperatorLogs: (params?: any) =>
    api.get('/operators/audit-logs/', { params }),
  
  getExclusionLogs: (params?: any) =>
    api.get('/nser/audit-logs/', { params }),
}

// ============================================
// DASHBOARD APIs
// ============================================
export const dashboardAPI = {
  getOperatorDashboard: () =>
    api.get('/dashboards/operator/'),
  
  getRegulatorDashboard: () =>
    api.get('/dashboards/regulator/'),
  
  getAnalytics: (params?: any) =>
    api.get('/analytics/', { params }),
}

// Export all APIs
export default {
  auth: authAPI,
  operator: operatorAPI,
  apiKey: apiKeyAPI,
  license: licenseAPI,
  integration: integrationAPI,
  compliance: complianceAPI,
  metrics: metricsAPI,
  nser: nserAPI,
  screening: screeningAPI,
  bst: bstAPI,
  notification: notificationAPI,
  audit: auditAPI,
  dashboard: dashboardAPI,
}
