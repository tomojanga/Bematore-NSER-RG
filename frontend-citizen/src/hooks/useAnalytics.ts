import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const { data } = await api.analytics.dashboard()
      return data
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  })
}

export function useUserGrowth(period: string = 'month') {
  return useQuery({
    queryKey: ['user-growth', period],
    queryFn: async () => {
      const { data } = await api.analytics.userGrowth({ period })
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

export function useExclusionTrends(period: string = 'month') {
  return useQuery({
    queryKey: ['exclusion-trends', period],
    queryFn: async () => {
      const { data } = await api.analytics.exclusionTrends({ period })
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}

export function useRiskDistribution() {
  return useQuery({
    queryKey: ['risk-distribution'],
    queryFn: async () => {
      const { data } = await api.analytics.riskDistribution()
      return data
    },
    staleTime: 300000, // 5 minutes
  })
}
