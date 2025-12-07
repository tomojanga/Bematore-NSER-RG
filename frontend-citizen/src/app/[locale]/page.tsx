'use client'

import { useEffect } from 'react'
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import { useAuthInitialization } from '@/hooks/useAuthInitialization'

export default function Home() {
  const router = useRouter()
  const t = useTranslations()
  const { isValidating, isAuthenticated, validationError } = useAuthInitialization()

  useEffect(() => {
    // Wait for validation to complete before routing
    if (isValidating) return

    // Route based on authentication status
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  }, [isValidating, isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    </div>
  )
}
