'use client'

import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color: 'blue' | 'red' | 'green' | 'purple' | 'indigo' | 'yellow'
  trend?: {
    value: number
    direction: 'up' | 'down'
    period: string
  }
}

const colorClasses = {
  blue: 'border-blue-500 text-blue-600',
  red: 'border-red-500 text-red-600',
  green: 'border-green-500 text-green-600',
  purple: 'border-purple-500 text-purple-600',
  indigo: 'border-indigo-500 text-indigo-600',
  yellow: 'border-yellow-500 text-yellow-600'
}

export default function MetricCard({ title, value, subtitle, icon: Icon, color, trend }: MetricCardProps) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow border-l-4 ${colorClasses[color].split(' ')[0]}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-600 uppercase">{title}</h3>
        <Icon className={`h-4 w-4 ${colorClasses[color].split(' ')[1]}`} />
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
      )}
      {trend && (
        <p className={`text-xs mt-1 ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}% ({trend.period})
        </p>
      )}
    </div>
  )
}