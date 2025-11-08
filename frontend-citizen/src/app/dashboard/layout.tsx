'use client'

import { useAuth } from '@/hooks/useAuth'
import { Shield, Home, FileText, History, Settings, LogOut, User } from 'lucide-react'
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
  const { user, logout, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  if (!user) return null

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

        <div className="p-6 border-t border-blue-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold">{user.first_name} {user.last_name}</p>
              <p className="text-blue-100 text-xs">{user.phone_number}</p>
            </div>
          </div>
          <button
            onClick={() => logout(false)}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
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
