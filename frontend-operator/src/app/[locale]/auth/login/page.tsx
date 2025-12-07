'use client'

import { useState } from 'react'
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import apiService from '@/lib/api-service'
import Link from 'next/link'
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    phone_number: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await apiService.auth.login(formData.phone_number, formData.password)
      localStorage.setItem('operator_token', response.data.data.access)
      localStorage.setItem('operator_refresh', response.data.data.refresh)
      
      // Check operator approval status
      try {
        const operatorRes = await apiService.operator.getMe()
        const operator = operatorRes.data.data
        
        if (operator.license_status === 'pending' || !operator.is_api_active) {
          router.push('/auth/pending-approval')
        } else {
          router.push('/dashboard')
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          router.push('/auth/pending-approval')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      let errorMsg = 'Login failed. Please check your credentials.'
      
      try {
        const data = error.response?.data
        if (data) {
          if (data.message && typeof data.message === 'string') {
            errorMsg = data.message
          } else if (data.error && typeof data.error === 'string') {
            errorMsg = data.error
          } else if (data.detail && typeof data.detail === 'string') {
            errorMsg = data.detail
          } else if (data.errors && typeof data.errors === 'object') {
            const firstError = Object.values(data.errors)[0]
            if (Array.isArray(firstError)) {
              errorMsg = firstError[0] || errorMsg
            } else if (typeof firstError === 'string') {
              errorMsg = firstError
            }
          }
        }
      } catch (e) {
        console.error('Error parsing error response:', e)
      }
      
      setError(String(errorMsg).slice(0, 200))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{t('auth.welcome_back')}</h1>
          <p className="text-muted-foreground">{t('auth.operator_signin')}</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-border rounded-2xl shadow-lg p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t('auth.phone_number')}</label>
              <input
                type="tel"
                required
                placeholder="+254712345678"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('auth.signing_in')}
                </>
              ) : (
                t('auth.sign_in')
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Footer */}
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.new_operator')}{' '}
              <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium transition">
                {t('auth.create_account')}
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              <Link href="/forgot-password" className="text-primary hover:text-primary/80 transition">
                {t('auth.forgot_password')}
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { icon: '🔐', label: t('auth.secure') },
            { icon: '⚡', label: t('auth.fast') },
            { icon: '🛡️', label: t('auth.protected') }
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
