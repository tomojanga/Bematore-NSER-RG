'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('grak_token')
    router.push(token ? '/dashboard' : '/auth/login')
  }, [router])

  return <div className="min-h-screen flex items-center justify-center">Loading...</div>
}
