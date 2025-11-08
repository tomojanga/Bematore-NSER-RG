import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import { type Toast } from '@/components/ui/toast'
import { detectDeviceType, detectOS, detectBrowser } from '@/lib/device-detection'
import type { User as SystemUser, Status, VerificationStatus, UserRole, Language, Country } from '@/types/index'
import type { User as AuthUser, DeviceInfo as AuthDeviceInfo, Device as AuthDevice } from '@/types/auth'
import { getDeviceInfo } from '@/lib/device'
import { v4 as uuidv4 } from 'uuid'

// Type guard for AuthUser
const isAuthUser = (user: any): user is AuthUser => {
  return user && 'has_2fa' in user
}
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  Device,
  DeviceInfo,
  TwoFactorVerificationData,
  SingleApiResponse,
  ListApiResponse,
  User
} from '@/types/auth'

import type { UseAuthReturn, Session } from '@/types/useAuth'

interface ApiErrorData {
  message?: string
  errors?: Record<string, string[]>
  code?: string
  status?: string
}

interface ApiError extends Error {
  response?: {
    data: ApiErrorData
    status: number
  }
  status?: number
  code?: string
}

// Type guard for ApiError
function isApiError(error: any): error is ApiError {
  return (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response
  )
}

interface AuthState {/* Lines 42-49 omitted */}

type AuthMethod = '2fa' | 'sms' | 'email' | 'password' | 'biometric'

// Helper function to convert AuthUser to CoreUser
const convertAuthUserToCoreUser = (authUser: AuthUser): SystemUser => {
  // Map the auth role to core role
  const roleMap: Record<AuthUser['role'], UserRole> = {
    'super_admin': 'super_admin',
    'grak_admin': 'grak_admin',
    'operator_admin': 'operator_admin',
    'citizen': 'citizen'
  }

    // Validate the role is allowed in auth system
  if (!['super_admin', 'grak_admin', 'operator_admin', 'citizen'].includes(authUser.role)) {
    throw new Error(`Invalid role: ${authUser.role}`)
  }

  // Map the auth user to core user format
  const coreUser: SystemUser = {
    // Basic info
    id: authUser.id,
    email: authUser.email || '',
    phone_number: authUser.phone_number,
    role: roleMap[authUser.role],
    first_name: '',  // Will be set from profile
    last_name: '',   // Will be set from profile
    full_name: '',   // Will be computed after setting first/last name
    middle_name: '', // Optional field
    status: 'active' as Status,
    gender: 'N',     // Default to 'Not specified'
    
    // Verification
    is_active: authUser.is_active,
    is_verified: authUser.is_verified,
    is_phone_verified: false,  // Will be set from profile
    is_email_verified: false,  // Will be set from profile
    is_id_verified: false,     // Will be set from profile
    verification_status: 'pending' as VerificationStatus,
    
    // Security
    is_staff: authUser.role === 'super_admin',  // Staff for super_admin role
    is_locked: false,          // Default value
    failed_login_attempts: 0,  // Initialize to 0
    
    // 2FA
    is_2fa_enabled: authUser.has_2fa,
    
    // Preferences
    language: 'en' as Language,
    timezone_name: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notification_preferences: {},  // Initialize empty preferences
    
    // Location
    country_code: 'KE' as Country,  // Default to Kenya
    
    // Terms
    terms_accepted: false,
    privacy_policy_accepted: false,
    
    // Timestamps
    created_at: authUser.created_at,
    updated_at: authUser.updated_at,
    
    // Metadata
    metadata: {}
  }

  return coreUser
}


interface VerificationRequest {
  phone_number?: string
  email?: string
  verification_code?: string
  method?: AuthMethod
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [authState, setAuthState] = useState<AuthState>({})
  const [isInitialized, setIsInitialized] = useState(false)
  const {
    user,
    setUser,
    setTokens,
    logout: logoutStore,
    isAuthenticated,
    updateUser
  } = useAuthStore()

  // Toast utility functions
  const showToast = useCallback((props: { 
    title?: string;
    description: string;
    variant?: "default" | "destructive";
    duration?: number;
  }) => {
    return toast({
      ...props,
      duration: props.duration ?? 3000,
    })
  }, [toast])

  const showSuccess = useCallback((message: string) => {
    return showToast({
      title: "Success",
      description: message,
      variant: "default",
      duration: 3000,
    })
  }, [showToast])

