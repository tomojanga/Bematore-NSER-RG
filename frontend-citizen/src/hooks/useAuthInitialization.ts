import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api-client'

/**
 * Initialize and validate authentication on app startup
 * This hook validates the stored token against the backend
 */
export function useAuthInitialization() {
  const [isValidating, setIsValidating] = useState(true)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { setUser, logout, accessToken } = useAuthStore()

  useEffect(() => {
    const validateAuth = async () => {
      try {
        const token = localStorage.getItem('access_token')

        // No token = not authenticated
        if (!token) {
          setIsValidating(false)
          return
        }

        // Validate token by attempting to fetch user profile
        try {
          const response = await api.get('/users/me/')
          
          if (response.status === 200 && response.data?.success && response.data?.data) {
            // Token is valid, user is authenticated
            // The useAuth hook will handle setting user data from the profile query
            setIsValidating(false)
          } else {
            // Invalid response structure
            throw new Error('Invalid response from server')
          }
        } catch (apiError: any) {
          // Token is invalid, expired, or revoked
          if (apiError.response?.status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            logout()
            setValidationError('Session expired. Please login again.')
          } else {
            // Other API errors
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            logout()
            setValidationError('Failed to validate session.')
          }
          setIsValidating(false)
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error)
        logout()
        setValidationError('Authentication initialization failed')
        setIsValidating(false)
      }
    }

    validateAuth()
  }, [])

  return {
    isValidating,
    validationError,
    isAuthenticated: accessToken !== null && accessToken !== undefined && !isValidating,
  }
}
