'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  description?: string
  onClick?: () => void
  className?: string
}

const colorStyles = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  purple: 'bg-purple-50 text-purple-600',
}

const iconBgStyles = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  red: 'bg-red-100',
  yellow: 'bg-yellow-100',
  purple: 'bg-purple-100',
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  color = 'blue',
  trend,
  description,
  onClick,
  className
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-300 cursor-pointer group',
        onClick && 'hover:border-gray-200',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2 sm:p-3 rounded-lg', iconBgStyles[color])}>
          <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', colorStyles[color])} />
        </div>
        {trend && (
          <div className={cn(
            'text-xs font-semibold px-2 py-1 rounded',
            trend.direction === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>

      <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">{label}</p>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{value}</h3>

      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  )
}

export default StatsCard