  // Initialize auth state from storage
  useEffect(() => {
    if (isInitialized) return

    const initializeAuth = async () => {
      try {
        // Check for temp auth state (2FA flow)
        const tempAuth = sessionStorage.getItem('temp_auth')
        if (tempAuth) {
          try {
            const parsed = JSON.parse(tempAuth)
            // Validate parsed data structure
            if (typeof parsed === 'object' && parsed !== null) {
              const validKeys = ['token', 'refreshToken', 'requires2FA', 'preferredMethod', 'tempDeviceId']
              const hasValidKeys = Object.keys(parsed).every(key => validKeys.includes(key))
              if (hasValidKeys) {
                setAuthState(parsed)
              } else {
                throw new Error('Invalid auth state structure')
              }
            }
          } catch (parseError) {
            console.error('Failed to parse temp auth state:', parseError)
            sessionStorage.removeItem('temp_auth')
          }
        }

        // Initialize or validate device ID
        let deviceId = localStorage.getItem('device_id') ?? undefined
        if (!deviceId) {
          deviceId = uuidv4()
          localStorage.setItem('device_id', deviceId)
        } else {
          // Validate existing device ID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          if (!uuidRegex.test(deviceId)) {
            deviceId = uuidv4()
            localStorage.setItem('device_id', deviceId)
          }
        }

        // Clear expired rate limiting data
        const lastAttempt = localStorage.getItem('last_login_attempt')
        if (lastAttempt) {
          const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt)
          if (timeSinceLastAttempt > 300000) { // 5 minutes
            localStorage.removeItem('last_login_attempt')
            localStorage.removeItem('failed_login_attempts')
          }
        }

        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize auth state:', error)
        // Clear potentially corrupted state
        sessionStorage.removeItem('temp_auth')
        showToast({
          title: "Warning",
          description: "Failed to restore previous session. Please log in again.",
          variant: "destructive",
          duration: 5000,
        })
      }
    }

