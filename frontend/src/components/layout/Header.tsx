'use client'

import { useAuth } from '@/hooks/useAuth'
import { Bell, LogOut, User, Settings } from 'lucide-react'
import { getInitials, getRoleColor } from '@/lib/utils'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Welcome back, {user?.first_name}!
        </h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-KE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleColor(user?.role || '')}`}>
              {user?.role?.replace('_', ' ').toUpperCase()}
            </p>
          </div>
          
          <div className="relative group">
            <button className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center">
              {getInitials(`${user?.first_name} ${user?.last_name}`)}
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <hr className="my-2 border-gray-200" />
              <button 
                onClick={() => logout()}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
