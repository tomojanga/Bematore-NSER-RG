'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Bell, Shield, Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Monitor, LogOut, Trash2, Clock } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

export default function SettingsPage() {
    const t = useTranslations()
    const { user, refreshUser, devices, sessions, refetchDevices, refetchSessions, revokeDevice } = useAuth()
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState('notifications')
    const [loading, setLoading] = useState(false)
    const [twoFactorCode, setTwoFactorCode] = useState('')
    const [showVerifyInput, setShowVerifyInput] = useState(false)
    
    // Notification preferences
    const [notifications, setNotifications] = useState({
        email: false,
        sms: false,
        exclusion_reminders: false
    })
    const [savingNotifications, setSavingNotifications] = useState(false)
    const [isLoadingPrefs, setIsLoadingPrefs] = useState(true)
    
    // Password change
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [showPasswords, setShowPasswords] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    // Fetch notification preferences
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                setIsLoadingPrefs(true)
                const { data } = await api.get('/notifications/preferences/')
                if (data) {
                    setNotifications({
                        email: data.email_enabled ?? true,
                        sms: data.sms_enabled ?? true,
                        exclusion_reminders: data.exclusion_reminders ?? true
                    })
                }
            } catch (error) {
                console.error('Failed to fetch notification preferences:', error)
            } finally {
                setIsLoadingPrefs(false)
            }
        }

        fetchPreferences()
    }, [])

    const tabs = [
        { id: 'notifications', label: t('settings_page.notifications_tab'), icon: Bell },
        { id: 'security', label: t('settings_page.security_tab'), icon: Shield },
        { id: 'devices', label: t('settings_page.devices_tab'), icon: Monitor },
    ]

    const changePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast({
                title: t('common.error'),
                description: t('errors.password_required'),
                variant: 'destructive'
            })
            return
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: t('common.error'),
                description: t('errors.passwords_dont_match'),
                variant: 'destructive'
            })
            return
        }

        if (newPassword.length < 8) {
            toast({
                title: t('common.error'),
                description: t('errors.min_password_length'),
                variant: 'destructive'
            })
            return
        }

        setIsChangingPassword(true)
        try {
            await api.post('/auth/password-change/', {
                old_password: currentPassword,
                new_password: newPassword
            })
            toast({
                title: t('common.success'),
                description: t('success.password_changed')
            })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setShowPasswords(false)
        } catch (error: any) {
            toast({
                title: t('common.error'),
                description: error.response?.data?.message || t('errors.something_went_wrong'),
                variant: 'destructive'
            })
        } finally {
            setIsChangingPassword(false)
        }
    }

    const handleRevokeDevice = async (deviceId: string) => {
        if (!confirm(t('settings_page.revoke_device_confirm'))) return

        try {
            await revokeDevice(deviceId)
            await refetchDevices()
            await refetchSessions()
            toast({
                title: t('common.success'),
                description: t('settings_page.device_revoked')
            })
        } catch (error: any) {
            toast({
                title: t('common.error'),
                description: t('errors.failed_to_revoke'),
                variant: 'destructive'
            })
        }
    }

    const handleLogoutOtherSessions = async () => {
        if (!confirm(t('settings_page.logout_other_confirm'))) return

        try {
            await api.post('/users/sessions/terminate-all/')
            await refetchSessions()
            toast({
                title: t('common.success'),
                description: t('settings_page.sessions_terminated')
            })
        } catch (error: any) {
            toast({
                title: t('common.error'),
                description: t('errors.failed_to_terminate'),
                variant: 'destructive'
            })
        }
    }

    const enable2FA = async () => {
        setLoading(true)
        try {
            await api.post('/auth/2fa/enable/', {
                method: 'sms',
                phone_number: user?.phone_number
            })
            setShowVerifyInput(true)
            toast({
                title: t('common.success'),
                description: 'Verification code sent to your phone!'
            })
        } catch (error: any) {
            toast({
                title: t('common.error'),
                description: error.response?.data?.message || t('errors.something_went_wrong'),
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const verify2FA = async () => {
        if (!twoFactorCode || twoFactorCode.length !== 6) {
            toast({
                title: t('common.error'),
                description: 'Please enter a valid 6-digit code',
                variant: 'destructive'
            })
            return
        }

        setLoading(true)
        try {
            await api.post('/auth/2fa/verify/', { verification_code: twoFactorCode })
            toast({
                title: t('common.success'),
                description: t('success.2fa_enabled')
            })
            setShowVerifyInput(false)
            setTwoFactorCode('')
            await refreshUser()
        } catch (error: any) {
            toast({
                title: t('common.error'),
                description: error.response?.data?.message || t('security.invalid_code'),
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const disable2FA = async () => {
        if (!confirm(t('settings_page.are_you_sure'))) return

        setLoading(true)
        try {
            await api.post('/auth/2fa/disable/')
            toast({
                title: t('common.success'),
                description: t('success.2fa_disabled')
            })
            await refreshUser()
        } catch (error: any) {
            toast({
                title: t('common.error'),
                description: error.response?.data?.message || t('errors.something_went_wrong'),
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <DashboardHeader title={t('settings_page.title')} subtitle={t('settings_page.subtitle')} />

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Language Switcher */}
                <div className="flex justify-end mb-8">
                    <LanguageSwitcher />
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 border-b border-gray-200 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon className="h-5 w-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notification Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isLoadingPrefs ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {/* Email Notifications */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{t('notifications.email_notifications')}</h3>
                                                <p className="text-sm text-gray-600">{t('notifications.receive_updates_email')}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={notifications.email}
                                                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                                    aria-label="Enable email notifications"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        {/* SMS Notifications */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{t('notifications.sms_notifications')}</h3>
                                                <p className="text-sm text-gray-600">{t('notifications.receive_updates_sms')}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={notifications.sms}
                                                    onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                                                    aria-label="Enable SMS notifications"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        {/* Exclusion Reminders */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{t('notifications.exclusion_reminders')}</h3>
                                                <p className="text-sm text-gray-600">{t('notifications.get_reminders')}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={notifications.exclusion_reminders}
                                                    onChange={(e) => setNotifications({ ...notifications, exclusion_reminders: e.target.checked })}
                                                    aria-label="Enable exclusion reminders"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={async () => {
                                            setSavingNotifications(true)
                                            try {
                                                await api.put('/notifications/preferences/update/', {
                                                    email_enabled: notifications.email,
                                                    sms_enabled: notifications.sms,
                                                    exclusion_reminders: notifications.exclusion_reminders
                                                })
                                                toast({
                                                    title: 'Success',
                                                    description: 'Notification preferences saved'
                                                })
                                                await refreshUser()
                                            } catch (error: any) {
                                                toast({
                                                    title: 'Error',
                                                    description: 'Failed to save preferences',
                                                    variant: 'destructive'
                                                })
                                            } finally {
                                                setSavingNotifications(false)
                                            }
                                        }}
                                        disabled={savingNotifications}
                                    >
                                        {savingNotifications ? (
                                        <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        {t('notifications.saving')}
                                        </>
                                        ) : (
                                        t('notifications.save_preferences')
                                        )}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        {/* Two-Factor Authentication */}
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    {t('security.two_factor_auth')}
                                    {user?.is_2fa_enabled && (
                                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded ml-auto">
                                            <CheckCircle className="h-3 w-3" /> {t('common.enabled')}
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {user?.is_2fa_enabled ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <Shield className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium text-green-900">{t('security.2fa_is_active')}</p>
                                                <p className="text-sm text-green-700">{t('security.2fa_extra_security')}</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={disable2FA}
                                            disabled={loading}
                                            variant="outline"
                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    {t('security.disabling')}
                                                </>
                                            ) : (
                                                t('security.disable_2fa')
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-gray-600">
                                            {t('security.add_extra_security')}
                                        </p>

                                        {!showVerifyInput ? (
                                            <Button onClick={enable2FA} disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        {t('security.sending_code')}
                                                    </>
                                                ) : (
                                                    t('security.enable_2fa_sms')
                                                )}
                                            </Button>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <p className="text-sm text-blue-900">
                                                        {t('security.verification_code_sent', { phone: user?.phone_number })}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="text"
                                                        placeholder={t('security.enter_code')}
                                                        value={twoFactorCode}
                                                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        maxLength={6}
                                                        className="flex-1"
                                                        disabled={loading}
                                                    />
                                                    <Button
                                                        onClick={verify2FA}
                                                        disabled={loading || twoFactorCode.length !== 6}
                                                    >
                                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('security.verify')}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setShowVerifyInput(false)
                                                            setTwoFactorCode('')
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        {t('common.cancel')}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Change Password */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    {t('account.change_password')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('account.current_password')}</label>
                                        <div className="relative">
                                            <Input
                                                type={showPasswords ? 'text' : 'password'}
                                                placeholder={t('account.current_password')}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                disabled={isChangingPassword}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(!showPasswords)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('account.new_password')}</label>
                                        <Input
                                            type={showPasswords ? 'text' : 'password'}
                                            placeholder={t('account.new_password')}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={isChangingPassword}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('account.confirm_new_password')}</label>
                                        <Input
                                            type={showPasswords ? 'text' : 'password'}
                                            placeholder={t('account.confirm_new_password')}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={isChangingPassword}
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={changePassword}
                                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                                >
                                    {isChangingPassword ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            {t('security.changing_password')}
                                        </>
                                    ) : (
                                        t('account.change_password')
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Devices Tab */}
                {activeTab === 'devices' && (
                    <div className="space-y-6">
                        {/* Trusted Devices */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Monitor className="h-5 w-5" />
                                    {t('settings_page.trusted_devices')} ({devices?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {devices && devices.length > 0 ? (
                                    devices.map((device: any) => (
                                        <div key={device.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Monitor className="h-4 w-4 text-gray-500" />
                                                    <h4 className="font-medium text-gray-900">{device.name}</h4>
                                                    {device.trusted && (
                                                        <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                                                            <CheckCircle className="h-3 w-3" /> {t('settings_page.trusted')}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">{device.type} • {device.os}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {t('settings_page.last_used', { date: new Date(device.lastUsed).toLocaleDateString() })}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRevokeDevice(device.id)}
                                                className="border-red-300 text-red-600 hover:bg-red-50"
                                                title={t('settings_page.revoke_access')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Monitor className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                        <p>{t('settings_page.no_devices')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Active Sessions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    {t('settings_page.active_sessions')} ({sessions?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {sessions && sessions.length > 0 ? (
                                    <>
                                        {sessions.map((session: any) => (
                                            <div key={session.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Monitor className="h-4 w-4 text-gray-500" />
                                                        <h4 className="font-medium text-gray-900">{session.device?.name || 'Unknown Device'}</h4>
                                                        {session.isActive && (
                                                            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                                                <CheckCircle className="h-3 w-3" /> {t('dashboard.active')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {session.ip_address || 'IP address unknown'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {t('settings_page.last_active', { date: new Date(session.lastActive).toLocaleDateString() })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {sessions.length > 1 && (
                                            <Button
                                                variant="outline"
                                                className="w-full border-red-300 text-red-600 hover:bg-red-50 mt-4"
                                                onClick={handleLogoutOtherSessions}
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                {t('settings_page.logout_other_devices')}
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                        <p>{t('settings_page.no_sessions')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    )
}
