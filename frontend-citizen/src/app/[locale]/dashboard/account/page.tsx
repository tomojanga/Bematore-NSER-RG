'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader'
import {
  User,
  Mail,
  Phone,
  Shield,
  MapPin,
  Calendar,
  Check,
  X,
  Edit2,
  Loader2,
  Upload
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  phone_number: string
  first_name: string
  last_name: string
  date_of_birth?: string
  national_id?: string
  gender?: string
  country_code?: string
  is_email_verified: boolean
  is_phone_verified: boolean
  is_id_verified: boolean
  verification_status: string
  created_at: string
  last_login: string
}

export default function AccountPage() {
  const t = useTranslations()
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const { data } = await api.get('/users/me/profile/')
        if (data.success && data.data) {
          setProfile(data.data)
          setEditData({
            first_name: data.data.first_name || '',
            last_name: data.data.last_name || '',
            email: data.data.email || '',
            phone_number: data.data.phone_number || ''
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        toast({
          title: t('common.error'),
          description: t('errors.something_went_wrong'),
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [toast, t])

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      await api.put('/users/me/profile/', {
        first_name: editData.first_name,
        last_name: editData.last_name,
        email: editData.email,
        phone_number: editData.phone_number
      })
      
      toast({
        title: t('common.success'),
        description: t('success.profile_updated')
      })
      
      setIsEditing(false)
      await refreshUser()
      
      // Refresh profile
      const { data } = await api.get('/users/me/profile/')
      if (data.success) {
        setProfile(data.data)
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('errors.something_went_wrong'),
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <DashboardHeader title={t('account.title')} subtitle={t('account.subtitle')} />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white rounded-lg animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardHeader title={t('account.title')} subtitle={t('account.subtitle')} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Profile Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('account.personal_information')}</h2>
                <p className="text-gray-600 mt-1">{t('help.subtitle')}</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  {t('common.edit')}
                </button>
              )}
            </div>

            <div className="p-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.first_name')}</label>
                      <input
                        type="text"
                        value={editData.first_name}
                        onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.last_name')}</label>
                      <input
                        type="text"
                        value={editData.last_name}
                        onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.phone_number')}</label>
                    <input
                      type="tel"
                      value={editData.phone_number}
                      onChange={(e) => setEditData({...editData, phone_number: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      {t('account.save_changes')}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{t('auth.first_name')}</p>
                        <p className="text-lg font-medium text-gray-900">{profile?.first_name || t('common.no_results')}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{t('auth.last_name')}</p>
                        <p className="text-lg font-medium text-gray-900">{profile?.last_name || t('common.no_results')}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{t('auth.email')}</p>
                        <p className="text-lg font-medium text-gray-900">{profile?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {profile?.is_email_verified ? (
                            <>
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">{t('account.verified')}</span>
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm text-yellow-600">{t('account.pending')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{t('auth.phone_number')}</p>
                        <p className="text-lg font-medium text-gray-900">{profile?.phone_number}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {profile?.is_phone_verified ? (
                            <>
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">{t('account.verified')}</span>
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm text-yellow-600">{t('account.pending')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {profile?.date_of_birth && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{t('auth.date_of_birth')}</p>
                        <p className="text-lg font-medium text-gray-900">
                          {new Date(profile.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile?.country_code && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{t('auth.country')}</p>
                        <p className="text-lg font-medium text-gray-900">{profile.country_code}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Verification Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('account.verification')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{t('account.email_verified')}</p>
                    <p className="text-sm text-gray-600">{t('help.what_is_self_exclusion_answer')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile?.is_email_verified ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">{t('account.verified')}</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-yellow-600" />
                      <span className="text-yellow-600 font-medium">{t('account.pending')}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{t('account.phone_verified')}</p>
                    <p className="text-sm text-gray-600">{t('help.what_is_self_exclusion_answer')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile?.is_phone_verified ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">{t('account.verified')}</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-yellow-600" />
                      <span className="text-yellow-600 font-medium">{t('account.pending')}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{t('account.id_verified')}</p>
                    <p className="text-sm text-gray-600">{t('help.what_is_self_exclusion_answer')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile?.is_id_verified ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">{t('account.verified')}</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-yellow-600" />
                      <span className="text-yellow-600 font-medium">{t('account.pending')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('account.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{t('help.what_is_self_exclusion')}</p>
                <p className="text-lg font-medium text-gray-900">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{t('help.what_is_self_exclusion')}</p>
                <p className="text-lg font-medium text-gray-900">
                  {profile?.last_login ? new Date(profile.last_login).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{t('dashboard.account_status')}</p>
                <p className="text-lg font-medium text-green-600">{t('dashboard.active')}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{t('account.verification')}</p>
                <p className="text-lg font-medium text-gray-900">
                  {profile?.verification_status ? profile.verification_status.charAt(0).toUpperCase() + profile.verification_status.slice(1) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
