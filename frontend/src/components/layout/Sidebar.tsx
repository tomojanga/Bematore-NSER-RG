'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  ClipboardList,
  BarChart3,
  Bell,
  FileText,
  Settings,
  Activity,
  DollarSign,
  Key,
  AlertTriangle,
  UserCheck,
  CreditCard,
  TrendingUp,
  Search,
  Home,
  Phone,
  Mail
} from 'lucide-react'

// Role-based navigation configuration
const navigationConfig = {
  // GRAK (Regulatory Authority) Navigation
  grak_admin: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Self-Exclusions', href: '/dashboard/exclusions', icon: Shield },
    { name: 'Operators', href: '/dashboard/operators', icon: Building2 },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Risk Assessments', href: '/dashboard/assessments', icon: ClipboardList },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Compliance', href: '/dashboard/compliance', icon: FileText },
    { name: 'System Health', href: '/dashboard/monitoring', icon: Activity },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
  
  grak_officer: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Self-Exclusions', href: '/dashboard/exclusions', icon: Shield },
    { name: 'Risk Assessments', href: '/dashboard/assessments', icon: ClipboardList },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Reports', href: '/dashboard/compliance', icon: FileText },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
  
  grak_auditor: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Audit Logs', href: '/dashboard/compliance', icon: FileText },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],

  // Operator Navigation  
  operator_admin: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'User Lookup', href: '/dashboard/lookup', icon: Search },
    { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
    { name: 'Integration', href: '/dashboard/integration', icon: Activity },
    { name: 'Compliance', href: '/dashboard/compliance', icon: Shield },
    { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
  
  operator_user: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'User Lookup', href: '/dashboard/lookup', icon: Search },
    { name: 'Assessments', href: '/dashboard/assessments', icon: ClipboardList },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],

  // Bematore (Company) Navigation
  bematore_admin: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'National Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Operators', href: '/dashboard/operators', icon: Building2 },
    { name: 'Financial', href: '/dashboard/financial', icon: DollarSign },
    { name: 'System Health', href: '/dashboard/monitoring', icon: Activity },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Compliance', href: '/dashboard/compliance', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
  
  bematore_analyst: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Risk Trends', href: '/dashboard/risk-trends', icon: TrendingUp },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],

  // Citizen (End User) Navigation
  citizen: [
    { name: 'My Portal', href: '/dashboard', icon: Home },
    { name: 'Self-Exclude', href: '/dashboard/self-exclude', icon: Shield },
    { name: 'Take Assessment', href: '/dashboard/assessment', icon: ClipboardList },
    { name: 'My Status', href: '/dashboard/status', icon: UserCheck },
    { name: 'Help & Support', href: '/dashboard/support', icon: Phone },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],

  // Super Admin Navigation (All Access)
  super_admin: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Exclusions', href: '/dashboard/exclusions', icon: Shield },
    { name: 'Operators', href: '/dashboard/operators', icon: Building2 },
    { name: 'Assessments', href: '/dashboard/assessments', icon: ClipboardList },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Financial', href: '/dashboard/financial', icon: DollarSign },
    { name: 'Compliance', href: '/dashboard/compliance', icon: FileText },
    { name: 'Monitoring', href: '/dashboard/monitoring', icon: Activity },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],

  // API User (Limited Access)
  api_user: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'API Usage', href: '/dashboard/api-usage', icon: Activity },
    { name: 'Documentation', href: '/dashboard/docs', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  // Get navigation items based on user role
  const navigation = navigationConfig[user?.role as keyof typeof navigationConfig] || navigationConfig.citizen

  // Role-based branding
  const getBrandingConfig = (role?: string) => {
    if (role?.includes('grak')) {
      return {
        title: 'GRAK Portal',
        subtitle: 'Regulatory Authority',
        color: 'text-red-600'
      }
    } else if (role?.includes('operator')) {
      return {
        title: 'Operator Portal',
        subtitle: 'Licensed Gaming',
        color: 'text-blue-600'
      }
    } else if (role?.includes('bematore')) {
      return {
        title: 'Bematore HQ',
        subtitle: 'National Platform',
        color: 'text-green-600'
      }
    } else if (role === 'citizen') {
      return {
        title: 'Self-Exclusion',
        subtitle: 'Responsible Gaming',
        color: 'text-purple-600'
      }
    } else {
      return {
        title: 'NSER Platform',
        subtitle: 'System Access',
        color: 'text-gray-600'
      }
    }
  }

  const branding = getBrandingConfig(user?.role)

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Shield className={cn('h-8 w-8', branding.color)} />
          <div>
            <h1 className="text-lg font-bold text-gray-900">{branding.title}</h1>
            <p className="text-xs text-gray-500">{branding.subtitle}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                            (pathname.startsWith(item.href + '/') && item.href !== '/dashboard')
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Role-specific footer */}
      <div className="p-4 border-t border-gray-200">
        {user?.role?.includes('citizen') ? (
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-purple-900 mb-1">24/7 Support</p>
            <p className="text-xs text-purple-700">Emergency: 0800-GAMBLE</p>
          </div>
        ) : user?.role?.includes('operator') ? (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-900 mb-1">API Support</p>
            <p className="text-xs text-blue-700">Integration Help</p>
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-900 mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <p className="text-xs text-green-700">All Systems Operational</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
