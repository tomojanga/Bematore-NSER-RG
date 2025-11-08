'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, usePhoneVerification, useEmailVerification } from '@/hooks/useAuth'
import { Shield, Phone, Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/use-toast'

function VerifyAccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { sendCode: sendPhoneCode, verifyPhone, isSendingCode: isSendingPhone, isVerifying: isVerifyingPhone } = usePhoneVerification()
  const { verifyEmail, isVerifying: isVerifyingEmail } = useEmailVerification()
  
  const [phoneCode, setPhoneCode] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [phoneSent, setPhoneSent] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSendPhoneCode = () => {
    if (!user?.phone_number) return
    sendPhoneCode({ phone_number: user.phone_number, action: 'verify' })
    setPhoneSent(true)
  }

  const handleVerifyPhone = () => {
    if (!user?.phone_number || !phoneCode) return
    verifyPhone({ phone_number: user.phone_number, code: phoneCode })
  }

  const handleVerifyEmail = () => {
    if (!user?.email || !emailCode) return
    verifyEmail({ email: user.email, code: emailCode })
  }

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Redirect when fully verified
  useEffect(() => {
    if (user?.is_phone_verified && (!user.email || user.is_email_verified)) {
      router.push('/dashboard')
    }
  }, [user?.is_phone_verified, user?.is_email_verified, user?.email, router])

  if (!user) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-full mb-4">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Account</h1>
          <p className="text-gray-600 mt-2 text-center">Complete verification to access your account</p>
        </div>

        <div className="space-y-6">
          {/* Phone Verification */}
          {!user.is_phone_verified && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Phone Verification</h3>
                  <p className="text-sm text-gray-600">{user.phone_number}</p>
                </div>
              </div>
              
              {!phoneSent ? (
                <Button onClick={handleSendPhoneCode} disabled={isSendingPhone} className="w-full">
                  {isSendingPhone ? 'Sending...' : 'Send Code'}
                </Button>
              ) : (
                <div className="space-y-3">
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
            </div>
          )}

          {user.is_phone_verified && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Phone Verified</h3>
                  <p className="text-sm text-green-700">{user.phone_number}</p>
                </div>
              </div>
            </div>
          )}

          {/* Email Verification */}
          {user.email && !user.is_email_verified && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Email Verification</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Input
                  placeholder="Enter 6-digit code"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  maxLength={6}
                />
                <Button onClick={handleVerifyEmail} disabled={isVerifyingEmail || !emailCode} className="w-full">
                  {isVerifyingEmail ? 'Verifying...' : 'Verify Email'}
                </Button>
              </div>
            </div>
          )}

          {user.email && user.is_email_verified && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Email Verified</h3>
                  <p className="text-sm text-green-700">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Protected by GRAK © 2025</p>
        </div>
      </div>
    </div>
  )
}

export default VerifyAccountPage