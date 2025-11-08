'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Phone, Mail, Shield, Key } from 'lucide-react'

export default function AccountPage() {
  const { user, changePassword } = useAuth()
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: ''
  })

  const handleChangePassword = async () => {
    if (passwords.new_password !== passwords.new_password_confirm) {
      alert('Passwords do not match')
      return
    }
    try {
      await changePassword(passwords)
      setPasswords({ current_password: '', new_password: '', new_password_confirm: '' })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
        <p className="text-gray-600 mt-1">Manage your profile and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-gray-900">{user?.first_name} {user?.last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </label>
              <p className="mt-1 text-gray-900">{user?.phone_number}</p>
              {user?.is_phone_verified && (
                <span className="text-xs text-green-600">✓ Verified</span>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="mt-1 text-gray-900">{user?.email || 'Not provided'}</p>
              {user?.is_email_verified && (
                <span className="text-xs text-green-600">✓ Verified</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Current Password"
              value={passwords.current_password}
              onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
            />
            <Input
              type="password"
              placeholder="New Password"
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={passwords.new_password_confirm}
              onChange={(e) => setPasswords({ ...passwords, new_password_confirm: e.target.value })}
            />
            <Button onClick={handleChangePassword} className="w-full">
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Account Status</p>
              <p className="text-lg font-bold text-green-600">Active</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(user?.created_at || '').toLocaleDateString()}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg font-bold text-blue-600">Citizen</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
