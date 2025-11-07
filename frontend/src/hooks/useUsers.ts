import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { 
  User,
  UserProfile,
  UserDevice,
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

export function useUsers(params?: PaginatedParams) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await api.get('/users/', { params })
      return data as ApiResponse<User>
    },
    staleTime: 30000, // 30 seconds
  })

  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      phone_number: string
      email?: string
      first_name: string
      last_name: string
      middle_name?: string
      role?: string
      password?: string
      send_welcome_sms?: boolean
    }) => {
      const result = await api.post('/users/', userData)
      return result.data as SingleApiResponse<User>
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-statistics'] })
      toast.success(response.message || 'User created successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create user'
      toast.error(message)
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: string } & Partial<User>) => {
      const { id, ...updateData } = data
      const result = await api.patch(`/users/${id}/`, updateData)
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update user'
      toast.error(message)
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (data: {
      id: string
      reason?: string
    }) => {
      const result = await api.delete(`/users/${data.id}/`, {
        data: { deletion_reason: data.reason }
      })
      return result.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete user'
      toast.error(message)
    }
  })

  return {
    // Data
    users: data?.results || [],
    total: data?.count || 0,
    hasNextPage: !!data?.next,
    hasPreviousPage: !!data?.previous,
    
    // Loading states
    isLoading,
    error,
    
    // Mutations
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    
    // Loading states for mutations
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  }
}

