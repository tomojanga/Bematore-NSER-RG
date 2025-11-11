// Auth Types
export interface User {
  id: string
  email: string
  phone_number: string
  role: 'super_admin' | 'grak_admin' | 'operator_admin' | 'citizen'
  is_active: boolean
  is_verified: boolean
  is_phone_verified?: boolean
  is_email_verified?: boolean
  is_id_verified?: boolean
  verification_status?: 'verified' | 'pending' | 'unverified' | 'rejected'
  has_2fa: boolean
  preferred_2fa_method?: '2fa' | 'sms' | 'email'
  created_at: string
  updated_at: string
}

export interface DeviceInfo {
  id?: string
  name: string | null
  type: string
  os: string
  browser: string
  trusted?: boolean
  lastUsed?: Date | null
}

export interface LoginCredentials {
  phone_number: string
  password: string
  remember_device?: boolean
  device_info?: DeviceInfo
}

export interface AuthResponse {
  user: User
  access: string
  refresh: string
  requires2FA?: boolean
  preferredMethod?: '2fa' | 'sms' | 'email'
  biometricAvailable?: boolean
  biometricRegistered?: boolean
}

export interface TwoFactorVerificationData {
  verification_code: string
  method: '2fa' | 'sms' | 'email'
}

export interface Device {
  id: string
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  name: string
  browser: string
  os: string
  lastActive: string
  isCurrent: boolean
  location?: string
  trusted: boolean
  ip_address: string
}

// API Response Types
export interface SingleApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ListApiResponse<T> {
  success: boolean
  message: string
  data: {
    items: T[]
    total: number
    page: number
    size: number
    hasNext: boolean
  }
}

// Registration Types
export interface RegisterData {
  email: string
  phone_number: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  terms_accepted?: boolean
  privacy_policy_accepted?: boolean
  role?: string
  operator_id?: string
}

// Password Reset Types
export interface PasswordResetRequest {
  phone_number: string
}

export interface PasswordResetConfirm {
  token: string
  new_password: string
  confirm_password: string
}