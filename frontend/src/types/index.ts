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
}

export interface UserProfile {
  id: string
  user: string
  bio?: string
  avatar?: string
  date_of_birth?: string
  gender?: 'M' | 'F' | 'O' | 'N'
  address?: string
  postal_code?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  created_at: string
  updated_at: string
}

export interface UserDevice {
  id: string
  user: string
  device_id: string
  device_name?: string
  device_type: 'mobile' | 'desktop' | 'tablet' | 'unknown'
  operating_system?: string
  browser?: string
  is_trusted: boolean
  is_active: boolean
  first_seen_at: string
  last_seen_at: string
  ip_address?: string
  location_data?: Record<string, any>
  created_at: string
  updated_at: string
}

// ============================================================================
// BST (BIOMETRIC SECURITY TOKEN) TYPES
// ============================================================================

export interface BSTToken {
  id: string
  token: string
  token_version: string
  token_hash: string
  token_checksum: string
  user: string
  user_name?: string
  user_phone?: string
  phone_number_hash: string
  national_id_hash?: string
  biometric_hash?: string
  
  // Lifecycle
  status: Status
  is_active: boolean
  issued_at: string
  expires_at?: string
  last_used_at?: string
  
  // Security
  salt: string
  is_compromised: boolean
  compromised_at?: string
  compromised_reason?: string
  
  // Rotation
  previous_token?: string
  rotation_count: number
  rotated_at?: string
  
  // Usage
  lookup_count: number
  operator_count: number
  
