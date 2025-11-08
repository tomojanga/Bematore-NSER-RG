'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Phone, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { usePhoneVerification } from '@/hooks/useAuth'

function VerifyPhonePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    // Check if we have a phone number from URL params
    const phone = searchParams.get('phone')
    if (phone) {
      setPhoneNumber(phone)
      setStep('verify')
    }
  }, [searchParams])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSendingCode(true)

    if (!phoneNumber.trim()) {
      setErrors({ phone: 'Phone number is required' })
      setIsSendingCode(false)
      return
    }

    if (!/^254[0-9]{9}$/.test(phoneNumber)) {
      setErrors({ phone: 'Phone must be in format 254XXXXXXXXX' })
      setIsSendingCode(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/users/verify/send-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ type: 'phone' }),
      })

      if (response.ok) {
        setStep('verify')
      } else {
        const errorData = await response.json()
        setErrors({ general: errorData.message || 'Failed to send code' })
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsVerifying(true)

    if (!verificationCode.trim()) {
      setErrors({ code: 'Verification code is required' })
      setIsVerifying(false)
      return
    }

    if (verificationCode.length !== 6) {
      setErrors({ code: 'Code must be 6 digits' })
      setIsVerifying(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/users/verify/phone/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ code: verificationCode }),
      })

      if (response.ok) {
        // Redirect to dashboard or appropriate page
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        setErrors({ code: errorData.message || 'Invalid verification code' })
      }
    } catch (error) {
      setErrors({ code: 'Network error. Please try again.' })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setErrors({})
    setIsSendingCode(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/users/verify/send-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ type: 'phone' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrors({ general: errorData.message || 'Failed to resend code' })
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsSendingCode(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-full mb-4">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {step === 'request' ? 'Verify Phone Number' : 'Enter Verification Code'}
          </h1>
          <p className="text-gray-600 mt-2 text-center">
            {step === 'request'
              ? 'Enter your phone number to receive a verification code'
              : `We've sent a 6-digit code to ${phoneNumber}`
            }
          </p>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {errors.general}
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254712345678"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <button
              type="submit"
              disabled={isSendingCode}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSendingCode ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Sending Code...
                </span>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className={`w-full text-center text-2xl font-mono tracking-widest px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={6}
                required
              />
              {errors.code && <p className="text-red-500 text-sm mt-1 text-center">{errors.code}</p>}
            </div>

            <button
              type="submit"
              disabled={isVerifying || verificationCode.length !== 6}
              className="w-full bg-gradient-to-r from-green-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isVerifying ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Verifying...
                </span>
              ) : (
                'Verify Phone Number'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isSendingCode}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm disabled:opacity-50"
              >
                {isSendingCode ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Protected by GRAK © 2025</p>
        </div>
      </div>
    </div>
  )
}

export default VerifyPhonePage