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
    User,
    Bell,
    HelpCircle,
    FileText,
    Zap
} from 'lucide-react'

const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, section: 'main' },
    { name: 'Exclusion Lookup', href: '/dashboard/lookup', icon: Search, section: 'main' },
    { name: 'API Keys', href: '/dashboard/api-keys', icon: Key, section: 'main' },
    { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook, section: 'main' },
]

const toolsNavigation = [
    { name: 'Simulator', href: '/dashboard/simulator', icon: TestTube2, section: 'tools' },
    { name: 'Integration Guide', href: '/dashboard/integration', icon: Code, section: 'tools' },
    { name: 'API Reference', href: '/dashboard/api-reference', icon: FileText, section: 'tools' },
]

const insightsNavigation = [
    { name: 'Statistics', href: '/dashboard/statistics', icon: BarChart3, section: 'insights' },
    { name: 'Compliance', href: '/dashboard/compliance', icon: Shield, section: 'insights' },
]

const allNavigation = [...mainNavigation, ...toolsNavigation, ...insightsNavigation]

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
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 lg:relative lg:translate-x-0 shadow-sm lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Logo Section */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                N
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">NSER</h1>
                                <p className="text-xs text-gray-500">Operator Portal</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-all"
                            title="Close sidebar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Operator Status Card */}
                {operator && (
                    <div className="p-4 mx-3 mt-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200/50">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Your Operator</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{operator.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${operator.license_status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {operator.license_status?.toUpperCase()}
                            </span>
                            {operator.compliance_score && (
                                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                    {Math.round(operator.compliance_score)}% Compliant
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
                    {/* Main Navigation */}
                    <div>
                        <p className="px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Core</p>
                        <ul className="space-y-1">
                            {mainNavigation.map((item) => {
                                const isActive = pathname === item.href
                                const IconComponent = item.icon
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                                    ? 'bg-purple-600 text-white shadow-md'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <IconComponent className="h-5 w-5 flex-shrink-0" />
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    {/* Tools Navigation */}
                    <div>
                        <p className="px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Tools</p>
                        <ul className="space-y-1">
                            {toolsNavigation.map((item) => {
                                const isActive = pathname === item.href
                                const IconComponent = item.icon
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                                    ? 'bg-purple-600 text-white shadow-md'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <IconComponent className="h-5 w-5 flex-shrink-0" />
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    {/* Insights Navigation */}
                    <div>
                        <p className="px-4 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Insights</p>
                        <ul className="space-y-1">
                            {insightsNavigation.map((item) => {
                                const isActive = pathname === item.href
                                const IconComponent = item.icon
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                                    ? 'bg-purple-600 text-white shadow-md'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <IconComponent className="h-5 w-5 flex-shrink-0" />
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </nav>

                {/* Help & Logout Section */}
                <div className="border-t border-gray-200 p-3 space-y-2">
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all text-sm"
                    >
                        <HelpCircle className="h-5 w-5" />
                        <span>Help Center</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:ml-0">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100 transition-all"
                            title="Toggle menu"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Header Actions */}
                        <div className="flex items-center gap-4">
                            {/* Notification Bell */}
                            <button
                                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                title="Notifications"
                            >
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* Divider */}
                            <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
                                    title="User menu"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                                        {operator?.name?.charAt(0) || 'O'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">{operator?.name?.split(' ')[0]}</span>
                                    <ChevronDown className="h-4 w-4 text-gray-600 hidden sm:inline" />
                                </button>

                                {/* User Dropdown Menu */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
                                        {/* Header */}
                                        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
                                            <p className="text-sm font-bold text-gray-900">{operator?.name}</p>
                                            <p className="text-xs text-gray-600 mt-1">{operator?.email}</p>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            <Link
                                                href="/dashboard/profile"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                                            >
                                                <User className="h-4 w-4" />
                                                View Profile
                                            </Link>
                                            <Link
                                                href="/dashboard/settings"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                                            >
                                                <Settings className="h-4 w-4" />
                                                Settings
                                            </Link>
                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-gray-100">
                                            <button
                                                onClick={() => {
                                                    setUserMenuOpen(false)
                                                    handleLogout()
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all font-medium"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}
