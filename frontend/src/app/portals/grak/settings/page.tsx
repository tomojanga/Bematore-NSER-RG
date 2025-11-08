'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Settings, User, Lock, Bell, Shield } from 'lucide-react'

export default function GRAKSettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <nav className="space-y-2">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'security', label: 'Security', icon: Lock },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'permissions', label: 'Permissions', icon: Shield }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <Input defaultValue={user?.first_name} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <Input defaultValue={user?.last_name} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input defaultValue={user?.email} type="email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <Input defaultValue={user?.phone_number} />
                  </div>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <Input type="password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <Input type="password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <Input type="password" />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Email Notifications', description: 'Receive email alerts for important events' },
                    { label: 'SMS Notifications', description: 'Get SMS alerts for critical issues' },
                    { label: 'System Alerts', description: 'Notifications for system health issues' },
                    { label: 'Compliance Alerts', description: 'Alerts for compliance violations' }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <input type="checkbox" className="h-5 w-5" defaultChecked />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'permissions' && (
            <Card>
              <CardHeader>
                <CardTitle>Role & Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Current Role</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{user?.role?.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Permissions</p>
                    <div className="space-y-2">
                      {[
                        'View Users',
                        'Manage Exclusions',
                        'View Operators',
                        'Manage Compliance',
                        'Generate Reports',
                        'System Administration'
                      ].map((permission) => (
                        <div key={permission} className="flex items-center gap-2 text-sm text-gray-600">
                          <Shield className="h-4 w-4 text-green-600" />
                          {permission}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
