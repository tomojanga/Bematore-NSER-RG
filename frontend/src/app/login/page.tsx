'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Shield, Phone, Lock, Eye, EyeOff, Fingerprint } from 'lucide-react'
import Link from 'next/link'
import { TwoFactorVerification } from '@/components/auth/TwoFactorVerification'
import { useToast } from '@/components/ui/use-toast'
import { SingleApiResponse, AuthResponse } from '@/types/auth'

interface LoginState {
  step: 'credentials' | '2fa' | 'biometric'
  method?: '2fa' | 'sms' | 'email'
}

export default function LoginPage() {
  const { toast } = useToast()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(false)
  const [loginState, setLoginState] = useState<LoginState>({ step: 'credentials' })
  const { login, isLoggingIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await login({
        phone_number: phone,
        password,
        remember_device: rememberDevice,
      }) as SingleApiResponse<AuthResponse>
      const { data } = response
      
      // If 2FA is required, move to the next step
      if (data.requires2FA) {
        setLoginState({ 
          step: '2fa',
          method: data.preferredMethod || '2fa'
        })
        return
      }

      // If biometric is available and not yet registered
      if (data.biometricAvailable && !data.biometricRegistered) {
        setLoginState({ step: 'biometric' })
        return
      }

      // Success - handled by useAuth hook for redirect
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to sign in",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-full mb-4">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">NSER & RG Portal</h1>
          <p className="text-gray-600 mt-2">Access your dedicated portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="254712345678"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoggingIn ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            Forgot your password?
          </Link>
          <div className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign up here
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Protected by GRAK © 2025</p>
        </div>
      </div>
    </div>
  )
}