    initializeAuth()
  }, [isInitialized, showToast])

  // Generate a cryptographically secure fallback device ID
  const generateFallbackDeviceId = useCallback((deviceInfo: AuthDeviceInfo): string => {
    try {
      // Use crypto API for secure random values
      const array = new Uint32Array(4)
      crypto.getRandomValues(array)
      const random = Array.from(array, x => x.toString(16).padStart(8, '0')).join('')
      
      const timestamp = Date.now()
      const deviceHash = `${deviceInfo.type}-${deviceInfo.os}-${deviceInfo.browser}`
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 32)
      
      return `${deviceHash}-${timestamp}-${random}`
    } catch (error) {
      // Final fallback using less secure but available methods
      console.warn('Crypto API not available, using less secure fallback')
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 15)
      const deviceHash = `${deviceInfo.type}-${deviceInfo.os}-${deviceInfo.browser}`
        .replace(/[^a-zA-Z0-9]/g, '')
      return `${deviceHash}-${timestamp}-${random}`
    }
  }, [])

  // Helper function for device info with enhanced security
  const getSecureDeviceInfo = useCallback((): AuthDeviceInfo => {
    const deviceInfo = getDeviceInfo()
    let deviceId = localStorage.getItem('device_id')
    
    if (!deviceId) {
      try {
        // Try UUID v4 first
        deviceId = uuidv4()
      } catch (error) {
        console.error('Failed to generate UUID, using fallback:', error)
        deviceId = generateFallbackDeviceId(deviceInfo)
      }
      
      // Validate generated ID
      if (!deviceId || deviceId.length < 32) {
        console.warn('Generated device ID failed validation, using fallback')
        deviceId = generateFallbackDeviceId(deviceInfo)
      }
      
      localStorage.setItem('device_id', deviceId)
    }

    // Enhance device info with security features
    const secureDeviceInfo: AuthDeviceInfo = {
      ...deviceInfo,
      id: deviceId,
      name: `${deviceInfo.browser} on ${deviceInfo.os}`,
      type: deviceInfo.type,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      lastUsed: new Date(),
      trusted: false
    }

    return secureDeviceInfo
  }, [generateFallbackDeviceId])

  const showError = useCallback((error: ApiError | Error, defaultMessage: string = 'Operation failed') => {
    let message = defaultMessage
    let details: string[] = []
    
    if (isApiError(error) && error.response?.data) {
      if (error.response.data.errors) {
        // Combine all error messages
        details = Object.entries(error.response.data.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        message = details.join('\n')
      } else if (error.response.data.message) {
        message = error.response.data.message
      }
    } else if (error.message) {
      message = error.message
    }

    showToast({
      title: "Error",
      description: message,
      variant: "destructive",
      duration: 5000,
    })

    // Log error for debugging
    console.error('API Error:', {
      message,
      details: details.length ? details : undefined,
      error
    })
  }, [showToast])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      if (!isInitialized) {
        throw new Error('Auth system not initialized')
      }

      const deviceInfo = getSecureDeviceInfo()

      // Validate credentials
      if (!credentials.phone_number || !credentials.password) {
        throw new Error('Phone number and password are required')
      }

      // Validate phone number format
      if (!/^\+?[1-9]\d{1,14}$/.test(credentials.phone_number)) {
        throw new Error('Invalid phone number format')
      }

      // Check password strength (minimum requirements)
      if (credentials.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      // Rate limiting check from localStorage
      const lastAttempt = localStorage.getItem('last_login_attempt')
      const failedAttempts = parseInt(localStorage.getItem('failed_login_attempts') || '0')
      
      if (lastAttempt && failedAttempts >= 5) {
        const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt)
        if (timeSinceLastAttempt < 300000) { // 5 minutes
          throw new Error('Too many failed attempts. Please try again later.')
        } else {
          // Reset failed attempts after timeout
          localStorage.setItem('failed_login_attempts', '0')
        }
      }

      try {
        const { data } = await api.post<SingleApiResponse<AuthResponse>>('/auth/login/', {
          ...credentials,
          device_info: deviceInfo,
          timestamp: Date.now() // Add timestamp for request freshness
        })

        if (!data.success || !data.data) {
          throw new Error(data.message || 'Invalid response from server')
        }

        return data as SingleApiResponse<AuthResponse>
      } catch (error: any) {
        // Handle specific error cases
        if (error.response?.status === 401) {
          throw new Error('Invalid phone number or password')
        } else if (error.response?.status === 403) {
          if (error.response.data?.code === 'ACCOUNT_LOCKED') {
            throw new Error('Account locked. Please contact support.')
          } else if (error.response.data?.code === 'VERIFICATION_REQUIRED') {
            throw new Error('Please verify your account first.')
          }
        } else if (error.response?.status === 429) {
          throw new Error('Too many login attempts. Please try again later.')
        }
        throw error
      }
    },
    onSuccess: (response) => {
      const { data } = response

      // Handle 2FA requirements
      if (data.requires2FA) {
        setAuthState({
          token: data.access,
          refreshToken: data.refresh,
          requires2FA: true,
          preferredMethod: data.preferredMethod,
          tempDeviceId: localStorage.getItem('device_id')
        })

        // Store temp auth state
        sessionStorage.setItem('temp_auth', JSON.stringify({
          token: data.access,
          refreshToken: data.refresh,
          requires2FA: true,
          preferredMethod: data.preferredMethod
        }))

        // Redirect to 2FA verification
        router.push(`/2fa/verify?method=${data.preferredMethod || '2fa'}`)
        return
      }

      // Regular login success
      const coreUser = convertAuthUserToCoreUser(data.user)
      setUser(coreUser)
      setTokens(data.access, data.refresh)
      
      // Clear any temporary auth state
      sessionStorage.removeItem('temp_auth')
      setAuthState({})

      toast({
        title: "Success",
        description: 'Login successful',
        duration: 3000,
      })

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['auth'] })

      // Handle biometric registration if available
      if (data.biometricAvailable && !data.biometricRegistered) {
        router.push('/security/setup-biometric')
        return
      }

      // Redirect based on user role and verification status
      if (!data.user.is_verified) {
        router.push('/verify-account')
        return
      }

      // Role-based routing
      const roleRoutes = {
        super_admin: '/portals/grak',
        grak_admin: '/portals/grak',
        operator_admin: '/portals/operator',
        citizen: '/portals/citizen'
      }

      const redirectPath = roleRoutes[data.user.role as keyof typeof roleRoutes] || '/dashboard'
      router.push(redirectPath)
    },
    onError: (error: ApiError) => {
      // Clear any temporary auth state on error
      sessionStorage.removeItem('temp_auth')
      setAuthState({})
      
      if (error.response?.status === 401) {
        showError(error, 'Invalid phone number or password')
      } else if (error.response?.status === 403) {
        if (error.response.data?.code === 'ACCOUNT_LOCKED') {
          showError(error, 'Account locked. Please contact support.')
        } else if (error.response.data?.code === 'VERIFICATION_REQUIRED') {
          showError(error, 'Please verify your account first.')
        } else {
          showError(error, 'Access denied')
        }
      } else if (error.response?.status === 429) {
        showError(error, 'Too many login attempts. Please try again later.')
      } else {
        showError(error, 'Login failed. Please try again.')
      }
    }
  })

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      // Validate required fields
      const requiredFields = ['email', 'phone_number', 'password', 'confirm_password', 'first_name', 'last_name']
      const missingFields = requiredFields.filter(field => !userData[field as keyof RegisterData])
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      // Validate password match
      if (userData.password !== userData.confirm_password) {
        throw new Error('Passwords do not match')
      }

      // Get device info and generate device ID if not exists
      const deviceInfo = getDeviceInfo()
      const deviceId = localStorage.getItem('device_id') || 
        `${deviceInfo.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      if (!localStorage.getItem('device_id')) {
        localStorage.setItem('device_id', deviceId)
      }

      try {
        const { data } = await api.post('/auth/register/', {
          ...userData,
          device_info: {
            ...deviceInfo,
            id: deviceId
          }
        })
        return data as SingleApiResponse<AuthResponse>
      } catch (error: any) {
        // Handle specific registration errors
        if (error.response?.status === 409) {
          throw new Error('A user with this email or phone number already exists')
        }
        throw error
      }
    },
    onSuccess: (response) => {
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Invalid response from server')
      }

      const { user: newUser, access, refresh, requires2FA } = response.data

      // Validate user data
      if (!newUser || typeof newUser !== 'object' || !('id' in newUser)) {
        throw new Error('Invalid user data received')
      }

      // Validate required user fields
      const requiredFields: Array<keyof User> = [
        'id', 'email', 'phone_number', 'role', 
        'is_active', 'is_verified', 'created_at', 'updated_at'
      ]
      
      const missingFields = requiredFields.filter(field => !(field in newUser))
      if (missingFields.length > 0) {
        console.error('Missing required user fields:', missingFields)
        throw new Error('Invalid user data: missing required fields')
      }

      // Handle 2FA setup if required
      if (requires2FA) {
        // Store temporary tokens
        sessionStorage.setItem('temp_auth', JSON.stringify({
          access,
          refresh,
          requires2FA,
          isNewRegistration: true
        }))
        router.push('/2fa/setup')
        return
      }

      // Convert AuthUser to CoreUser
      const coreUser = convertAuthUserToCoreUser(newUser)
      
      // Regular registration success
      setUser(coreUser)
      setTokens(access, refresh)
      
      showSuccess('Registration successful')
      
      // Clear any temporary auth data
      sessionStorage.removeItem('temp_auth')

      showSuccess(response.message || 'Registration successful')

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['auth'] })

      // Redirect based on user role and verification status
      if (!newUser.is_verified) {
        router.push('/verify-account')
      } else {
        const roleRoutes = {
          super_admin: '/portals/grak',
          grak_admin: '/portals/grak',
          operator_admin: '/portals/operator',
          citizen: '/portals/citizen'
        }
        router.push(roleRoutes[newUser.role as keyof typeof roleRoutes] || '/dashboard')
      }
    },
    onError: (error: any) => {
      showError(error)
    }
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (logoutAllDevices: boolean = false) => {
      const refreshToken = localStorage.getItem('refresh_token')
      const deviceId = localStorage.getItem('device_id')

      if (!refreshToken) {
        throw new Error('No refresh token found')
      }

      try {
        const { data } = await api.post('/auth/logout/', { 
          refresh_token: refreshToken,
          device_id: deviceId,
          all_devices: logoutAllDevices 
        })
        return data as SingleApiResponse<{ logged_out: boolean }>
      } catch (error) {
        // If the server request fails, we'll still clear local state
        // but we'll throw the error to trigger onError
        throw error
      }
    },
    onSuccess: (response) => {
      // Clear all auth-related storage
      localStorage.removeItem('refresh_token')
      sessionStorage.removeItem('temp_auth')
      
      if (!response.data?.logged_out) {
        // If all devices were logged out, also remove device ID
        localStorage.removeItem('device_id')
      }

      // Clear local state
      logoutStore()
      
      // Clear all queries except UI preferences
      queryClient.removeQueries({ queryKey: ['auth'] })
      queryClient.removeQueries({ queryKey: ['user'] })
      
      toast({
        title: "Success",
        description: 'Logged out successfully',
        duration: 3000,
      })
      
      // Redirect to login
      router.push('/login')
    },
    onError: (error: ApiError) => {
      console.error('Logout error:', error)
      
      // Even if logout API fails, clear local state for security
      localStorage.removeItem('refresh_token')
      sessionStorage.removeItem('temp_auth')
      logoutStore()
      queryClient.removeQueries({ queryKey: ['auth'] })
      queryClient.removeQueries({ queryKey: ['user'] })
      
      toast({
        title: "Notice",
        description: 'You have been logged out',
        duration: 3000,
      })
      
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
      const { data: result } = await api.post('/auth/change-password/', data)
      return result
    },
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: response.message || 'Password changed successfully',
        variant: "default",
        duration: 3000,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to change password',
        variant: "destructive",
        duration: 3000,
      })
    }
  })

  // Password reset request mutation
  const passwordResetRequestMutation = useMutation({
    mutationFn: async (data: { phone_number?: string; email?: string }) => {
      if (!data.phone_number && !data.email) {
        throw new Error('Either phone number or email is required')
      }

      // Validate phone number format if provided
      if (data.phone_number && !/^\+?[1-9]\d{1,14}$/.test(data.phone_number)) {
        throw new Error('Invalid phone number format')
      }

      // Validate email format if provided
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('Invalid email format')
      }

      // Rate limiting check from localStorage
      const lastAttempt = localStorage.getItem('last_reset_attempt')
      if (lastAttempt) {
        const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt)
        if (timeSinceLastAttempt < 60000) { // 1 minute
          throw new Error('Please wait before requesting another reset code')
        }
      }
      
      const { data: result } = await api.post<SingleApiResponse<{ message: string }>>('/auth/request-password-reset/', data)
      
      // Update rate limiting
      localStorage.setItem('last_reset_attempt', Date.now().toString())
      
      return result
    },
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.message || 'Failed to send reset code')
      }
      toast({
        title: "Success",
        description: response.message || 'Reset code sent',
      })
    },
    onError: (error: ApiError) => {
      showError(error, 'Failed to send reset code')
    }
  })

  // Password reset confirm mutation
  const passwordResetConfirmMutation = useMutation({
    mutationFn: async (data: { 
      token: string
      new_password: string
      new_password_confirm: string 
    }) => {
      const { data: result } = await api.post('/auth/reset-password/', data)
      return result
    },
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: response.message || 'Password reset successful',
        variant: "default",
        duration: 3000,
      })
      router.push('/login')
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Password reset failed',
        variant: "destructive",
        duration: 3000,
      })
    }
  })

  // Enable 2FA mutation
  const enable2FAMutation = useMutation({
    mutationFn: async (data: { 
      method: 'totp' | 'sms' | 'email'
      phone_number?: string
      email?: string 
    }) => {
      const { data: result } = await api.post('/auth/2fa/enable/', data)
      return result
    },
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: '2FA enabled successfully',
        variant: "default",
        duration: 3000,
      })
      if (user) {
        updateUser({ is_2fa_enabled: true })
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to enable 2FA',
        variant: "destructive",
        duration: 3000,
      })
    }
  })

  // Disable 2FA mutation
  const disable2FAMutation = useMutation({
    mutationFn: async (data: { 
      password: string
      verification_code: string 
    }) => {
      if (!data.password || !data.verification_code) {
        throw new Error('Password and verification code are required')
      }
      const { data: result } = await api.post('/auth/2fa/disable/', data)
      return result as SingleApiResponse<{ disabled: boolean }>
    },
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.message || 'Failed to disable 2FA')
      }
      toast({
        title: "Success",
        description: '2FA disabled successfully'
      })
      if (user) {
        updateUser({ is_2fa_enabled: false })
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })
      }
    },
    onError: (error: ApiError) => {
      showError(error, 'Failed to disable 2FA')
    }
  })

  // Verify 2FA mutation
  const verify2FAMutation = useMutation({
    mutationFn: async (data: { verification_code: string }) => {
      const { data: result } = await api.post('/auth/2fa/verify/', data)
      return result
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: '2FA verification successful',
        variant: "default",
        duration: 3000,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || '2FA verification failed',
        variant: "destructive",
        duration: 3000,
      })
    }
  })

  // Enhanced session refresh with jitter and retry
  useEffect(() => {
    if (!isAuthenticated) return
    let timeoutId: NodeJS.Timeout
    let retryCount = 0
    const MAX_RETRIES = 3
    const BASE_INTERVAL = 23 * 60 * 60 * 1000 // 23 hours
    const JITTER_MAX = 60 * 1000 // 1 minute

    const refreshSession = async () => {
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          logoutStore()
          router.push('/login')
          return
        }

        const { data } = await api.post('/auth/token/refresh/', {
          refresh: refreshToken
        })

        if (data.access) {
          setTokens(data.access, refreshToken)
          retryCount = 0
          const jitter = Math.random() * JITTER_MAX
          scheduleNextRefresh(BASE_INTERVAL + jitter)
        } else {
          throw new Error('Invalid refresh response')
        }
      } catch (error) {
        console.error('Failed to refresh session:', error)
        
        if (retryCount < MAX_RETRIES) {
          retryCount++
          // Exponential backoff with jitter
          const backoff = Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 1000, 30000)
          timeoutId = setTimeout(refreshSession, backoff)
        } else {
          // After max retries, log out user
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
            duration: 5000,
          })
          logoutStore()
          router.push('/login')
        }
      }
    }

    const scheduleNextRefresh = (delay: number) => {
      timeoutId = setTimeout(refreshSession, delay)
    }

    // Initial refresh schedule with jitter
    const jitter = Math.random() * JITTER_MAX
    scheduleNextRefresh(BASE_INTERVAL + jitter)

    // Visibility change handler to refresh session when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSession()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, setTokens, logoutStore, router, getSecureDeviceInfo, toast])

  // Current user profile query
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      try {
        // Get profile data with explicit AuthUser type
        const { data } = await api.get<SingleApiResponse<AuthUser>>('/users/me/')
        if (!data.success) {
          throw new Error('Failed to fetch profile')
        }
        return data
      } catch (error: any) {
        const apiError = error as Error | ApiError
        showError(apiError)
        throw apiError
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    refetchOnWindowFocus: true // Refresh when tab becomes active
  })

  // Update user in store when profile data changes
  useEffect(() => {
    let isMounted = true
    
    if (isMounted && profile?.success && profile.data && (!user || user.id !== profile.data.id)) {
      // Convert AuthUser to SystemUser before setting in store
      const systemUser = convertAuthUserToCoreUser(profile.data)
      setUser(systemUser)
    }

    return () => {
      isMounted = false
    }
  }, [profile, user, setUser, convertAuthUserToCoreUser])

  // User devices query
  const { data: devicesData, refetch: refetchDevices } = useQuery({
    queryKey: ['auth', 'devices'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/users/me/devices/')
        return data as ListApiResponse<AuthDevice>
      } catch (error) {
        const apiError = error as Error | ApiError
        showError(apiError)
        throw apiError
      }
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  })

  // User sessions query
  const { data: sessionsData, refetch: refetchSessions } = useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/users/me/sessions/')
        return data as ListApiResponse<{
          id: string
          device: AuthDevice
          lastActive: string
          isActive: boolean
          ip_address: string
          location?: string
        }>
      } catch (error) {
        // Type guard to check if error is ApiError
        const apiError = error as Error | ApiError
        showError(apiError)
        throw apiError
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })

  // Device trust mutation
  const trustDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const { data } = await api.post(`/users/devices/${deviceId}/trust/`, { trust: true })
      return data as SingleApiResponse<{ trusted: boolean }>
    },
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.message || 'Failed to trust device')
      }
      toast({
        title: "Success",
        description: 'Device marked as trusted'
      })
      refetchDevices()
    },
    onError: (error: any) => {
      showError(error)
    }
  })

  // Device revoke mutation
  const revokeDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const { data } = await api.post(`/users/devices/${deviceId}/block/`)
      return data as SingleApiResponse<{ revoked: boolean }>
    },
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.message || 'Failed to revoke device')
      }
      toast({
        title: "Success",
        description: 'Device access revoked'
      })
      refetchDevices()
      refetchSessions()
    },
    onError: (error: any) => {
      showError(error)
    }
  })

  // Token verification
  const verifyToken = async (token: string): Promise<boolean> => {
    if (!token || typeof token !== 'string') return false

    try {
      const { data } = await api.post<SingleApiResponse<{ valid: boolean }>>('/auth/verify-token/', { token })
      return data?.success === true && data?.data?.valid === true
    } catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  // Check if user has specific role
  const hasRole = (roles: string | string[]): boolean => {
    if (!user?.role) return false
    const rolesArray = Array.isArray(roles) ? roles : [roles]
    
    // Validate role format
    const validRoles = new Set([
      'super_admin', 'grak_admin', 'grak_officer', 'grak_auditor',
      'operator_admin', 'operator_user', 'bematore_admin', 'bematore_analyst', 'citizen'
    ])
    if (!rolesArray.every(role => validRoles.has(role))) {
      console.warn('Invalid role requested:', rolesArray)
      return false
    }
    
    return rolesArray.includes(user.role)
  }

  // Check if user has permission
  const hasPermission = (permission: string): boolean => {
    if (!user?.role) return false
    
    // Validate permission format
    if (!/^[a-z_]+$/.test(permission)) {
      console.warn('Invalid permission format:', permission)
      return false
    }
    
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

  // Biometric authentication
  const biometricLoginMutation = useMutation({
    mutationFn: async () => {
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn not supported in this browser')
      }

      try {
        // Get challenge from server
        const { data: challengeResponse } = await api.get<SingleApiResponse<{ challenge: string }>>('/auth/biometric/challenge/')
        
        if (!challengeResponse.success || !challengeResponse.data.challenge) {
          throw new Error('Failed to get authentication challenge')
        }

        // Create credential
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(Buffer.from(challengeResponse.data.challenge, 'base64')),
            rpId: window.location.hostname,
            timeout: 60000,
            userVerification: 'preferred',
          }
        })

        // Verify with server
        const { data: authResponse } = await api.post<SingleApiResponse<AuthResponse>>('/auth/biometric/authenticate/', {
          credential,
          device_info: getSecureDeviceInfo()
        })

        return authResponse
      } catch (error: any) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Biometric authentication was denied')
        }
        throw error
      }
    },
    onSuccess: (response) => {
      if (!response.success || !response.data) {
        throw new Error('Authentication failed')
      }

      setUser(response.data.user)
      setTokens(response.data.access, response.data.refresh)

      toast({
        title: "Success",
        description: 'Biometric authentication successful',
        duration: 3000,
      })

      queryClient.invalidateQueries({ queryKey: ['auth'] })
      router.push('/dashboard')
    },
    onError: (error: ApiError) => {
      showError(error, 'Biometric authentication failed')
    }
  })

  return {
    // State
    user: (profile?.success && profile.data) 
      ? convertAuthUserToCoreUser(profile.data) 
      : isAuthUser(user) ? convertAuthUserToCoreUser(user) : user as AuthUser | null,
    isAuthenticated,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    isLoadingProfile,
    devices: devicesData?.success ? devicesData.data.items : [],
    sessions: sessionsData?.success ? sessionsData.data.items : [],

    // Device Management
    trustDevice: async (deviceId: string) => {
      return trustDeviceMutation.mutateAsync(deviceId)
    },
    revokeDevice: async (deviceId: string) => {
      return revokeDeviceMutation.mutateAsync(deviceId)
    },
    refetchDevices: async () => {
      await refetchDevices()
    },
    refetchSessions: async () => {
      await refetchSessions()
    },
    isTrustingDevice: trustDeviceMutation.isPending,
    isRevokingDevice: revokeDeviceMutation.isPending,
    
    // Biometric Authentication
    biometricLogin: biometricLoginMutation.mutateAsync,
    isBiometricSupported: typeof window !== 'undefined' ? !!window.PublicKeyCredential : false,
    isBiometricAuthenticating: biometricLoginMutation.isPending,

    // Actions
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: async (allDevices: boolean = false) => {
      await logoutMutation.mutateAsync(allDevices)
    },
    changePassword: changePasswordMutation.mutateAsync,
    requestPasswordReset: passwordResetRequestMutation.mutateAsync,
    confirmPasswordReset: passwordResetConfirmMutation.mutateAsync,
    enable2FA: enable2FAMutation.mutateAsync,
    disable2FA: disable2FAMutation.mutateAsync,
    verify2FA: verify2FAMutation.mutateAsync,
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
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const showError = useCallback((error: ApiError, defaultMessage: string = 'Operation failed') => {
    let message = defaultMessage
    if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.message) {
      message = error.message
    }

    toast({
      title: "Error",
      description: message,
      variant: "destructive",
      duration: 3000,
    })
  }, [toast])

  const sendCodeMutation = useMutation({
    mutationFn: async (data: { phone_number: string, action: string }) => {
      const { data: result } = await api.post('/users/verify/send-code/', { type: 'phone' })
      return result as SingleApiResponse<{ message: string }>
    },
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error('Operation failed')
      }
      toast({
        title: "Success",
        description: response.message || 'Verification code sent',
        variant: "default",
        duration: 3000,
      })
    },
    onError: (error: any) => {
      showError(error, 'Failed to send verification code')
    }
  })

  const verifyPhoneMutation = useMutation({
    mutationFn: async (data: { phone_number: string, code: string }) => {
      const { data: result } = await api.post('/users/verify/phone/', {
        phone_number: data.phone_number,
        verification_code: data.code
      })
      return result as SingleApiResponse<{ is_verified: boolean }>
    },
    onSuccess: async (response) => {
      if (!response.success) {
        throw new Error('Verification failed')
      }
      toast({
        title: "Success",
        description: response.message || 'Phone verified successfully'
      })
      updateUser({ is_phone_verified: true })
      await queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })
    },
    onError: (error: any) => {
      showError(error)
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
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const verifyEmailMutation = useMutation({
    mutationFn: async (data: { email: string, code: string }) => {
      if (!data.email || !data.code) {
        throw new Error('Email and verification code are required')
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('Invalid email format')
      }

      if (!/^\d{6}$/.test(data.code)) {
        throw new Error('Verification code must be 6 digits')
      }

      const { data: result } = await api.post<SingleApiResponse<{ verified: boolean }>>('/users/verify/email/', {
        email: data.email,
        verification_code: data.code
      })
      return result
    },
    onSuccess: async (response) => {
      if (!response.success) {
        throw new Error(response.message || 'Email verification failed')
      }
      toast({
        title: "Success",
        description: response.message || 'Email verified successfully',
        duration: 5000,
      })
      updateUser({ is_email_verified: true })
      await queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })
    },
    onError: (error: ApiError) => {
      const defaultMessage = 'Failed to verify email. Please check the code and try again.'
      toast({
        title: "Error",
        description: error.response?.data?.message || defaultMessage,
        variant: "destructive",
        duration: 5000,
      })
    }
  })

  return {
    verifyEmail: verifyEmailMutation.mutate,
    isVerifying: verifyEmailMutation.isPending,
    error: verifyEmailMutation.error as ApiError | null,
    isSuccess: verifyEmailMutation.isSuccess,
  }
}// ID verification hook
export function useIdVerification() {
  const { updateUser } = useAuthStore()
  const { toast } = useToast()
  
  const verifyIdMutation = useMutation({
    mutationFn: async (data: { national_id: string, document_front: File, document_back?: File }) => {
      try {
        const formData = new FormData()
        formData.append('national_id', data.national_id)
        
        // Validate file type and size
        const validFileTypes = ['image/jpeg', 'image/png', 'application/pdf']
        const maxSize = 5 * 1024 * 1024 // 5MB
        
        if (!validFileTypes.includes(data.document_front.type)) {
          throw new Error('Invalid file type. Please upload JPEG, PNG or PDF')
        }
        if (data.document_front.size > maxSize) {
          throw new Error('File size too large. Maximum size is 5MB')
        }
        
        formData.append('document_front', data.document_front)
        
        if (data.document_back) {
          if (!validFileTypes.includes(data.document_back.type)) {
            throw new Error('Invalid file type for back document')
          }
          if (data.document_back.size > maxSize) {
            throw new Error('Back document size too large')
          }
          formData.append('document_back', data.document_back)
        }
        
        const result = await api.upload('/users/verify/id/', formData)
        return result.data as SingleApiResponse<{ verification_status: string }>
      } catch (error: any) {
        if (error.message) throw error
        throw new Error('Failed to upload verification documents')
      }
    },
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.message || 'Verification submission failed')
      }
      toast({
        title: "Success",
        description: 'ID verification submitted successfully',
        variant: "default",
        duration: 3000,
      })
      updateUser({ verification_status: 'pending' })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'ID verification failed',
        variant: "destructive",
        duration: 3000,
      })
    }
  })

  return {
    verifyId: verifyIdMutation.mutate,
    isVerifying: verifyIdMutation.isPending,
  }
}
