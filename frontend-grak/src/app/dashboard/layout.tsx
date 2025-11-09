'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Users, Shield, BarChart3, LogOut, Settings, FileText, Activity, Bell, AlertTriangle, Search } from 'lucide-react'

// GRAK Dashboard Navigation - Regulatory Focus Only
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Operators', href: '/dashboard/operators', icon: Users },
  { name: 'Exclusions', href: '/dashboard/exclusions', icon: Shield },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Screening', href: '/dashboard/screening', icon: Search },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Alerts', href: '/dashboard/alerts', icon: AlertTriangle },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('grak_token')
    if (!token) router.push('/auth/login')
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('grak_token')
    localStorage.removeItem('grak_refresh')
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-blue-700 text-white flex flex-col">
        <div className="p-6 border-b border-blue-600">
          <h1 className="text-xl font-bold">GRAK Admin</h1>
          <p className="text-blue-200 text-sm">NSER Portal</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive ? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-blue-600'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-blue-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg"
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
