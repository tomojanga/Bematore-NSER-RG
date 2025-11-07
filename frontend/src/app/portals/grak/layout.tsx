'use client'

import { useAuth } from '@/hooks/useAuth'
import { Shield, Users, Building2, BarChart3, FileText, Activity, Bell, Settings, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useActiveAlerts } from '@/hooks/useMonitoring'
import { useUnreadNotifications } from '@/hooks/useNotifications'

const grakNavigation = [
  { name: 'Overview', href: '/portals/grak', icon: BarChart3, exact: true },
  { name: 'Self-Exclusions', href: '/portals/grak/exclusions', icon: Shield },
  { name: 'Users Management', href: '/portals/grak/users', icon: Users },
  { name: 'Operators', href: '/portals/grak/operators', icon: Building2 },
  { name: 'Risk Assessments', href: '/portals/grak/assessments', icon: FileText },
  { name: 'Analytics & Reports', href: '/portals/grak/analytics', icon: BarChart3 },
  { name: 'Compliance', href: '/portals/grak/compliance', icon: FileText },
  { name: 'System Health', href: '/portals/grak/monitoring', icon: Activity },
  { name: 'Notifications', href: '/portals/grak/notifications', icon: Bell },
  { name: 'Settings', href: '/portals/grak/settings', icon: Settings },
]

export default function GRAKPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, hasRole } = useAuth()
  const pathname = usePathname()
  const { data: activeAlerts } = useActiveAlerts()
  const { data: unreadNotifications } = useUnreadNotifications()

  // Ensure user has GRAK role
  if (!hasRole(['grak_admin', 'grak_officer', 'grak_auditor', 'super_admin'])) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-red-900">Access Denied</h1>
          <p className="text-red-700 mt-2">You don't have permission to access the GRAK portal.</p>
        </div>
      </div>
    )
  }

  const alertCount = activeAlerts?.results?.length || 0
  const unreadCount = unreadNotifications?.results?.length || 0

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* GRAK Sidebar */}
      <div className="w-72 bg-gradient-to-b from-red-600 to-red-700 text-white flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-red-500">
          <div className="flex items-center gap-3">
            <div className="bg-white p-3 rounded-lg">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">GRAK Portal</h1>
              <p className="text-red-100 text-sm">Regulatory Authority</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <ul className="space-y-2">
            {grakNavigation.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href)
                
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium',
                      isActive
                        ? 'bg-white text-red-700 shadow-lg'
                        : 'text-red-100 hover:bg-red-500 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1">{item.name}</span>
                    
                    {/* Show notification badges */}
                    {item.name === 'Notifications' && unreadCount > 0 && (
                      <span className="bg-yellow-400 text-red-900 text-xs rounded-full px-2 py-1 font-bold">
                        {unreadCount}
                      </span>
                    )}
                    
                    {item.name === 'System Health' && alertCount > 0 && (
                      <span className="bg-yellow-400 text-red-900 text-xs rounded-full px-2 py-1 font-bold">
                        {alertCount}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-6 border-t border-red-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold">{user?.first_name} {user?.last_name}</p>
              <p className="text-red-100 text-xs">{user?.role?.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>
          
          <button
            onClick={() => logout(false)}
            className="w-full bg-red-500 hover:bg-red-400 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Alert Bar */}
        {alertCount > 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 font-medium">
                  {alertCount} active system alert{alertCount > 1 ? 's' : ''} require attention
                </p>
              </div>
              <Link 
                href="/portals/grak/monitoring" 
                className="text-yellow-800 hover:text-yellow-900 font-medium text-sm"
              >
                View Details →
              </Link>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}