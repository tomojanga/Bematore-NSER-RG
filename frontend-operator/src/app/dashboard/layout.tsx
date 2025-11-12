'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import apiService from '@/lib/api-service'
import { 
  Home, 
  Key, 
  Search, 
  BarChart3, 
  TestTube2, 
  LogOut, 
  Webhook, 
  Shield, 
  Code, 
  Menu,
  X,
  ChevronDown,
  Settings,
  User
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Exclusion Lookup', href: '/dashboard/lookup', icon: Search },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Simulator', href: '/dashboard/simulator', icon: TestTube2 },
  { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
  { name: 'Integration', href: '/dashboard/integration', icon: Code },
  { name: 'Compliance', href: '/dashboard/compliance', icon: Shield },
  { name: 'Statistics', href: '/dashboard/statistics', icon: BarChart3 },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [operator, setOperator] = useState<any>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [router])

  const checkAccess = async () => {
    const token = localStorage.getItem('operator_token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    try {
      const response = await apiService.operator.getMe()
      const op = response.data.data
      setOperator(op)
      
      if (op.license_status === 'pending' || !op.is_api_active) {
        router.push('/auth/pending-approval')
      } else {
        setChecking(false)
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        router.push('/auth/pending-approval')
      } else {
        setChecking(false)
      }
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('operator_token')
    localStorage.removeItem('operator_refresh')
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">NSER</h1>
              <p className="text-slate-400 text-xs">Operator Portal</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Operator Info */}
        {operator && (
          <div className="p-4 bg-slate-800/50 border-b border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Operator</p>
            <p className="text-sm font-medium truncate">{operator.name}</p>
            <p className="text-xs text-slate-500 mt-1">License: {operator.license_status}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const IconComponent = item.icon
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-300 py-2 px-4 rounded-lg transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-4">
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    {operator?.name?.charAt(0) || 'O'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">{operator?.email?.split('@')[0]}</span>
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{operator?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{operator?.email}</p>
                    </div>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all border-t border-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
