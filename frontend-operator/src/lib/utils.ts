import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now.getTime() - target.getTime()
  
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

// Text formatting utilities
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

// User role utilities
export function getRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    'super_admin': 'bg-purple-100 text-purple-800',
    'grak_admin': 'bg-red-100 text-red-800',
    'grak_officer': 'bg-orange-100 text-orange-800',
    'grak_auditor': 'bg-yellow-100 text-yellow-800',
    'operator_admin': 'bg-blue-100 text-blue-800',
    'operator_user': 'bg-cyan-100 text-cyan-800',
    'bematore_admin': 'bg-green-100 text-green-800',
    'bematore_analyst': 'bg-emerald-100 text-emerald-800',
    'citizen': 'bg-gray-100 text-gray-800',
    'api_user': 'bg-slate-100 text-slate-800'
  }
  return roleColors[role] || 'bg-gray-100 text-gray-800'
}

export function formatRole(role: string): string {
  const roleNames: Record<string, string> = {
    'super_admin': 'Super Admin',
    'grak_admin': 'GRAK Admin',
    'grak_officer': 'GRAK Officer',
    'grak_auditor': 'GRAK Auditor',
    'operator_admin': 'Operator Admin',
    'operator_user': 'Operator User',
    'bematore_admin': 'Bematore Admin',
    'bematore_analyst': 'Bematore Analyst',
    'citizen': 'Citizen',
    'api_user': 'API User'
  }
  return roleNames[role] || capitalizeWords(role.replace('_', ' '))
}

// Number formatting utilities
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toLocaleString()
}

export function formatCurrency(value: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// File size formatting
export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  
  return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
  // Format Kenyan phone numbers
  if (phone.startsWith('+254')) {
    const number = phone.substring(4)
    if (number.length === 9) {
      return `+254 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`
    }
  }
  return phone
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidKenyanPhone(phone: string): boolean {
  const phoneRegex = /^\+?254[17]\d{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function isValidNationalId(id: string): boolean {
  // Kenyan national ID is 8 digits
  const idRegex = /^\d{8}$/
  return idRegex.test(id)
}

// Color utilities
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'active': 'text-green-600',
    'pending': 'text-yellow-600',
    'inactive': 'text-gray-600',
    'suspended': 'text-red-600',
    'expired': 'text-red-600',
    'completed': 'text-green-600',
    'failed': 'text-red-600',
    'processing': 'text-blue-600',
  }
  return statusColors[status] || 'text-gray-600'
}

export function getStatusBgColor(status: string): string {
  const statusColors: Record<string, string> = {
    'active': 'bg-green-50 border-green-200 text-green-700',
    'pending': 'bg-yellow-50 border-yellow-200 text-yellow-700',
    'inactive': 'bg-gray-50 border-gray-200 text-gray-700',
    'suspended': 'bg-red-50 border-red-200 text-red-700',
    'expired': 'bg-red-50 border-red-200 text-red-700',
    'completed': 'bg-green-50 border-green-200 text-green-700',
    'failed': 'bg-red-50 border-red-200 text-red-700',
    'processing': 'bg-blue-50 border-blue-200 text-blue-700',
  }
  return statusColors[status] || 'bg-gray-50 border-gray-200 text-gray-700'
}

// Array utilities
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// Local storage utilities
export function setLocalStorage(key: string, value: any): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error setting localStorage:', error)
    }
  }
}

export function getLocalStorage<T>(key: string, defaultValue?: T): T | null {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error('Error getting localStorage:', error)
      return defaultValue || null
    }
  }
  return defaultValue || null
}

export function removeLocalStorage(key: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing localStorage:', error)
    }
  }
}

// Download utilities
export function downloadFile(url: string, filename?: string): void {
  const link = document.createElement('a')
  link.href = url
  if (filename) {
    link.download = filename
  }
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function downloadData(data: any, filename: string, type: string = 'application/json'): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type })
  const url = URL.createObjectURL(blob)
  downloadFile(url, filename)
  URL.revokeObjectURL(url)
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    return false
  }
}

// Environment detection
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}
