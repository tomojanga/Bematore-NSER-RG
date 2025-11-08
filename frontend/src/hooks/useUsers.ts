import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

export function useUsers(params?: { 
  search?: string
  role?: string
  status?: string
  verification_status?: string
  page?: number
  page_size?: number
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await api.users.list(params)
      return data
    },
    staleTime: 30000,
  })

  return {
    users: data?.data?.items || [],
    total: data?.data?.total || 0,
    isLoading,
    error
  }
}

export function useUserHelpers() {
  return {
    formatUserRole: (role: string) => role?.replace('_', ' ').toUpperCase() || 'N/A',
    getRoleColor: (role: string) => {
      const colors: Record<string, string> = {
        citizen: 'bg-blue-100 text-blue-700',
        operator_admin: 'bg-purple-100 text-purple-700',
        operator_user: 'bg-indigo-100 text-indigo-700',
        grak_admin: 'bg-red-100 text-red-700',
        grak_officer: 'bg-orange-100 text-orange-700',
        super_admin: 'bg-gray-900 text-white'
      }
      return colors[role] || 'bg-gray-100 text-gray-700'
    },
    formatUserStatus: (status: string) => status?.toUpperCase() || 'N/A',
    getUserStatusColor: (status: string) => {
      const colors: Record<string, string> = {
        active: 'bg-green-100 text-green-700',
        inactive: 'bg-gray-100 text-gray-700',
        suspended: 'bg-yellow-100 text-yellow-700',
        locked: 'bg-red-100 text-red-700'
      }
      return colors[status] || 'bg-gray-100 text-gray-700'
    },
    formatVerificationStatus: (status: string) => status?.toUpperCase() || 'UNVERIFIED',
    getVerificationStatusColor: (status: string) => {
      const colors: Record<string, string> = {
        verified: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        unverified: 'bg-gray-100 text-gray-700',
        failed: 'bg-red-100 text-red-700'
      }
      return colors[status] || 'bg-gray-100 text-gray-700'
    },
    calculateAge: (dateOfBirth: string) => {
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    },
    formatPhoneNumber: (phone: string) => {
      if (!phone) return 'N/A'
      if (phone.startsWith('+254')) {
        return `+254 ${phone.slice(4, 7)} ${phone.slice(7)}`
      }
      return phone
    },
    isUserVerified: (user: any) => {
      return user.is_phone_verified && user.is_email_verified && user.is_id_verified
    },
    getUserVerificationProgress: (user: any) => {
      const checks = [
        user.is_phone_verified,
        user.is_email_verified,
        user.is_id_verified
      ]
      const completed = checks.filter(Boolean).length
      return {
        completed,
        total: 3,
        percentage: Math.round((completed / 3) * 100)
      }
    }
  }
}

export function useUserSearch() {
  return useMutation({
    mutationFn: async (params: { query: string; filters?: any }) => {
      const { data } = await api.get('/users/search/', { params })
      return data
    }
  })
}
