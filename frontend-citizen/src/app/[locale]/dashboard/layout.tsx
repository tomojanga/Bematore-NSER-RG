'use client'

import { useAuth } from '@/hooks/useAuth'
import { useMyActiveExclusion } from '@/hooks/useExclusions'
import { Shield, Home, FileText, History, Settings, LogOut, User, CheckCircle, AlertCircle, Loader2, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from '@/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const getNavigation = (t: any) => [
    { name: t('sidebar.my_portal'), href: '/dashboard', icon: Home },
    { name: t('sidebar.self_exclude'), href: '/dashboard/self-exclude', icon: Shield },
    { name: t('dashboard.risk_assessment'), href: '/dashboard/assessments', icon: FileText },
    { name: t('history.title'), href: '/dashboard/history', icon: History },
    { name: t('account.title'), href: '/dashboard/account', icon: User },
    { name: t('common.settings'), href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, isAuthenticated, isLoadingProfile } = useAuth()
    const { data: activeExclusionResponse } = useMyActiveExclusion()
    const pathname = usePathname()
    const router = useRouter()
    const t = useTranslations()
    const locale = useLocale()
    const navigation = getNavigation(t)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // activeExclusionResponse.data is already the exclusion object or null (after hook transformation)
    const activeExclusion = activeExclusionResponse?.data || null

    useEffect(() => {
        if (!isLoadingProfile && !isAuthenticated) {
            router.push('/auth/login')
        }
    }, [isAuthenticated, router, isLoadingProfile])

    // Close sidebar when route changes
    useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col lg:flex-row">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                aria-label="Toggle menu"
            >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Modern Sidebar - Responsive */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:inset-auto",
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-700/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 md:p-3 rounded-xl shadow-lg flex-shrink-0">
                            <Shield className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg md:text-xl font-bold tracking-tight truncate">{t('auth.citizen_portal')}</h1>
                            <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">{t('sidebar.self_exclusion')}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 md:px-4 py-6 md:py-8 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 md:px-4 py-3 md:py-3.5 rounded-lg transition-all duration-200 text-sm font-medium group relative whitespace-nowrap',
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                                )}
                            >
                                <item.icon className={cn(
                                    'h-5 w-5 transition-transform duration-200 flex-shrink-0',
                                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                                )} />
                                <span className="hidden sm:inline">{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-white flex-shrink-0"></div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Card */}
                <div className="p-3 md:p-4 border-t border-slate-700/50 space-y-4">
                    <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-3 md:p-4 backdrop-blur-sm border border-slate-600/50">
                        {/* User Info */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 md:h-14 w-12 md:w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-slate-600/50 flex-shrink-0">
                                <span className="text-white font-bold text-base md:text-lg">
                                    {user.first_name?.[0] || user.phone_number?.[0] || 'U'}{user.last_name?.[0] || user.phone_number?.[1] || 'S'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate text-sm">
                                    {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'User'}
                                </p>
                                <p className="text-slate-400 text-xs truncate">{user.phone_number}</p>
                            </div>
                        </div>

                        {/* Status Badges */}
                        <div className="space-y-2">
                            {activeExclusion ? (
                                <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-200 px-3 py-2 md:py-2.5 rounded-lg border border-red-500/30 font-medium">
                                    <AlertCircle className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                                    <span className="hidden sm:inline">{t('sidebar.self_excluded')}</span>
                                    <span className="sm:hidden">Excluded</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-200 px-3 py-2 md:py-2.5 rounded-lg border border-emerald-500/30 font-medium">
                                    <CheckCircle className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                                    <span className="hidden sm:inline">{t('sidebar.account_active')}</span>
                                    <span className="sm:hidden">Active</span>
                                </div>
                            )}

                            {user.is_phone_verified ? (
                                <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-200 px-3 py-2 md:py-2.5 rounded-lg border border-emerald-500/30">
                                    <CheckCircle className="h-3 w-3 flex-shrink-0" />
                                    <span className="hidden sm:inline">{t('sidebar.phone_verified')}</span>
                                    <span className="sm:hidden">Phone ✓</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-200 px-3 py-2 md:py-2.5 rounded-lg border border-amber-500/30">
                                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                    <span className="hidden sm:inline">{t('sidebar.phone_unverified')}</span>
                                    <span className="sm:hidden">Phone ⚠</span>
                                </div>
                            )}

                            {user.is_2fa_enabled && (
                                <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-blue-500/20 to-indigo-600/20 text-blue-200 px-3 py-2 md:py-2.5 rounded-lg border border-blue-500/30">
                                    <Shield className="h-3 w-3 flex-shrink-0" />
                                    <span className="hidden sm:inline">{t('sidebar.2fa_enabled')}</span>
                                    <span className="sm:hidden">2FA ✓</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => logout(false)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 md:py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline">{t('common.logout')}</span>
                        <span className="sm:hidden">Exit</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto mt-16 lg:mt-0">{children}</main>
        </div>
    )
}
