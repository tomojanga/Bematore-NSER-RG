'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useExclusions } from '@/hooks/useExclusions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Phone, Mail, Shield, Key, AlertCircle, CheckCircle, Clock, Hash } from 'lucide-react'

export default function AccountPage() {
  const { user, changePassword } = useAuth()
  const { exclusions } = useExclusions()
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const activeExclusion = exclusions?.find(e => e.status === 'active')
  const exclusionEndDate = activeExclusion
    ? activeExclusion.end_date || activeExclusion.actual_end_date || activeExclusion.expiry_date
    : null

  const handleChangePassword = async () => {
    if (passwords.new_password !== passwords.new_password_confirm) {
      setMessage('Passwords do not match')
      return
    }
    if (passwords.new_password.length < 8) {
      setMessage('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      await changePassword(passwords)
      setPasswords({ current_password: '', new_password: '', new_password_confirm: '' })
      setMessage('Password changed successfully!')
    } catch (error: any) {
      setMessage(error.response?.data?.error?.current_password?.[0] || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
        <p className="text-gray-600 mt-1">Manage your profile and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <p className="mt-1 text-lg text-gray-900">{user?.first_name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <p className="mt-1 text-lg text-gray-900">{user?.last_name || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </label>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-lg text-gray-900">{user?.phone_number}</p>
                {user?.is_phone_verified ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <AlertCircle className="h-3 w-3" /> Not Verified
                  </span>
                )}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-lg text-gray-900">{user?.email || 'Not provided'}</p>
                {user?.email && (
                  user?.is_email_verified ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      <CheckCircle className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      <AlertCircle className="h-3 w-3" /> Not Verified
                    </span>
                  )
                )}
              </div>
            </div>

            {user?.bst_token && (
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  BST Token (Betting Session Tracker)
                </label>
                <p className="mt-1 text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded break-all">
                  {user.bst_token}
                </p>
                <p className="mt-1 text-xs text-gray-500">This unique token tracks your gambling activity across all licensed operators in Kenya.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Account Status</p>
              <p className="text-xl font-bold text-blue-600">Active</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(user?.created_at || '').toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Role</p>
              <p className="text-lg font-semibold text-gray-900">Citizen</p>
            </div>

            {activeExclusion && (
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600 mb-1">Exclusion Status</p>
                <p className="text-lg font-bold text-red-600">Self-Excluded</p>
                {exclusionEndDate && (
                  <p className="text-xs text-gray-600 mt-2">
                    Until {new Date(exclusionEndDate).toLocaleDateString('en-GB')}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('success') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Current Password</label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={passwords.current_password}
                onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={passwords.new_password}
                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm New Password</label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwords.new_password_confirm}
                onChange={(e) => setPasswords({ ...passwords, new_password_confirm: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">Password must be at least 8 characters long</p>
            <Button 
              onClick={handleChangePassword} 
              disabled={loading || !passwords.current_password || !passwords.new_password}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="text-sm font-medium text-gray-900">Last Login</p>
                <p className="text-xs text-gray-500">
                  {user?.last_login ? new Date(user.last_login).toLocaleString('en-GB') : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="text-sm font-medium text-gray-900">Account Created</p>
                <p className="text-xs text-gray-500">
                  {new Date(user?.created_at || '').toLocaleString('en-GB')}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Profile Updated</p>
                <p className="text-xs text-gray-500">
                  {new Date(user?.updated_at || '').toLocaleString('en-GB')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