// Individual user hook
export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}/`)
      return data as SingleApiResponse<User>
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  })
}

// User profile hook
export function useUserProfile(userId?: string) {
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const endpoint = userId ? `/users/${userId}/profile/` : '/users/me/profile/'
      const { data } = await api.get(endpoint)
      return data as SingleApiResponse<UserProfile>
    },
    staleTime: 60000, // 1 minute
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      const endpoint = userId ? `/users/${userId}/profile/` : '/users/me/profile/'
      const result = await api.patch(endpoint, profileData)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Profile updated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
    }
  })

  return {
    profile: profile?.data,
    isLoading,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  }
}

// User devices hook
export function useUserDevices(userId?: string) {
  const queryClient = useQueryClient()

  const { data: devices, isLoading } = useQuery({
    queryKey: ['user-devices', userId],
    queryFn: async () => {
      const endpoint = userId ? `/users/${userId}/devices/` : '/users/me/devices/'
      const { data } = await api.get(endpoint)
      return data as ApiResponse<UserDevice>
    },
    staleTime: 60000, // 1 minute
  })

  const trustDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const result = await api.post(`/users/devices/${deviceId}/trust/`)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices'] })
      toast.success('Device trusted successfully')
    }
  })

  const blockDeviceMutation = useMutation({
    mutationFn: async (data: {
      deviceId: string
      reason?: string
    }) => {
      const result = await api.post(`/users/devices/${data.deviceId}/block/`, {
        reason: data.reason
      })
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices'] })
      toast.warning('Device blocked successfully')
    }
  })

  return {
    devices: devices?.results || [],
    totalDevices: devices?.count || 0,
    isLoading,
    trustDevice: trustDeviceMutation.mutate,
    blockDevice: blockDeviceMutation.mutate,
    isTrusting: trustDeviceMutation.isPending,
    isBlocking: blockDeviceMutation.isPending,
  }
}

// User sessions hook
export function useUserSessions(userId?: string) {
  const queryClient = useQueryClient()

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['user-sessions', userId],
    queryFn: async () => {
      const endpoint = userId ? `/users/${userId}/sessions/` : '/users/me/sessions/'
      const { data } = await api.get(endpoint)
      return data
    },
    staleTime: 60000, // 1 minute
  })

  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const result = await api.post(`/users/sessions/${sessionId}/terminate/`)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
      toast.success('Session terminated successfully')
    }
  })

  const terminateAllSessionsMutation = useMutation({
    mutationFn: async () => {
      const result = await api.post('/users/sessions/terminate-all/')
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
      toast.success('All sessions terminated successfully')
    }
  })

  return {
    sessions: sessions?.results || [],
    isLoading,
    terminateSession: terminateSessionMutation.mutate,
    terminateAllSessions: terminateAllSessionsMutation.mutate,
    isTerminating: terminateSessionMutation.isPending,
    isTerminatingAll: terminateAllSessionsMutation.isPending,
  }
}

// User search hook
export function useUserSearch() {
  return useMutation({
    mutationFn: async (data: {
      query?: string
      filters?: {
        role?: string
        status?: string
        verification_status?: string
        is_verified?: boolean
        country_code?: string
        date_from?: string
        date_to?: string
      }
    }) => {
      const result = await api.users.search(data)
      return result.data as ApiResponse<User>
    }
  })
}

// User statistics hook
export function useUserStatistics() {
  return useQuery({
    queryKey: ['user-statistics'],
    queryFn: async () => {
      const { data } = await api.users.statistics()
      return data
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 120000,
  })
}

// User login history hook
export function useUserLoginHistory(userId?: string, params?: PaginatedParams) {
  const queryParams = userId ? { ...params, user_id: userId } : params
  
  return useQuery({
    queryKey: ['user-login-history', userId, params],
    queryFn: async () => {
      const { data } = await api.get('/users/login-history/', { params: queryParams })
      return data
    },
    enabled: true,
    staleTime: 300000, // 5 minutes
  })
}

// User activity logs hook
export function useUserActivityLogs(userId?: string, params?: PaginatedParams) {
  const queryParams = userId ? { ...params, user_id: userId } : params
  
  return useQuery({
    queryKey: ['user-activity-logs', userId, params],
    queryFn: async () => {
      const { data } = await api.get('/users/activity-logs/', { params: queryParams })
      return data
    },
    staleTime: 60000, // 1 minute
  })
}

// User verification hooks
export function useUserVerification() {
  const queryClient = useQueryClient()

  const sendVerificationCodeMutation = useMutation({
    mutationFn: async (data: {
      phone_number: string
      action: 'verify_phone' | 'password_reset' | '2fa_setup'
    }) => {
      const result = await api.users.sendVerificationCode(data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Verification code sent')
    }
  })

  const verifyPhoneMutation = useMutation({
    mutationFn: async (data: {
      phone_number: string
      code: string
    }) => {
      const result = await api.users.verifyPhone(data)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Phone verified successfully')
    }
  })

  const verifyEmailMutation = useMutation({
    mutationFn: async (data: {
      email: string
      code: string
    }) => {
      const result = await api.users.verifyEmail(data)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Email verified successfully')
    }
  })

  const verifyIdMutation = useMutation({
    mutationFn: async (data: {
      national_id: string
      document_front: File
      document_back?: File
    }) => {
      const formData = new FormData()
      formData.append('national_id', data.national_id)
      formData.append('document_front', data.document_front)
      if (data.document_back) {
        formData.append('document_back', data.document_back)
      }
      
      const result = await api.upload('/users/verify/id/', formData)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('ID verification submitted successfully')
    }
  })

  return {
    sendVerificationCode: sendVerificationCodeMutation.mutate,
    verifyPhone: verifyPhoneMutation.mutate,
    verifyEmail: verifyEmailMutation.mutate,
    verifyId: verifyIdMutation.mutate,
    isSendingCode: sendVerificationCodeMutation.isPending,
    isVerifyingPhone: verifyPhoneMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
    isVerifyingId: verifyIdMutation.isPending,
  }
}

// User helpers
export function useUserHelpers() {
  const formatUserRole = (role: string): string => {
    const roleMap: Record<string, string> = {
      'super_admin': 'Super Administrator',
      'grak_admin': 'GRAK Administrator',
      'grak_officer': 'GRAK Officer',
      'grak_auditor': 'GRAK Auditor',
      'operator_admin': 'Operator Administrator',
      'operator_user': 'Operator User',
      'bematore_admin': 'Bematore Administrator',
      'bematore_analyst': 'Bematore Analyst',
      'citizen': 'Citizen',
      'api_user': 'API User'
    }
    return roleMap[role] || role
  }

  const getRoleColor = (role: string): 'purple' | 'red' | 'orange' | 'yellow' | 'blue' | 'green' | 'gray' => {
    const colorMap: Record<string, 'purple' | 'red' | 'orange' | 'yellow' | 'blue' | 'green' | 'gray'> = {
      'super_admin': 'purple',
      'grak_admin': 'red',
      'grak_officer': 'orange',
      'grak_auditor': 'yellow',
      'operator_admin': 'blue',
      'operator_user': 'blue',
      'bematore_admin': 'green',
      'bematore_analyst': 'green',
      'citizen': 'gray',
      'api_user': 'gray'
    }
    return colorMap[role] || 'gray'
  }

  const formatUserStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'active': 'Active',
      'inactive': 'Inactive',
      'suspended': 'Suspended',
      'pending': 'Pending',
      'locked': 'Locked'
    }
    return statusMap[status] || status
  }

  const getUserStatusColor = (status: string): 'green' | 'yellow' | 'red' | 'blue' | 'gray' => {
    const colorMap: Record<string, 'green' | 'yellow' | 'red' | 'blue' | 'gray'> = {
      'active': 'green',
      'inactive': 'yellow',
      'suspended': 'red',
      'pending': 'blue',
      'locked': 'red'
    }
    return colorMap[status] || 'gray'
  }

  const formatVerificationStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'unverified': 'Unverified',
      'pending': 'Verification Pending',
      'verified': 'Verified',
      'failed': 'Verification Failed',
      'expired': 'Verification Expired',
      'suspended': 'Verification Suspended'
    }
    return statusMap[status] || status
  }

  const getVerificationStatusColor = (status: string): 'red' | 'yellow' | 'green' | 'blue' | 'gray' => {
    const colorMap: Record<string, 'red' | 'yellow' | 'green' | 'blue' | 'gray'> = {
      'unverified': 'red',
      'pending': 'yellow',
      'verified': 'green',
      'failed': 'red',
      'expired': 'gray',
      'suspended': 'gray'
    }
    return colorMap[status] || 'gray'
  }

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const dob = new Date(dateOfBirth)
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    
    return age
  }

  const formatPhoneNumber = (phone: string): string => {
    // Format Kenyan phone numbers
    if (phone.startsWith('+254')) {
      const number = phone.substring(4)
      return `+254 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`
    }
    return phone
  }

  const formatUserName = (user: User): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    } else if (user.first_name) {
      return user.first_name
    } else {
      return user.phone_number
    }
  }

  const isUserVerified = (user: User): boolean => {
    return user.is_phone_verified && user.is_id_verified && user.verification_status === 'verified'
  }

  const getUserVerificationProgress = (user: User): {
    percentage: number
    completedSteps: string[]
    remainingSteps: string[]
  } => {
    const allSteps = ['Phone Verification', 'Email Verification', 'ID Verification']
    const completedSteps: string[] = []
    
    if (user.is_phone_verified) completedSteps.push('Phone Verification')
    if (user.is_email_verified) completedSteps.push('Email Verification')
    if (user.is_id_verified) completedSteps.push('ID Verification')
    
    const remainingSteps = allSteps.filter(step => !completedSteps.includes(step))
    const percentage = Math.round((completedSteps.length / allSteps.length) * 100)
    
    return {
      percentage,
      completedSteps,
      remainingSteps
    }
  }

  return {
    formatUserRole,
    getRoleColor,
    formatUserStatus,
    getUserStatusColor,
    formatVerificationStatus,
    getVerificationStatusColor,
    calculateAge,
    formatPhoneNumber,
    formatUserName,
    isUserVerified,
    getUserVerificationProgress,
  }
}
