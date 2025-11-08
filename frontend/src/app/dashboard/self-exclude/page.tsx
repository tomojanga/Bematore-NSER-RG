'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Shield, AlertTriangle, CheckCircle, Clock, Info, Phone, Mail } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

export default function SelfExcludePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const periods = [
    { value: 'six_months', label: '6 Months', description: 'Short-term break', days: 180 },
    { value: 'one_year', label: '1 Year', description: 'Medium-term exclusion', days: 365 },
    { value: 'three_years', label: '3 Years', description: 'Long-term exclusion', days: 1095 },
    { value: 'five_years', label: '5 Years', description: 'Extended exclusion', days: 1825 },
    { value: 'permanent', label: 'Permanent', description: 'Lifetime exclusion', days: null },
  ]

  const reasons = [
    'I want to take a break from gambling',
    'I am spending too much money',
    'Gambling is affecting my relationships',
    'I want to focus on other priorities',
    'I am concerned about my gambling habits',
    'Other personal reasons',
  ]

  const handleSubmit = async () => {
    if (!selectedPeriod) {
      toast({
        title: 'Validation Error',
        description: 'Please select an exclusion period',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await api.nser.register({
        exclusion_period: selectedPeriod,
        reason: reason || 'Personal decision',
        consent_given: true,
      })

      toast({
        title: 'Self-Exclusion Registered',
        description: 'Your self-exclusion has been successfully registered',
        variant: 'default'
      })

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.message || 'Failed to register self-exclusion',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Self-Exclusion Registration</h1>
        <p className="text-gray-600 mt-2">Take control of your gambling activities</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
              step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`h-1 w-16 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Understanding Self-Exclusion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-900">Important Information</p>
                  <p className="text-sm text-yellow-800 mt-1">
                    Self-exclusion is a serious commitment. Once registered, you will be blocked from all licensed gambling operators in Kenya for the selected period.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Immediate Effect</p>
                  <p className="text-sm text-gray-600">Your exclusion takes effect immediately across all operators</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Cannot Be Reversed</p>
                  <p className="text-sm text-gray-600">You cannot cancel or reduce the exclusion period once registered</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">All Operators</p>
                  <p className="text-sm text-gray-600">Applies to all GRAK-licensed gambling operators</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Confidential</p>
                  <p className="text-sm text-gray-600">Your information is protected and confidential</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Period */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Exclusion Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedPeriod === period.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-lg">{period.label}</p>
                      <p className="text-sm text-gray-600">{period.description}</p>
                      {period.days && (
                        <p className="text-xs text-gray-500 mt-1">{period.days} days</p>
                      )}
                    </div>
                    {selectedPeriod === period.value && (
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a reason...</option>
                {reasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!selectedPeriod}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Self-Exclusion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">Final Confirmation</p>
                  <p className="text-sm text-red-800 mt-1">
                    Please review your selection carefully. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600">Exclusion Period</p>
                <p className="font-bold text-lg">
                  {periods.find(p => p.value === selectedPeriod)?.label}
                </p>
              </div>
              {reason && (
                <div>
                  <p className="text-sm text-gray-600">Reason</p>
                  <p className="font-medium">{reason}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Effect</p>
                <p className="font-medium">Immediate - All GRAK-licensed operators</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Need Help?</p>
                  <p>If you need support or counseling, please contact:</p>
                  <p className="font-medium mt-1">National Gambling Helpline: 0800-GAMBLE</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                    Registering...
                  </>
                ) : (
                  'Confirm Self-Exclusion'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Support Information */}
      <Card>
        <CardHeader>
          <CardTitle>Support Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium">24/7 Helpline</p>
                <p className="text-sm text-gray-600">0800-GAMBLE (426253)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-gray-600">support@grak.go.ke</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
