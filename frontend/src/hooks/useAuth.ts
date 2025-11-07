import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api-client'
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  SingleApiResponse
} from '@/types'
import { useRouter } from 'next/navigation'

// Simple toast replacement until we add react-hot-toast
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
}

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { 
    user, 
    setUser, 
    setTokens, 
    logout: logoutStore, 
    isAuthenticated,
    updateUser 
  } = useAuthStore()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.auth.login(credentials)
      return data as SingleApiResponse<AuthResponse>
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        setUser(response.data.user)
        setTokens(response.data.access, response.data.refresh)
        
        // Generate device ID for tracking if not exists
        if (!localStorage.getItem('device_id')) {
          localStorage.setItem('device_id', `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
        }
        
        toast.success(response.message || 'Login successful')
        router.push('/dashboard')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
    }
  })

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const { data } = await api.auth.register(userData)
      return data as SingleApiResponse<AuthResponse>
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        setUser(response.data.user)
        setTokens(response.data.access, response.data.refresh)
        
        // Generate device ID
        if (!localStorage.getItem('device_id')) {
          localStorage.setItem('device_id', `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
        }
        
        toast.success(response.message || 'Registration successful')
        router.push('/verify-phone')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
    }
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (logoutAllDevices: boolean = false) => {
      const refreshToken = localStorage.getItem('refresh_token')
      await api.auth.logout({ 
        refresh_token: refreshToken,
        all_devices: logoutAllDevices 
      })
    },
    onSuccess: () => {
      logoutStore()
      queryClient.clear()
      toast.success('Logged out successfully')
      router.push('/login')
    },
    onError: () => {
      // Even if logout API fails, clear local state
      logoutStore()
      queryClient.clear()
      router.push('/login')
    }
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { 
      current_password: string
      new_password: string
      new_password_confirm: string 
    }) => {
      const result = await api.auth.changePassword(data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Password changed successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to change password'
      toast.error(message)
    }
  })

  // Password reset request mutation
  const passwordResetRequestMutation = useMutation({
    mutationFn: async (data: { phone_number?: string; email?: string }) => {
      const result = await api.auth.requestPasswordReset(data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Reset code sent')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send reset code'
      toast.error(message)
    }
  })

  // Password reset confirm mutation
  const passwordResetConfirmMutation = useMutation({
    mutationFn: async (data: { 
      token: string
      new_password: string
      new_password_confirm: string 
    }) => {
      const result = await api.auth.confirmPasswordReset(data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Password reset successful')
      router.push('/login')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Password reset failed'
      toast.error(message)
    }
  })

  // Enable 2FA mutation
  const enable2FAMutation = useMutation({
    mutationFn: async (data: { 
      method: 'totp' | 'sms' | 'email'
      phone_number?: string
      email?: string 
    }) => {
      const result = await api.auth.enable2FA(data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success('2FA enabled successfully')
      if (user) {
        updateUser({ is_2fa_enabled: true })
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to enable 2FA'
      toast.error(message)
    }
  })

  // Disable 2FA mutation
  const disable2FAMutation = useMutation({
    mutationFn: async (data: { 
      password: string
      verification_code: string 
    }) => {
      const result = await api.auth.disable2FA(data)
      return result.data
    },
    onSuccess: () => {
      toast.success('2FA disabled successfully')
      if (user) {
        updateUser({ is_2fa_enabled: false })
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to disable 2FA'
      toast.error(message)
    }
  })

  // Verify 2FA mutation
  const verify2FAMutation = useMutation({
    mutationFn: async (data: { verification_code: string }) => {
      const result = await api.auth.verify2FA(data)
      return result.data
    },
    onSuccess: () => {
      toast.success('2FA verification successful')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '2FA verification failed'
      toast.error(message)
    }
  })

  // Current user profile query
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const { data } = await api.users.me()
      return data as SingleApiResponse<User>
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Update user in store when profile data changes
  useEffect(() => {
    if (profile?.success && profile.data && (!user || user.id !== profile.data.id)) {
      setUser(profile.data)
    }
  }, [profile, user, setUser])

  // User devices query
  const { data: devices } = useQuery({
    queryKey: ['auth', 'devices'],
    queryFn: async () => {
      const { data } = await api.users.devices()
      return data
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // User sessions query
  const { data: sessions } = useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: async () => {
      const { data } = await api.users.sessions()
      return data
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Token verification
  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      await api.auth.verifyToken(token)
      return true
    } catch {
      return false
    }
  }

  // Check if user has specific role
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false
    const rolesArray = Array.isArray(roles) ? roles : [roles]
    return rolesArray.includes(user.role)
  }

  // Check if user has permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true
    
    // Define role-based permissions
    const permissions: Record<string, string[]> = {
      'grak_admin': ['*'], // All permissions
      'grak_officer': [
        'view_users', 'view_exclusions', 'manage_exclusions', 
        'view_operators', 'view_assessments'
      ],
      'grak_auditor': ['view_*', 'audit_*'],
      'operator_admin': [
        'manage_operator', 'view_users', 'view_assessments', 'manage_api_keys'
      ],
      'operator_user': ['view_assessments', 'submit_assessments'],
      'bematore_admin': ['*'],
      'bematore_analyst': ['view_*', 'analytics_*'],
      'citizen': ['view_own', 'manage_own'],
    }
    
    const userPermissions = permissions[user.role] || []
    return userPermissions.includes('*') || 
           userPermissions.includes(permission) ||
           userPermissions.some(p => p.startsWith(permission.split('_')[0] + '_*'))
  }

  return {
    // State
    user: (profile?.success && profile.data) ? profile.data : user,
    isAuthenticated,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    isLoadingProfile,
    devices: devices?.results || [],
    sessions: sessions?.results || [],

    // Actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: (allDevices: boolean = false) => logoutMutation.mutate(allDevices),
    changePassword: changePasswordMutation.mutate,
    requestPasswordReset: passwordResetRequestMutation.mutate,
    confirmPasswordReset: passwordResetConfirmMutation.mutate,
    enable2FA: enable2FAMutation.mutate,
    disable2FA: disable2FAMutation.mutate,
    verify2FA: verify2FAMutation.mutate,
    verifyToken,
    
    // Permissions
    hasRole,
    hasPermission,
    
    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isEnabling2FA: enable2FAMutation.isPending,
    isDisabling2FA: disable2FAMutation.isPending,
  }
}

// Phone verification hook
export function usePhoneVerification() {
  const { updateUser } = useAuthStore()
  
  const sendCodeMutation = useMutation({
    mutationFn: async (data: { phone_number: string, action: string }) => {
      const result = await api.users.sendVerificationCode(data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Verification code sent')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send code'
      toast.error(message)
    }
  })

  const verifyPhoneMutation = useMutation({
    mutationFn: async (data: { phone_number: string, code: string }) => {
      const result = await api.users.verifyPhone(data)
      return result.data
    },
    onSuccess: (response) => {
      toast.success('Phone verified successfully')
      updateUser({ is_phone_verified: true })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Verification failed'
      toast.error(message)
    }
  })

  return {
    sendCode: sendCodeMutation.mutate,
    verifyPhone: verifyPhoneMutation.mutate,
    isSendingCode: sendCodeMutation.isPending,
    isVerifying: verifyPhoneMutation.isPending,
  }
}

// Email verification hook  
export function useEmailVerification() {
  const { updateUser } = useAuthStore()
  
  const verifyEmailMutation = useMutation({
    mutationFn: async (data: { email: string, code: string }) => {
      const result = await api.users.verifyEmail(data)
      return result.data
    },
    onSuccess: () => {
      toast.success('Email verified successfully')
      updateUser({ is_email_verified: true })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Email verification failed'
      toast.error(message)
    }
  })

  return {
    verifyEmail: verifyEmailMutation.mutate,
    isVerifying: verifyEmailMutation.isPending,
  }
}

// ID verification hook
export function useIdVerification() {
  const { updateUser } = useAuthStore()
  
  const verifyIdMutation = useMutation({
    mutationFn: async (data: { national_id: string, document_front: File, document_back?: File }) => {
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
      toast.success('ID verification submitted successfully')
      updateUser({ verification_status: 'pending' })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'ID verification failed'
      toast.error(message)
    }
  })

  return {
    verifyId: verifyIdMutation.mutate,
    isVerifying: verifyIdMutation.isPending,
  }
}
