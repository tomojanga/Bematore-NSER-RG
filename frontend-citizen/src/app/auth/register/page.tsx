'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Shield } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const { register, isRegistering } = useAuth()
  const [formData, setFormData] = useState({
    phone_number: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    terms_accepted: false,
    privacy_policy_accepted: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.password_confirm) {
      alert('Passwords do not match')
      return
    }
    
    if (!formData.terms_accepted || !formData.privacy_policy_accepted) {
      alert('Please accept terms and privacy policy')
      return
    }
    
    try {
      console.log('Submitting:', formData)
      await register(formData)
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-full mb-4">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Register for self-exclusion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <Input
              type="tel"
              placeholder="+254712345678"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <Input
              type="password"
              value={formData.password_confirm}
              onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.terms_accepted}
                onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                className="mt-1"
                required
              />
              <span className="text-sm text-gray-600">
                I accept the terms and conditions
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.privacy_policy_accepted}
                onChange={(e) => setFormData({ ...formData, privacy_policy_accepted: e.target.checked })}
                className="mt-1"
                required
              />
              <span className="text-sm text-gray-600">
                I accept the privacy policy
              </span>
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={isRegistering}>
            {isRegistering ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
