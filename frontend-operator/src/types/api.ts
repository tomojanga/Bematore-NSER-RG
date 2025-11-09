// ============================================
// OPERATOR TYPES
// ============================================
export interface Operator {
  id: string
  name: string
  trading_name?: string
  registration_number: string
  operator_code: string
  email: string
  phone: string
  website?: string
  license_number?: string
  license_type?: 'online' | 'retail' | 'both'
  license_status: 'active' | 'pending' | 'expired' | 'suspended' | 'revoked'
  license_issued_date?: string
  license_expiry_date?: string
  integration_status: 'pending' | 'in_progress' | 'completed' | 'failed'
  is_api_active: boolean
  is_webhook_active: boolean
  compliance_score: number
  is_compliant: boolean
  total_users: number
  total_screenings: number
  total_exclusions: number
  city?: string
  county?: string
  country_code?: string
  created_at: string
  updated_at: string
}

// ============================================
// API KEY TYPES
// ============================================
export interface APIKey {
  id: string
  operator: string
  key_name: string
  api_key: string
  api_secret?: string
  api_secret_masked?: string
  scopes: string[]
  can_lookup: boolean
  can_register: boolean
  can_screen: boolean
  is_active: boolean
  last_used_at?: string
  usage_count: number
  expires_at?: string
  rate_limit_per_second: number
  rate_limit_per_day: number
  ip_whitelist?: string[]
  days_until_expiry?: number
  usage_today: number
  created_at: string
  updated_at: string
}

// ============================================
// LICENSE TYPES
// ============================================
export interface License {
  id: string
  operator: string
  license_number: string
  license_type: 'online' | 'retail' | 'both'
  issued_date: string
  expiry_date: string
  status: 'active' | 'pending' | 'expired' | 'suspended' | 'revoked'
  issued_by?: string
  conditions?: string
  renewal_count: number
  days_until_expiry?: number
  is_expired: boolean
  is_expiring_soon: boolean
  created_at: string
  updated_at: string
}

// ============================================
// EXCLUSION TYPES
// ============================================
export interface SelfExclusion {
  id: string
  user: string
  reference_number: string
  exclusion_period: '6_months' | '1_year' | '3_years' | '5_years' | 'permanent'
  start_date: string
  end_date?: string
  is_permanent: boolean
  is_active: boolean
  status: 'pending' | 'active' | 'expired' | 'terminated'
  reason?: string
  termination_reason?: string
  auto_renew: boolean
  renewal_count: number
  days_remaining?: number
  created_at: string
  updated_at: string
}

export interface ExclusionLookupRequest {
  phone_number?: string
  national_id?: string
  email?: string
  bst_token?: string
  operator_id: string
}

export interface ExclusionLookupResponse {
  is_excluded: boolean
  exclusion_id?: string
  reference_number?: string
  exclusion_period?: string
  start_date?: string
  end_date?: string
  is_permanent: boolean
  days_remaining?: number
  user_message: string
  lookup_timestamp: string
  response_time_ms: number
  from_cache?: boolean
}

// ============================================
// COMPLIANCE TYPES
// ============================================
export interface ComplianceReport {
  id: string
  operator: string
  operator_name: string
  report_reference: string
  report_period_start: string
  report_period_end: string
  total_users_screened: number
  total_exclusions_enforced: number
  screening_compliance_rate: number
  exclusion_enforcement_rate: number
  avg_lookup_response_ms: number
  avg_webhook_response_ms: number
  compliance_issues: any[]
  violations_count: number
  warnings_issued: number
  overall_score: number
  is_compliant: boolean
  compliance_status: 'excellent' | 'good' | 'adequate' | 'poor' | 'critical'
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
}

// ============================================
// METRICS TYPES
// ============================================
export interface OperatorMetrics {
  period: string
  total_api_calls: number
  successful_calls: number
  failed_calls: number
  success_rate: number
  average_response_time_ms: number
  p95_response_time_ms: number
  p99_response_time_ms: number
  total_exclusions_propagated: number
  propagation_success_rate: number
  webhooks_delivered: number
  webhook_delivery_rate: number
}

// ============================================
// STATISTICS TYPES
// ============================================
export interface OperatorStatistics {
  total_operators: number
  active_operators: number
  integrated_operators: number
  compliant_operators: number
  operators_with_expired_licenses: number
  operators_by_type: Record<string, number>
  operators_by_compliance_score: Record<string, number>
  average_compliance_score: number
}

export interface NSERStatistics {
  total_active_exclusions: number
  new_exclusions_today: number
  by_period: Record<string, number>
  by_status: Record<string, number>
  propagation_metrics: any
}

// ============================================
// NOTIFICATION TYPES
// ============================================
export interface Notification {
  id: string
  user: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  is_read: boolean
  action_url?: string
  created_at: string
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface APIResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string[]>
  status_code?: number
}

export interface PaginatedResponse<T = any> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

// ============================================
// FORM DATA TYPES
// ============================================
export interface OperatorRegistrationData {
  name: string
  trading_name?: string
  registration_number: string
  email: string
  phone: string
  website?: string
  license_number?: string
  license_type?: 'online' | 'retail' | 'both'
  license_issued_date?: string
  license_expiry_date?: string
  city?: string
  county?: string
  country_code?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  terms_accepted: boolean
}

export interface APIKeyGenerationData {
  key_name: string
  scopes?: string[]
  can_lookup?: boolean
  can_register?: boolean
  can_screen?: boolean
  expires_in_days?: number
  rate_limit_per_second?: number
  rate_limit_per_day?: number
}

export interface IntegrationSetupData {
  webhook_url_exclusion?: string
  webhook_url_screening?: string
  webhook_url_compliance?: string
  webhook_secret?: string
  callback_success_url?: string
  callback_failure_url?: string
  auto_propagate_exclusions?: boolean
  require_screening_on_register?: boolean
  screening_frequency_days?: number
  timeout_seconds?: number
  retry_attempts?: number
  notification_email?: string
  notification_phone?: string
}
