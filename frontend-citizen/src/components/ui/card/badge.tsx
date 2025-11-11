import { cn } from '@/lib/utils'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full border',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  )
}

export interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    const statusLower = status.toLowerCase()
    if (['active', 'completed', 'success', 'approved', 'compliant'].includes(statusLower)) return 'success'
    if (['pending', 'processing', 'in_progress'].includes(statusLower)) return 'warning'
    if (['failed', 'rejected', 'suspended', 'expired', 'non_compliant'].includes(statusLower)) return 'danger'
    if (['draft', 'scheduled'].includes(statusLower)) return 'info'
    return 'default'
  }

  return (
    <Badge variant={getVariant(status)} className={className}>
      {status.replace(/_/g, ' ').toUpperCase()}
    </Badge>
  )
}

export interface RiskBadgeProps {
  riskLevel: string
  className?: string
}

export function RiskBadge({ riskLevel, className }: RiskBadgeProps) {
  const getVariant = (level: string): 'success' | 'warning' | 'danger' | 'info' => {
    const levelLower = level.toLowerCase()
    if (['low', 'minimal'].includes(levelLower)) return 'success'
    if (['moderate', 'medium'].includes(levelLower)) return 'warning'
    if (['high', 'severe', 'critical'].includes(levelLower)) return 'danger'
    return 'info'
  }

  return (
    <Badge variant={getVariant(riskLevel)} className={className}>
      {riskLevel.toUpperCase()} RISK
    </Badge>
  )
}
