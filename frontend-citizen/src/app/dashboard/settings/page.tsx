'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader'
import { Bell, Shield, Lock, Loader2, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('notifications')
  const [loading, setLoading] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showVerifyInput, setShowVerifyInput] = useState(false)
  const [notifications, setNotifications] = useState({
    email: false,
    sms: false,
    exclusion_reminders: false
  })
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true)

  // Fetch notification preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setIsLoadingPrefs(true)
        const { data } = await api.get('/users/me/notification-preferences/')
        if (data.success && data.data) {
          setNotifications({
            email: data.data.email_enabled ?? true,
            sms: data.data.sms_enabled ?? true,
            exclusion_reminders: data.data.exclusion_reminders ?? true
          })
        }
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error)
      } finally {
        setIsLoadingPrefs(false)
      }
    }

    fetchPreferences()
  }, [toast])

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Lock },
  ]

  const enable2FA = async () => {
    setLoading(true)
    try {
      await api.post('/auth/2fa/enable/', { 
        method: 'sms',
        phone_number: user?.phone_number 
      })
      setShowVerifyInput(true)
      toast({
        title: 'Success',
        description: 'Verification code sent to your phone!'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to enable 2FA',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const verify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive'
      })
      return
    }
    
    setLoading(true)
    try {
      await api.post('/auth/2fa/verify/', { code: twoFactorCode })
      toast({
        title: 'Success',
        description: '2FA enabled successfully!'
      })
      setShowVerifyInput(false)
      setTwoFactorCode('')
      await refreshUser()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Invalid verification code',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) return
    
    setLoading(true)
    try {
      await api.post('/auth/2fa/disable/')
      toast({
        title: 'Success',
        description: '2FA disabled successfully'
      })
      await refreshUser()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to disable 2FA',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardHeader title="Settings" subtitle="Manage your preferences and security" />

      <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="space-y-6">

      <div className="flex gap-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingPrefs ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.email}
                        onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                      <p className="text-sm text-gray-600">Receive updates via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.sms}
                        onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Exclusion Reminders</h3>
                      <p className="text-sm text-gray-600">Get reminders about your exclusion status</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.exclusion_reminders}
                        onChange={(e) => setNotifications({...notifications, exclusion_reminders: e.target.checked})}
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
                      await api.put('/users/me/notification-preferences/', {
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
                      Saving...
                    </>
                  ) : (
                    'Save Preferences'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
                {user?.is_2fa_enabled && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    <CheckCircle className="h-3 w-3" /> Enabled
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
                      <p className="font-medium text-green-900">2FA is Active</p>
                      <p className="text-sm text-green-700">Your account has an extra layer of security</p>
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
                        Disabling...
                      </>
                    ) : (
                      'Disable 2FA'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Add an extra layer of security by requiring a verification code sent to your phone ({user?.phone_number}) when logging in.
                  </p>
                  
                  {!showVerifyInput ? (
                    <Button onClick={enable2FA} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Sending code...
                        </>
                      ) : (
                        'Enable 2FA via SMS'
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                          A 6-digit verification code has been sent to {user?.phone_number}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit code"
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
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowVerifyInput(false)
                            setTwoFactorCode('')
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Login Alerts</h3>
                  <p className="text-sm text-gray-600">Get notified of new logins</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Session Timeout</h3>
                  <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
                </div>
                <span className="text-sm font-medium text-gray-900">24 hours</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Your data is protected under applicable data protection laws. We only share necessary information with licensed gambling operators for self-exclusion enforcement.
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Data We Collect</h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Personal identification (name, phone, email)</li>
                    <li>Self-exclusion records and history</li>
                    <li>Risk assessment responses</li>
                    <li>Account activity logs</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Your Rights</h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Access your personal data</li>
                    <li>Request data correction</li>
                    <li>Request data deletion (subject to legal requirements)</li>
                    <li>Withdraw consent for data processing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={async () => {
                  try {
                    const response = await api.get('/users/me/')
                    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`
                    a.click()
                    toast({
                      title: 'Success',
                      description: 'Data exported successfully'
                    })
                  } catch (error) {
                    toast({
                      title: 'Error',
                      description: 'Failed to export data',
                      variant: 'destructive'
                    })
                  }
                }}
              >
                Download My Data
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone and you may not be able to register again.')) {
                    toast({
                      title: 'Notice',
                      description: 'Account deletion requires contacting NSER support'
                    })
                  }
                }}
              >
                Request Account Deletion
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Account deletion requests are processed within 30 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
      </main>
    </div>
  )
}
