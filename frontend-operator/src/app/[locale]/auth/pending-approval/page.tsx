'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import apiService from '@/lib/api-service'
import { Clock, CheckCircle, XCircle, AlertCircle, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function PendingApprovalPage() {
  const router = useRouter()
  const t = useTranslations()
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null)
  const [loading, setLoading] = useState(true)
  const [operator, setOperator] = useState<any>(null)

  useEffect(() => {
    checkApprovalStatus()
    const interval = setInterval(checkApprovalStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkApprovalStatus = async () => {
    try {
      const response = await apiService.operator.getMe()
      const op = response.data.data
      setOperator(op)
      
      if (op.license_status === 'active' && op.is_api_active) {
        setStatus('approved')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else if (op.license_status === 'rejected' || op.license_status === 'suspended') {
        setStatus('rejected')
      } else {
        setStatus('pending')
      }
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        setStatus('pending')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('operator_token')
    localStorage.removeItem('operator_refresh')
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <Clock className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg">{t('auth.checking_status')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-md">
        {/* Pending Status */}
        {status === 'pending' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 border border-yellow-500/50 rounded-full mb-4">
                <Clock className="h-10 w-10 text-yellow-400 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('auth.pending_approval')}</h1>
              <p className="text-gray-300">{t('auth.registration_under_review')}</p>
            </div>

            {operator && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-24">{t('auth.business')}:</span>
                  <span className="text-white font-medium">{operator.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-24">{t('auth.email')}:</span>
                  <span className="text-white font-mono text-xs">{operator.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-24">{t('auth.license')}:</span>
                  <span className="text-yellow-400 font-medium">{operator.license_status}</span>
                </div>
              </div>
            )}

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-100">
                  <p className="font-semibold mb-2">{t('auth.what_happens_next')}</p>
                  <ul className="space-y-1 text-yellow-50/90 text-xs">
                    <li>{t('auth.verify_license')}</li>
                    <li>{t('auth.email_notification')}</li>
                    <li>{t('auth.approval_time')}</li>
                    <li>{t('auth.api_keys_after_approval')}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={checkApprovalStatus}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <Clock className="h-4 w-4" />
                {t('auth.check_status_again')}
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-medium transition"
              >
                {t('auth.logout')}
              </button>
            </div>

            <div className="border-t border-white/10 pt-6 text-center">
              <p className="text-xs text-gray-400 mb-4">{t('auth.need_help')}</p>
               <div className="flex flex-col gap-2 text-sm">
                  <a href="mailto:support@nser.local" className="text-purple-400 hover:text-purple-300 flex items-center justify-center gap-2 transition">
                    <Mail className="h-4 w-4" />
                    support@nser.local
                  </a>
                </div>
            </div>
          </div>
        )}

        {/* Approved Status */}
        {status === 'approved' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 border border-green-500/50 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('auth.approved')}</h1>
            <p className="text-gray-300 mb-4">{t('auth.application_approved')}</p>
            <p className="text-sm text-gray-400">{t('auth.redirecting')}</p>
          </div>
        )}

        {/* Rejected Status */}
        {status === 'rejected' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 border border-red-500/50 rounded-full mb-4">
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('auth.application_rejected')}</h1>
              <p className="text-gray-300">{t('auth.registration_not_approved')}</p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8">
              <p className="text-sm text-red-100 mb-3">
                {t('auth.rejection_info')}
              </p>
              <p className="text-xs text-red-200">
                {t('auth.resubmit_option')}
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition text-center"
              >
                {t('auth.back_to_login')}
              </Link>
              <a
                href="mailto:support@nser.local"
                className="block w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-medium transition text-center"
              >
                {t('auth.contact_support')}
              </a>
            </div>
          </div>
        )}
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
