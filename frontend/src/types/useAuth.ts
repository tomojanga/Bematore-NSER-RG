import { UseMutateAsyncFunction } from '@tanstack/react-query'
import { 
  User, 
  Device, 
  AuthResponse, 
  LoginCredentials,
  TwoFactorVerificationData,
  SingleApiResponse 
} from './auth'

export interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  login: UseMutateAsyncFunction<SingleApiResponse<AuthResponse>, unknown, LoginCredentials, unknown>
  isLoggingIn: boolean
  logout: UseMutateAsyncFunction<void, unknown, void, unknown>
  isLoggingOut: boolean
  verify2FA: UseMutateAsyncFunction<AuthResponse, unknown, TwoFactorVerificationData, unknown>
  isVerifying2FA: boolean
  resend2FACode: UseMutateAsyncFunction<void, unknown, { method: '2fa' | 'sms' | 'email' }, unknown>
  isResending2FA: boolean
  devices: Device[] | undefined
  revokeDevice: UseMutateAsyncFunction<void, unknown, string, unknown>
  isRevokingDevice: boolean
  trustDevice: UseMutateAsyncFunction<void, unknown, string, unknown>
  isTrustingDevice: boolean
  refetchDevices: () => Promise<void>
}