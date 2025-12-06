'use client'

import { useState } from 'react'
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import apiService from '@/lib/api-service'
import Link from 'next/link'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function RegisterPage() {
  const router = useRouter()
  const t = useTranslations()
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
        setError(t('auth.fill_business_info'))
        return
      }
      const issued = new Date(formData.license_issued_date)
      const expiry = new Date(formData.license_expiry_date)
      if (expiry <= issued) {
        setError(t('auth.license_date_error'))
        return
      }
      setCurrentStep('contact')
    } else if (currentStep === 'contact') {
      if (!formData.email || !formData.phone_number || !formData.contact_person_name || !formData.contact_person_phone) {
        setError(t('auth.fill_contact_info'))
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
      setError(t('auth.passwords_not_match'))
      return
    }

    if (!formData.terms_accepted) {
      setError(t('auth.accept_terms'))
      return
    }

    setLoading(true)
    try {
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
        password: formData.password,
        terms_accepted: formData.terms_accepted
      })
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/pending-approval')
      }, 2000)
    } catch (error: any) {
      let errorMsg = t('auth.registration_failed')
      
      try {
        const responseData = error.response?.data
        
        if (responseData) {
          if (responseData.message && typeof responseData.message === 'string') {
            errorMsg = responseData.message
          } else if (responseData.error && typeof responseData.error === 'string') {
            errorMsg = responseData.error
          } else if (responseData.detail && typeof responseData.detail === 'string') {
            errorMsg = responseData.detail
          } else if (responseData.errors && typeof responseData.errors === 'object') {
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
      
      setError(String(errorMsg || t('auth.registration_failed')).slice(0, 200))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-12 px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">{t('auth.operator_registration')}</h1>
            <p className="text-muted-foreground">{t('auth.join_nser')}</p>
          </div>

          {/* Main Card */}
          <div className="bg-white border border-border rounded-2xl shadow-lg p-8">
            
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-destructive">{error}</p>
              </div>
            )}

            {/* Success State */}
            {success && (
              <div className="text-center py-12">
                <div className="mb-4 flex justify-center">
                  <CheckCircle className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{t('auth.registration_success')}</h3>
                <p className="text-muted-foreground mb-6">{t('auth.pending_approval_msg')}</p>
                <p className="text-sm text-muted-foreground">{t('auth.redirecting')}</p>
              </div>
            )}

            {!success && (
              <>
                {/* Progress Indicator */}
                <div className="mb-8 flex gap-4">
                   {(['business', 'contact', 'credentials'] as const).map((step, idx) => (
                     <div key={step} className="flex-1">
                       <div className={`h-2 rounded-full transition-all ${
                         currentStep === step ? 'bg-primary' : 
                         (['business', 'contact', 'credentials'].indexOf(currentStep) > idx ? 'bg-primary/60' : 'bg-secondary')
                       }`}></div>
                       <p className="text-xs text-muted-foreground mt-2 capitalize">{t(`auth.step_${step}`)}</p>
                     </div>
                   ))}
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Business Information Step */}
                  {currentStep === 'business' && (
                    <div className="space-y-4 animate-fade-in">
                      <h2 className="text-xl font-semibold text-foreground mb-6">{t('auth.business_info')}</h2>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('auth.operator_name')} *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder={t('auth.operator_name_placeholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('auth.registration_number')} *</label>
                        <input
                          type="text"
                          required
                          value={formData.business_registration_number}
                          onChange={(e) => setFormData({ ...formData, business_registration_number: e.target.value })}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="REG-2024-12345"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('auth.license_type')} *</label>
                        <select
                          required
                          value={formData.license_type}
                          onChange={(e) => setFormData({ ...formData, license_type: e.target.value })}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        >
                          <option value="online_betting">{t('auth.online_betting')}</option>
                          <option value="land_based_casino">{t('auth.land_based_casino')}</option>
                          <option value="lottery">{t('auth.lottery')}</option>
                          <option value="sports_betting">{t('auth.sports_betting')}</option>
                          <option value="online_casino">{t('auth.online_casino')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('auth.license_number')} *</label>
                        <input
                          type="text"
                          required
                          value={formData.license_number}
                          onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="LIC-2024-001"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">{t('auth.license_issued')} *</label>
                          <input
                            type="date"
                            required
                            value={formData.license_issued_date}
                            onChange={(e) => setFormData({ ...formData, license_issued_date: e.target.value })}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">{t('auth.license_expiry')} *</label>
                          <input
                            type="date"
                            required
                            value={formData.license_expiry_date}
                            onChange={(e) => setFormData({ ...formData, license_expiry_date: e.target.value })}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('auth.website_url')}</label>
                        <input
                          type="url"
                          value={formData.website_url}
                          onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="https://youroperator.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('auth.physical_address')} *</label>
                        <textarea
                          required
                          rows={2}
                          value={formData.physical_address}
                          onChange={(e) => setFormData({ ...formData, physical_address: e.target.value })}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder={t('auth.address_placeholder')}
                        />
                      </div>
                    </div>
                  )}

                  {/* Contact Information Step */}
                  {currentStep === 'contact' && (
                    <div className="space-y-4 animate-fade-in">
                      <h2 className="text-xl font-semibold text-foreground mb-6">{t('auth.contact_info')}</h2>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('auth.email_address')} *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="operator@company.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('auth.phone_number')} *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone_number}
                          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="+254712345678"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('auth.contact_person')} *</label>
                        <input
                          type="text"
                          required
                          value={formData.contact_person_name}
                          onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('auth.contact_person_phone')} *</label>
                        <input
                          type="tel"
                          required
                          value={formData.contact_person_phone}
                          onChange={(e) => setFormData({ ...formData, contact_person_phone: e.target.value })}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="+254712345678"
                        />
                      </div>
                    </div>
                  )}

                  {/* Credentials Step */}
                  {currentStep === 'credentials' && (
                    <div className="space-y-4 animate-fade-in">
                      <h2 className="text-xl font-semibold text-foreground mb-6">{t('auth.create_account')}</h2>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('auth.password')} *</label>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="••••••••"
                        />
                        <p className="text-xs text-muted-foreground mt-2">{t('auth.password_requirements')}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('auth.confirm_password')} *</label>
                        <input
                          type="password"
                          required
                          value={formData.password_confirm}
                          onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-3 pt-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.terms_accepted}
                            onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                            className="mt-1 w-4 h-4 rounded border-border bg-secondary accent-primary"
                          />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground">
                            {t('auth.accept_terms_text')}
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
                        className="flex-1 px-6 py-3 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-lg font-medium transition"
                      >
                        {t('auth.previous')}
                      </button>
                    )}
                    
                    {currentStep !== 'credentials' ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition"
                      >
                        {t('auth.next')}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('auth.registering')}
                          </>
                        ) : (
                          t('auth.complete_registration')
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}

            {/* Footer */}
            <div className="mt-8 text-center border-t border-border pt-8">
              <p className="text-muted-foreground">
                {t('auth.have_account')}{' '}
                <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition">
                  {t('auth.sign_in')}
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
