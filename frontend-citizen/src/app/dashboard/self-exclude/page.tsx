'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExclusions } from '@/hooks/useExclusions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Shield, AlertCircle } from 'lucide-react'

export default function SelfExcludePage() {
  const router = useRouter()
  const [period, setPeriod] = useState('6')
  const [reason, setReason] = useState('')
  const { createExclusion, isCreating } = useExclusions()

  const handleSubmit = () => {
    createExclusion({
      exclusion_period: parseInt(period),
      reason: reason || 'Personal decision',
      motivation_type: 'self_initiated',
      terms_acknowledged: true,
      consequences_understood: true
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Self-Exclusion Registration</h1>
        <p className="text-gray-600 mt-1">Voluntarily exclude yourself from gambling activities</p>
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Important Information</p>
              <p className="text-sm text-yellow-700 mt-1">
                Self-exclusion is a serious commitment. Once registered, you will be blocked from all licensed gambling operators in Kenya for the selected period.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Exclusion Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '6', label: '6 Months' },
                { value: '12', label: '1 Year' },
                { value: '60', label: '5 Years' },
                { value: '999', label: 'Permanent' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPeriod(option.value)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    period === option.value
                      ? 'border-red-500 bg-red-50 text-red-900'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  <p className="font-semibold">{option.label}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                rows={4}
                placeholder="Why are you self-excluding?"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isCreating}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              {isCreating ? 'Processing...' : 'Confirm Self-Exclusion'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
