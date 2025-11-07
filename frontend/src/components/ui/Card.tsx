import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 shadow-sm',
      className
    )}>
      {children}
    </div>
  )
}

// Card Header
interface CardHeaderProps {
  className?: string
  children: React.ReactNode
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn('p-6 border-b border-gray-200', className)}>
      {children}
    </div>
  )
}

// Card Title
interface CardTitleProps {
  className?: string
  children: React.ReactNode
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

// Card Content
interface CardContentProps {
  className?: string
  children: React.ReactNode
}

export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  )
}

// Card Footer
interface CardFooterProps {
  className?: string
  children: React.ReactNode
}

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={cn('p-6 border-t border-gray-200', className)}>
      {children}
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  loading?: boolean
  onClick?: () => void
}

export function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'blue', 
  loading = false,
  onClick 
}: StatCardProps) {
  const colorStyles = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500'
  }

  const changeColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  }

  return (
    <Card className={cn('transition-all duration-200', onClick && 'cursor-pointer hover:shadow-md')}>
      <CardContent className="p-6">
        {loading ? (
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div onClick={onClick}>
            <div className="flex items-center justify-between mb-4">
              {icon && (
                <div className={cn('p-3 rounded-lg', colorStyles[color])}>
                  <div className="h-6 w-6 text-white">
                    {icon}
                  </div>
                </div>
              )}
              {change && (
                <div className={cn('text-sm font-medium', changeColors[change.direction])}>
                  {change.direction === 'up' && '+'}
                  {change.direction === 'down' && '-'}
                  {change.value}
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
            <p className="text-3xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Badge Component
interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className 
}: BadgeProps) {
  const variants = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800'
  }

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }

  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  )
}

// Status Badge with automatic color mapping
interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
    const lowercaseStatus = status.toLowerCase()
    
    if (['active', 'verified', 'completed', 'paid', 'success'].includes(lowercaseStatus)) {
      return 'success'
    } else if (['pending', 'processing', 'in_progress', 'issued'].includes(lowercaseStatus)) {
      return 'warning'
    } else if (['inactive', 'failed', 'expired', 'suspended', 'revoked', 'overdue'].includes(lowercaseStatus)) {
      return 'danger'
    } else if (['draft', 'cancelled'].includes(lowercaseStatus)) {
      return 'secondary'
    } else {
      return 'info'
    }
  }

  const formatStatus = (status: string): string => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <Badge variant={getStatusVariant(status)} className={className}>
      {formatStatus(status)}
    </Badge>
  )
}

// Risk Level Badge
interface RiskBadgeProps {
  riskLevel: string
  className?: string
}

export function RiskBadge({ riskLevel, className }: RiskBadgeProps) {
  const getRiskVariant = (level: string): 'success' | 'warning' | 'danger' | 'info' => {
    const lowercaseLevel = level.toLowerCase()
    
    if (['none', 'low'].includes(lowercaseLevel)) {
      return 'success'
    } else if (['mild', 'moderate'].includes(lowercaseLevel)) {
      return 'warning'
    } else if (['high', 'severe', 'critical'].includes(lowercaseLevel)) {
      return 'danger'
    } else {
      return 'info'
    }
  }

  const formatRiskLevel = (level: string): string => {
    const levelMap: Record<string, string> = {
      'none': 'No Risk',
      'low': 'Low Risk',
      'mild': 'Mild Risk',
      'moderate': 'Moderate Risk',
      'high': 'High Risk',
      'severe': 'Severe Risk',
      'critical': 'Critical Risk'
    }
    return levelMap[level.toLowerCase()] || level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <Badge variant={getRiskVariant(riskLevel)} className={className}>
      {formatRiskLevel(riskLevel)}
    </Badge>
  )
}

// Progress Bar Component
interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  color?: 'blue' | 'green' | 'yellow' | 'red'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  showPercentage = true, 
  color = 'blue',
  size = 'md',
  className 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const colorStyles = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  }
  
  const sizeStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div className={cn('bg-gray-200 rounded-full overflow-hidden', sizeStyles[size])}>
        <div 
          className={cn('transition-all duration-300 rounded-full', colorStyles[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}