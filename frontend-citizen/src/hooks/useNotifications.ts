import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export function useNotifications(params?: any) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const { data } = await api.notifications.my(params)
      return data
    },
    staleTime: 30000,
    retry: false,
  })
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: ['unread-notifications'],
    queryFn: async () => {
      const { data } = await api.notifications.unread().catch(() => ({ data: { results: [] } }))
      return data
    },
    refetchInterval: 60000,
    staleTime: 30000,
    retry: false,
  })
}
