import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/use-toast'
import { Shield, Smartphone, Mail } from 'lucide-react'
import { TwoFactorVerificationData } from '@/types/auth'

interface TwoFactorVerificationProps {
  method: '2fa' | 'sms' | 'email'
  onVerified: () => void
  onCancel: () => void
}

export function TwoFactorVerification({
  method,
  onVerified,
  onCancel
}: TwoFactorVerificationProps) {
  const { toast } = useToast()
  const { verify2FA, resend2FACode } = useAuth()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await verify2FA({ verification_code: code, method } as TwoFactorVerificationData)
      toast({
        title: "Success",
        description: "Two-factor authentication verified successfully",
        variant: "default"
      })
      onVerified()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify code",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await resend2FACode({ method })
      setCountdown(30)
      toast({
        title: "Code Sent",
        description: `A new verification code has been sent to your ${
          method === 'email' ? 'email' : 'phone'
        }`,
        variant: "default"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend code",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="w-[400px] p-6">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 p-3 rounded-full mb-4">
          {method === '2fa' && <Shield className="h-6 w-6 text-blue-600" />}
          {method === 'sms' && <Smartphone className="h-6 w-6 text-blue-600" />}
          {method === 'email' && <Mail className="h-6 w-6 text-blue-600" />}
        </div>
        <h2 className="text-xl font-semibold text-center">Two-Factor Authentication</h2>
        <p className="text-sm text-gray-600 text-center mt-2">
          {method === '2fa' && 'Enter the code from your authenticator app'}
          {method === 'sms' && 'Enter the code sent to your phone'}
          {method === 'email' && 'Enter the code sent to your email'}
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <Input
          type="text"
          placeholder="Enter verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          required
          className="text-center text-2xl tracking-wider"
        />

        <div className="space-y-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
          
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={countdown > 0 || isLoading}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}