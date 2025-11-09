'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('operator_token')
    if (token) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  }, [router])

  return null
}