  // Metadata
  generation_metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface BSTMapping {
  id: string
  bst_token: string
  operator: string
  operator_name?: string
  operator_user_id: string
  operator_username?: string
  first_seen_at: string
  last_seen_at: string
  interaction_count: number
  last_activity_type: 'registration' | 'login' | 'deposit' | 'bet' | 'withdrawal' | 'lookup'
  is_active: boolean
  is_primary_operator: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface BSTCrossReference {
  id: string
  bst_token: string
  identifier_type: 'phone' | 'email' | 'national_id' | 'device_id' | 'ip_address' | 'sim_card' | 'biometric'
  identifier_hash: string
  first_detected_at: string
  detection_source: 'registration' | 'verification' | 'device_fingerprint' | 'behavioral' | 'operator_report'
  confidence_score: number
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// NSER (SELF-EXCLUSION) TYPES
// ============================================================================

export interface SelfExclusion {
  id: string
  user: string
  user_name?: string
  user_phone?: string
  bst_token: string
  
  // Exclusion Details
  exclusion_reference: string
  exclusion_period: ExclusionPeriod
  custom_period_days?: number
  
  // Dates
  effective_date: string
  expiry_date: string
  actual_end_date?: string
  
  // Auto-Renewal
  is_auto_renewable: boolean
  renewal_count: number
  last_renewed_at?: string
  
  // Status
  status: 'pending' | 'active' | 'expired' | 'terminated' | 'suspended' | 'revoked'
  is_active: boolean
  
  // Reason & Context
  reason?: string
  motivation_type?: 'financial_loss' | 'relationship_issues' | 'mental_health' | 'addiction' | 'precaution' | 'other'
  triggering_assessment?: string
  risk_level_at_exclusion?: RiskLevel
  
  // Computed Properties
  is_currently_active?: boolean
  days_remaining?: number
  progress_percentage?: number
  
  // Consent & Legal
  terms_accepted: boolean
  consent_recorded_at: string
  consent_ip_address?: string
  digital_signature?: string
  
  // Propagation
  propagation_status: 'pending' | 'in_progress' | 'completed' | 'partial' | 'failed'
  operators_notified: number
  operators_acknowledged: number
  propagation_completed_at?: string
  
  // Early Termination
  can_terminate_early: boolean
  early_termination_request_date?: string
  early_termination_approved: boolean
  early_termination_approved_by?: string
  termination_reason?: string
  
  // Notifications
  notification_sent: boolean
  notification_sent_at?: string
  reminder_notifications_enabled: boolean
  
  // Location
  latitude?: number
  longitude?: number
  country_code: Country
  county?: string
  city?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Related Data
  operator_mappings?: OperatorExclusionMapping[]
  audit_logs?: ExclusionAuditLog[]
  
  // Metadata
  metadata?: Record<string, any>
}

export interface OperatorExclusionMapping {
  id: string
  exclusion: string
  operator: string
  operator_name?: string
  notified_at?: string
  acknowledged_at?: string
  propagation_status: 'pending' | 'notified' | 'acknowledged' | 'failed' | 'timeout'
  retry_count: number
  max_retries: number
  next_retry_at?: string
  webhook_sent_at?: string
  webhook_response_code?: number
  webhook_response_body?: string
  last_error_message?: string
  error_count: number
  is_compliant: boolean
  compliance_checked_at?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// SCREENING & ASSESSMENT TYPES
// ============================================================================

export interface AssessmentSession {
  id: string
  user: string
  user_name?: string
  bst_token?: string
  session_reference: string
  assessment_type: AssessmentType
  started_at: string
  completed_at?: string
  status: 'in_progress' | 'completed' | 'abandoned' | 'expired'
  raw_score?: number
  risk_level?: RiskLevel
  operator?: string
  language: Language
  should_self_exclude: boolean
  next_assessment_due?: string
  ml_risk_prediction?: number
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  
  // Related Data
  responses?: AssessmentResponse[]
}

export interface AssessmentQuestion {
  id: string
  question_code: string
  assessment_type: AssessmentType
  question_number: number
  question_text_en: string
  question_text_sw?: string
  response_type: 'yes_no' | 'multiple_choice' | 'scale' | 'text'
  response_options?: Record<string, any>
  max_score: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AssessmentResponse {
  id: string
  session: string
  question: string
  response_value: string
  score: number
  answered_at: string
  created_at: string
  updated_at: string
}

export interface RiskScore {
  id: string
  user: string
  user_name?: string
  bst_token?: string
  score_date: string
  risk_level: RiskLevel
  risk_score: number
  score_source: string
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface BehavioralProfile {
  id: string
  user: string
  total_bets_count: number
  total_amount_wagered: number
  betting_frequency_daily: number
  late_night_betting_count: number
  loss_chasing_score: number
  overall_risk_score: number
  anomaly_flags: string[]
  last_analyzed_at?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// OPERATOR TYPES
// ============================================================================

export interface Operator {
  id: string
  name: string
  trading_name?: string
  registration_number: string
  operator_code: string
  
  // Contact
  email: string
  phone: string
  website?: string
  
  // License
  license_number: string
  license_type: 'online_betting' | 'land_based_casino' | 'lottery' | 'sports_betting' | 'online_casino'
  license_status: Status
  license_issued_date: string
  license_expiry_date: string
  
  // Integration
  integration_status: string
  integration_completed_at?: string
  is_api_active: boolean
  is_webhook_active: boolean
  
  // Compliance
  compliance_score: number
  last_compliance_check?: string
  is_compliant: boolean
  
  // Statistics
  total_users: number
  total_screenings: number
  total_exclusions: number
  
  // Location
  latitude?: number
  longitude?: number
  country_code: Country
  county?: string
  city?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Metadata
  metadata?: Record<string, any>
}

export interface APIKey {
  id: string
  operator: string
  key_name: string
  api_key: string
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
  ip_whitelist: string[]
  created_at: string
  updated_at: string
}

export interface IntegrationConfig {
  id: string
  operator: string
  webhook_url_exclusion?: string
  webhook_url_screening?: string
  webhook_url_compliance?: string
  webhook_secret?: string
  callback_success_url?: string
  callback_failure_url?: string
  auto_propagate_exclusions: boolean
  require_screening_on_register: boolean
  screening_frequency_days: number
  api_version: string
  timeout_seconds: number
  retry_attempts: number
  notification_email?: string
  notification_phone?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

// ============================================================================
// FINANCIAL/SETTLEMENTS TYPES  
// ============================================================================

export interface Transaction {
  id: string
  transaction_reference: string
  operator: string
  operator_name?: string
  transaction_type: 'screening_fee' | 'license_fee' | 'monthly_subscription' | 'penalty' | 'refund'
  amount: number
  currency: Currency
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  payment_method: 'mpesa' | 'bank_transfer' | 'card' | 'wallet'
  payment_reference?: string
  initiated_at: string
  completed_at?: string
  description?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  operator: string
  operator_name?: string
  billing_period_start: string
  billing_period_end: string
  issue_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  currency: Currency
  line_items: any[]
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled'
  paid_at?: string
  payment_transaction?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string
  user: string
  user_name?: string
  notification_type: string
  channel: 'sms' | 'email' | 'push' | 'in_app'
  title: string
  message: string
  priority: Priority
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  scheduled_for?: string
  sent_at?: string
  delivered_at?: string
  read_at?: string
  clicked_at?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface NotificationBatch {
  id: string
  name: string
  description?: string
  notification_type: string
  channel: 'sms' | 'email' | 'push'
  template: string
  recipient_count: number
  sent_count: number
  delivered_count: number
  failed_count: number
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled'
  scheduled_for?: string
  started_at?: string
  completed_at?: string
  created_at: string
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface DashboardStats {
  total_users: number
  active_users: number
  verified_users: number
  total_exclusions: number
  active_exclusions: number
  expired_exclusions: number
  total_operators: number
  active_operators: number
  compliant_operators: number
  pending_assessments: number
  completed_assessments: number
  high_risk_users: number
  moderate_risk_users: number
  low_risk_users: number
  total_bst_tokens: number
  active_bst_tokens: number
  compromised_tokens: number
  total_transactions: number
  total_revenue: number
  compliance_rate: number
  avg_response_time: number
  system_uptime: number
}

export interface ExclusionTrend {
  date: string
  total: number
  new: number
  expired: number
  terminated: number
  active: number
}

export interface RiskDistribution {
  [key: string]: number
  none: number
  low: number
  mild: number
  moderate: number
  high: number
  severe: number
  critical: number
}

// ============================================================================
// AUDIT & COMPLIANCE TYPES
// ============================================================================

export interface AuditLog {
  id: string
  user?: string
  user_name?: string
  action: string
  description: string
  resource_type?: string
  resource_id?: string
  ip_address?: string
  user_agent?: string
  changes?: Record<string, any>
  metadata?: Record<string, any>
  success: boolean
  error_message?: string
  created_at: string
}

export interface ExclusionAuditLog {
  id: string
  exclusion: string
  action: 'created' | 'updated' | 'activated' | 'expired' | 'renewed' | 'terminated' | 'suspended' | 'revoked' | 'viewed' | 'propagated'
  description?: string
  performed_by?: string
  ip_address?: string
  user_agent?: string
  changes?: Record<string, any>
  metadata?: Record<string, any>
  created_at: string
}

export interface ComplianceReport {
  id: string
  operator: string
  operator_name?: string
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
  reviewed_by?: string
  reviewed_at?: string
  file_url?: string
  filename?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// MONITORING TYPES
// ============================================================================

export interface SystemHealth {
  id: string
  status: 'healthy' | 'degraded' | 'down'
  uptime_seconds: number
  database_status: 'ok' | 'slow' | 'error'
  cache_status: 'ok' | 'slow' | 'error'
  celery_status: 'ok' | 'slow' | 'error'
  api_response_time_ms: number
  memory_usage_percent: number
  cpu_usage_percent: number
  disk_usage_percent: number
  active_connections: number
  error_rate_percent: number
  last_error_message?: string
  timestamp: string
}

export interface APIRequestLog {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  status_code: number
  response_time_ms: number
  request_size_bytes: number
  response_size_bytes: number
  user?: string
  operator?: string
  ip_address: string
  user_agent?: string
  error_message?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface Alert {
  id: string
  alert_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  source: string
  status: 'active' | 'acknowledged' | 'resolved'
  triggered_at: string
  acknowledged_at?: string
  resolved_at?: string
  acknowledged_by?: string
  resolved_by?: string
  metadata?: Record<string, any>
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
// FORM DATA TYPES
// ============================================================================

export interface ExclusionFormData {
  user?: string
  exclusion_period: ExclusionPeriod
  custom_period_days?: number
  reason?: string
  motivation_type?: 'financial_loss' | 'relationship_issues' | 'mental_health' | 'addiction' | 'precaution' | 'other'
  is_auto_renewable?: boolean
  effective_date?: string
}

export interface AssessmentFormData {
  user?: string
  assessment_type: AssessmentType
  language?: Language
  operator_id?: string
}

export interface OperatorFormData {
  name: string
  trading_name?: string
  registration_number: string
  email: string
  phone: string
  website?: string
  license_number: string
  license_type: 'online_betting' | 'land_based_casino' | 'lottery' | 'sports_betting' | 'online_casino'
  license_issued_date: string
  license_expiry_date: string
  country_code: Country
  county?: string
  city?: string
}

// ============================================================================
// WEBSOCKET TYPES
// ============================================================================

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

export interface RealTimeUpdate {
  event: string
  resource: string
  action: string
  data: any
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

export interface TableColumn<T = any> {
  key: keyof T
  title: string
  sortable?: boolean
  width?: number
  render?: (value: any, record: T) => React.ReactNode
}

export interface FilterConfig {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'daterange' | 'number'
  options?: SelectOption[]
  placeholder?: string
}
