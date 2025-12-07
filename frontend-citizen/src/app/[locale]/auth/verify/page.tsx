'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, usePhoneVerification, useEmailVerification } from '@/hooks/useAuth'
import { Shield, Phone, Mail, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/use-toast'

function VerifyAccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, refreshUser } = useAuth()
  const { sendCode: sendPhoneCode, verifyPhone, isSendingCode: isSendingPhone, isVerifying: isVerifyingPhone } = usePhoneVerification()
  const { verifyEmail, isVerifying: isVerifyingEmail } = useEmailVerification()
  
  const [phoneCode, setPhoneCode] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [step, setStep] = useState<'phone' | 'email' | 'complete'>('phone')
  const [emailCodeSent, setEmailCodeSent] = useState(false)

  const handleSendPhoneCode = () => {
    if (!user?.phone_number) return
    sendPhoneCode({ phone_number: user.phone_number, action: 'verify' })
  }

  const handleVerifyPhone = async () => {
    if (!user?.phone_number || !phoneCode) return
    try {
      await verifyPhone({ phone_number: user.phone_number, code: phoneCode })
      const updatedUser = await refreshUser()
      if (updatedUser?.email && !updatedUser?.is_email_verified) {
        setStep('email')
      } else {
        setTimeout(() => router.push('/dashboard'), 500)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSendEmailCode = async () => {
    if (!user?.email) return
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/verify/send-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ type: 'email' })
      })
      setEmailCodeSent(true)
      toast({
        title: 'Success',
        description: 'Verification code sent to your email',
        duration: 3000
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleVerifyEmail = async () => {
    if (!user?.email || !emailCode) return
    try {
      await verifyEmail({ email: user.email, code: emailCode })
      await refreshUser()
      setTimeout(() => router.push('/dashboard'), 500)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSkipEmail = () => {
    router.push('/dashboard')
  }

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    // Check if already verified
    if (user.is_phone_verified && step === 'phone') {
      if (!user.email || user.is_email_verified) {
        router.push('/dashboard')
      } else {
        setStep('email')
      }
    }
  }, [user, router, step])

  if (!user) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6 sm:py-12">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 sm:p-4 rounded-full mb-4">
            <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">Verify Your Account</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center">
            {step === 'phone' && 'Step 1: Verify your phone number'}
            {step === 'email' && 'Step 2: Verify your email'}
            {step === 'complete' && 'Verification complete!'}
          </p>
        </div>

        {step === 'phone' && !user.is_phone_verified && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm">Phone Number</p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{user.phone_number}</p>
              </div>
            </div>
            <Button onClick={handleSendPhoneCode} disabled={isSendingPhone} className="w-full">
              {isSendingPhone ? 'Sending...' : 'Send Verification Code'}
            </Button>
            <Input
              placeholder="Enter 6-digit code"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              maxLength={6}
            />
            <Button onClick={handleVerifyPhone} disabled={isVerifyingPhone || !phoneCode} className="w-full">
              {isVerifyingPhone ? 'Verifying...' : 'Verify Phone'}
            </Button>
          </div>
        )}

        {step === 'email' && user.email && !user.is_email_verified && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm">Email Address</p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
              </div>
            </div>
            
            {!emailCodeSent ? (
              <Button onClick={handleSendEmailCode} className="w-full">
                Send Verification Code to Email
              </Button>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                  <p className="text-xs sm:text-sm text-green-800">Verification code sent to {user.email}</p>
                </div>
                <Input
                  placeholder="Enter 6-digit code"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
                <Button onClick={handleVerifyEmail} disabled={isVerifyingEmail || !emailCode} className="w-full">
                  {isVerifyingEmail ? 'Verifying...' : 'Verify Email'}
                </Button>
              </>
            )}
            
            <Button onClick={handleSkipEmail} variant="outline" className="w-full">
              Skip for Now
            </Button>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 sm:h-20 sm:w-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Verification Complete!</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
          <p>Protected by GRAK © 2025</p>
        </div>
      </div>
    </div>
  )
}

export default VerifyAccountPage