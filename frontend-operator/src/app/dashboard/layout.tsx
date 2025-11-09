'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Key, Search, BarChart3, TestTube2, LogOut } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Exclusion Lookup', href: '/dashboard/lookup', icon: Search },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Simulator', href: '/dashboard/simulator', icon: TestTube2 },
  { name: 'Statistics', href: '/dashboard/statistics', icon: BarChart3 },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('operator_token')
    if (!token) {
      router.push('/auth/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('operator_token')
    localStorage.removeItem('operator_refresh')
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-indigo-700 text-white flex flex-col">
        <div className="p-6 border-b border-indigo-600">
          <h1 className="text-xl font-bold">NSER Operator</h1>
          <p className="text-indigo-200 text-sm">Portal</p>
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
                      isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600'
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

        <div className="p-4 border-t border-indigo-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg"
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
