import { UseMutateAsyncFunction } from '@tanstack/react-query'
import { 
  User, 
  Device, 
  AuthResponse, 
  LoginCredentials,
  RegisterData,
  TwoFactorVerificationData,
  SingleApiResponse,
  ListApiResponse
} from './auth'

export interface Session {
  id: string
  device: Device
  lastActive: string
  isActive: boolean
  ip_address: string
  location?: string
}

export interface UseAuthReturn {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isLoadingProfile: boolean
  devices: Device[]
  sessions: Session[]

  // Auth Actions
  login: UseMutateAsyncFunction<SingleApiResponse<AuthResponse>, unknown, LoginCredentials, unknown>
  logout: (allDevices?: boolean) => Promise<void>
  register: UseMutateAsyncFunction<SingleApiResponse<AuthResponse>, unknown, RegisterData, unknown>
  
  // 2FA
  verify2FA: UseMutateAsyncFunction<SingleApiResponse<AuthResponse>, unknown, TwoFactorVerificationData, unknown>
  enable2FA: UseMutateAsyncFunction<SingleApiResponse<{ enabled: boolean }>, unknown, { method: '2fa' | 'sms' | 'email', phone_number?: string, email?: string }, unknown>
  disable2FA: UseMutateAsyncFunction<SingleApiResponse<{ disabled: boolean }>, unknown, { password: string, verification_code: string }, unknown>
  resend2FACode: UseMutateAsyncFunction<SingleApiResponse<{ sent: boolean }>, unknown, { method: '2fa' | 'sms' | 'email' }, unknown>

  // Device Management
  revokeDevice: UseMutateAsyncFunction<SingleApiResponse<{ revoked: boolean }>, unknown, string, unknown>
  trustDevice: UseMutateAsyncFunction<SingleApiResponse<{ trusted: boolean }>, unknown, string, unknown>
  refetchDevices: () => Promise<void>
  refetchSessions: () => Promise<void>

  // Password Management
  changePassword: UseMutateAsyncFunction<SingleApiResponse<{ changed: boolean }>, unknown, { current_password: string, new_password: string, new_password_confirm: string }, unknown>
  requestPasswordReset: UseMutateAsyncFunction<SingleApiResponse<{ sent: boolean }>, unknown, { phone_number?: string, email?: string }, unknown>
  
  // Biometric Authentication
  registerBiometric: UseMutateAsyncFunction<SingleApiResponse<{ registered: boolean }>, unknown, void, unknown>
  isBiometricSupported: boolean
  isBiometricAuthenticating: boolean
  biometricLogin: UseMutateAsyncFunction<SingleApiResponse<AuthResponse>, unknown, void, unknown>
  confirmPasswordReset: UseMutateAsyncFunction<SingleApiResponse<{ reset: boolean }>, unknown, { token: string, new_password: string, new_password_confirm: string }, unknown>

  // Utility Functions
  verifyToken: (token: string) => Promise<boolean>
  hasRole: (roles: string | string[]) => boolean
  hasPermission: (permission: string) => boolean
  
  // Loading States
  isLoggingIn: boolean
  isLoggingOut: boolean
  isRegistering: boolean
  isVerifying2FA: boolean
  isResending2FA: boolean
  isEnabling2FA: boolean
  isDisabling2FA: boolean
  isRevokingDevice: boolean
  isTrustingDevice: boolean
  isChangingPassword: boolean
}