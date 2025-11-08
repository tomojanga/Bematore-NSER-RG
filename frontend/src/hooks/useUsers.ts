import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export function useUsers(params?: { search?: string; role?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await api.users.list(params)
      return data
    },
    staleTime: 30000,
  })
}
