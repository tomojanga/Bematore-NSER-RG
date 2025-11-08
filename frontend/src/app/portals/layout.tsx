'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PortalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Redirect to appropriate portal based on role
    const currentPath = window.location.pathname

    if (currentPath === '/portals') {
      if (user?.role === 'super_admin' || user?.role === 'grak_admin') {
        router.push('/portals/grak')
      } else if (user?.role === 'operator_admin') {
        router.push('/portals/operator')
      } else if (user?.role === 'citizen') {
        router.push('/portals/citizen')
      } else {
        router.push('/dashboard') // Fallback to existing dashboard
      }
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}