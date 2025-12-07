/**
 * NSER-RG System Frontend Types
 * Comprehensive type definitions matching Django backend models
 */

// ============================================================================
// BASE TYPES & ENUMS
// ============================================================================

export type Status = 'pending' | 'active' | 'inactive' | 'suspended' | 'expired' | 'revoked' | 'completed' | 'failed' | 'cancelled' | 'processing'

export type RiskLevel = 'none' | 'low' | 'mild' | 'moderate' | 'high' | 'severe' | 'critical' | 'blacklisted'

export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'critical'

export type Language = 'en' | 'sw' | 'fr' | 'ar' | 'pt' | 'am' | 'ha' | 'yo' | 'ig' | 'zu' | 'af' | 'pcm'

export type Currency = 'KES' | 'USD' | 'EUR' | 'GBP' | 'TZS' | 'UGX' | 'RWF' | 'BIF'

export type Country = 'KE' | 'TZ' | 'UG' | 'RW' | 'BI' | 'SS' | 'ET' | 'SO' | 'DJ'

export type UserRole = 'super_admin' | 'grak_admin' | 'grak_officer' | 'grak_auditor' | 'operator_admin' | 'operator_user' | 'bematore_admin' | 'bematore_analyst' | 'citizen' | 'api_user'

export type ExclusionPeriod = '6_months' | '1_year' | '5_years' | 'permanent' | 'custom'

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed' | 'expired' | 'suspended'

export type AssessmentType = 'liebet' | 'pgsi' | 'dsm5' | 'behavioral' | 'custom'

// ============================================================================
// CORE USER TYPES
// ============================================================================

export interface User {
  id: string
  phone_number: string
  email?: string
  first_name: string
  last_name: string
  middle_name?: string
  full_name: string
  date_of_birth?: string
  age?: number
  gender?: 'M' | 'F' | 'O' | 'N'
  role: UserRole
  status: Status
  
  // Verification
  is_phone_verified: boolean
  is_email_verified: boolean
  is_id_verified: boolean
  verification_status: VerificationStatus
  verified_at?: string
  is_verified: boolean
  
  // Security
  is_active: boolean
  is_staff: boolean
  is_locked: boolean
  locked_until?: string
  failed_login_attempts: number
  last_login_at?: string
  last_login_ip?: string
  last_login?: string
  
  // 2FA
  is_2fa_enabled: boolean
  
  // Preferences
  language: Language
  timezone_name: string
  notification_preferences: Record<string, any>
  
  // Location
  country_code: Country
  county?: string
  city?: string
  latitude?: number
  longitude?: number
  
  // Terms
  terms_accepted: boolean
  terms_accepted_at?: string
  privacy_policy_accepted: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Metadata
  metadata?: Record<string, any>

  // BST Token (optional for verified users)
  bst_token?: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  count: number
  next?: string | null
  previous?: string | null
  results: T[]
}

export interface SingleApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, any>
  meta?: Record<string, any>
}

export interface PaginatedParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  [key: string]: any
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}

export interface LoginCredentials {
  phone_number: string
  password: string
  device_id?: string
  device_name?: string
}

export interface RegisterData {
  phone_number: string
  email?: string
  first_name: string
  last_name: string
  middle_name?: string
  password: string
  password_confirm: string
  date_of_birth?: string
  gender?: 'M' | 'F' | 'O' | 'N'
  country_code?: Country
  county?: string
  city?: string
  terms_accepted: boolean
  privacy_policy_accepted: boolean
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}
