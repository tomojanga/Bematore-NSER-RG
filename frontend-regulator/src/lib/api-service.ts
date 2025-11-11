import api from './api'

const apiService = {
  operators: {
    list: (params?: any) => api.get('/operators/', { params }),
    get: (id: string) => api.get(`/operators/${id}/`),
    activate: (id: string) => api.post(`/operators/${id}/activate/`),
    suspend: (id: string) => api.post(`/operators/${id}/suspend/`),
    statistics: () => api.get('/operators/statistics/'),
  },
  nser: {
    list: (params?: any) => api.get('/nser/exclusions/', { params }),
    get: (id: string) => api.get(`/nser/exclusions/${id}/`),
    terminate: (id: string, data: any) => api.post(`/nser/exclusions/${id}/terminate/`, data),
    statistics: () => api.get('/nser/statistics/'),
  },
  bst: {
    list: (params?: any) => api.get('/bst/tokens/', { params }),
    get: (id: string) => api.get(`/bst/tokens/${id}/`),
    generate: (data: any) => api.post('/bst/generate/', data),
    validate: (token: string) => api.post('/bst/validate/', { token }),
    rotate: (id: string, data: any) => api.post(`/bst/tokens/${id}/rotate/`, data),
    compromise: (id: string, data: any) => api.post(`/bst/tokens/${id}/compromise/`, data),
    deactivate: (id: string) => api.post(`/bst/tokens/${id}/deactivate/`),
    lookup: (data: any) => api.post('/bst/lookup/', data),
    statistics: () => api.get('/bst/statistics/'),
    fraudCheck: (data: any) => api.post('/bst/fraud-check/', data),
  },
}

export default apiService
