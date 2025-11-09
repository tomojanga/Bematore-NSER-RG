'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import apiService from '@/lib/api-service'
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function PendingApprovalPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkApprovalStatus()
    const interval = setInterval(checkApprovalStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkApprovalStatus = async () => {
    try {
      const response = await apiService.operator.getMe()
      const operator = response.data.data
      
      if (operator.license_status === 'active' && operator.is_api_active) {
        setStatus('approved')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else if (operator.license_status === 'rejected' || operator.license_status === 'suspended') {
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
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {status === 'pending' && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Clock className="h-8 w-8 text-yellow-600 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Approval</h1>
              <p className="text-gray-600">Your operator registration is under review by GRAK.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    <li>GRAK will verify your license</li>
                    <li>You'll receive an email once approved</li>
                    <li>Approval takes 1-3 business days</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={checkApprovalStatus} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700">
                Check Status Again
              </button>
              <button onClick={handleLogout} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200">
                Logout
              </button>
            </div>
          </>
        )}

        {status === 'approved' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Approved!</h1>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'rejected' && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Rejected</h1>
              <p className="text-gray-600">Your registration was not approved.</p>
            </div>
            <Link href="/auth/login" className="block w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 text-center">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
