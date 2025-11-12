'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import apiService from '@/lib/api-service'
import Link from 'next/link'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState<'business' | 'contact' | 'credentials'>('business')
  
  const [formData, setFormData] = useState({
    name: '',
    license_number: '',
    license_type: 'online_betting',
    license_issued_date: '',
    license_expiry_date: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirm: '',
    business_registration_number: '',
    physical_address: '',
    website_url: '',
    contact_person_name: '',
    contact_person_phone: '',
    terms_accepted: false,
  })

  const handleNext = () => {
    setError(null)
    if (currentStep === 'business') {
      if (!formData.name || !formData.license_number || !formData.business_registration_number || 
          !formData.license_issued_date || !formData.license_expiry_date || !formData.physical_address) {
        setError('Please fill in all required business information')
        return
      }
      // Validate license dates
      const issued = new Date(formData.license_issued_date)
      const expiry = new Date(formData.license_expiry_date)
      if (expiry <= issued) {
        setError('License expiry date must be after issued date')
        return
      }
      setCurrentStep('contact')
    } else if (currentStep === 'contact') {
      if (!formData.email || !formData.phone_number || !formData.contact_person_name || !formData.contact_person_phone) {
        setError('Please fill in all contact information')
        return
      }
      setCurrentStep('credentials')
    }
  }

  const handlePrevious = () => {
    setError(null)
    if (currentStep === 'contact') {
      setCurrentStep('business')
    } else if (currentStep === 'credentials') {
      setCurrentStep('contact')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match')
      return
    }

    if (!formData.terms_accepted) {
      setError('Please accept terms and conditions')
      return
    }

    setLoading(true)
    try {
      // Register operator via public endpoint
      await apiService.operator.publicRegister({
        name: formData.name,
        trading_name: formData.name,
        email: formData.email,
        phone: formData.phone_number,
        registration_number: formData.business_registration_number,
        license_number: formData.license_number,
        license_type: formData.license_type,
        license_issued_date: formData.license_issued_date,
        license_expiry_date: formData.license_expiry_date,
        website: formData.website_url,
        city: formData.physical_address.split(',')[1]?.trim() || '',
        terms_accepted: formData.terms_accepted
      })
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/pending-approval')
      }, 2000)
    } catch (error: any) {
      console.error('Registration error (raw):', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      
      let errorMsg = 'Registration failed. Please try again.'
      
      try {
        const responseData = error.response?.data
        console.log('Response data type:', typeof responseData)
        console.log('Response data keys:', Object.keys(responseData || {}))
        
        if (responseData) {
          // Try common error response formats
          if (responseData.message && typeof responseData.message === 'string') {
            errorMsg = responseData.message
          } else if (responseData.error && typeof responseData.error === 'string') {
            errorMsg = responseData.error
          } else if (responseData.detail && typeof responseData.detail === 'string') {
            errorMsg = responseData.detail
          } else if (responseData.errors && typeof responseData.errors === 'object') {
            // Handle validation errors - get first error
            const errorValues = Object.values(responseData.errors) as any[]
            if (errorValues.length > 0) {
              const firstError = errorValues[0]
              if (Array.isArray(firstError) && firstError.length > 0) {
                errorMsg = String(firstError[0])
              } else if (typeof firstError === 'string') {
                errorMsg = firstError
              }
            }
          }
        }
      } catch (e) {
        console.error('Error parsing error response:', e)
      }
      
      // Final safeguard: ensure it's a string
      const finalErrorMsg = String(errorMsg || 'Registration failed. Please try again.').slice(0, 200)
      setError(finalErrorMsg)
     } finally {
      setLoading(false)
    }
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-12 px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Operator Registration</h1>
            <p className="text-gray-300">Join NSER and manage your gaming operations</p>
          </div>

          {/* Main Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
            
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Success State */}
            {success && (
              <div className="text-center py-12">
                <div className="mb-4 flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
                <p className="text-gray-300 mb-6">Your account is pending approval. Check your email for next steps.</p>
                <p className="text-sm text-gray-400">Redirecting...</p>
              </div>
            )}

            {!success && (
              <>
                {/* Progress Indicator */}
                <div className="mb-8 flex gap-4">
                  {(['business', 'contact', 'credentials'] as const).map((step, idx) => (
                    <div key={step} className="flex-1">
                      <div className={`h-2 rounded-full transition-all ${
                        currentStep === step ? 'bg-purple-500' : 
                        (['business', 'contact', 'credentials'].indexOf(currentStep) > idx ? 'bg-green-500' : 'bg-gray-600')
                      }`}></div>
                      <p className="text-xs text-gray-400 mt-2 capitalize">{step}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Business Information Step */}
                  {currentStep === 'business' && (
                    <div className="space-y-4 animate-fade-in">
                      <h2 className="text-xl font-semibold text-white mb-6">Business Information</h2>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Operator Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="e.g., ABC Gaming Ltd"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Business Registration Number *</label>
                        <input
                          type="text"
                          required
                          value={formData.business_registration_number}
                          onChange={(e) => setFormData({ ...formData, business_registration_number: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="e.g., REG-2024-12345"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">License Type *</label>
                        <select
                          required
                          value={formData.license_type}
                          onChange={(e) => setFormData({ ...formData, license_type: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        >
                          <option value="online_betting">Online Betting</option>
                          <option value="land_based_casino">Land-Based Casino</option>
                          <option value="lottery">Lottery</option>
                          <option value="sports_betting">Sports Betting</option>
                          <option value="online_casino">Online Casino</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">License Number *</label>
                        <input
                          type="text"
                          required
                          value={formData.license_number}
                          onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="e.g., LIC-2024-001"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">License Issued Date *</label>
                          <input
                            type="date"
                            required
                            value={formData.license_issued_date}
                            onChange={(e) => setFormData({ ...formData, license_issued_date: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">License Expiry Date *</label>
                          <input
                            type="date"
                            required
                            value={formData.license_expiry_date}
                            onChange={(e) => setFormData({ ...formData, license_expiry_date: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Website URL</label>
                        <input
                          type="url"
                          value={formData.website_url}
                          onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="https://youroperator.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Physical Address *</label>
                        <textarea
                          required
                          rows={2}
                          value={formData.physical_address}
                          onChange={(e) => setFormData({ ...formData, physical_address: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="Street address, city, postal code"
                        />
                      </div>
                    </div>
                  )}

                  {/* Contact Information Step */}
                  {currentStep === 'contact' && (
                    <div className="space-y-4 animate-fade-in">
                      <h2 className="text-xl font-semibold text-white mb-6">Contact Information</h2>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="operator@company.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone_number}
                          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="+254712345678"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Contact Person Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.contact_person_name}
                          onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Contact Person Phone *</label>
                        <input
                          type="tel"
                          required
                          value={formData.contact_person_phone}
                          onChange={(e) => setFormData({ ...formData, contact_person_phone: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="+254712345678"
                        />
                      </div>
                    </div>
                  )}

                  {/* Credentials Step */}
                  {currentStep === 'credentials' && (
                    <div className="space-y-4 animate-fade-in">
                      <h2 className="text-xl font-semibold text-white mb-6">Create Your Account</h2>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Password *</label>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="••••••••"
                        />
                        <p className="text-xs text-gray-400 mt-2">Minimum 8 characters, with numbers and symbols</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Confirm Password *</label>
                        <input
                          type="password"
                          required
                          value={formData.password_confirm}
                          onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-3 pt-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.terms_accepted}
                            onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                            className="mt-1 w-4 h-4 rounded border-white/30 bg-white/10 accent-purple-500"
                          />
                          <span className="text-sm text-gray-300 group-hover:text-gray-200">
                            I agree to the Terms and Conditions and confirm all information is accurate
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-4 mt-8">
                    {currentStep !== 'business' && (
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-medium transition"
                      >
                        Previous
                      </button>
                    )}
                    
                    {currentStep !== 'credentials' ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          'Complete Registration'
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}

            {/* Footer */}
            <div className="mt-8 text-center border-t border-white/10 pt-8">
              <p className="text-gray-300">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in;
        }
      `}</style>
    </div>
  )
}
