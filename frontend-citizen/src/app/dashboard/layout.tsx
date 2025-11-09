'use client'

import { useAuth } from '@/hooks/useAuth'
import { useExclusions } from '@/hooks/useExclusions'
import { Shield, Home, FileText, History, Settings, LogOut, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Self-Exclude', href: '/dashboard/self-exclude', icon: Shield },
  { name: 'Assessments', href: '/dashboard/assessments', icon: FileText },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'Account', href: '/dashboard/account', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, isLoadingProfile } = useAuth()
  const { exclusions, isLoading: isLoadingExclusions } = useExclusions()
  const pathname = usePathname()
  const router = useRouter()
  
  const activeExclusion = exclusions?.find(e => e.status === 'active')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-72 bg-gradient-to-b from-blue-600 to-blue-700 text-white flex flex-col">
        <div className="p-6 border-b border-blue-500">
          <div className="flex items-center gap-3">
            <div className="bg-white p-3 rounded-lg">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">My Portal</h1>
              <p className="text-blue-100 text-sm">Self-Exclusion</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium',
                      isActive ? 'bg-white text-blue-700 shadow-lg' : 'text-blue-100 hover:bg-blue-500'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-blue-500 space-y-4">
          <div className="bg-blue-500 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">
                  {user.first_name?.[0] || user.phone_number?.[0] || 'U'}{user.last_name?.[0] || user.phone_number?.[1] || 'S'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">
                  {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.phone_number}
                </p>
                <p className="text-blue-100 text-xs">{user.phone_number}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {activeExclusion ? (
                <div className="flex items-center gap-2 text-xs bg-red-500 text-white px-3 py-2 rounded">
                  <AlertCircle className="h-3 w-3" />
                  <span className="font-medium">Self-Excluded</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs bg-green-500 text-white px-3 py-2 rounded">
                  <CheckCircle className="h-3 w-3" />
                  <span className="font-medium">Active Account</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs">
                {user.is_phone_verified ? (
                  <span className="flex items-center gap-1 text-green-300">
                    <CheckCircle className="h-3 w-3" /> Phone Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-300">
                    <AlertCircle className="h-3 w-3" /> Phone Unverified
                  </span>
                )}
              </div>
              
              {user.is_2fa_enabled && (
                <div className="flex items-center gap-2 text-xs text-blue-100">
                  <Shield className="h-3 w-3" />
                  <span>2FA Enabled</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => logout(false)}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
