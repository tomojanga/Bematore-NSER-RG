'use client'

import { useState, useEffect } from 'react'
import apiService from '@/lib/api-service'
import { User, Mail, Phone, MapPin, Building2, Calendar, Edit2, Save, X, Loader, AlertCircle, CheckCircle } from 'lucide-react'

interface UserProfile {
  name: string
  email: string
  phone?: string
  job_title?: string
  last_login?: string
  created_at: string
}

interface OperatorProfile {
  name: string
  license_status: string
  license_expiry_date?: string
  country?: string
  website?: string
  industry?: string
}

interface LoginActivity {
  timestamp: string
  ip_address: string
  user_agent: string
  status: 'success' | 'failed'
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [operatorProfile, setOperatorProfile] = useState<OperatorProfile | null>(null)
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    job_title: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const userRes = await apiService.operator.getMe()
      const user = userRes.data?.data

      if (!user) {
        setMessage({ type: 'error', text: 'Failed to load profile data' })
        setLoading(false)
        return
      }

      setUserProfile({
        name: user.name || user.company_name || 'User',
        email: user.email || user.contact_person_email || '',
        phone: user.phone || user.contact_person_phone || '',
        job_title: user.job_title || 'Operator',
        last_login: user.last_login || '',
        created_at: user.created_at
      })

      setOperatorProfile({
        name: user.name || user.company_name || 'Operator',
        license_status: user.license_status || 'pending',
        license_expiry_date: user.license_expiry_date,
        country: user.country || '',
        website: user.website_url || user.website || '',
        industry: user.industry || ''
      })

      setEditData({
        name: user.name || user.company_name || '',
        phone: user.phone || user.contact_person_phone || '',
        job_title: user.job_title || ''
      })

      // Fetch login activity
      try {
        const auditRes = await apiService.audit.getOperatorLogs({ limit: 10 })
        setLoginActivity(auditRes.data?.data?.results || [])
      } catch (auditError) {
        console.error('Failed to fetch audit logs:', auditError)
        // Don't fail the whole profile fetch if audit logs fail
        setLoginActivity([])
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!editData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' })
      return
    }

    setSaving(true)
    try {
      const operatorRes = await apiService.operator.getMe()
      const operatorId = operatorRes.data.data.id
      
      await apiService.operator.update(operatorId, {
        name: editData.name,
        phone: editData.phone,
        job_title: editData.job_title
      })

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setEditing(false)
      fetchProfile()
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">View and manage your profile information</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div className={`rounded-lg p-4 flex gap-3 border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">
                {userProfile?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{userProfile?.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{userProfile?.job_title || 'Operator'}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Mail className="h-4 w-4 text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900 truncate">{userProfile?.email}</p>
              </div>
            </div>

            {userProfile?.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Phone className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{userProfile.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Calendar className="h-4 w-4 text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(userProfile?.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>

            {userProfile?.last_login && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <User className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Last Login</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(userProfile.last_login).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Operator Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Operator Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Building2 className="h-4 w-4 text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Operator Name</p>
                <p className="text-sm font-medium text-gray-900">{operatorProfile?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <CheckCircle className="h-4 w-4 flex-shrink-0" style={{
                color: operatorProfile?.license_status === 'active' ? '#16a34a' : '#ef4444'
              }} />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">License Status</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {operatorProfile?.license_status}
                </p>
              </div>
            </div>

            {operatorProfile?.license_expiry_date && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Calendar className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">License Expiry</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(operatorProfile.license_expiry_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {operatorProfile?.country && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <MapPin className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Country</p>
                  <p className="text-sm font-medium text-gray-900">{operatorProfile.country}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your name"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="+254712345678"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={editData.job_title}
                  onChange={(e) => setEditData({ ...editData, job_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your job title"
                  disabled={saving}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setEditData({
                      name: userProfile?.name || '',
                      phone: userProfile?.phone || '',
                      job_title: userProfile?.job_title || ''
                    })
                  }}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login Activity */}
      {loginActivity.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Login Activity</h3>
          <div className="space-y-3">
            {loginActivity.slice(0, 10).map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.ip_address}</p>
                </div>
                <div className="flex items-center gap-2">
                  {activity.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-sm font-medium capitalize text-gray-900">
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
