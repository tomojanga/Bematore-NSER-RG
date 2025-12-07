'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Bell, Settings, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  showNotifications?: boolean
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title = 'Dashboard',
  subtitle = 'Welcome back',
  showNotifications = true 
}) => {
  const t = useTranslations()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 gap-4 sm:gap-0">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {showNotifications && (
            <Link 
              href="/dashboard/notifications"
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              title={t('header.notifications')}
            >
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs">
                3
              </span>
            </Link>
          )}

          <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none sm:pl-4 sm:border-l sm:border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm font-medium text-gray-900">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : t('common.profile')}
              </p>
              <p className="text-xs text-gray-500">{user?.phone_number}</p>
            </div>

            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.first_name?.[0] || user?.phone_number?.[0] || 'U'}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Link 
                href="/dashboard/settings"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                title={t('common.settings')}
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex-shrink-0"
                title={t('common.logout')}
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader
