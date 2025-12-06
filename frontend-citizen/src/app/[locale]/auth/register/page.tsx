'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Shield } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function RegisterPage() {
  const t = useTranslations()
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
      alert(t('errors.passwords_dont_match'))
      return
    }
    
    if (!formData.terms_accepted || !formData.privacy_policy_accepted) {
      alert(t('errors.required_field'))
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6 sm:py-12">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 sm:p-4 rounded-full mb-4">
            <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">{t('auth.sign_up')}</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base text-center">{t('auth.create_account')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.first_name')}</label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.last_name')}</label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.phone_number')}</label>
            <Input
              type="tel"
              placeholder="+254712345678"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.password')}</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.confirm_password')}</label>
            <Input
              type="password"
              value={formData.password_confirm}
              onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.terms_accepted}
                onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                className="mt-1"
                required
              />
              <span className="text-xs sm:text-sm text-gray-600">
                {t('auth.terms_agree')}
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
              <span className="text-xs sm:text-sm text-gray-600">
                {t('auth.privacy_agree')}
              </span>
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={isRegistering}>
            {isRegistering ? t('auth.signing_in') : t('auth.sign_up')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            {t('auth.dont_have_account')}{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              {t('auth.sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
