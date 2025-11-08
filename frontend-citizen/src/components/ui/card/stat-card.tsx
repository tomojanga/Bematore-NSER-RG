import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'
  change?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  subtitle?: string
  className?: string
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  purple: 'bg-purple-50 text-purple-600',
  gray: 'bg-gray-50 text-gray-600',
}

export function StatCard({ title, value, icon, color = 'blue', change, subtitle, className }: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        {icon && (
          <div className={cn('p-3 rounded-lg', colorClasses[color])}>
            {icon}
          </div>
        )}
        {change && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            change.direction === 'up' ? 'text-green-600' : 
            change.direction === 'down' ? 'text-red-600' : 
            'text-gray-600'
          )}>
            {change.direction === 'up' && <TrendingUp className="h-4 w-4" />}
            {change.direction === 'down' && <TrendingDown className="h-4 w-4" />}
            {change.direction === 'neutral' && <Minus className="h-4 w-4" />}
            <span>{change.value}</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
